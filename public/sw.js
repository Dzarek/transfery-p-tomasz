self.addEventListener("push", async (event) => {
  if (event.data) {
    const eventData = await event.data.json();
    showLocalNotification(
      eventData.title,
      eventData.body,
      eventData.tag,
      eventData.recipeID,
      self.registration,
    );
  }
});

const showLocalNotification = (title, body, tag, recipeID, swRegistration) => {
  swRegistration.showNotification(title, {
    body,
    tag,
    icon: "./logo192.png",
    data: { recipeID },
  });
};

self.addEventListener("notificationclick", function (event) {
  const url = `/`;

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
