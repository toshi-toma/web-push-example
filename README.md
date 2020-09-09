# web-push-example

Web Pushのサンプルプロジェクト

以下のPush通知送信方法を実装

- [web-push](https://github.com/web-push-libs/web-push)を利用したPush通知の送信
- [FCM](https://firebase.google.com/docs/cloud-messaging)を利用したPush通知の送信

## Client
- public/index.html
- public/index.js
- public/sw.js
 
## Server

- server.js

### API

#### VAPID
- GET: `/api/webpush/get`
    -  VAPIDの公開鍵を取得

#### Push Service
- POST: `/api/webpush/register`
  - Push ServiceのPushSubscriptionをサーバーに送信
- POST: `/api/webpush/send`
  - Push Service経由で通知を送信する

#### Firebase
- POST: `/api/webpush/firebase/token`
  - firebaseのデバイストークンをサーバーに送信
- POST: `/api/webpush/firebase/send`
  - FCM経由で通知を送信する
  
## Env

- .env

```json
MAIL_SUBJECT=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

- firebase-adminsdk.json

```json
{
  "type": "",
  "project_id": "",
  "private_key_id": "",
  // ...
}
```
