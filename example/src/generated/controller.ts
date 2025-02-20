import { type FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import {
  getTasksSchema,
  createTaskSchema,
  deleteTaskSchema,
  getTaskSchema,
} from "./schema";

export const route: FastifyPluginAsyncJsonSchemaToTs = async (f) => {
  f.get("/todo", { schema: getTasksSchema }, async (req, reply) => {
    console.log("HELLO!!!!!!!!!!!!!");
  });

  f.post("/todo", { schema: createTaskSchema }, async (req, reply) => {
    throw new Error("Not implemented");
  });

  f.delete("/todo", { schema: deleteTaskSchema }, async (req, reply) => {
    throw new Error("Not implemented");
  });

  f.get("/todo/{id}", { schema: getTaskSchema }, async (req, reply) => {
    throw new Error("Not implemented");
  });
};
