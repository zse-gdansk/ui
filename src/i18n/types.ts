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
    grade: {
        // Nazwy ocen domyślnej skali po wartości: 4 → „dobry”.
        steps: Record<number, string>;
        // Po symbolu modyfikatora: "+" → „plus”.
        modifiers: Record<string, string>;
        // Po zapisie znaku: "np" → „nieprzygotowany”.
        marks: Record<string, string>;
        weight: (weight: string) => string;
        improvedFrom: (previous: string) => string;
        invalid: string;
        pick: string;
        average: string;
        noAverage: string;
        predicted: (grade: string) => string;
        from: (grade: string) => string;
        range: (from: string, to: string) => string;
        pointsFrom: (points: string) => string;
        thresholdOrder: string;
    };
    capacity: {
        of: (taken: number, limit: number) => string;
        left: (free: number) => string;
        full: string;
        waitlist: (count: number) => string;
        signedUp: (count: number) => string;
    };
    signup: {
        join: string;
        joinWaitlist: string;
        leave: string;
        leaveWaitlist: string;
        joined: string;
        waitlisted: (position: number | undefined) => string;
        closed: string;
        full: string;
        closes: string;
        failed: string;
    };
    peoplePicker: {
        groups: string;
        people: string;
        members: (count: number) => string;
        // Nazwa chipu grupy dla czytnika, np. „3C, 28 osób”.
        groupChip: (label: string, count: number) => string;
        inGroup: (group: string) => string;
    };
    hoverCard: {
        failed: string;
    };
    photo: {
        choose: string;
        change: string;
        remove: string;
        // Tytuł okna kadrowania.
        crop: string;
        // Nazwa kadru dla czytnika, z instrukcją klawiszy.
        frame: string;
        hint: string;
        zoom: string;
        rotate: string;
        save: string;
        notImage: string;
        drop: string;
    };
    notifications: {
        label: string;
        // Nazwa dzwonka dla czytnika z liczbą nieprzeczytanych.
        trigger: (unread: number) => string;
        markAll: string;
        // Krótko na przycisku; pełna nazwa (markAll) dla czytnika.
        markAllShort: string;
        markRead: string;
        all: string;
        unread: string;
        empty: string;
        emptyUnread: string;
        showAll: string;
    };
    errorPage: {
        notFound: { title: string; description: string };
        forbidden: { title: string; description: string };
        error: { title: string; description: string };
        maintenance: { title: string; description: string };
        offline: { title: string; description: string };
        back: string;
        home: string;
        retry: string;
        reload: string;
        // Kod do zgłoszenia, np. digest błędu z serwera.
        code: string;
        // Konto, na którym brakuje uprawnień: „Zalogowano jako Jan (uczeń)”.
        signedInAs: (who: string) => string;
        switchAccount: string;
        // Koniec przerwy: „Wracamy o 15:00, za 2 godz.”.
        returns: (when: string) => string;
        returnsToday: (clock: string, relative: string) => string;
        overdue: string;
    };
    survey: {
        // Gotowe skale, od najbardziej pozytywnej.
        agreement: readonly string[];
        yesNo: readonly string[];
        frequency: readonly string[];
        // Błąd pytania bez odpowiedzi w SurveyMatrix.
        missing: string;
        question: string;
    };
    rankList: {
        // Dla czytnika: jak przestawiać z klawiatury.
        instructions: string;
        handle: (label: string) => string;
        picked: (label: string, position: number, total: number) => string;
        moved: (label: string, position: number, total: number) => string;
        dropped: (label: string, position: number, total: number) => string;
        cancelled: (label: string) => string;
        moveUp: string;
        moveDown: string;
        // Linia pod ostatnią liczoną pozycją przy max.
        beyond: string;
    };
    qr: {
        label: string;
        scanner: string;
        starting: string;
        hint: string;
        denied: string;
        deniedHint: string;
        noCamera: string;
        unsupported: string;
        failed: string;
        retry: string;
        torchOn: string;
        torchOff: string;
        switchCamera: string;
        scanned: string;
    };
    eventCalendar: {
        today: string;
        month: string;
        list: string;
        view: string;
        types: string;
        // „+2 więcej” w dniu z nadmiarem wydarzeń.
        more: (count: number) => string;
        allDay: string;
        empty: string;
        // Liczba wydarzeń dnia dla czytnika.
        events: (count: number) => string;
    };
    timetable: {
        // Nagłówek kolumny z godzinami.
        lesson: string;
        day: string;
        now: string;
        cancelled: string;
        substitute: string;
        // Poprzednia wartość przy zastępstwie, dla czytnika i podpowiedzi.
        instead: (value: string) => string;
        // Wolna lekcja między zajęciami.
        free: string;
        empty: string;
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
    kbd: {
        space: string;
        backspace: string;
        delete: string;
        escape: string;
        // Między klawiszami sekwencji: „G potem U”.
        sequence: string;
    };
    localeSwitcher: { label: string };
    userMenu: { label: (name: string) => string };
    deadline: {
        // Dopisek dla czytnika przed czasem („Termin: jutro o 15:00”).
        dueLabel: string;
        due: (when: string) => string;
        overdue: (when: string) => string;
        done: string;
    };
    banner: {
        label: string;
        dismiss: string;
        ends: (when: string) => string;
        tomorrowAt: (time: string) => string;
    };
    choiceCard: {
        count: (selected: string, max: string) => string;
    };
    chart: {
        empty: string;
        total: string;
        // Liczba odpowiedzi w pytaniu ankiety (LikertChart).
        responses: (count: number, formatted: string) => string;
        // Komórka heatmapy bez wartości, np. dzień bez tej lekcji.
        noValue: string;
    };
    timeline: {
        today: string;
        yesterday: string;
        justNow: string;
        yesterdayAt: (time: string) => string;
        dayAt: (day: string, time: string) => string;
        showMore: (count: number, formatted: string) => string;
        showLess: string;
        change: (label: string, from: string, to: string) => string;
        added: (label: string, to: string) => string;
        removed: (label: string, from: string) => string;
    };
    tagInput: {
        invalid: string;
        duplicate: (tag: string) => string;
        limit: (max: string) => string;
        skipped: (count: number, formatted: string) => string;
        armed: (tag: string) => string;
    };
    secretField: {
        show: string;
        hide: string;
        // Dla czytnika zamiast kropek.
        hidden: string;
        hiddenEnding: (ending: string) => string;
        loadFailed: string;
    };
    appLoader: {
        loading: string;
        // Teksty przy długim wczytywaniu: pierwszy zawsze na start, potem
        // losowo.
        slow: readonly string[];
        failed: string;
        retry: string;
    };
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
    command: {
        label: string;
        search: string;
        placeholder: string;
        back: string;
        commands: string;
        recent: string;
        searching: string;
        failed: string;
        searchFailed: string;
        empty: string;
        emptyFor: (query: string) => string;
        // Stopka: co zrobi Enter i Escape.
        open: string;
        go: string;
        run: string;
        pick: string;
        next: string;
        save: string;
        close: string;
        // Wiersz kroku z tekstem, zanim coś się wpisze.
        typeValue: (label: string) => string;
        required: string;
        // Podpowiedź po pierwszym klawiszu sekwencji.
        sequence: string;
        // Okno skrótów (?) i jego grupa w palecie.
        shortcuts: string;
        shortcutsHint: string;
        help: string;
        // Między kilkoma skrótami jednego polecenia.
        or: string;
    };
}

// Częściowe nadpisanie katalogu, np. zmiana jednego tekstu w aplikacji.
export type MessagesOverride = {
    [K in keyof Messages]?: Messages[K] extends object
        ? Partial<Messages[K]>
        : Messages[K];
};
