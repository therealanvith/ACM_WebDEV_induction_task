import { logEvent } from "@/lib/logger";

interface SendMatchEmailParams {
  toEmail: string;
  toName?: string;
  lostItemTitle: string;
  foundItemTitle: string;
  foundItemDescription: string;
  foundItemLocation: string;
  foundItemId: string;
}

/**
 * Dispatches an email notification via Brevo HTTP API when a Found item matches a user's Lost item
 */
export async function sendMatchEmail({
  toEmail,
  toName,
  lostItemTitle,
  foundItemTitle,
  foundItemDescription,
  foundItemLocation,
  foundItemId,
}: SendMatchEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "notifications@campuslostfound.acm.org";

  if (!apiKey) {
    logEvent.error(
      "[BREVO_EMAIL_SKIPPED] BREVO_API_KEY environment variable is not configured",
      null,
      { toEmail, foundItemId }
    );
    return false;
  }

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const itemUrl = `${appUrl}/items/${foundItemId}`;

  const payload = {
    sender: {
      name: "Campus Found",
      email: senderEmail,
    },
    to: [
      {
        email: toEmail,
        name: toName || "Student",
      },
    ],
    subject: `[MATCH FOUND] Someone reported an item matching your lost "${lostItemTitle}"!`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Campus Found Match Notification</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #e5e2e1;
              background-color: #141313;
              margin: 0;
              padding: 24px 12px;
            }
            .card {
              background-color: #1c1b1b;
              max-width: 580px;
              margin: 0 auto;
              border: 1px solid #353534;
              padding: 32px;
              box-sizing: border-box;
            }
            .header-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #353534;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .brand-name {
              font-family: 'Georgia', 'Source Serif 4', serif;
              font-size: 20px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              color: #ffffff;
              margin: 0;
            }
            .badge {
              display: inline-block;
              background-color: #ffffff;
              color: #141313;
              font-family: 'Courier New', Courier, monospace;
              font-weight: 700;
              font-size: 11px;
              padding: 4px 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border: 1px solid #ffffff;
            }
            h2 {
              font-family: 'Georgia', 'Source Serif 4', serif;
              color: #ffffff;
              font-size: 22px;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 16px;
              line-height: 1.3;
            }
            p {
              color: #e5e2e1;
              font-size: 14px;
              margin-top: 0;
              margin-bottom: 16px;
            }
            .details-box {
              background-color: #141313;
              border: 1px solid #353534;
              border-left: 4px solid #ffffff;
              padding: 20px;
              margin: 24px 0;
            }
            .details-title {
              font-family: 'Georgia', 'Source Serif 4', serif;
              color: #ffffff;
              font-size: 17px;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 12px;
            }
            .details-row {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #c5c7c1;
              margin-bottom: 8px;
            }
            .details-label {
              color: #8f918c;
              text-transform: uppercase;
              font-weight: 700;
            }
            .cta-button {
              display: inline-block;
              background-color: #ffffff;
              color: #141313 !important;
              font-family: 'Courier New', Courier, monospace;
              font-weight: 700;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 0px;
              border: 1px solid #ffffff;
              margin-top: 8px;
            }
            .footer {
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid #353534;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              color: #8f918c;
              text-align: center;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border-bottom: 1px solid #353534; padding-bottom: 16px;">
              <tr>
                <td align="left" style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: -0.5px;">
                  CAMPUS FOUND
                </td>
                <td align="right">
                  <span class="badge">MATCH NOTIFICATION</span>
                </td>
              </tr>
            </table>

            <h2>A potential match for your lost item was reported!</h2>
            <p>Hello ${toName || "Student"},</p>
            <p>Good news! A new <strong>Found Item</strong> report has been submitted to the Campus Found board that matches your active report for <em>"${lostItemTitle}"</em>.</p>
            
            <div class="details-box">
              <div class="details-title">${foundItemTitle}</div>
              <div class="details-row"><span class="details-label">Description:</span> ${foundItemDescription}</div>
              <div class="details-row" style="margin-bottom:0;"><span class="details-label">Found Location:</span> ${foundItemLocation}</div>
            </div>

            <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; margin-bottom: 24px;">
              <tr>
                <td align="center" bgcolor="#ffffff">
                  <a href="${itemUrl}" target="_blank" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; color: #141313; text-decoration: none; padding: 14px 28px; border: 1px solid #ffffff; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                    VIEW FOUND ITEM DETAILS & CONTACT
                  </a>
                </td>
              </tr>
            </table>

            <div class="footer">
              <p>Campus Found • Campus Lost & Found System</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      logEvent.notificationSent({
        type: "email",
        recipientEmail: toEmail,
        itemId: foundItemId,
      });
      return true;
    } else {
      const errorText = await response.text();
      logEvent.error("[BREVO_API_ERROR] Failed to send email via Brevo", new Error(errorText), {
        status: response.status,
      });
      return false;
    }
  } catch (err) {
    logEvent.error("[BREVO_SEND_EXCEPTION] Exception while sending email", err);
    return false;
  }
}
