import Fastify from "fastify";
import routes from "./routes/index.mjs";
import dotenv from 'dotenv';

const env = dotenv.config().parsed;

const server = Fastify({
    logger: true,
});

const whiteList = ['/v1/models', '/v1/test']

server.addHook('preHandler', (request, reply, done) => {

    const headers = request.headers;
    const path = request.url;

    if (whiteList.includes(path)) {
        done();
        return;
    }

    const authHeader = headers['authorization'];
    if (!authHeader) {
        reply.code(401).send({
            error: 'Unauthorized',
            message: 'Missing Authorization header'
        });
        return;
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
        reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid token format'
        });
        return;
    }

    console.log(token, 'tokentokentoken');
    console.log(env.OPENAI_API_KEY, 'env.OPENAI_API_KEY');
    
    if (token != env.OPENAI_API_KEY) {
        reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
        return;
    }

    // if (!headers['user-agent']) {
    //     reply.code(400).send({
    //         error: 'Bad Request',
    //         message: 'User-Agent header is required'
    //     });
    //     return;
    // }

    done();
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