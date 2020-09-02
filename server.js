const fastify = require('fastify')({
  logger: true
});
const path = require('path');
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
})

fastify.get('/', (request, reply) => {
  reply.sendFile('index.html');
}).get('/index.js',(request, reply) => {
  reply.sendFile('index.js');
}).get('/sw.js',(request, reply) => {
  reply.sendFile('sw.js');
});

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})