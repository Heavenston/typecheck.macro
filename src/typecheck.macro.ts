import { createMacro } from "babel-plugin-macros";
import { NodePath, types as t } from "@babel/core";
import type { MacroParams } from "babel-plugin-macros";
import deepCopy from "fast-copy";
import {
  getTypeParameter,
  getBlockParent as getStatementsInSameScope,
  getRegisterArguments,
  throwUnexpectedError,
} from "./macro-assertions";
import { IR, BuiltinType, builtinTypes, BuiltinTypeName } from "./type-ir/IR";
import { registerType } from "./register";
import { getTypeParameterIR } from "./type-ir/astToTypeIR";
import generateValidator from "./code-gen/irToInline";
import instantiateIR, {
  InstantiationStatePartial,
  TypeInfo,
} from "./type-ir/passes/instantiate";
import resolveAllNamedTypes, {
  resolveSingleType,
} from "./type-ir/passes/resolve";
import flattenType from "./type-ir/passes/flatten";
import { stringifyValue, replaceWithCode } from "./debug-helper";
import callDump from "./debug-helper";
import * as u from "./type-ir/IRUtils";
import solveIntersections from "./type-ir/passes/intersect";
import cleanUnions from "./type-ir/passes/clean";

const baseNamedTypes: ReadonlyMap<
  BuiltinTypeName,
  BuiltinType<BuiltinTypeName>
> = new Map<BuiltinTypeName, BuiltinType<BuiltinTypeName>>([
  ["Array", u.BuiltinType("Array", u.GenericType(0), undefined)],
  ["Set", u.BuiltinType("Set", u.GenericType(0), undefined)],
  ["Map", u.BuiltinType("Map", u.GenericType(0), u.GenericType(1))],
]);

function removeBuiltins<K>(map: Map<string, K>): Map<string, K> {
  const builtinsRemoved = deepCopy(map);
  for (const builtin of builtinTypes) {
    builtinsRemoved.delete(builtin);
  }
  return builtinsRemoved;
}

function finalizeType(
  path: NodePath<t.Node>,
  instantiatedTypes: Map<string, TypeInfo>,
  namedTypes: Map<string, IR>
): [IR, Map<string, number>] {
  const typeParam = getTypeParameter(path);
  let ir = getTypeParameterIR(typeParam.node);
  const state: InstantiationStatePartial = {
    instantiatedTypes,
    namedTypes,
    typeStats: new Map(),
    newInstantiatedTypes: [],
  };
  // no type resolution on the type parameter
  ir = flattenType(ir);
  const instantiatedIR = instantiateIR(ir, state);
  for (const type of state.newInstantiatedTypes) {
    const newType = instantiatedTypes.get(type);
    if (newType === undefined) {
      throwUnexpectedError(`did not expected ${type} to be undefined`);
    }
    newType.value = cleanUnions(
      solveIntersections(newType.value, instantiatedTypes),
      instantiatedTypes
    );
    instantiatedTypes.set(type, newType);
  }
  const finalIR = cleanUnions(
    solveIntersections(instantiatedIR, instantiatedTypes),
    instantiatedTypes
  );
  return [finalIR, state.typeStats];
}

// @ts-ignore - @types/babel-plugin-macros is out of date
function macroHandler({ references, state, babel }: MacroParams): void {
  const namedTypes: Map<string, IR> = (deepCopy(
    baseNamedTypes
  ) as unknown) as Map<string, IR>;
  const instantiatedTypes: Map<string, TypeInfo> = new Map();

  if (references.register) {
    for (const path of references.register) {
      const callExpr = path.parentPath;
      const typeName = getRegisterArguments(path);
      const stmtsInSameScope = getStatementsInSameScope(path);
      registerType(typeName, stmtsInSameScope, namedTypes);
      callExpr.remove();
    }
  }

  if (
    callDump(
      references,
      removeBuiltins(namedTypes),
      "__dumpAfterRegistration",
      true
    )
  )
    return;

  resolveAllNamedTypes(namedTypes);

  if (
    callDump(
      references,
      removeBuiltins(namedTypes),
      "__dumpAfterTypeResolution"
    )
  )
    return;

  for (const [typeName, ir] of namedTypes) {
    if (builtinTypes.includes(typeName as BuiltinTypeName)) continue;
    namedTypes.set(typeName, flattenType(ir));
  }

  if (
    callDump(
      references,
      removeBuiltins(namedTypes),
      "__dumpAfterTypeFlattening"
    )
  )
    return;

  const dumpInstantiatedName = "__dumpInstantiatedIR";
  if (references[dumpInstantiatedName]) {
    for (const path of references[dumpInstantiatedName]) {
      const callExpr = path.parentPath;
      const instantiatedTypesToDump = new Map<string, TypeInfo>();
      const [finalIR, typeStats] = finalizeType(
        path,
        instantiatedTypesToDump,
        namedTypes
      );
      instantiatedTypesToDump.set("$$typeParameter$$", {
        typeStats,
        value: finalIR,
        circular: false,
      });
      const stringified = stringifyValue(
        instantiatedTypesToDump,
        "instantiatedTypes"
      );
      replaceWithCode(stringified, callExpr);
    }
    return;
  }

  if (references.default) {
    for (const path of references.default) {
      const callExpr = path.parentPath;
      const [finalIR, typeStats] = finalizeType(
        path,
        instantiatedTypes,
        namedTypes
      );
      const code = generateValidator(finalIR, {
        instantiatedTypes,
        options: { errorMessages: false },
        typeStats,
      });
      replaceWithCode(code, callExpr);
    }
  }

  let exportName = "createDetailedValidator";
  if (references[exportName]) {
    for (const path of references[exportName]) {
      const callExpr = path.parentPath;
      const [finalIR, typeStats] = finalizeType(
        path,
        instantiatedTypes,
        namedTypes
      );
      const code = generateValidator(finalIR, {
        instantiatedTypes,
        options: { errorMessages: true },
        typeStats,
      });
      replaceWithCode(code, callExpr);
    }
  }
}

export default createMacro(macroHandler);
