// Standard Schema v1 (standardschema.dev): wspólny interfejs Zoda 4,
// Valibota, ArkType i innych. Typy skopiowane zgodnie ze specyfikacją,
// żeby biblioteka nie zależała od żadnej z nich.

export interface StandardSchemaV1<Input = unknown, Output = Input> {
    readonly "~standard": {
        readonly version: 1;
        readonly vendor: string;
        readonly validate: (
            value: unknown,
        ) => StandardResult<Output> | Promise<StandardResult<Output>>;
        readonly types?:
            | { readonly input: Input; readonly output: Output }
            | undefined;
    };
}

export type StandardResult<Output> =
    | { readonly value: Output; readonly issues?: undefined }
    | { readonly issues: readonly StandardIssue[] };

export interface StandardIssue {
    readonly message: string;
    readonly path?:
        | readonly (PropertyKey | { readonly key: PropertyKey })[]
        | undefined;
}

export type InferOutput<Schema> =
    Schema extends StandardSchemaV1<unknown, infer Output> ? Output : never;
