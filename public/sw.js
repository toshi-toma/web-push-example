console.log("sw.js");

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.", event);
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = "Hello";
  const options = {
    body: event.data.text(),
    icon: "/icon.jpg",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
