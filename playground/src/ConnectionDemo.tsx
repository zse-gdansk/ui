import { Button, ConnectionStatus, type ConnectionState } from "@zse-gdansk/ui";
import { useState } from "react";

const STATES: ConnectionState[] = [
    "connecting",
    "live",
    "reconnecting",
    "polling",
    "offline",
];

export function ConnectionDemo() {
    const [status, setStatus] = useState<ConnectionState>("live");
    const [updatedAt] = useState(() => Date.now() - 4 * 60_000);
    const [retryAt, setRetryAt] = useState<number | null>(null);

    return (
        <section className="fields">
            <div className="button-row">
                {STATES.map((state) => (
                    <Button
                        key={state}
                        size="sm"
                        variant={state === status ? "primary" : "outline"}
                        onClick={() => {
                            setStatus(state);
                            setRetryAt(
                                state === "reconnecting"
                                    ? Date.now() + 10_000
                                    : null,
                            );
                        }}
                    >
                        {state}
                    </Button>
                ))}
            </div>
            <ConnectionStatus
                status={status}
                updatedAt={updatedAt}
                retryAt={retryAt}
                pollInterval={10_000}
                onRetry={() => setStatus("connecting")}
            />
        </section>
    );
}
