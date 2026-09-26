import { CopyButton, Input, PasswordStrength } from "@zse-gdansk/ui";
import { useState } from "react";

export function CopyDemo() {
    const [password, setPassword] = useState("");

    return (
        <section className="fields">
            <div className="button-row">
                <code className="copy-code">482-913</code>
                <CopyButton
                    value="482-913"
                    aria-label="Kopiuj kod do głosowania"
                    size="sm"
                />
                <CopyButton
                    value={() => `${window.location.origin}/sprawdzian/42`}
                    label="Kopiuj link"
                    variant="outline"
                />
                <CopyButton value="3C" label="Kopiuj" size="sm" />
            </div>

            <Input
                label="Nowe hasło"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
            />
            <PasswordStrength value={password} />
        </section>
    );
}
