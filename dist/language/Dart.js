"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DartRenderer = exports.DartTargetLanguage = exports.dartOptions = void 0;
const Type_1 = require("../Type");
const TypeUtils_1 = require("../TypeUtils");
const Source_1 = require("../Source");
const Strings_1 = require("../support/Strings");
const Naming_1 = require("../Naming");
const ConvenienceRenderer_1 = require("../ConvenienceRenderer");
const TargetLanguage_1 = require("../TargetLanguage");
const RendererOptions_1 = require("../RendererOptions");
const Annotation_1 = require("../Annotation");
const Support_1 = require("../support/Support");
exports.dartOptions = {
    nullSafety: new RendererOptions_1.BooleanOption("null-safety", "Null Safety", true),
    justTypes: new RendererOptions_1.BooleanOption("just-types", "Types only", false),
    codersInClass: new RendererOptions_1.BooleanOption("coders-in-class", "Put encoder & decoder in Class", false),
    methodNamesWithMap: new RendererOptions_1.BooleanOption("from-map", "Use method names fromMap() & toMap()", false, "secondary"),
    requiredProperties: new RendererOptions_1.BooleanOption("required-props", "Make all properties required", false),
    finalProperties: new RendererOptions_1.BooleanOption("final-props", "Make all properties final", false),
    generateCopyWith: new RendererOptions_1.BooleanOption("copy-with", "Generate CopyWith method", false),
    useFreezed: new RendererOptions_1.BooleanOption("use-freezed", "Generate class definitions with @freezed compatibility", false, "secondary"),
    useHive: new RendererOptions_1.BooleanOption("use-hive", "Generate annotations for Hive type adapters", false, "secondary"),
    useJsonAnnotation: new RendererOptions_1.BooleanOption("use-json-annotation", "Generate annotations for json_serializable", false, "secondary"),
    partName: new RendererOptions_1.StringOption("part-name", "Use this name in `part` directive", "NAME", "", "secondary")
};
class DartTargetLanguage extends TargetLanguage_1.TargetLanguage {
    constructor() {
        super("Dart", ["dart"], "dart");
    }
    getOptions() {
        return [
            exports.dartOptions.nullSafety,
            exports.dartOptions.justTypes,
            exports.dartOptions.codersInClass,
            exports.dartOptions.methodNamesWithMap,
            exports.dartOptions.requiredProperties,
            exports.dartOptions.finalProperties,
            exports.dartOptions.generateCopyWith,
            exports.dartOptions.useFreezed,
            exports.dartOptions.useHive,
            exports.dartOptions.useJsonAnnotation,
            exports.dartOptions.partName
        ];
    }
    get supportsUnionsWithBothNumberTypes() {
        return true;
    }
    get stringTypeMapping() {
        const mapping = new Map();
        mapping.set("date", "date");
        mapping.set("date-time", "date-time");
        return mapping;
    }
    makeRenderer(renderContext, untypedOptionValues) {
        const options = (0, RendererOptions_1.getOptionValues)(exports.dartOptions, untypedOptionValues);
        return new DartRenderer(this, renderContext, options);
    }
}
exports.DartTargetLanguage = DartTargetLanguage;
const keywords = [
    "abstract",
    "do",
    "import",
    "super",
    "as",
    "dynamic",
    "in",
    "switch",
    "assert",
    "else",
    "interface",
    "sync*",
    "async",
    "enum",
    "is",
    "this",
    "async*",
    "export",
    "library",
    "throw",
    "await",
    "external",
    "mixin",
    "true",
    "break",
    "extends",
    "new",
    "try",
    "case",
    "factory",
    "null",
    "typedef",
    "catch",
    "false",
    "operator",
    "var",
    "class",
    "final",
    "part",
    "void",
    "const",
    "finally",
    "rethrow",
    "while",
    "continue",
    "for",
    "return",
    "with",
    "covariant",
    "get",
    "set",
    "yield",
    "default",
    "if",
    "static",
    "yield*",
    "deferred",
    "implements",
    "int",
    "double",
    "bool",
    "Map",
    "List",
    "String",
    "File",
    "fromJson",
    "toJson",
    "fromMap",
    "toMap"
];
const typeNamingFunction = (0, Naming_1.funPrefixNamer)("types", n => dartNameStyle(true, false, n));
const propertyNamingFunction = (0, Naming_1.funPrefixNamer)("properties", n => dartNameStyle(false, false, n));
const enumCaseNamingFunction = (0, Naming_1.funPrefixNamer)("enum-cases", n => dartNameStyle(true, true, n));
// Escape the dollar sign, which is used in string interpolation
const stringEscape = (0, Strings_1.utf16ConcatMap)((0, Strings_1.escapeNonPrintableMapper)(cp => (0, Strings_1.isPrintable)(cp) && cp !== 0x24, Strings_1.standardUnicodeHexEscape));
function isStartCharacter(codePoint) {
    if (codePoint === 0x5f)
        return false; // underscore
    return (0, Strings_1.isAscii)(codePoint) && (0, Strings_1.isLetter)(codePoint);
}
function isPartCharacter(codePoint) {
    return isStartCharacter(codePoint) || ((0, Strings_1.isAscii)(codePoint) && (0, Strings_1.isDigit)(codePoint));
}
const legalizeName = (0, Strings_1.utf16LegalizeCharacters)(isPartCharacter);
// FIXME: Handle acronyms consistently.  In particular, that means that
// we have to use namers to produce the getter and setter names - we can't
// just capitalize and concatenate.
// https://stackoverflow.com/questions/8277355/naming-convention-for-upper-case-abbreviations
function dartNameStyle(startWithUpper, upperUnderscore, original) {
    const words = (0, Strings_1.splitIntoWords)(original);
    const firstWordStyle = upperUnderscore
        ? Strings_1.allUpperWordStyle
        : startWithUpper
            ? Strings_1.firstUpperWordStyle
            : Strings_1.allLowerWordStyle;
    const restWordStyle = upperUnderscore ? Strings_1.allUpperWordStyle : Strings_1.firstUpperWordStyle;
    return (0, Strings_1.combineWords)(words, legalizeName, firstWordStyle, restWordStyle, firstWordStyle, restWordStyle, upperUnderscore ? "_" : "", isStartCharacter);
}
class DartRenderer extends ConvenienceRenderer_1.ConvenienceRenderer {
    constructor(targetLanguage, renderContext, _options) {
        super(targetLanguage, renderContext);
        this._options = _options;
        this._gettersAndSettersForPropertyName = new Map();
        this._needEnumValues = false;
        this.classCounter = 0;
        this.classPropertyCounter = 0;
        this._topLevelDependents = new Map();
        this._enumValues = new Map();
    }
    forbiddenNamesForGlobalNamespace() {
        return keywords;
    }
    forbiddenForObjectProperties(_c, _className) {
        return { names: [], includeGlobalForbidden: true };
    }
    makeNamedTypeNamer() {
        return typeNamingFunction;
    }
    namerForObjectProperty() {
        return propertyNamingFunction;
    }
    makeUnionMemberNamer() {
        return propertyNamingFunction;
    }
    makeEnumCaseNamer() {
        return enumCaseNamingFunction;
    }
    unionNeedsName(u) {
        return (0, TypeUtils_1.nullableFromUnion)(u) === null;
    }
    namedTypeToNameForTopLevel(type) {
        // If the top-level type doesn't contain any classes or unions
        // we have to define a class just for the `FromJson` method, in
        // emitFromJsonForTopLevel.
        return (0, TypeUtils_1.directlyReachableSingleNamedType)(type);
    }
    get toJson() {
        return `to${this._options.methodNamesWithMap ? "Map" : "Json"}`;
    }
    get fromJson() {
        return `from${this._options.methodNamesWithMap ? "Map" : "Json"}`;
    }
    makeTopLevelDependencyNames(_t, name) {
        const encoder = new Naming_1.DependencyName(propertyNamingFunction, name.order, lookup => `${lookup(name)}_${this.toJson}`);
        const decoder = new Naming_1.DependencyName(propertyNamingFunction, name.order, lookup => `${lookup(name)}_${this.fromJson}`);
        this._topLevelDependents.set(name, { encoder, decoder });
        return [encoder, decoder];
    }
    makeNamesForPropertyGetterAndSetter(_c, _className, _p, _jsonName, name) {
        const getterName = new Naming_1.DependencyName(propertyNamingFunction, name.order, lookup => `get_${lookup(name)}`);
        const setterName = new Naming_1.DependencyName(propertyNamingFunction, name.order, lookup => `set_${lookup(name)}`);
        return [getterName, setterName];
    }
    makePropertyDependencyNames(c, className, p, jsonName, name) {
        const getterAndSetterNames = this.makeNamesForPropertyGetterAndSetter(c, className, p, jsonName, name);
        this._gettersAndSettersForPropertyName.set(name, getterAndSetterNames);
        return getterAndSetterNames;
    }
    makeNamedTypeDependencyNames(t, name) {
        if (!(t instanceof Type_1.EnumType))
            return [];
        const enumValue = new Naming_1.DependencyName(propertyNamingFunction, name.order, lookup => `${lookup(name)}_values`);
        this._enumValues.set(t, enumValue);
        return [enumValue];
    }
    emitFileHeader() {
        if (this.leadingComments !== undefined) {
            this.emitCommentLines(this.leadingComments);
        }
        if (this._options.justTypes)
            return;
        if (!this._options.codersInClass) {
            this.emitLine("// To parse this JSON data, do");
            this.emitLine("//");
            this.forEachTopLevel("none", (_t, name) => {
                const { decoder } = (0, Support_1.defined)(this._topLevelDependents.get(name));
                this.emitLine("//     final ", (0, Source_1.modifySource)(Strings_1.decapitalize, name), " = ", decoder, "(jsonString);");
            });
        }
        this.ensureBlankLine();
        if (this._options.requiredProperties) {
            this.emitLine("import 'package:meta/meta.dart';");
        }
        if (this._options.useFreezed) {
            this.emitLine("import 'package:freezed_annotation/freezed_annotation.dart';");
        }
        if (this._options.useHive) {
            this.emitLine("import 'package:hive/hive.dart';");
        }
        if (this._options.useJsonAnnotation && !this._options.useFreezed) {
            // The freezed annotatation import already provides the import for json_annotation
            this.emitLine("import 'package:json_annotation/json_annotation.dart';");
        }
        this.emitLine("import 'dart:convert';");
        if (this._options.useFreezed || this._options.useHive || this._options.useJsonAnnotation) {
            this.ensureBlankLine();
            const optionNameIsEmpty = this._options.partName.length === 0;
            // FIXME: This should use a `Name`, not `modifySource`
            const name = (0, Source_1.modifySource)(Strings_1.snakeCase, optionNameIsEmpty ? [...this.topLevels.keys()][0] : this._options.partName);
            if (this._options.useFreezed) {
                this.emitLine("part '", name, ".freezed.dart';");
            }
            if (!this._options.justTypes) {
                this.emitLine("part '", name, ".g.dart';");
            }
        }
    }
    emitDescriptionBlock(lines) {
        this.emitCommentLines(lines, "///", "");
    }
    emitBlock(line, f) {
        this.emitLine(line, " {");
        this.indent(f);
        this.emitLine("}");
    }
    dartType(t, withIssues = false, forceNullable = false) {
        const nullable = forceNullable || (this._options.nullSafety && t.isNullable && !this._options.requiredProperties);
        const withNullable = (s) => (nullable ? [s, "?"] : s);
        return (0, TypeUtils_1.matchType)(t, _anyType => (0, Source_1.maybeAnnotated)(withIssues, Annotation_1.anyTypeIssueAnnotation, "dynamic"), _nullType => (0, Source_1.maybeAnnotated)(withIssues, Annotation_1.nullTypeIssueAnnotation, "dynamic"), _boolType => withNullable("bool"), _integerType => withNullable("int"), _doubleType => withNullable("double"), _stringType => withNullable("String"), arrayType => withNullable(["List<", this.dartType(arrayType.items, withIssues), ">"]), classType => withNullable(this.nameForNamedType(classType)), mapType => withNullable(["Map<String, ", this.dartType(mapType.values, withIssues), ">"]), enumType => withNullable(this.nameForNamedType(enumType)), unionType => {
            const maybeNullable = (0, TypeUtils_1.nullableFromUnion)(unionType);
            if (maybeNullable === null) {
                return "dynamic";
            }
            return withNullable(this.dartType(maybeNullable, withIssues));
        }, transformedStringType => {
            switch (transformedStringType.kind) {
                case "date-time":
                case "date":
                    return withNullable("DateTime");
                default:
                    return withNullable("String");
            }
        });
    }
    mapList(isNullable, itemType, list, mapper) {
        if (this._options.nullSafety && isNullable && !this._options.requiredProperties) {
            return [list, " == null ? [] : ", "List<", itemType, ">.from(", list, "!.map((x) => ", mapper, "))"];
        }
        return ["List<", itemType, ">.from(", list, ".map((x) => ", mapper, "))"];
    }
    mapMap(isNullable, valueType, map, valueMapper) {
        if (this._options.nullSafety && isNullable && !this._options.requiredProperties) {
            return ["Map.from(", map, "!).map((k, v) => MapEntry<String, ", valueType, ">(k, ", valueMapper, "))"];
        }
        return ["Map.from(", map, ").map((k, v) => MapEntry<String, ", valueType, ">(k, ", valueMapper, "))"];
    }
    mapClass(isNullable, classType, dynamic) {
        if (this._options.nullSafety && isNullable && !this._options.requiredProperties) {
            return [
                dynamic,
                " == null ? null : ",
                this.nameForNamedType(classType),
                ".",
                this.fromJson,
                "(",
                dynamic,
                ")"
            ];
        }
        return [this.nameForNamedType(classType), ".", this.fromJson, "(", dynamic, ")"];
    }
    //If the first time is the unionType type, after nullableFromUnion conversion,
    //the isNullable property will become false, which is obviously wrong,
    //so add isNullable property
    fromDynamicExpression(isNullable = false, t, ...dynamic) {
        return (0, TypeUtils_1.matchType)(t, _anyType => dynamic, _nullType => dynamic, // FIXME: check null
        // FIXME: check null
        _boolType => dynamic, _integerType => dynamic, _doubleType => [dynamic, this._options.nullSafety ? "?.toDouble()" : ".toDouble()"], _stringType => dynamic, arrayType => this.mapList(isNullable || arrayType.isNullable, this.dartType(arrayType.items), dynamic, this.fromDynamicExpression(arrayType.items.isNullable, arrayType.items, "x")), classType => this.mapClass(isNullable || classType.isNullable, classType, dynamic), mapType => this.mapMap(mapType.isNullable || isNullable, this.dartType(mapType.values), dynamic, this.fromDynamicExpression(mapType.values.isNullable, mapType.values, "v")), enumType => {
            return [
                (0, Support_1.defined)(this._enumValues.get(enumType)),
                ".map[",
                dynamic,
                this._options.nullSafety ? "]!" : "]"
            ];
        }, unionType => {
            const maybeNullable = (0, TypeUtils_1.nullableFromUnion)(unionType);
            if (maybeNullable === null) {
                return dynamic;
            }
            return this.fromDynamicExpression(unionType.isNullable, maybeNullable, dynamic);
        }, transformedStringType => {
            switch (transformedStringType.kind) {
                case "date-time":
                case "date":
                    if ((transformedStringType.isNullable || isNullable) &&
                        !this._options.requiredProperties &&
                        this._options.nullSafety) {
                        return [dynamic, " == null ? null : ", "DateTime.parse(", dynamic, ")"];
                    }
                    return ["DateTime.parse(", dynamic, ")"];
                default:
                    return dynamic;
            }
        });
    }
    //If the first time is the unionType type, after nullableFromUnion conversion,
    //the isNullable property will become false, which is obviously wrong,
    //so add isNullable property
    toDynamicExpression(isNullable = false, t, ...dynamic) {
        return (0, TypeUtils_1.matchType)(t, _anyType => dynamic, _nullType => dynamic, _boolType => dynamic, _integerType => dynamic, _doubleType => dynamic, _stringType => dynamic, arrayType => this.mapList(arrayType.isNullable || isNullable, "dynamic", dynamic, this.toDynamicExpression(arrayType.items.isNullable, arrayType.items, "x")), _classType => {
            if (this._options.nullSafety &&
                (_classType.isNullable || isNullable) &&
                !this._options.requiredProperties) {
                return [dynamic, "?.", this.toJson, "()"];
            }
            return [dynamic, ".", this.toJson, "()"];
        }, mapType => this.mapMap(mapType.isNullable || isNullable, "dynamic", dynamic, this.toDynamicExpression(mapType.values.isNullable, mapType.values, "v")), enumType => {
            return [(0, Support_1.defined)(this._enumValues.get(enumType)), ".reverse[", dynamic, "]"];
        }, unionType => {
            const maybeNullable = (0, TypeUtils_1.nullableFromUnion)(unionType);
            if (maybeNullable === null) {
                return dynamic;
            }
            return this.toDynamicExpression(unionType.isNullable, maybeNullable, dynamic);
        }, transformedStringType => {
            switch (transformedStringType.kind) {
                case "date-time":
                    if (this._options.nullSafety &&
                        !this._options.requiredProperties &&
                        (transformedStringType.isNullable || isNullable)) {
                        return [dynamic, "?.toIso8601String()"];
                    }
                    return [dynamic, ".toIso8601String()"];
                case "date":
                    if (this._options.nullSafety &&
                        !this._options.requiredProperties &&
                        (transformedStringType.isNullable || isNullable)) {
                        return [
                            '"${',
                            dynamic,
                            "!.year.toString().padLeft(4, '0')",
                            "}-${",
                            dynamic,
                            "!.month.toString().padLeft(2, '0')}-${",
                            dynamic,
                            "!.day.toString().padLeft(2, '0')}\""
                        ];
                    }
                    return [
                        '"${',
                        dynamic,
                        ".year.toString().padLeft(4, '0')",
                        "}-${",
                        dynamic,
                        ".month.toString().padLeft(2, '0')}-${",
                        dynamic,
                        ".day.toString().padLeft(2, '0')}\""
                    ];
                default:
                    return dynamic;
            }
        });
    }
    _emitEmptyConstructor(className) {
        this.emitLine(className, "();");
    }
    _emitConstructor(c, className) {
        this.emitLine(className, "({");
        this.indent(() => {
            this.forEachClassProperty(c, "none", (name, _, prop) => {
                const required = this._options.requiredProperties ||
                    (this._options.nullSafety && (!prop.type.isNullable || !prop.isOptional));
                this.emitLine(required ? "required " : "", "this.", name, ",");
            });
        });
        this.emitLine("});");
        this.ensureBlankLine();
    }
    _emitVariables(c) {
        this.forEachClassProperty(c, "none", (name, jsonName, p) => {
            const description = this.descriptionForClassProperty(c, jsonName);
            if (description !== undefined) {
                this.emitDescription(description);
            }
            if (this._options.useHive) {
                this.classPropertyCounter++;
                this.emitLine(`@HiveField(${this.classPropertyCounter})`);
            }
            if (this._options.useJsonAnnotation) {
                this.classPropertyCounter++;
                this.emitLine(`@JsonKey(name: "${jsonName}")`);
            }
            this.emitLine(this._options.finalProperties ? "final " : "", this.dartType(p.type, true), " ", name, ";");
        });
    }
    _emitCopyConstructor(c, className) {
        this.ensureBlankLine();
        this.emitLine(className, " copyWith({");
        this.indent(() => {
            this.forEachClassProperty(c, "none", (name, _, _p) => {
                this.emitLine(this.dartType(_p.type, true, true), " ", name, ",");
            });
        });
        this.emitLine("}) => ");
        this.indent(() => {
            this.emitLine(className, "(");
            this.indent(() => {
                this.forEachClassProperty(c, "none", (name, _, _p) => {
                    this.emitLine(name, ": ", name, " ?? ", "this.", name, ",");
                });
            });
            this.emitLine(");");
        });
    }
    _emitStringJsonEncoderDecoder(className) {
        this.ensureBlankLine();
        this.emitLine("factory ", className, ".from", this._options.methodNamesWithMap ? "Json" : "RawJson", "(String str) => ", className, ".", this.fromJson, "(json.decode(str));");
        this.ensureBlankLine();
        this.emitLine("String ", this._options.methodNamesWithMap ? "toJson() => " : "toRawJson() => ", "json.encode(", this.toJson, "());");
    }
    _emitMapEncoderDecoder(c, className) {
        this.ensureBlankLine();
        this.emitLine("factory ", className, ".", this.fromJson, "(Map<String, dynamic> json) => ", className, "(");
        this.indent(() => {
            this.forEachClassProperty(c, "none", (name, jsonName, property) => {
                this.emitLine(name, ": ", this.fromDynamicExpression(property.type.isNullable, property.type, 'json["', stringEscape(jsonName), '"]'), ",");
            });
        });
        this.emitLine(");");
        this.ensureBlankLine();
        this.emitLine("Map<String, dynamic> ", this.toJson, "() => {");
        this.indent(() => {
            this.forEachClassProperty(c, "none", (name, jsonName, property) => {
                this.emitLine('"', stringEscape(jsonName), '": ', this.toDynamicExpression(property.type.isNullable, property.type, name), ",");
            });
        });
        this.emitLine("};");
    }
    emitClassDefinition(c, className) {
        this.emitDescription(this.descriptionForType(c));
        if (this._options.useHive) {
            this.classCounter++;
            this.emitLine(`@HiveType(typeId: ${this.classCounter})`);
            this.classPropertyCounter = 0;
        }
        if (this._options.useJsonAnnotation) {
            this.emitLine(`@JsonSerializable()`);
        }
        this.emitBlock(["class ", className], () => {
            if (c.getProperties().size === 0) {
                this._emitEmptyConstructor(className);
            }
            else {
                this._emitVariables(c);
                this.ensureBlankLine();
                this._emitConstructor(c, className);
            }
            if (this._options.generateCopyWith) {
                this._emitCopyConstructor(c, className);
            }
            if (this._options.useJsonAnnotation) {
                this.ensureBlankLine();
                this.emitLine(
                // factory PublicAnswer.fromJson(Map<String, dynamic> json) => _$PublicAnswerFromJson(json);
                "factory ", className, ".fromJson(Map<String, dynamic> json) => ", "_$", className, "FromJson(json);");
                this.ensureBlankLine();
                this.emitLine(
                // Map<String, dynamic> toJson() => _$PublicAnswerToJson(this);
                "Map<String, dynamic> toJson() => ", "_$", className, "ToJson(this);");
            }
            else {
                if (this._options.justTypes)
                    return;
                if (this._options.codersInClass) {
                    this._emitStringJsonEncoderDecoder(className);
                }
                this._emitMapEncoderDecoder(c, className);
            }
        });
    }
    emitFreezedClassDefinition(c, className) {
        this.emitDescription(this.descriptionForType(c));
        this.emitLine("@freezed");
        this.emitBlock(["class ", className, " with _$", className], () => {
            if (c.getProperties().size === 0) {
                this.emitLine("const factory ", className, "() = _", className, ";");
            }
            else {
                this.emitLine("const factory ", className, "({");
                this.indent(() => {
                    this.forEachClassProperty(c, "none", (name, jsonName, prop) => {
                        const required = this._options.requiredProperties ||
                            (this._options.nullSafety && (!prop.type.isNullable || !prop.isOptional));
                        if (this._options.useJsonAnnotation) {
                            this.classPropertyCounter++;
                            this.emitLine(`@JsonKey(name: "${jsonName}")`);
                        }
                        this.emitLine(required ? "required " : "", this.dartType(prop.type, true), " ", name, ",");
                    });
                });
                this.emitLine("}) = _", className, ";");
            }
            if (this._options.justTypes)
                return;
            this.ensureBlankLine();
            this.emitLine(
            // factory PublicAnswer.fromJson(Map<String, dynamic> json) => _$PublicAnswerFromJson(json);
            "factory ", className, ".fromJson(Map<String, dynamic> json) => ", "_$", className, "FromJson(json);");
        });
    }
    emitEnumDefinition(e, enumName) {
        this.emitDescription(this.descriptionForType(e));
        this.emitLine("enum ", enumName, " {");
        this.indent(() => {
            this.forEachEnumCase(e, "none", (name, jsonName, pos) => {
                const comma = pos === "first" || pos === "middle" ? "," : [];
                if (this._options.useJsonAnnotation) {
                    this.emitLine('@JsonValue("', stringEscape(jsonName), '")');
                }
                this.emitLine(name, comma);
            });
        });
        this.emitLine("}");
        if (this._options.justTypes)
            return;
        this.ensureBlankLine();
        this.emitLine("final ", (0, Support_1.defined)(this._enumValues.get(e)), " = EnumValues({");
        this.indent(() => {
            this.forEachEnumCase(e, "none", (name, jsonName, pos) => {
                const comma = pos === "first" || pos === "middle" ? "," : [];
                this.emitLine('"', stringEscape(jsonName), '": ', enumName, ".", name, comma);
            });
        });
        this.emitLine("});");
        this._needEnumValues = true;
    }
    emitEnumValues() {
        this.ensureBlankLine();
        this.emitMultiline(`class EnumValues<T> {
    Map<String, T> map;
    late Map<T, String> reverseMap;

    EnumValues(this.map);

    Map<T, String> get reverse {
        reverseMap = map.map((k, v) => MapEntry(v, k));
        return reverseMap;
    }
}`);
    }
    _emitTopLvlEncoderDecoder() {
        this.forEachTopLevel("leading-and-interposing", (t, name) => {
            const { encoder, decoder } = (0, Support_1.defined)(this._topLevelDependents.get(name));
            this.emitLine(this.dartType(t), " ", decoder, "(String str) => ", this.fromDynamicExpression(t.isNullable, t, "json.decode(str)"), ";");
            this.ensureBlankLine();
            this.emitLine("String ", encoder, "(", this.dartType(t), " data) => json.encode(", this.toDynamicExpression(t.isNullable, t, "data"), ");");
            // this.emitBlock(["String ", encoder, "(", this.dartType(t), " data)"], () => {
            //     this.emitJsonEncoderBlock(t);
            // });
        });
    }
    emitSourceStructure() {
        this.emitFileHeader();
        if (!this._options.justTypes && !this._options.codersInClass) {
            this._emitTopLvlEncoderDecoder();
        }
        this.forEachNamedType("leading-and-interposing", (c, n) => this._options.useFreezed ? this.emitFreezedClassDefinition(c, n) : this.emitClassDefinition(c, n), (e, n) => this.emitEnumDefinition(e, n), (_e, _n) => {
            // We don't support this yet.
        });
        if (this._needEnumValues) {
            this.emitEnumValues();
        }
    }
}
exports.DartRenderer = DartRenderer;
