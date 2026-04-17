"use client";

const CONFIG = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

const registerServiceWorker = async () => {
  return navigator.serviceWorker.register("/sw.js");
};

export const subscribePush = async () => {
  const swRegistration = await navigator.serviceWorker.register("/sw.js");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  let subscription = await swRegistration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(CONFIG.PUBLIC_KEY),
    });
  }

  await fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "subscribe",
      subscription,
    }),
  });
};

export const unsubscribePush = async () => {
  const swRegistration = await navigator.serviceWorker.getRegistration();

  if (!swRegistration) return;

  const subscription = await swRegistration.pushManager.getSubscription();

  if (!subscription) return;

  await fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "unsubscribe",
      endpoint: subscription.endpoint,
    }),
  });

  await subscription.unsubscribe();
};
