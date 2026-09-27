"use client";

import {
    CameraOff01Icon,
    CameraRotated01Icon,
    FlashIcon,
    FlashOffIcon,
} from "@hugeicons/core-free-icons";
import { useRef, useState } from "react";

import { useMessages } from "../../i18n/context";
import { useExternalEffect, useLatest, useTimeout } from "../../utils/effects";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { Spokes } from "../spinner/Spinner";

export interface QRScannerProps {
    // Odczytany kod. Ten sam kod liczy się znowu dopiero, gdy zniknie z
    // kadru na repeatDelay ms.
    onScan: (value: string) => void;
    // Podgląd zostaje, kody nie są czytane, np. w trakcie sprawdzania
    // biletu na serwerze.
    paused?: boolean;
    repeatDelay?: number;
    // Adres pliku .wasm czytnika zapasowego zamiast CDN jsDelivr, np. przy
    // ścisłym CSP albo w sieci bez internetu (docs/components.md).
    wasmUrl?: string;
    label?: string;
    className?: string;
}

type Status =
    | "starting"
    | "scanning"
    | "denied"
    | "no-camera"
    | "unsupported"
    | "failed";

interface Detector {
    detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
}

interface DetectorClass {
    new (options: { formats: string[] }): Detector;
    getSupportedFormats?: () => Promise<string[]>;
}

// Natywny BarcodeDetector (Chrome, Android), a gdzie go nie ma (iPhone,
// Firefox) czytnik zxing-wasm z barcode-detector, ładowany dopiero teraz.
async function createDetector(wasmUrl: string | undefined) {
    const Native = (globalThis as { BarcodeDetector?: DetectorClass })
        .BarcodeDetector;
    if (Native) {
        try {
            const formats = (await Native.getSupportedFormats?.()) ?? [];
            if (formats.includes("qr_code"))
                return new Native({ formats: ["qr_code"] });
        } catch {
            // Dalej zapasowy.
        }
    }
    try {
        const module = await import("barcode-detector/ponyfill");
        if (wasmUrl)
            module.prepareZXingModule({
                overrides: {
                    locateFile: (path: string, prefix: string) =>
                        path.endsWith(".wasm") ? wasmUrl : prefix + path,
                },
            });
        return new module.BarcodeDetector({
            formats: ["qr_code"],
        }) as unknown as Detector;
    } catch {
        return null;
    }
}

const SCAN_EVERY = 120;

