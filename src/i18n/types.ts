export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
    other: string;
};

export interface Messages {
    // Kod języka dla Intl (daty, liczby, odmiana), np. "pl-PL".
    locale: string;

    common: {
        close: string;
        cancel: string;
        clear: string;
        loading: string;
        optional: string;
        remove: (name: string) => string;
    };
    field: {
        valueMissing: string;
        typeMismatch: string;
        patternMismatch: string;
        tooShort: string;
        tooLong: string;
        rangeUnderflow: string;
        rangeOverflow: string;
        stepMismatch: string;
        badInput: string;
    };
    input: { showPassword: string; hidePassword: string };
    numberField: { decrement: string; increment: string };
    textarea: { tooLong: (extra: number) => string };
    inputGroup: { checking: string; checkFailed: string };
    combobox: {
        showList: string;
        searching: string;
        searchFailed: string;
        startTyping: string;
        empty: string;
        emptyFor: (query: string) => string;
    };
    timePicker: {
        pick: string;
        now: string;
        // Znacznik przedziału, który właśnie trwa.
        current: string;
        hours: string;
        minutes: string;
    };
    datePicker: {
        pick: string;
        pickRange: string;
        today: string;
    };
    calendar: {
        previousMonth: string;
        nextMonth: string;
        previousYear: string;
        nextYear: string;
        previousYears: string;
        nextYears: string;
        // Od poniedziałku.
        weekdaysShort: readonly string[];
        weekdaysLong: readonly string[];
    };
    codeField: {
        invalid: string;
        verifying: string;
        character: (index: number, total: number) => string;
    };
    fileUpload: {
        // Z „albo” na końcu, dalej idzie browse: „Przeciągnij pliki albo wybierz z dysku”.
        drag: (multiple: boolean) => string;
        browse: string;
        choose: (multiple: boolean) => string;
        unsupported: string;
        upTo: (size: string) => string;
        types: { image: string; video: string; audio: string };
        tooLarge: (max: string) => string;
        tooMany: (max: number) => string;
        uploadFailed: string;
        uploaded: string;
        retry: (name: string) => string;
        added: (count: number) => string;
        rejected: (count: number) => string;
        removed: (name: string) => string;
    };
    slider: { from: string; to: string };
    stepper: {
        back: string;
        next: string;
        finish: string;
        incomplete: string;
        finishFailed: string;
        step: (index: number, total: number) => string;
        optional: string;
    };
    pagination: {
        label: string;
        perPage: string;
        perPageLabel: string;
        first: string;
        previous: string;
        next: string;
        last: string;
        jump: string;
        jumpInput: (total: number) => string;
        page: (page: string) => string;
        pageOf: (page: string, total: string) => string;
        noResults: string;
        range: (from: string, to: string, total: string) => string;
    };
    breadcrumbs: { label: string; showHidden: (count: number) => string };
    link: {
        newTab: string;
        leavingTitle: string;
        leavingBefore: string;
        leavingAfter: string;
        go: string;
        dontAsk: (domain: string) => string;
    };
    copy: {
        copy: string;
        copied: string;
        failed: string;
        copyCode: string;
    };
    codeBlock: { showAll: (lines: number) => string; code: string };
    password: {
        minLength: (length: number) => string;
        mixedCase: string;
        digit: string;
        special: string;
        levels: readonly [string, string, string, string, string];
        common: string;
        verdict: (level: string) => string;
        empty: string;
        met: string;
        unmet: string;
    };
    form: { submitFailed: string };
    toast: { undo: string };
    checkboxGroup: {
        selectAll: string;
        count: (selected: string, total: string) => string;
    };
    accordion: { showDetails: string };
    kbd: { space: string; backspace: string; delete: string; escape: string };
    localeSwitcher: { label: string };
    userMenu: { label: (name: string) => string };
    appShell: {
        skip: string;
        sidebar: string;
        navigation: string;
        collapse: string;
        expand: string;
        openMenu: string;
        moreActions: string;
    };
    table: {
        search: string;
        clearFilters: string;
        results: (count: number, formatted: string) => string;
        noResults: string;
        noResultsHint: string;
        filterNoOptions: string;
        actions: string;
        moreActions: string;
        selectRow: string;
        selectPage: string;
        selected: (count: number, formatted: string) => string;
        selectAll: (count: number, formatted: string) => string;
        allSelected: (count: number, formatted: string) => string;
        clearSelection: string;
    };
    confirm: { confirm: string; failed: string };
    stat: {
        noData: string;
        increase: (delta: string) => string;
        decrease: (delta: string) => string;
        unchanged: string;
    };
}

// Częściowe nadpisanie katalogu, np. zmiana jednego tekstu w aplikacji.
export type MessagesOverride = {
    [K in keyof Messages]?: Messages[K] extends object
        ? Partial<Messages[K]>
        : Messages[K];
};
