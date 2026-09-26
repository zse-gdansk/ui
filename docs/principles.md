# Zasady

## Dla kogo i jaki charakter

Biblioteka obsługuje aplikacje szkolne: nauczyciel wpisuje punkty w tabeli, uczeń oddaje pracę i głosuje w wyborach do samorządu, wszyscy sprawdzają terminy w kalendarzu. Używa się jej codziennie, często na telefonie, przez ludzi, którzy nie są ekspertami od komputerów.

Z tego wynika charakter:

- **Żywa, nie cicha.** To nie jest portfolio w skali szarości. Jest akcent (domyślnie niebieski, do wyboru), są kolory statusów, są ikony. Kolor zawsze coś znaczy: akcent to „interaktywne albo wybrane”, zielony sukces, pomarańczowy ostrzeżenie, czerwony błąd.
- **Dopracowana w szczegółach.** Standard ruchu i dokładności jak u Emila Kowalskiego i w interfejsach Apple: animacje od wyzwalacza, podmiana ikon z blurem, przerywalne przejścia, nic nie skacze. Detale, których nikt świadomie nie zauważy, składają się na wrażenie, że „to po prostu działa”.
- **Szybka w użyciu.** Rzeczy robione sto razy dziennie (wpisywanie punktów, przełączanie zakładek, hover) reagują od razu. Animacja jest tam, gdzie pomaga zrozumieć zmianę, nie tam, gdzie spowalnia.

## Czego nie robimy

- **Nie dodajemy ozdobników bez celu:** gradientów „dla efektu”, bouncy sprężyn na menu, animacji wejścia na każdym elemencie strony, ilustracji.
- **Nie przesuwamy układu.** Zmiana stanu (ładowanie, błąd, rozwinięcie, zaznaczenie) nie może przesuwać sąsiednich elementów skokiem. Albo płynnie, albo wcale.
- **Nie zgadujemy wartości.** Czasy, krzywe, promienie i kolory biorą się z tokenów i z `docs/motion.md`, a nie z „mniej więcej”.

## Każdy komponent

- **Ma sensowne wartości domyślne.** Działa bez konfiguracji i wygląda dobrze od razu. Propsy są do wyjątków, nie do codziennego użycia.
- **Obsługuje oba motywy** (`data-theme="light"` i `"dark"` na `<html>`) przez tokeny, bez osobnych styli.
- **Działa na telefonie:** pola dotyku co najmniej około 40px, hover tylko tam, gdzie jest kursor, przytrzymanie zamiast prawego przycisku, wersje kompaktowe przez `@container`, gdy brakuje miejsca.
- **Działa z klawiatury i z czytnikiem ekranu.**
- **Szanuje `prefers-reduced-motion`:** bez przesuwania i skalowania, zostaje przenikanie.
- **Mówi językiem aplikacji.** Teksty pochodzą z katalogu (domyślnie polskiego), zmienia się je propsem (`closeLabel`, `emptyText`…) albo przez `LocaleProvider`.
