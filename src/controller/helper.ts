import {
  SyntaxKind,
  VariableDeclarationKind,
  type SourceFile,
  type Statement,
} from "ts-morph";
import { nonNull } from "../nonNull.ts";

type UpsertImportInput = {
  moduleSpecifier: string;
  namedImportName: string;
  isTypeOnly?: boolean;
};

export const upsertImport = (
  source: SourceFile,
  { moduleSpecifier, namedImportName, isTypeOnly = false }: UpsertImportInput
) => {
  const importDeclare = source.getImportDeclaration(moduleSpecifier);

  if (importDeclare != null) {
    const hasAlreadyImported = importDeclare
      .getNamedImports()
      .find((namedImport) => namedImport.getName() === namedImportName);

    if (hasAlreadyImported == null) {
      importDeclare.addNamedImport({
        name: namedImportName,
        isTypeOnly,
      });
    }
  } else {
    source.addImportDeclaration({
      moduleSpecifier,
      namedImports: [
        {
          name: namedImportName,
          isTypeOnly,
        },
      ],
    });
  }
};

type UpsertFunctionInput = {
  name: string;
  type: string;
  body: string;
};
export const upsertFunction = (
  source: SourceFile,
  { name, type, body }: UpsertFunctionInput
) => {
  const statement =
    source.getVariableStatement(name) ??
    source.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name,
          type,
          initializer: body,
        },
      ],
    });

  const declarations = statement.getDeclarations();

  if (declarations != null && declarations.length !== 1) {
    throw new Error("Expected exactly one declaration");
  }

  const arrowFn = declarations[0].getInitializerIfKind(
    SyntaxKind.ArrowFunction
  );
  if (arrowFn == null) {
    throw new Error("Expected arrow function");
  }

  return arrowFn;
};

export const buildCamlCase = (...str: [string, ...string[]]) => {
  return (
    str[0] +
    str
      .slice(1)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join("")
  );
};

/**
 * f.get("/todo", { schema: getTasksSchema }, async (req, reply) => {...} という形式のコードをパースする
 */
export const parseFastifyRoute = (
  statement: Statement,
  statements: Statement[],
  index: number
) => {
  // 関数呼び出し
  const callExpression = statement
    .asKind(SyntaxKind.ExpressionStatement)
    ?.getExpressionIfKind(SyntaxKind.CallExpression);
  if (callExpression == null) {
    return null;
  }

  // f.get
  const propertyAccess = callExpression.getExpressionIfKind(
    SyntaxKind.PropertyAccessExpression
  );

  const args = callExpression.getArguments();
  const method = propertyAccess?.getName();
  const path = args[0].asKind(SyntaxKind.StringLiteral)?.getLiteralValue();

  if (method == null || path == null) {
    return [];
  }

  // メソッドの直前にコメントがある場合はコメントを残す
  const comment = statements[index - 1];

  return {
    statement,
    callbackExpression: args[2],
    comments: [
      comment?.getKind() === SyntaxKind.SingleLineCommentTrivia ||
      comment?.getKind() === SyntaxKind.MultiLineCommentTrivia
        ? comment
        : null,
    ].filter(nonNull),
    method,
    path,
  };
};
