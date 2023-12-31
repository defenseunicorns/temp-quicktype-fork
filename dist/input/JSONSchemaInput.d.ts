import URI from "urijs";
import { TypeBuilder } from "../TypeBuilder";
import { TypeAttributes } from "../attributes/TypeAttributes";
import { JSONSchema, JSONSchemaStore } from "./JSONSchemaStore";
import { type RunContext } from "../Run";
import { type Input } from "./Inputs";
export declare enum PathElementKind {
    Root = 0,
    KeyOrIndex = 1,
    Type = 2,
    Object = 3
}
export type PathElement = {
    kind: PathElementKind.Root;
} | {
    kind: PathElementKind.KeyOrIndex;
    key: string;
} | {
    kind: PathElementKind.Type;
    index: number;
} | {
    kind: PathElementKind.Object;
};
export declare class Ref {
    readonly path: ReadonlyArray<PathElement>;
    static root(address: string | undefined): Ref;
    private static parsePath;
    static parseURI(uri: URI, destroyURI?: boolean): Ref;
    static parse(ref: string): Ref;
    addressURI: URI | undefined;
    constructor(addressURI: URI | undefined, path: ReadonlyArray<PathElement>);
    get hasAddress(): boolean;
    get address(): string;
    get isRoot(): boolean;
    private pushElement;
    push(...keys: string[]): Ref;
    pushObject(): Ref;
    pushType(index: number): Ref;
    resolveAgainst(base: Ref | undefined): Ref;
    get name(): string;
    get definitionName(): string | undefined;
    toString(): string;
    private lookup;
    lookupRef(root: JSONSchema): JSONSchema;
    equals(other: any): boolean;
    hashCode(): number;
}
export declare const schemaTypeDict: {
    null: boolean;
    boolean: boolean;
    string: boolean;
    integer: boolean;
    number: boolean;
    array: boolean;
    object: boolean;
};
export type JSONSchemaType = keyof typeof schemaTypeDict;
export type JSONSchemaAttributes = {
    forType?: TypeAttributes;
    forUnion?: TypeAttributes;
    forObject?: TypeAttributes;
    forNumber?: TypeAttributes;
    forString?: TypeAttributes;
    forCases?: TypeAttributes[];
};
export type JSONSchemaAttributeProducer = (schema: JSONSchema, canonicalRef: Ref, types: Set<JSONSchemaType>, unionCases: JSONSchema[] | undefined) => JSONSchemaAttributes | undefined;
export interface JSONSchemaSourceData {
    name: string;
    uris?: string[];
    schema?: string;
    isConverted?: boolean;
}
export declare class JSONSchemaInput implements Input<JSONSchemaSourceData> {
    private _schemaStore;
    private readonly _additionalSchemaAddresses;
    readonly kind: string;
    readonly needSchemaProcessing: boolean;
    private readonly _attributeProducers;
    private readonly _schemaInputs;
    private _schemaSources;
    private readonly _topLevels;
    private _needIR;
    constructor(_schemaStore: JSONSchemaStore | undefined, additionalAttributeProducers?: JSONSchemaAttributeProducer[], _additionalSchemaAddresses?: ReadonlyArray<string>);
    get needIR(): boolean;
    addTopLevel(name: string, ref: Ref): void;
    addTypes(ctx: RunContext, typeBuilder: TypeBuilder): Promise<void>;
    addTypesSync(): void;
    addSource(schemaSource: JSONSchemaSourceData): Promise<void>;
    addSourceSync(schemaSource: JSONSchemaSourceData): void;
    singleStringSchemaSource(): string | undefined;
}
