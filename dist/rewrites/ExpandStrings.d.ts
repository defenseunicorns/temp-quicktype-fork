import { TypeGraph } from "../TypeGraph";
import { RunContext } from "../Run";
export type EnumInference = "none" | "all" | "infer";
export declare function expandStrings(ctx: RunContext, graph: TypeGraph, inference: EnumInference): TypeGraph;
