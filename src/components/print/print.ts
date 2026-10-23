// Drukowanie z nazwą pliku: „Zapisz jako PDF” bierze ją z tytułu strony,
// więc na czas druku tytuł to nazwa dokumentu, potem wraca poprzedni.
export function printDocument({ title }: { title?: string } = {}) {
    const previous = document.title;
    if (title) document.title = title;
    const restore = () => {
        document.title = previous;
        window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
}
