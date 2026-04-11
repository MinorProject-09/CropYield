/**
 * smsAlert.js — MSG91 WhatsApp/SMS alert sender
 * Sign up free at https://msg91.com — get API key, sender ID, template ID
 * Free tier: 100 SMS/month
 *
 * Usage:
 *   const { sendSMSAlert } = require("./smsAlert");
 *   await sendSMSAlert(phone, "Your soil nitrogen is critically low. Apply Urea 50kg/ha.");
 */

const MSG91_KEY        = process.env.MSG91_API_KEY;
const MSG91_SENDER     = process.env.MSG91_SENDER_ID || "CROPAI";
const MSG91_TEMPLATE   = process.env.MSG91_TEMPLATE_ID;

/**
 * Send an SMS alert via MSG91.
 * @param {string} phone - 10-digit Indian mobile number (no country code)
 * @param {string} message - alert text (max 160 chars for single SMS)
 */
async function sendSMSAlert(phone, message) {
  if (!MSG91_KEY || MSG91_KEY === "your_msg91_api_key_here") {
    console.log(`[SMS skipped — no MSG91 key] To: ${phone} | ${message}`);
    return;
  }
  if (!phone || phone.length < 10) return;

  const mobile = phone.replace(/\D/g, "").slice(-10);
  const url = "https://api.msg91.com/api/v5/flow/";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": MSG91_KEY,
      },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE,
        short_url:   "0",
        recipients: [{
          mobiles: `91${mobile}`,
          var1:    message.slice(0, 160),
        }],
      }),
    });
    const data = await res.json();
    if (data.type === "success") {
      console.log(`✅ SMS sent to ${mobile}`);
    } else {
      console.warn(`⚠ MSG91 error:`, data);
    }
  } catch (err) {
    console.warn(`⚠ SMS send failed:`, err.message);
  }
}

/**
 * Send a critical soil alert SMS if user has phone and alerts enabled.
 */
async function sendSoilAlertSMS(user, alerts) {
  if (!user?.phone || !user?.smsAlerts) return;
  const critical = alerts.filter(a => a.level === "critical");
  if (!critical.length) return;
  const msg = `🌾 CropYield Alert: ${critical.map(a => a.message).join(" | ")}`;
  await sendSMSAlert(user.phone, msg);
}

/**
 * Send a weather risk SMS.
 */
async function sendWeatherAlertSMS(user, risks) {
  if (!user?.phone || !user?.smsAlerts) return;
  const critical = risks.filter(r => r.level === "critical");
  if (!critical.length) return;
  const msg = `🌤 CropYield Weather Alert: ${critical.map(r => r.title).join(" | ")}`;
  await sendSMSAlert(user.phone, msg);
}

module.exports = { sendSMSAlert, sendSoilAlertSMS, sendWeatherAlertSMS };
