# ui

Wspólna biblioteka komponentów, tokenów i stylów dla projektów Zespołu Szkół Energetycznych w Gdańsku.

## Instalacja

Paczka jest w GitHub Packages. Rejestr npm GitHuba wymaga tokenu także przy publicznych paczkach, więc w projekcie potrzebny jest `.npmrc`:

```ini
@zse-gdansk:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` to [token klasyczny](https://github.com/settings/tokens) z uprawnieniem `read:packages`, trzymany w zmiennej środowiskowej, nie w repozytorium. W GitHub Actions wystarczy wbudowany `secrets.GITHUB_TOKEN`.

```sh
bun add @zse-gdansk/ui
```

## Użycie

```tsx
import "@zse-gdansk/ui/styles.css";
import { Button } from "@zse-gdansk/ui";

export function Save() {
    return <Button>Zapisz</Button>;
}
```

Motyw ustawia atrybut `data-theme="light"` albo `"dark"` na `<html>`. `CodeBlock` jest w osobnym wejściu `@zse-gdansk/ui/code-block` i wymaga zainstalowanego `shiki`.

## Zmiany

[CHANGELOG.md](CHANGELOG.md) i [wydania](https://github.com/zse-gdansk/ui/releases).
