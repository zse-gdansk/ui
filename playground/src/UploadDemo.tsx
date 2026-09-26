import { FileUpload, toast } from "@zse-gdansk/ui";

// Udawana wysyłka: postęp co 120ms, co piąty plik kończy się błędem.
let attempt = 0;
function fakeUpload(
    file: File,
    {
        onProgress,
        signal,
    }: { onProgress: (p: number) => void; signal: AbortSignal },
) {
    attempt += 1;
    const fails = attempt % 5 === 0;
    return new Promise<void>((resolve, reject) => {
        let progress = 0;
        const timer = setInterval(() => {
            progress += 0.08 + Math.random() * 0.12;
            onProgress(progress);
            if (fails && progress > 0.6) {
                clearInterval(timer);
                reject(new Error("Serwer nie odpowiada"));
            } else if (progress >= 1) {
                clearInterval(timer);
                resolve();
            }
        }, 120);
        signal.addEventListener("abort", () => {
            clearInterval(timer);
            toast.info(`Przerwano wysyłanie ${file.name}`);
        });
    });
}

export function UploadDemo() {
    return (
        <section className="fields">
            <FileUpload
                label="Rozwiązanie zadania"
                accept=".pdf,.zip,.py,image/*"
                maxSize={10 * 1024 * 1024}
                maxFiles={5}
                onUpload={fakeUpload}
            />
            <FileUpload
                label="Zdjęcie do legitymacji"
                accept="image/*"
                multiple={false}
                maxSize={2 * 1024 * 1024}
                name="photo"
            />
            <FileUpload
                label="Załącznik"
                error="Dodaj co najmniej jeden plik"
            />
            <FileUpload label="Oddawanie zamknięte" disabled />
        </section>
    );
}
