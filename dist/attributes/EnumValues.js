"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumValuesAttributeProducer = exports.enumCaseValues = exports.enumValuesTypeAttributeKind = void 0;
const collection_utils_1 = require("collection-utils");
const AccessorNames_1 = require("./AccessorNames");
const TypeAttributes_1 = require("./TypeAttributes");
class EnumValuesTypeAttributeKind extends TypeAttributes_1.TypeAttributeKind {
    constructor() {
        super("enumValues");
    }
    makeInferred(_) {
        return undefined;
    }
}
exports.enumValuesTypeAttributeKind = new EnumValuesTypeAttributeKind();
function enumCaseValues(e, language) {
    const enumValues = exports.enumValuesTypeAttributeKind.tryGetInAttributes(e.getAttributes());
    if (enumValues === undefined)
        return (0, collection_utils_1.mapMap)(e.cases.entries(), _ => undefined);
    return (0, collection_utils_1.mapMap)(e.cases.entries(), c => (0, AccessorNames_1.lookupKey)(enumValues, c, language));
}
exports.enumCaseValues = enumCaseValues;
function enumValuesAttributeProducer(schema, _canonicalRef, _types) {
    if (typeof schema !== "object")
        return undefined;
    const maybeEnumValues = schema["qt-enum-values"];
    if (maybeEnumValues === undefined)
        return undefined;
    return { forType: exports.enumValuesTypeAttributeKind.makeAttributes((0, AccessorNames_1.makeAccessorNames)(maybeEnumValues)) };
}
exports.enumValuesAttributeProducer = enumValuesAttributeProducer;
