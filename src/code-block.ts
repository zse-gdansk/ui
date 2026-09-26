// Osobny punkt wejścia, bo CodeBlock potrzebuje Shiki (opcjonalna zależność
// peer). Główny import biblioteki go nie dotyka, więc aplikacje bez bloków
// kodu nie muszą instalować Shiki, a ich build nie próbuje go szukać.
export {
    CodeBlock,
    type CodeBlockProps,
} from "./components/code-block/CodeBlock";
