/**
 * pushNotification.js — Web Push via VAPID
 * Sends browser push notifications to subscribed users.
 * Works on desktop and mobile (when site is added to home screen as PWA).
 */
const webpush = require("web-push");

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@cropyield.ai",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send a push notification to a subscription object.
 * @param {object} subscription - PushSubscription from browser
 * @param {string} title
 * @param {string} body
 * @param {string} url - URL to open on click
 */
async function sendPush(subscription, title, body, url = "/") {
  if (!process.env.VAPID_PUBLIC_KEY) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired — caller should delete it
      return "expired";
    }
    console.warn("Push send failed:", err.message);
  }
}

module.exports = { sendPush, VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY };
