# web-push-example

Web Pushのサンプルプロジェクト

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