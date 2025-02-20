import path from "node:path";
import { Project, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import SwaggerParser from "@apidevtools/swagger-parser";
import {
  forEachOperations,
  getFastifySchemaFromOperationObject,
  getOpId,
} from "./openapi/helper.ts";
import {
  buildCamlCase,
  parseFastifyRoute,
  upsertFunction,
  upsertImport,
} from "./controller/helper.ts";
import { nonNull } from "./nonNull.ts";

type Config = {
  openApiFilePath: string;
  output: string;
  tsconfigPath: string;
};

export const convert = async ({
  openApiFilePath,
  output,
  tsconfigPath,
}: Config) => {
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), tsconfigPath),
  });

  const controllerSource =
    project.getSourceFile(path.join(process.cwd(), output, "controller.ts")) ??
    project.createSourceFile(
      path.join(process.cwd(), output, "controller.ts"),
      ""
    );

  const schemaSource =
    project.getSourceFile(path.join(process.cwd(), output, "schema.ts")) ??
    project.createSourceFile(
      path.join(process.cwd(), output, "schema.ts"),
      "",
      { overwrite: true }
    );

  const api = await SwaggerParser.dereference(
    path.join(process.cwd(), openApiFilePath)
  );

  {
    // import { type FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
    upsertImport(controllerSource, {
      moduleSpecifier: "@fastify/type-provider-json-schema-to-ts",
      namedImportName: "FastifyPluginAsyncJsonSchemaToTs",
      isTypeOnly: true,
    });

    // import { type FastifySchema } from "fastify";
    upsertImport(schemaSource, {
      moduleSpecifier: "fastify",
      namedImportName: "FastifySchema",
      isTypeOnly: true,
    });
  }

  {
    // export const route: FastifyPluginAsyncJsonSchemaToTs = async (f) => {...}
    const arrowFn = upsertFunction(controllerSource, {
      name: "route",
      type: "FastifyPluginAsyncJsonSchemaToTs",
      body: "async (f) => {}",
    });

    // すでに定義されているルートを取得
    const bodyStatements = arrowFn
      .getBody()
      .asKind(SyntaxKind.Block)
      ?.getStatementsWithComments();
    const definedStatements =
      bodyStatements
        ?.flatMap((statement, i) =>
          parseFastifyRoute(statement, bodyStatements, i)
        )
        .filter(nonNull) ?? [];

    // OperationIDごとに追加
    forEachOperations(api.paths, ({ path, method, operationObject }) => {
      const fastifySchema =
        getFastifySchemaFromOperationObject(operationObject);

      const opId = getOpId(operationObject, method, path);
      const schemaName = buildCamlCase(opId, "Schema");

      // import { xxxSchema } from "./schema";
      upsertImport(controllerSource, {
        moduleSpecifier: `./schema`,
        namedImportName: schemaName,
      });

      // f.get("/todo", { schema: getTasksSchema }, async (req, reply) => {...}
      const definedStatement = definedStatements.find(
        (defined) => defined.method === method && defined.path === path
      );

      // if (definedStatement != null) {
      arrowFn?.addStatements([
        [
          `\n`,
          ...(definedStatement?.comments.map((comment) =>
            comment.getText()
          ) ?? [
            `/**
  * OperationID: ${operationObject.operationId ?? ""}
  * Tags: ${operationObject.tags?.join(", ") ?? ""}
  * Method: ${method.toUpperCase()}
  * Path: ${path}
 */`,
          ]),
          `f.${method}("${path}", { schema: ${schemaName} }, ${
            definedStatement?.callbackExpression.getText() ??
            `async (req, reply) => { throw new Error("Not implemented") }`
          });`,
        ].join("\n"),
      ]);
      definedStatement?.statement.remove();
      definedStatement?.comments.map((comment) => comment.remove());

      // schema.ts
      const variable = schemaSource.getVariableStatement(schemaName);
      if (variable == null) {
        schemaSource.addVariableStatement({
          isExported: true,
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: operationObject.operationId + "Schema",
              initializer: `${JSON.stringify(
                fastifySchema
              )} as const satisfies FastifySchema`,
            },
          ],
        });
      } else {
        variable
          .getDeclarations()[0]
          .setInitializer(
            `${JSON.stringify(fastifySchema)} as const satisfies FastifySchema`
          );
      }
    });
  }

  await controllerSource.save();
  await schemaSource.save();

  controllerSource.formatText();
  schemaSource.formatText();
};
