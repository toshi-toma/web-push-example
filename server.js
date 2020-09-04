const fastify = require("fastify")({
  logger: true,
});
const path = require("path");
const webpush = require("web-push");
require("dotenv").config();

const env = process.env;
webpush.setVapidDetails(
  env.MAIL_SUBJECT,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
});

const subscriber = [];

fastify
  .get("/", (request, reply) => {
    reply.sendFile("index.html");
  })
  .get("/index.js", (request, reply) => {
    reply.sendFile("index.js");
  })
  .get("/sw.js", (request, reply) => {
    reply.sendFile("sw.js");
  })
  .get("/icon.jpg", (request, reply) => {
    reply.sendFile("icon.jpg");
  })
  .get("/api/webpush/get", (request, reply) => {
    reply.send({
      publicKey: env.VAPID_PUBLIC_KEY,
    });
  })
  .post("/api/webpush/register", (request, reply) => {
    subscriber.push(JSON.parse(request.body));
    reply.send({
      result: "ok",
    });
  })
  .post("/api/webpush/post", (request, reply) => {
    console.log(subscriber);

    // プッシュ通知で送信したい任意のデータ
    const payload = JSON.stringify({
      title: "通知タイトル",
      body: "通知body",
      url: "https://google.com",
    });

    const promises = subscriber.map((s) => {
      return new Promise((resolve, reject) => {
        const subscription = {
          endpoint: s.endpoint,
          keys: {
            auth: s.auth,
            p256dh: s.p256dh,
          },
        };

        webpush
          .sendNotification(subscription, payload)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      });
    });
    Promise.all(promises)
      .then(() => {
        reply.send({
          result: "ok",
        });
      })
      .catch(() => {
        reply.send({
          result: "error",
        });
        reply.errorCode(400);
      });
  });

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
