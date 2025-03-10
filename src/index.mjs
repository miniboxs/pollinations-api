import Fastify from "fastify";
import routes from "./routes/index.mjs";
import dotenv from 'dotenv';

const env = dotenv.config().parsed;

const server = Fastify({
    logger: true,
});


server.register(routes, { prefix: '/v1' })

// 监听
server.listen({ port: env.PORT || 56553, host: '0.0.0.0' }, function (err, address) {
    if (err) {
        server.log.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
})