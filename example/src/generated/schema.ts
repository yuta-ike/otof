import { type FastifySchema } from "fastify";

export const getTasksSchema = {
  response: {
    type: "array",
    items: {
      anyOf: [
        {
          type: "object",
          required: ["id", "name", "createdBy", "status"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            createdBy: {
              type: "object",
              required: ["id", "name"],
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            status: { type: "string", enum: ["Todo"] },
          },
        },
        {
          type: "object",
          required: ["id", "name", "createdBy", "status", "startedAt"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            createdBy: {
              type: "object",
              required: ["id", "name"],
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            status: { type: "string", enum: ["Doing"] },
            startedAt: { type: "string", format: "date-time" },
          },
        },
        {
          type: "object",
          required: [
            "id",
            "name",
            "createdBy",
            "status",
            "startedAt",
            "doneAt",
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            createdBy: {
              type: "object",
              required: ["id", "name"],
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            status: { type: "string", enum: ["Done"] },
            startedAt: { type: "string", format: "date-time" },
            doneAt: { type: "string", format: "date-time" },
          },
        },
        {
          type: "object",
          required: ["id", "name", "createdBy", "status", "deletedAt"],
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            createdBy: {
              type: "object",
              required: ["id", "name"],
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
              },
            },
            status: { type: "string", enum: ["Deleted"] },
            deletedAt: { type: "string", format: "date-time" },
          },
        },
      ],
    },
  },
  querystring: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["Todo", "Doing", "Done", "Deleted"] },
      limit: { type: "integer" },
    },
    required: [],
  },
  headers: { type: "object", properties: {}, required: [] },
  params: { type: "object", properties: {}, required: [] },
} as const satisfies FastifySchema;
export const createTaskSchema = {
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      tag: { type: "array", items: { type: "string" } },
    },
    required: ["name", "description", "createdAt", "tag"],
  },
  querystring: { type: "object", properties: {}, required: [] },
  headers: { type: "object", properties: {}, required: [] },
  params: { type: "object", properties: {}, required: [] },
} as const satisfies FastifySchema;
export const deleteTaskSchema = {
  querystring: { type: "object", properties: {}, required: [] },
  headers: { type: "object", properties: {}, required: [] },
  params: { type: "object", properties: {}, required: [] },
} as const satisfies FastifySchema;
export const getTaskSchema = {
  response: {
    anyOf: [
      {
        type: "object",
        required: ["id", "name", "createdBy", "status"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          createdBy: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
          status: { type: "string", enum: ["Todo"] },
        },
      },
      {
        type: "object",
        required: ["id", "name", "createdBy", "status", "startedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          createdBy: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
          status: { type: "string", enum: ["Doing"] },
          startedAt: { type: "string", format: "date-time" },
        },
      },
      {
        type: "object",
        required: ["id", "name", "createdBy", "status", "startedAt", "doneAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          createdBy: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
          status: { type: "string", enum: ["Done"] },
          startedAt: { type: "string", format: "date-time" },
          doneAt: { type: "string", format: "date-time" },
        },
      },
      {
        type: "object",
        required: ["id", "name", "createdBy", "status", "deletedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          createdBy: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
          status: { type: "string", enum: ["Deleted"] },
          deletedAt: { type: "string", format: "date-time" },
        },
      },
    ],
  },
  querystring: { type: "object", properties: {}, required: [] },
  headers: { type: "object", properties: {}, required: [] },
  params: { type: "object", properties: {}, required: [] },
} as const satisfies FastifySchema;
