import {
    Button,
    Card,
    CardContent,
    Input,
    Lightbox,
    Swap,
    Text,
} from "@zse-gdansk/ui";
import { useRef, useState } from "react";

export function ViewsDemo() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const thumb = useRef<HTMLButtonElement>(null);

    return (
        <section className="button-row">
            <button
                ref={thumb}
                type="button"
                className="views-thumb"
                aria-label="Powiększ zdjęcie"
                onClick={() => setOpen(true)}
            >
                <img src="/demo-photo.svg" alt="" width={160} height={100} />
            </button>
            <Lightbox
                open={open}
                onOpenChange={setOpen}
                src="/demo-photo.svg"
                alt="Zdjęcie demonstracyjne"
                originRef={thumb}
            />

            <Card>
                <CardContent>
                    <Swap
                        showAlt={editing}
                        main={
                            <div className="fields">
                                <Text>Samorząd Uczniowski ZSE w Gdańsku</Text>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditing(true)}
                                >
                                    Edytuj nazwę
                                </Button>
                            </div>
                        }
                        alt={
                            <div className="fields">
                                <Input
                                    label="Nazwa"
                                    defaultValue="Samorząd Uczniowski ZSE w Gdańsku"
                                />
                                <Text tone="secondary">
                                    Swap trzyma oba widoki, a wysokość
                                    przechodzi płynnie.
                                </Text>
                                <Button onClick={() => setEditing(false)}>
                                    Gotowe
                                </Button>
                            </div>
                        }
                    />
                </CardContent>
            </Card>
        </section>
    );
}
