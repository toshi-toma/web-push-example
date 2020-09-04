console.log("sw.js");

self.addEventListener("push", function (event) {
  const data = event.data.json();
  console.log("[Service Worker] Push Received.", event);

  const title = data.title;
  const options = {
    body: data.body,
    icon: "/icon.jpg",
    url: data.url
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
