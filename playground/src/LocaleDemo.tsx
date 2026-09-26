import { LocaleProvider, LocaleSwitcher, pl } from "@zse-gdansk/ui";
import { GB, PL, UA } from "country-flag-icons/react/3x2";
import { createInstance, type BackendModule } from "i18next";
import {
    I18nextProvider,
    initReactI18next,
    useTranslation,
} from "react-i18next";

const RESOURCES = {
    pl: { title: "Dziennik punktów", body: "Klasa 3C, 28 uczniów, 4 zadania." },
    en: { title: "Points register", body: "Class 3C, 28 students, 4 tasks." },
    uk: { title: "Журнал балів", body: "Клас 3C, 28 учнів, 4 завдання." },
} as const;

// Udaje wczytywanie tłumaczeń z serwera, żeby było widać spinner.
const slowBackend: BackendModule = {
    type: "backend",
    init() {},
    read(language, _namespace, callback) {
        setTimeout(() => {
            callback(null, RESOURCES[language as keyof typeof RESOURCES]);
        }, 700);
    },
};

const i18n = createInstance();
void i18n
    .use(slowBackend)
    .use(initReactI18next)
    .init({
        lng: "pl",
        fallbackLng: "pl",
        supportedLngs: ["pl", "en", "uk"],
        resources: { pl: { translation: RESOURCES.pl } },
        partialBundledLanguages: true,
        interpolation: { escapeValue: false },
    });

function Content() {
    const { t, i18n: instance } = useTranslation();
    const language = instance.resolvedLanguage ?? "pl";

    return (
        // Teksty biblioteki mają na razie tylko katalog polski.
        <LocaleProvider messages={pl}>
            <div className="locale-demo" lang={language}>
                <div>
                    <strong>{t("title")}</strong>
                    <p>{t("body")}</p>
                </div>
                <div className="button-row">
                    <LocaleSwitcher
                        locales={["pl", "en", "uk"]}
                        value={language}
                        flags={{ pl: PL, en: GB, uk: UA }}
                        onValueChange={(next) => instance.changeLanguage(next)}
                    />
                    <LocaleSwitcher
                        locales={["pl", "en", "uk"]}
                        value={language}
                        display="code"
                        size="sm"
                        onValueChange={(next) => instance.changeLanguage(next)}
                    />
                </div>
            </div>
        </LocaleProvider>
    );
}

export function LocaleDemo() {
    return (
        <section>
            <I18nextProvider i18n={i18n}>
                <Content />
            </I18nextProvider>
        </section>
    );
}
