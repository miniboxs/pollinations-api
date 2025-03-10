import dotenv from 'dotenv';

const env = dotenv.config().parsed;

const API_ENDPOINT = 'https://text.pollinations.ai';

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
    "X-Forwarded-For": "172.67.140.150",
    "X-Real-IP": "172.67.140.150",
    "Referer": "https://github.com",
    "Origin": "https://grok.com"
}

async function routes(fastify, options) {
    fastify.get('/test', async (request, reply) => {
        const response = await fetch('https://httpbin.org/get', {
            headers
        })
        const data = await response.json();
        return reply.send(data)
    })
    fastify.get('/models', async (request, reply) => {
        try {
            const pollinationsResponse = await fetch(`${API_ENDPOINT}/models`, {
                method: "GET",
                headers
            });

            if (!pollinationsResponse.ok) {
                throw new Error(`Pollinations API responded with status: ${pollinationsResponse.status}`);
            }

            const responseData = await pollinationsResponse.json();
            const models = responseData.map(item => {
                return {
                    ...item,
                    id: item.name
                }
            })
            const responded = await new Response(JSON.stringify(models), {
                headers: { "Content-Type": "application/json" }
            });

            return reply.send(responded);
        } catch (error) {
            return new Response(
                JSON.stringify({ error: "Failed to fetch models", details: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    })

    fastify.post('/chat/completions', async (request, reply) => {
        try {
            console.log(request);

            const requestBody = await request.body;

            const pollinationsResponse = await fetch(`${API_ENDPOINT}/openai`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model: requestBody.model || "gpt-4o-mini",
                    messages: requestBody.messages,
                    temperature: requestBody.temperature || 0.7,
                    stream: requestBody.stream || false
                })
            });

            if (requestBody.stream) {
                const responded = await new Response(pollinationsResponse.body, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive"
                    }
                });

                return reply.send(responded);
            } else {
                const responseData = await pollinationsResponse.json();
                const responded = await new Response(JSON.stringify(responseData), {
                    headers: { "Content-Type": "application/json" }
                });

                return reply.send(responded);
            }
        } catch (error) {
            return new Response(
                JSON.stringify({ error: "Invalid request or server error", details: error.message }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
    })
}

export default routes;