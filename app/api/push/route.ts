import webpush from "web-push";
import { query } from "@/notification/db";

webpush.setVapidDetails(
  process.env.NEXT_PUBLIC_WEB_PUSH_EMAIL!,
  process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
  process.env.WEB_PUSH_PRIVATE_KEY!,
);

type PushSubscriptionDB = {
  id: number;
  endpoint: string;
  expirationTime: number | null;
  p256dh: string;
  auth: string;
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    // =============================
    // ZAPIS SUBSKRYPCJI
    // =============================
    if (body.action === "subscribe") {
      const { endpoint, expirationTime, keys } = body.subscription;
      const { p256dh, auth } = keys;
      const { userID, isAdmin } = body;

      await query({
        query: "DELETE FROM push_subscriptions WHERE endpoint = ?",
        values: [endpoint] as any[],
      });

      await query({
        query: `
      INSERT INTO push_subscriptions (endpoint, expirationTime, p256dh, auth, userID, isAdmin)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
        values: [
          endpoint,
          expirationTime,
          p256dh,
          auth,
          userID,
          isAdmin ? 1 : 0,
        ] as any[],
      });

      return Response.json({ success: true });
    }
    // =============================
    // ANULOWANIE SUBSKRYPCJI
    // =============================
    if (body.action === "unsubscribe") {
      const { endpoint } = body;

      await query({
        query: "DELETE FROM push_subscriptions WHERE endpoint = ?",
        values: [endpoint] as any[],
      });

      return Response.json({ success: true });
    }

    // =============================
    // WYSYŁANIE POWIADOMIEŃ
    // =============================
    if (body.action === "notify") {
      const { title, body: text, tag, recipeID, type } = body;

      const subscriptions = (await query({
        query: "SELECT * FROM push_subscriptions WHERE isAdmin = 1",
        values: [],
      })) as PushSubscriptionDB[];

      if (!subscriptions || subscriptions.length === 0) {
        return Response.json({ message: "Brak subskrypcji" });
      }

      await Promise.all(
        subscriptions.map(async (s: PushSubscriptionDB) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: s.endpoint,
                expirationTime: s.expirationTime,
                keys: {
                  p256dh: s.p256dh,
                  auth: s.auth,
                },
              },
              JSON.stringify({
                title,
                body: text,
                tag,
                recipeID,
                type,
              }),
            );
          } catch (err: any) {
            // usuń wygasłe subskrypcje
            if (err.statusCode === 404 || err.statusCode === 410) {
              await query({
                query: "DELETE FROM push_subscriptions WHERE id = ?",
                values: [s.id] as any[],
              });
            } else {
              console.error("Push error:", err);
            }
          }
        }),
      );

      return Response.json({ success: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Push API error:", err);
    return Response.json({ error: "push error" }, { status: 500 });
  }
};
