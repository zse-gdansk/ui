# Changelog

## [1.1.0](https://github.com/zse-gdansk/ui/compare/v1.0.0...v1.1.0) (2026-09-26)


### Nowe funkcje

* **app-loader:** dodano komponent AppLoader z pełnoekranowym ekranem wczytywania aplikacji ([150cdf6](https://github.com/zse-gdansk/ui/commit/150cdf68cfef4c514d304e5b63f8bbc194e1fb17))
* **app-shell:** akcje drugorzędne paska w menu na telefonie ([0497492](https://github.com/zse-gdansk/ui/commit/0497492acc13d5ff8a201076a65174369a4518c6))
* **app-shell:** dodano komponent AppHeader z obsługą breadcrumbów i akcji w nagłówku ([f04942d](https://github.com/zse-gdansk/ui/commit/f04942d38e91ea08b757b9ca3687f08a2df8769d))
* **app-shell:** dodano komponent AppShell z kontekstem i obsługą stanu panelu bocznego ([1eb11d3](https://github.com/zse-gdansk/ui/commit/1eb11d330fbcb30dca8ba22dc0efcc86c6f86c79))
* **fonts:** dodano wsparcie dla czcionki Inter z konfiguracją i preloadem ([1d21df4](https://github.com/zse-gdansk/ui/commit/1d21df434afaacfc2ccf0987d70bfeae6ff6c0fe))
* **menu, sheet:** dodano obsługę zapytań medialnych dla komponentów MenuSub i Sheet ([247f63b](https://github.com/zse-gdansk/ui/commit/247f63ba99702ff9a4db3e4b2606516704eea95f))
* **page-header:** dodano komponent PageHeader z tytułem, opisem, akcjami i metadanymi ([72da147](https://github.com/zse-gdansk/ui/commit/72da1471019bf35f4af4e29a927be86c257fdb22))
* **secret-field:** dodano komponent SecretField do obsługi tajnych wartości z opcją pokazywania i kopiowania ([fdc0a7b](https://github.com/zse-gdansk/ui/commit/fdc0a7b05643a56e8bdffd826ad84491d4bde221))
* **sidebar:** dodano ikonę wskazującą kierunek powrotu w elementach menu bocznego ([03e0df5](https://github.com/zse-gdansk/ui/commit/03e0df5093437bc8aaf55409643b7c254a67859e))
* **sidebar:** dodano nowe klasy dla ikon w panelu bocznym oraz poprawiono animacje ([691de64](https://github.com/zse-gdansk/ui/commit/691de645c6aba906c3e1049524e87f65949a09fe))
* **sidebar:** dodano widoki w panelu bocznym z animacjami przejścia i obsługą powrotu do menu głównego ([9d06555](https://github.com/zse-gdansk/ui/commit/9d065551365d66aa1b69b2b9ee21cfd45897424e))
* **spinner:** dodano komponent Spokes jako wskaźnik ładowania, zastępując ikony LoaderCircle w innych komponentach ([8e0d7fd](https://github.com/zse-gdansk/ui/commit/8e0d7fd8c212a590408dd1bf6df3117b31059040))
* **table:** dodano akcje wiersza z menu i szybkimi przyciskami ([d4ad267](https://github.com/zse-gdansk/ui/commit/d4ad2679adbbbe7064912639791fd1403170f56c))
* **table:** zaznaczanie wierszy z akcjami zbiorczymi i confirm() ([16313b9](https://github.com/zse-gdansk/ui/commit/16313b9b01f4550db87271f66d150bfddd453cd5))
* **time-picker:** dodano komponent wyboru czasu z obsługą przedziałów czasowych ([aa4ab2e](https://github.com/zse-gdansk/ui/commit/aa4ab2e7725bdef2f731d80e5fb5f20e449e1b61))
* **user-menu:** dodano komponent UserMenu z obsługą konta użytkownika i menu akcji ([fd99008](https://github.com/zse-gdansk/ui/commit/fd990083d25195e37ad71562f7af49a00afb7a8a))


### Poprawki

* **form-demo:** poprawiono adresy e-mail i strony klasy na zse.edu.gdansk.pl ([4e4f217](https://github.com/zse-gdansk/ui/commit/4e4f2177d9646dbacd1064b88f1960fe5790693b))
* **secret-demo:** zmieniono wartość klucza API na wartość demonstracyjną ([75fca35](https://github.com/zse-gdansk/ui/commit/75fca352303279f621cd55f829c19cf3cbe70f56))
* **sidebar:** przewinięcie do aktywnej pozycji i wyższe pozycje na telefonie ([728658f](https://github.com/zse-gdansk/ui/commit/728658f4e4e1b6a8f7e0f530c2ed30036899002f))
* **time-picker:** poprawiono klucz dla przycisków slotów na unikalny identyfikator czasowy ([565cddd](https://github.com/zse-gdansk/ui/commit/565cddd6368cf5b14c1592fe6ab973f6a0e9a573))


### Dokumentacja

* **design:** dodano wytyczne projektowe, usunięto tracking i przejścia koloru przy hoverze ([b66883e](https://github.com/zse-gdansk/ui/commit/b66883e0c724f95e5d63e48cdad739441bf0fb13))

## 1.0.0 (2026-09-26)


### Nowe funkcje

* **accordion:** dodano accordion i collapsible z otwieraniem przy szukaniu na stronie ([d41b9c3](https://github.com/zse-gdansk/ui/commit/d41b9c33ab1537e61ee3b81827a3c31ae55f85e5))
* **alert:** dodano akcję w linii z obsługą Promise ([d613388](https://github.com/zse-gdansk/ui/commit/d6133880745290347311010473cac3e018161a07))
* **alert:** dodano alert z animowanym zamykaniem ([505e0a1](https://github.com/zse-gdansk/ui/commit/505e0a157f7ca65e029a003733773f0c8d76fd15))
* **avatar:** dodano avatar z generatorem gradientów i grupę ([fbc7677](https://github.com/zse-gdansk/ui/commit/fbc7677dda65b2aca5a6a0071c8ec692e94b2a6b))
* **badge:** dodano badge z wariantami i kropką statusu ([e6b643c](https://github.com/zse-gdansk/ui/commit/e6b643cad45db52186f4952ced0519e4928a3dc7))
* **breadcrumbs:** dodano breadcrumbs ze skracaniem do menu oraz label ([07e95a4](https://github.com/zse-gdansk/ui/commit/07e95a4f6ed1a5e0aea3893e3ebe57195a966ec9))
* **button:** dodano komponent Button Base UI z ikonami Hugeicons ([1947075](https://github.com/zse-gdansk/ui/commit/1947075b73b621412871b3014882694088639acf))
* **calendar:** dodano kalendarz i date picker z zakresami ([391292a](https://github.com/zse-gdansk/ui/commit/391292a98438056f9fca4a7df5e42bc0ca28a51d))
* **card:** dodano komponent Card i Container ([42bcabd](https://github.com/zse-gdansk/ui/commit/42bcabd0685739ff4fef62e0d6f4ce309a6167b8))
* **checkbox:** dodano komponent Checkbox ([9cd000d](https://github.com/zse-gdansk/ui/commit/9cd000d62224cf0fb28d7ad4e0e2a31d85552ebf))
* **checkbox:** poprawiono animacje checkboxa ([c51b811](https://github.com/zse-gdansk/ui/commit/c51b811bf4043aae11898e8428f7fff36f505df1))
* **code-block:** dodano błędy z falistą kreską i komunikatem pod linią ([5b6dc50](https://github.com/zse-gdansk/ui/commit/5b6dc5039efa9c4bfe208f11e7f0ad958abc4db4))
* **code-block:** dodano blok kodu z Shiki, diffami i ikonami języków ([0bfc420](https://github.com/zse-gdansk/ui/commit/0bfc420370b5f28e5f7f2a2be438aed36452ef0e))
* **code-field:** dodano pole na kod z weryfikacją i animacjami ([9173cb1](https://github.com/zse-gdansk/ui/commit/9173cb15deaa857a0852afda07c29429b93f5dbb))
* **combobox:** dodano komponent Combobox z funkcjonalnością autocomplete; dodano ScrollArea ([e6735d5](https://github.com/zse-gdansk/ui/commit/e6735d5f2b961d3fe4956438630f6d9299b7c325))
* **combobox:** dodano lepszy handling stanu w Comboboxie ([a9e3ed8](https://github.com/zse-gdansk/ui/commit/a9e3ed8ab402bc78bbd1117368bd9ebe9cdbb4aa))
* **components:** dodano pole liczbowe oraz edytowalne komórki z punktami ([eb041cd](https://github.com/zse-gdansk/ui/commit/eb041cd87cb44b63223af740ffbd509e0e5e55f6))
* **copy:** dodano copy button i ocenę siły hasła ([dfa296f](https://github.com/zse-gdansk/ui/commit/dfa296f764f0028a05a93eee02cb80f7d6bf5d2a))
* **empty-state:** dodano pusty stan z kafelkiem i wejściem po kolei ([bb1c58a](https://github.com/zse-gdansk/ui/commit/bb1c58a64a014139365beb414be58344caf65c0a))
* **form:** dodano formularze z walidacją Standard Schema, błędami z serwera i grupami pól ([d0215d2](https://github.com/zse-gdansk/ui/commit/d0215d2fb4118aa2f8234defda83efe71fc5f18c))
* **i18n:** dodano obsługę tłumaczeń z polskim katalogiem ([60ac013](https://github.com/zse-gdansk/ui/commit/60ac013b1d1b3de5b8b2d4351bbac70ce43df610))
* **input-group:** dodano pole z przedrostkiem, przyrostkiem i sprawdzaniem wartości ([7332a1b](https://github.com/zse-gdansk/ui/commit/7332a1b6a26c467852fa9f30b8dbd3cce6826b5a))
* **input:** dodano komponent Input ([2d60d4d](https://github.com/zse-gdansk/ui/commit/2d60d4dfb748e979d64dbdfc72e5109c02047376))
* **link:** dodano link z wariantami, obsługą Next Link i potwierdzeniem wyjścia ([73ab2ed](https://github.com/zse-gdansk/ui/commit/73ab2edf783ce3b363f72de63bbe9d7f3268f415))
* **locale-switcher:** dodano przełącznik języka z flagami, zgodny z i18next ([7e3b62d](https://github.com/zse-gdansk/ui/commit/7e3b62de7d222ad7ad8917fb89e4dbe8f2151729))
* **menu:** dodano komponent Menu z obsługą shortcutsów ([fb58e94](https://github.com/zse-gdansk/ui/commit/fb58e94bd44b3a5b2f89cc6946decff99f9bf7d6))
* **misc:** dodano kbd ze skrótami systemowymi, separator z etykietą i spinner ([938695e](https://github.com/zse-gdansk/ui/commit/938695e25cc2d466a5c4ce245d4d906f4edd5a00))
* **modal:** dodano komponent Modal z ModalClose ([992e53b](https://github.com/zse-gdansk/ui/commit/992e53b2134179b5ead022c0ac1ca01b2cf3f249))
* **modal:** dodano tryb alert oparty na AlertDialog ([ae3ad6a](https://github.com/zse-gdansk/ui/commit/ae3ad6ae28864244ec9a0297dc642bda4a1cc920))
* **pagination:** dodano paginację ze skokiem do strony i wersją kompaktową ([4aedbe5](https://github.com/zse-gdansk/ui/commit/4aedbe5a98f6afaa80e5ff2848ad3624697444cb))
* **popover:** dodano popover i menu kontekstowe z przytrzymaniem na dotyku ([5edc8ce](https://github.com/zse-gdansk/ui/commit/5edc8ce924efd6141393cfc7cdac46b12f831ee4))
* **popover:** poprawiono wygląd i działanie strzalki w popoverze ([1627e39](https://github.com/zse-gdansk/ui/commit/1627e39967b8ed8f3b1ce93971b6446612bf6d83))
* **progress:** dodano progress i meter z pierścieniem i kawałkami ([70975e5](https://github.com/zse-gdansk/ui/commit/70975e57f80a29a466aced2c560df6f07db2a235))
* **radio:** dodano komponent Radio i RadioGroup ([0a2c50e](https://github.com/zse-gdansk/ui/commit/0a2c50e47855c1b313726de9e1c655a8b70f7097))
* **search:** dodano silnik wyszukiwania z rankingiem i literówkami ([8875925](https://github.com/zse-gdansk/ui/commit/88759256d41a3dbdd5968b12d4a9ff8ce779421f))
* **segmented:** dodano segmented control z przesuwanym suwakiem ([c9a69db](https://github.com/zse-gdansk/ui/commit/c9a69db0e4694afbb77d3813b8974c27b76654d4))
* **select:** dodano komponent Select ([11ad827](https://github.com/zse-gdansk/ui/commit/11ad8277425cead9e8d2dbfe993f22949a49b2f6))
* **sheet:** dodano komponent Sheet (Drawer) ([1b7ef4a](https://github.com/zse-gdansk/ui/commit/1b7ef4af7a434ec3cde6cce6bebc88c3755865ea))
* **skeleton:** dodano skeleton z shimmerem ([544e697](https://github.com/zse-gdansk/ui/commit/544e697e36f4077c69efab398c39541d7c576d0e))
* **slider:** dodano slider z zakresem i kreskami oraz checkbox group z zaznaczaniem wszystkich ([4c4b36e](https://github.com/zse-gdansk/ui/commit/4c4b36e52abad364b6917c3479ac308cda257ca8))
* **stat:** dodano statystyki ze zmianą, trendem i grupą ([f9949ec](https://github.com/zse-gdansk/ui/commit/f9949ec62d03d186cbe4e50aab92fa1e07f7d5a9))
* **stepper:** dodano stepper z pierścieniem postępu kroku i walidacją ([258a2e7](https://github.com/zse-gdansk/ui/commit/258a2e787efe043fca9fc00eb879cca6f4e81ed7))
* **switch:** dodano komponent Switch ([5c2aee6](https://github.com/zse-gdansk/ui/commit/5c2aee6539b42d864e1e199644fcbd86c0ed5f1d))
* **table:** dodano komponent Table z przyklejonym nagłówkiem, kolumnami i stopką ([d36582b](https://github.com/zse-gdansk/ui/commit/d36582b04817c7b0d49bd8c67f6e382ad65f9b18))
* **table:** dodano opcję striped do komponentu Table dla lepszej czytelności ([d9c19ee](https://github.com/zse-gdansk/ui/commit/d9c19eeedccf4151e32c156689cca9d1285f8bb5))
* **tabs:** dodano komponent Tabs ([b59beb4](https://github.com/zse-gdansk/ui/commit/b59beb47a07777d4e7053af24eba757220cd3dd3))
* **textarea:** dodano komponent Textarea ([2564bb2](https://github.com/zse-gdansk/ui/commit/2564bb256d5893337e0df542b5b3ee5c2223ecd3))
* **toast:** dodano Toaster z globalnym API toast() ([36058db](https://github.com/zse-gdansk/ui/commit/36058db132b1480b2e70886e24190b4470c07ec9))
* **toast:** poprawiono stackowanie toastów ([616c6cb](https://github.com/zse-gdansk/ui/commit/616c6cbb562ee9c6c2d828954f29a03a0e0a37a8))
* **toggle:** dodano toggle i toggle group z podmianą ikon ([088b3e1](https://github.com/zse-gdansk/ui/commit/088b3e1b3b8b63ed61e537d8617582b50e40953d))
* **tokens:** dodano tokeny kolorów OKLCH z motywem jasnym, ciemnym i wyborem accentu ([5b2b703](https://github.com/zse-gdansk/ui/commit/5b2b703b6ad271d9c9449712ca083c5e7ac454b7))
* **tooltip:** dodano komponent Tooltip ([e946dc9](https://github.com/zse-gdansk/ui/commit/e946dc9935f6f473becb1e54bbb14b406761a9d5))
* **upload:** dodano komponent UploadDemo oraz FileUpload z obsługą przesyłania plików ([b324929](https://github.com/zse-gdansk/ui/commit/b3249290ce4a0ea2917531388436ba9657867598))


### Poprawki

* **form:** dodano daty i pliki do wartości formularza, pusty stan tabeli i linki routera w menu breadcrumbs ([463cf62](https://github.com/zse-gdansk/ui/commit/463cf62696c3b7f20660b0af84826bc4be18a7e9))
* **locale-switcher:** poprawiono lokalizację nazw języków w przełączniku języka ([2268a30](https://github.com/zse-gdansk/ui/commit/2268a30aea9002b59a5e60aa522eea5d26b3a32a))


### Dokumentacja

* dodano dokumentację dla agentów (zasady, ruch, tokeny, komponenty, pułapki) ([82dd301](https://github.com/zse-gdansk/ui/commit/82dd3019d51d91f0c5830e7c83b4db2d4cb43b76))
* dodano zasady dotyczące komponentów i konwencje nazewnictwa commitów ([b70a720](https://github.com/zse-gdansk/ui/commit/b70a7200135ac69cb55afffd576d8d2900ee32a6))


### Build

* dodano build paczki, changelog i publikację w GitHub Packages ([20d988b](https://github.com/zse-gdansk/ui/commit/20d988b69e5812c39d486f3131b9bc07810a69bd))
