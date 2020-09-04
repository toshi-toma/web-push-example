console.log("index.js");

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

const button = document.getElementById("trigger-button");
button.onclick = () => {
  fetch("/api/webpush/post", {
    method: "POST",
    body: "{}",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
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
  navigator.serviceWorker.ready.then((registration) => {
    fetch("/api/webpush/get")
      .then((res) => res.json())
      .then((data) => {
        const applicationServerKey = urlB64ToUint8Array(data.publicKey);
        registration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey,
          })
          .then((subscription) => {
            const p256dh = btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("p256dh"))
              )
            )
              .replace(/\+/g, "-")
              .replace(/\//g, "_");
            const auth = btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("auth"))
              )
            )
              .replace(/\+/g, "-")
              .replace(/\//g, "_");
            fetch("api/webpush/register", {
              method: "POST",
              body: JSON.stringify({
                endpoint: subscription.endpoint,
                p256dh,
                auth,
              }),
            });
          });
      });
  });
}