// Skaner kodów QR z aparatu: podgląd z celownikiem, latarka i zmiana
// aparatu, gdzie są, stany braku zgody i braku aparatu z ponowieniem.
// Odczyt krótko mignie celownikiem i zawibruje.
export function QRScanner({
    onScan,
    paused = false,
    repeatDelay = 2500,
    wasmUrl,
    label,
    className,
}: QRScannerProps) {
    const t = useMessages();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<Status>("starting");
    const [attempt, setAttempt] = useState(0);
    const [facing, setFacing] = useState<"environment" | "user">("environment");
    const [torch, setTorch] = useState<{
        track: MediaStreamTrack;
        on: boolean;
    } | null>(null);
    const [cameras, setCameras] = useState(0);
    const [flash, setFlash] = useState(0);
    const [announced, setAnnounced] = useState("");
    const last = useRef({ value: "", time: 0 });
    const latest = useLatest({ onScan, paused, repeatDelay, wasmUrl });

    useTimeout(() => setFlash(0), flash ? 450 : null, flash);

    // Aparat na czas życia skanera; od nowa po „Spróbuj ponownie” i po
    // zmianie aparatu.
    useExternalEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        let cancelled = false;
        let stream: MediaStream | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;

        void (async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setStatus("no-camera");
                return;
            }
            const detector = await createDetector(latest.current.wasmUrl);
            if (cancelled) return;
            if (!detector) {
                setStatus("unsupported");
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: { ideal: facing },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                });
            } catch (error) {
                if (cancelled) return;
                const name = error instanceof DOMException ? error.name : "";
                setStatus(
                    name === "NotAllowedError" || name === "SecurityError"
                        ? "denied"
                        : name === "NotFoundError" ||
                            name === "OverconstrainedError"
                          ? "no-camera"
                          : "failed",
                );
                return;
            }
            if (cancelled) {
                for (const track of stream.getTracks()) track.stop();
                return;
            }
            video.srcObject = stream;
            try {
                await video.play();
            } catch {
                // Autoodtwarzanie wyciszonego wideo zwykle przechodzi; jeśli
                // nie, klatki i tak przychodzą.
            }
            if (cancelled) return;
            const [track] = stream.getVideoTracks();
            const capabilities = track?.getCapabilities?.() as
                | { torch?: boolean }
                | undefined;
            setTorch(
                track && capabilities?.torch ? { track, on: false } : null,
            );
            const devices = await navigator.mediaDevices
                .enumerateDevices()
                .catch(() => []);
            if (cancelled) return;
            setCameras(
                devices.filter((device) => device.kind === "videoinput").length,
            );
            setStatus("scanning");

            const tick = async () => {
                if (cancelled) return;
                const options = latest.current;
                if (!options.paused && video.readyState >= 2) {
                    try {
                        const [code] = await detector.detect(video);
                        const value = code?.rawValue;
                        const now = Date.now();
                        // Ten sam kod dalej w kadrze tylko odświeża czas:
                        // bilet trzymany przed aparatem liczy się raz.
                        const repeated =
                            value === last.current.value &&
                            now - last.current.time < options.repeatDelay;
                        if (repeated) last.current.time = now;
                        if (!cancelled && value && !repeated) {
                            last.current = { value, time: now };
                            setFlash(now);
                            setAnnounced(`${t.qr.scanned}: ${value}`);
                            navigator.vibrate?.(40);
                            options.onScan(value);
                        }
                    } catch {
                        // Klatka nieczytelna, następna za chwilę.
                    }
                }
                timer = setTimeout(() => void tick(), SCAN_EVERY);
            };
            void tick();
        })();

        return () => {
            cancelled = true;
            clearTimeout(timer);
            for (const track of stream?.getTracks() ?? []) track.stop();
            video.srcObject = null;
        };
    }, [attempt, facing]);

    function restart(next?: "environment" | "user") {
        setStatus("starting");
        setTorch(null);
        if (next) setFacing(next);
        else setAttempt((value) => value + 1);
    }

    async function toggleTorch() {
        if (!torch) return;
        const on = !torch.on;
        try {
            await torch.track.applyConstraints({
                advanced: [{ torch: on } as MediaTrackConstraintSet],
            });
            setTorch({ track: torch.track, on });
        } catch {
            setTorch(null);
        }
    }

    const problem =
        status === "denied"
            ? { title: t.qr.denied, hint: t.qr.deniedHint }
            : status === "no-camera"
              ? { title: t.qr.noCamera }
              : status === "unsupported"
                ? { title: t.qr.unsupported }
                : status === "failed"
                  ? { title: t.qr.failed }
                  : null;

    return (
        <section
            className={["zse-qr-scanner", className].filter(Boolean).join(" ")}
            aria-label={label ?? t.qr.scanner}
            data-status={status}
            data-scanned={flash ? "" : undefined}
            data-paused={paused || undefined}
        >
            <video
                ref={videoRef}
                className="zse-qr-video"
                muted
                playsInline
                aria-hidden
                data-mirror={facing === "user" || undefined}
            />
            {status === "scanning" && (
                <>
                    <div className="zse-qr-frame" aria-hidden />
                    <p className="zse-qr-hint">{t.qr.hint}</p>
                    <div className="zse-qr-controls">
                        {torch && (
                            <button
                                type="button"
                                className="zse-qr-control"
                                aria-label={
                                    torch.on ? t.qr.torchOff : t.qr.torchOn
                                }
                                aria-pressed={torch.on}
                                onClick={() => void toggleTorch()}
                            >
                                <Icon
                                    icon={torch.on ? FlashOffIcon : FlashIcon}
                                    size={18}
                                />
                            </button>
                        )}
                        {cameras > 1 && (
                            <button
                                type="button"
                                className="zse-qr-control"
                                aria-label={t.qr.switchCamera}
                                onClick={() =>
                                    restart(
                                        facing === "environment"
                                            ? "user"
                                            : "environment",
                                    )
                                }
                            >
                                <Icon icon={CameraRotated01Icon} size={18} />
                            </button>
                        )}
                    </div>
                </>
            )}
            {status === "starting" && (
                <output className="zse-qr-state">
                    <Spokes size={20} />
                    <span>{t.qr.starting}</span>
                </output>
            )}
            {problem && (
                <div className="zse-qr-state" role="alert">
                    <Icon icon={CameraOff01Icon} size={24} />
                    <span className="zse-qr-state-title">{problem.title}</span>
                    {problem.hint && (
                        <span className="zse-qr-state-hint">
                            {problem.hint}
                        </span>
                    )}
                    {status !== "unsupported" && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restart()}
                        >
                            {t.qr.retry}
                        </Button>
                    )}
                </div>
            )}
            <span className="zse-qr-sr" aria-live="polite">
                {announced}
            </span>
        </section>
    );
}
