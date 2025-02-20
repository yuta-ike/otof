import type { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { type FastifySchema } from "fastify";
import { checkValidName, getUniqueId } from "../str/helper.ts";

const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

type ForEachOperationsCallback = (
  obj: {
    path: string;
    method: HttpMethod;
    operationObject: OpenAPIV3_1.OperationObject;
  },
  index: number
) => void;

export const forEachOperations = (
  paths: OpenAPI.Document<{}>["paths"],
  callback: ForEachOperationsCallback
) => {
  if (paths == null) {
    return [];
  }
  Object.entries(paths).map(([path, pathItemObject]) => {
    if (pathItemObject == null) {
      return;
    }
    HTTP_METHODS.forEach((method, i) => {
      if (pathItemObject[method] == null) {
        return;
      }
      callback({ path, method, operationObject: pathItemObject[method] }, i);
    });
  });
};

export const isNotRef = <Obj>(
  obj: Obj
): Exclude<Obj, OpenAPIV3_1.ReferenceObject> | null => {
  if (obj != null && typeof obj === "object" && "$ref" in obj) {
    return null;
  }
  // @ts-expect-error
  return obj;
};

const getFastifySchemaFromParameterObjects = (
  parameterObjects:
    | (OpenAPIV3.ParameterObject | OpenAPIV3_1.ReferenceObject)[]
    | undefined,
  target: "query" | "header" | "path"
) => {
  if (parameterObjects == null) {
    return [];
  }

  const parms = parameterObjects?.filter(
    (param): param is OpenAPIV3.ParameterObject =>
      isNotRef(param)?.in === target
  );

  return {
    type: "object",
    properties: parms?.reduce((acc, param) => {
      const schema = isNotRef(param.schema);
      if (schema == null) {
        return acc;
      }
      return {
        ...acc,
        [param.name]: schema,
      };
    }, {}),
    required: parms
      ?.filter((param) => param.required)
      .map((param) => param.name),
  };
};

export const getFastifySchemaFromOperationObject = (
  operationObject: OpenAPIV3_1.OperationObject<{}>
): FastifySchema => {
  const requestBodySchema = isNotRef(operationObject?.requestBody)?.content?.[
    "application/json"
  ]?.["schema"];

  const responoseBodySchema = isNotRef(operationObject?.responses?.["200"])
    ?.content?.["application/json"]?.["schema"];

  const querySchema = getFastifySchemaFromParameterObjects(
    operationObject.parameters,
    "query"
  );

  const headerSchema = getFastifySchemaFromParameterObjects(
    operationObject.parameters,
    "header"
  );

  const pathSchema = getFastifySchemaFromParameterObjects(
    operationObject.parameters,
    "header"
  );

  return {
    body: requestBodySchema,
    response: responoseBodySchema,
    querystring: querySchema,
    headers: headerSchema,
    params: pathSchema,
  };
};

export const getOpId = (
  operationObject: OpenAPIV3_1.OperationObject<{}>,
  method: HttpMethod,
  path: string
) => {
  if (operationObject.operationId != null) {
    return checkValidName(operationObject.operationId);
  }

  return `${method}_${getUniqueId(path)}`;
};
