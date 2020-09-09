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

const admin = require("firebase-admin");

const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// クライアントから送信されたデバイスのendpoint情報などを格納する (/api/webpush/post 用)
const subscriberEndpoints = [];
// クライアントから送信されたデバイスのトークンを格納する (/api/webpush/firebase-post 用)
const subscriberTokens = [];

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
    subscriberEndpoints.push(JSON.parse(request.body));
    reply.send({
      result: "ok",
    });
  })
  .post("/api/webpush/firebase-token-post", (request, reply) => {
    subscriberTokens.push(JSON.parse(request.body).token);
    reply.send({
      result: "ok",
    });
  })
  .post("/api/webpush/post", (request, reply) => {
    const body = JSON.parse(request.body);
    const message = body.message;
    // 登録されている端末にプッシュ通知を送信する
    const promises = subscriberEndpoints.map((s) => {
      return new Promise((resolve, reject) => {
        const subscription = {
          endpoint: s.endpoint,
          keys: {
            auth: s.auth,
            p256dh: s.p256dh,
          },
        };
        // プッシュ通知で送信したい任意のデータ
        const payload = JSON.stringify({
          data: {
            title: "通知が届きました(from Server)",
            body: message,
            url: "https://google.com",
          }
        });

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
  })
  .post("/api/webpush/firebase-post", (request, reply) => {
    const body = JSON.parse(request.body);
    const message = {
      data: { title: "タイトル from Firebase", body: body.message },
      tokens: subscriberTokens,
    };
    admin
      .messaging()
      .sendMulticast(message)
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
