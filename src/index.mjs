import Fastify from "fastify";
import routes from "./routes/index.mjs";

const server = Fastify({
    logger: true,
});


server.register(routes, { prefix: '/v1' })

// 监听
server.listen({ port: 8080 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
})