"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptionAttributeProducer = exports.propertyDescriptionsTypeAttributeKind = exports.descriptionTypeAttributeKind = exports.addDescriptionToSchema = void 0;
const collection_utils_1 = require("collection-utils");
// There's a cyclic import here. Ignoring now because it requires a large refactor.
// skipcq: JS-E1008
const TypeAttributes_1 = require("./TypeAttributes");
// FIXME: This is a circular import
const JSONSchemaInput_1 = require("../input/JSONSchemaInput");
function addDescriptionToSchema(schema, description) {
    if (description === undefined)
        return;
    schema.description = Array.from(description).join("\n");
}
exports.addDescriptionToSchema = addDescriptionToSchema;
class DescriptionTypeAttributeKind extends TypeAttributes_1.TypeAttributeKind {
    constructor() {
        super("description");
    }
    combine(attrs) {
        return (0, collection_utils_1.setUnionManyInto)(new Set(), attrs);
    }
    makeInferred(_) {
        return undefined;
    }
    addToSchema(schema, _t, attrs) {
        addDescriptionToSchema(schema, attrs);
    }
    stringify(descriptions) {
        let result = (0, collection_utils_1.iterableFirst)(descriptions);
        if (result === undefined)
            return undefined;
        if (result.length > 5 + 3) {
            result = `${result.slice(0, 5)}...`;
        }
        if (descriptions.size > 1) {
            result = `${result}, ...`;
        }
        return result;
    }
}
exports.descriptionTypeAttributeKind = new DescriptionTypeAttributeKind();
class PropertyDescriptionsTypeAttributeKind extends TypeAttributes_1.TypeAttributeKind {
    constructor() {
        super("propertyDescriptions");
    }
    combine(attrs) {
        // FIXME: Implement this with mutable sets
        const result = new Map();
        for (const attr of attrs) {
            (0, collection_utils_1.mapMergeWithInto)(result, (sa, sb) => (0, collection_utils_1.setUnion)(sa, sb), attr);
        }
        return result;
    }
    makeInferred(_) {
        return undefined;
    }
    stringify(propertyDescriptions) {
        if (propertyDescriptions.size === 0)
            return undefined;
        return `prop descs: ${propertyDescriptions.size}`;
    }
}
exports.propertyDescriptionsTypeAttributeKind = new PropertyDescriptionsTypeAttributeKind();
function isPropertiesKey(el) {
    return el.kind === JSONSchemaInput_1.PathElementKind.KeyOrIndex && el.key === "properties";
}
function descriptionAttributeProducer(schema, ref, types) {
    if (!(typeof schema === "object"))
        return undefined;
    let description = TypeAttributes_1.emptyTypeAttributes;
    let propertyDescription = TypeAttributes_1.emptyTypeAttributes;
    const pathLength = ref.path.length;
    if (types.has("object") ||
        (0, collection_utils_1.setSubtract)(types, ["null"]).size > 1 ||
        schema.enum !== undefined ||
        pathLength < 2 ||
        !isPropertiesKey(ref.path[pathLength - 2])) {
        const maybeDescription = schema.description;
        if (typeof maybeDescription === "string") {
            description = exports.descriptionTypeAttributeKind.makeAttributes(new Set([maybeDescription]));
        }
    }
    if (types.has("object") && typeof schema.properties === "object") {
        const propertyDescriptions = (0, collection_utils_1.mapFilterMap)((0, collection_utils_1.mapFromObject)(schema.properties), propSchema => {
            if (typeof propSchema === "object") {
                const desc = propSchema.description;
                if (typeof desc === "string") {
                    return new Set([desc]);
                }
            }
            return undefined;
        });
        if (propertyDescriptions.size > 0) {
            propertyDescription = exports.propertyDescriptionsTypeAttributeKind.makeAttributes(propertyDescriptions);
        }
    }
    return { forType: description, forObject: propertyDescription };
}
exports.descriptionAttributeProducer = descriptionAttributeProducer;
