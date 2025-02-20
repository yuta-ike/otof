import Fastify from "fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.get("/", function (req, reply) {
  reply.send({ hello: "world" });
});

fastify.listen({ port: 3000 }, function (err, address) {
  console.log(`Server listening on ${address}`);

  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
