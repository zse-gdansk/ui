import { CodeBlock } from "@zse-gdansk/ui/code-block";

const PYTHON = `def srednia(punkty: list[float]) -> float:
    """Średnia z punktów, puste zadania się nie liczą."""
    oddane = [p for p in punkty if p is not None]
    return sum(oddane) / len(oddane) if oddane else 0.0


print(srednia([4, 6, None, 8]))  # 6.0`;

const TS = `import { Table, TableNumberCell } from "@zse-gdansk/ui";

export function Punkty({ uczniowie }: { uczniowie: Uczen[] }) {
    return (
        <Table label="Wyniki sprawdzianu" striped>
            {uczniowie.map((uczen) => (
                <TableNumberCell
                    key={uczen.id}
                    label={uczen.nazwisko}
                    value={uczen.punkty}
                    max={8}
                    onValueChange={(punkty) => zapisz(uczen.id, punkty)}
                />
            ))}
        </Table>
    );
}

async function zapisz(id: string, punkty: number | null) {
    await fetch(\`/api/punkty/\${id}\`, {
        method: "PUT",
        body: JSON.stringify({ punkty }),
    });
}

function nieUzywana() {
    return null;
}

export const LIMIT = 8;`;

const DIFF = `// [!code word:oddane]
function srednia(punkty: (number | null)[]) {
    const oddane = punkty.filter((p) => p !== null);
    const suma = punkty.reduce((a, b) => a + b, 0); // [!code --]
    const suma = oddane.reduce((a, b) => a + b, 0); // [!code ++]
    return oddane.length ? suma / oddane.length : 0; // [!code highlight]
}`;

const ERROR = `import { Pagination } from "@zse-gdansk/ui";

type Wariant = "auto" | "full" | "compact";

const wariant: Wariant = "mini";
//                       ^^^^^^ Type '"mini"' is not assignable to type 'Wariant'.
<Pagination pageCount={12} variant={wariant} />;`;

export function CodeBlockDemo() {
    return (
        <section className="fields">
            <CodeBlock
                code={PYTHON}
                language="python"
                filename="srednia.py"
                highlight={[3]}
            />
            <CodeBlock
                code={TS}
                language="tsx"
                filename="Punkty.tsx"
                lineNumbers
            />
            <CodeBlock code={DIFF} language="ts" filename="srednia.ts" />
            <CodeBlock code={ERROR} language="tsx" />
            <CodeBlock
                code={PYTHON}
                language="python"
                words={["punkty", "oddane"]}
                lineNumbers
                removed={[3]}
                added={[4]}
            />
            <CodeBlock
                code={`SELECT nazwisko, SUM(punkty) AS suma\nFROM wyniki\nWHERE klasa = '3C'\nGROUP BY nazwisko;`}
                filename="ranking.sql"
            />
            <CodeBlock
                code={`{\n    "name": "@zse-gdansk/ui",\n    "private": true\n}`}
                filename="package.json"
            />
            <CodeBlock code="bun add @zse-gdansk/ui" language="bash" />
        </section>
    );
}
