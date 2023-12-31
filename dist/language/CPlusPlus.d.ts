import { TargetLanguage } from "../TargetLanguage";
import { Type, TypeKind, ClassType, ClassProperty, EnumType, UnionType } from "../Type";
import { Name, Namer } from "../Naming";
import { Sourcelike } from "../Source";
import { NamingStyle } from "../support/Strings";
import { ConvenienceRenderer, ForbiddenWordsInfo } from "../ConvenienceRenderer";
import { StringOption, EnumOption, BooleanOption, Option, OptionValues } from "../RendererOptions";
import { Declaration } from "../DeclarationIR";
import { RenderContext } from "../Renderer";
export declare const cPlusPlusOptions: {
    typeSourceStyle: EnumOption<boolean>;
    includeLocation: EnumOption<boolean>;
    codeFormat: EnumOption<boolean>;
    wstring: EnumOption<boolean>;
    westConst: EnumOption<boolean>;
    justTypes: BooleanOption;
    namespace: StringOption;
    enumType: StringOption;
    typeNamingStyle: EnumOption<NamingStyle>;
    memberNamingStyle: EnumOption<NamingStyle>;
    enumeratorNamingStyle: EnumOption<NamingStyle>;
    boost: BooleanOption;
    hideNullOptional: BooleanOption;
};
export declare class CPlusPlusTargetLanguage extends TargetLanguage {
    constructor(displayName?: string, names?: string[], extension?: string);
    protected getOptions(): Option<any>[];
    get supportsUnionsWithBothNumberTypes(): boolean;
    get supportsOptionalClassProperties(): boolean;
    protected makeRenderer(renderContext: RenderContext, untypedOptionValues: {
        [name: string]: any;
    }): CPlusPlusRenderer;
}
/**
 * To be able to support circles in multiple files -
 * e.g. class#A using class#B using class#A (obviously not directly,
 * but in vector or in variant) we can forward declare them;
 */
export declare enum IncludeKind {
    ForwardDeclare = 0,
    Include = 1
}
export declare enum GlobalNames {
    ClassMemberConstraints = 0,
    ClassMemberConstraintException = 1,
    ValueTooLowException = 2,
    ValueTooHighException = 3,
    ValueTooShortException = 4,
    ValueTooLongException = 5,
    InvalidPatternException = 6,
    CheckConstraint = 7
}
export declare enum MemberNames {
    MinIntValue = 0,
    GetMinIntValue = 1,
    SetMinIntValue = 2,
    MaxIntValue = 3,
    GetMaxIntValue = 4,
    SetMaxIntValue = 5,
    MinDoubleValue = 6,
    GetMinDoubleValue = 7,
    SetMinDoubleValue = 8,
    MaxDoubleValue = 9,
    GetMaxDoubleValue = 10,
    SetMaxDoubleValue = 11,
    MinLength = 12,
    GetMinLength = 13,
    SetMinLength = 14,
    MaxLength = 15,
    GetMaxLength = 16,
    SetMaxLength = 17,
    Pattern = 18,
    GetPattern = 19,
    SetPattern = 20
}
type ConstraintMember = {
    name: MemberNames;
    getter: MemberNames;
    setter: MemberNames;
    cppType: string;
    cppConstType?: string;
};
export type IncludeRecord = {
    kind: IncludeKind | undefined /** How to include that */;
    typeKind: TypeKind | undefined /** What exactly to include */;
};
export type TypeRecord = {
    name: Name;
    type: Type;
    level: number;
    variant: boolean;
    forceInclude: boolean;
};
/**
 * We map each and every unique type to a include kind, e.g. how
 * to include the given type
 */
