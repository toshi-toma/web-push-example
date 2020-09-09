console.log("index.js");

function arrayBufferToUnit8Array(arrayBuffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// setup Firebase
// Your web app's Firebase configuration
var firebaseConfig = {
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const button = document.getElementById("trigger-button-webpush-post");
const input = document.getElementById("message-input");
button.onclick = () => {
  fetch("/api/webpush/post", {
    method: "POST",
    body: JSON.stringify({
      message: input.value,
    }),
  });
};
const firebaseButtono = document.getElementById(
  "trigger-button-webpush-post-firebase-token"
);
firebaseButtono.onclick = () => {
  fetch("/api/webpush/firebase-post", {
    method: "POST",
    body: JSON.stringify({
      message: input.value,
    }),
  });
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(
    (registration) => {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    },
    (err) => {
      console.log("ServiceWorker registration failed: ", err);
    }
  );
  navigator.serviceWorker.ready.then(async (registration) => {
    // VAPIDの公開鍵を取得
    const res = await fetch("/api/webpush/get");
    const { publicKey } = await res.json();

    /**
     * /api/webpush/firebase-post 用の情報をサーバーに登録
     */
    // FCMのトークンを取得
    const messaging = firebase.messaging();
    const fcmRegistrationToken = await messaging.getToken({
      serviceWorkerRegistration: registration,
      vapidKey: publicKey,
    });
    // サーバーに送信
    fetch("/api/webpush/firebase-token-post", {
      method: "POST",
      body: JSON.stringify({
        token: fcmRegistrationToken,
      }),
    });

    /*
     * /api/webpush/post 用の情報をサーバーに登録
     */
    // プッシュ通知を購読
    const applicationServerKey = urlB64ToUint8Array(publicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });
    // パラメータを作成
    const endpoint = subscription.endpoint;
    const p256dh = arrayBufferToUnit8Array(subscription.getKey("p256dh"));
    const auth = arrayBufferToUnit8Array(subscription.getKey("auth"));
    // サーバーに送信
    fetch("api/webpush/register", {
      method: "POST",
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth,
      }),
    });
  });
}