export type IncludeMap = Map<string, IncludeRecord>;
export type TypeContext = {
    needsForwardIndirection: boolean;
    needsOptionalIndirection: boolean;
    inJsonNamespace: boolean;
};
declare class WrappingCode {
    private readonly start;
    private readonly end;
    constructor(start: Sourcelike[], end: Sourcelike[]);
    wrap(qualifier: Sourcelike, inner: Sourcelike): Sourcelike;
}
export declare class CPlusPlusRenderer extends ConvenienceRenderer {
    private readonly _options;
    /**
     * For forward declaration practically
     */
    private readonly _enumType;
    private readonly _generatedFiles;
    private _currentFilename;
    private _allTypeNames;
    private readonly _gettersAndSettersForPropertyName;
    private readonly _namespaceNames;
    private readonly _memberNameStyle;
    private readonly _namedTypeNameStyle;
    private readonly _generatedGlobalNames;
    private readonly _generatedMemberNames;
    private readonly _forbiddenGlobalNames;
    private readonly _memberNamingFunction;
    private readonly _stringType;
    private readonly _optionalType;
    private readonly _optionalFactory;
    private readonly _nulloptType;
    private readonly _variantType;
    private readonly _variantIndexMethodName;
    protected readonly typeNamingStyle: NamingStyle;
    protected readonly enumeratorNamingStyle: NamingStyle;
    constructor(targetLanguage: TargetLanguage, renderContext: RenderContext, _options: OptionValues<typeof cPlusPlusOptions>);
    isUnion(t: Type | UnionType): t is UnionType;
    isOptionalAsValuePossible(t: Type): boolean;
    isImplicitCycleBreaker(t: Type): boolean;
    optionalTypeStack(): string;
    optionalFactoryStack(): string;
    optionalTypeHeap(): string;
    optionalFactoryHeap(): string;
    optionalType(t: Type): string;
    optionalTypeLabel(t: Type): string;
    protected getConstraintMembers(): ConstraintMember[];
    protected lookupGlobalName(type: GlobalNames): string;
    protected lookupMemberName(type: MemberNames): string;
    protected addGlobalName(type: GlobalNames): void;
    protected addMemberName(type: MemberNames): void;
    protected setupGlobalNames(): void;
    protected forbiddenNamesForGlobalNamespace(): string[];
    protected forbiddenForObjectProperties(_c: ClassType, _className: Name): ForbiddenWordsInfo;
    protected forbiddenForEnumCases(_e: EnumType, _enumName: Name): ForbiddenWordsInfo;
    protected makeNamedTypeNamer(): Namer;
    protected namerForObjectProperty(): Namer;
    protected makeUnionMemberNamer(): null;
    protected makeEnumCaseNamer(): Namer;
    protected makeNamesForPropertyGetterAndSetter(_c: ClassType, _className: Name, _p: ClassProperty, _jsonName: string, name: Name): [Name, Name, Name];
    protected makePropertyDependencyNames(c: ClassType, className: Name, p: ClassProperty, jsonName: string, name: Name): Name[];
    protected withConst(s: Sourcelike): Sourcelike;
    protected emitInclude(global: boolean, name: Sourcelike): void;
    protected startFile(basename: Sourcelike, includeHelper?: boolean): void;
    protected finishFile(): void;
    protected get needsTypeDeclarationBeforeUse(): boolean;
    protected canBeForwardDeclared(t: Type): boolean;
    protected emitDescriptionBlock(lines: Sourcelike[]): void;
    protected emitBlock(line: Sourcelike, withSemicolon: boolean, f: () => void, withIndent?: boolean): void;
    protected emitNamespaces(namespaceNames: Iterable<string>, f: () => void): void;
    protected cppTypeInOptional(nonNulls: ReadonlySet<Type>, ctx: TypeContext, withIssues: boolean, forceNarrowString: boolean): Sourcelike;
    protected variantType(u: UnionType, inJsonNamespace: boolean): Sourcelike;
    protected ourQualifier(inJsonNamespace: boolean): Sourcelike;
    protected jsonQualifier(inJsonNamespace: boolean): Sourcelike;
    protected variantIndirection(type: Type, needIndirection: boolean, typeSrc: Sourcelike): Sourcelike;
    protected cppType(t: Type, ctx: TypeContext, withIssues: boolean, forceNarrowString: boolean, isOptional: boolean): Sourcelike;
    /**
     * similar to cppType, it practically gathers all the generated types within
     * 't'. It also records, whether a given sub-type is part of a variant or not.
     */
    protected generatedTypes(isClassMember: boolean, theType: Type): TypeRecord[];
    protected constraintMember(jsonName: string): string;
    protected emitMember(cppType: Sourcelike, name: Sourcelike): void;
    protected emitClassMembers(c: ClassType, constraints: Map<string, Sourcelike> | undefined): void;
    protected generateClassConstraints(c: ClassType): Map<string, Sourcelike> | undefined;
    protected emitClass(c: ClassType, className: Name): void;
    protected emitTopLevelHeaders(t: Type, className: Name): void;
    protected emitClassHeaders(className: Name): void;
    protected emitTopLevelFunction(t: Type, className: Name): void;
    protected emitClassFunctions(c: ClassType, className: Name): void;
    protected emitEnum(e: EnumType, enumName: Name): void;
    protected emitUnionTypedefs(u: UnionType, unionName: Name): void;
    protected emitUnionHeaders(u: UnionType): void;
    protected emitUnionFunctions(u: UnionType): void;
    protected emitEnumHeaders(enumName: Name): void;
    private isLargeEnum;
    protected emitEnumFunctions(e: EnumType, enumName: Name): void;
    protected emitTopLevelTypedef(t: Type, name: Name): void;
    protected emitAllUnionFunctions(): void;
    protected emitAllUnionHeaders(): void;
    protected emitOptionalHelpers(): void;
    protected emitDeclaration(decl: Declaration): void;
    protected emitGetterSetter(t: string, getterName: string, setterName: string, memberName: string): void;
    protected emitNumericCheckConstraints(checkConst: string, classConstraint: string, getterMinValue: string, getterMaxValue: string, cppType: string): void;
    protected emitConstraintClasses(): void;
    protected emitHelperFunctions(): void;
    protected emitExtraIncludes(): void;
    protected emitHelper(): void;
    protected emitTypes(): void;
    protected gatherUserNamespaceForwardDecls(): Sourcelike[];
    protected gatherNlohmannNamespaceForwardDecls(): Sourcelike[];
    protected emitUserNamespaceImpls(): void;
    protected emitNlohmannNamespaceImpls(): void;
    protected emitGenerators(): void;
    protected emitSingleSourceStructure(proposedFilename: string): void;
    protected updateIncludes(isClassMember: boolean, includes: IncludeMap, propertyType: Type, _defName: string): void;
    protected emitIncludes(c: ClassType | UnionType | EnumType, defName: string): void;
    protected emitDefinition(d: ClassType | EnumType | UnionType, defName: Name): void;
    protected emitMultiSourceStructure(proposedFilename: string): void;
    protected emitSourceStructure(proposedFilename: string): void;
    protected isConversionRequired(t: Type): boolean;
    NarrowString: {
        wrapEncodingChange(_qualifier: Sourcelike[], _fromType: Sourcelike, _toType: Sourcelike, inner: Sourcelike): Sourcelike;
        emitHelperFunctions(): void;
        _stringType: string;
        _constStringType: string;
        _smatch: string;
        _regex: string;
        _stringLiteralPrefix: string;
        _toString: WrappingCode;
        _encodingClass: Sourcelike;
        _encodingFunction: Sourcelike;
        getType(): string;
        getConstType(): string;
        getSMatch(): string;
        getRegex(): string;
        createStringLiteral(inner: Sourcelike): Sourcelike;
        wrapToString(inner: Sourcelike): Sourcelike;
    };
    WideString: {
        superThis: CPlusPlusRenderer;
        wrapEncodingChange(qualifier: Sourcelike[], fromType: Sourcelike, toType: Sourcelike, inner: Sourcelike): Sourcelike;
        emitHelperFunctions(): void;
        _stringType: string;
        _constStringType: string;
        _smatch: string;
        _regex: string;
        _stringLiteralPrefix: string;
        _toString: WrappingCode;
        _encodingClass: Sourcelike;
        _encodingFunction: Sourcelike;
        getType(): string;
        getConstType(): string;
        getSMatch(): string;
        getRegex(): string;
        createStringLiteral(inner: Sourcelike): Sourcelike;
        wrapToString(inner: Sourcelike): Sourcelike;
    };
}
export {};
