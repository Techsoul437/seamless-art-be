import transporter from "./mailTransporter.js";

/**
 * Send a notification email when a new support ticket is created.
 *
 * Always sends FROM your app email (process.env.EMAIL_USER) TO your support inbox (toEmail).
 *
 * @param {string} toEmail - Recipient email (e.g. process.env.EMAIL_USER or support@yourdomain.com).
 * @param {object} ticket - Ticket object:
 *   { _id, subject, message, orderId, priority, createdByName, createdByEmail, createdAt, attachments }
 * @param {string} frontendUrl - Base URL of your frontend (e.g. https://app.seamless.art)
 */
export const sendSupportNotification = async (
  toEmail,
  ticket = {},
  frontendUrl = ""
) => {
  const escapeHtml = (unsafe) => {
    if (unsafe === undefined || unsafe === null) return "";
    return String(unsafe).replace(/[&<>"'`=\/]/g, (s) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
          "/": "&#x2F;",
          "`": "&#x60;",
          "=": "&#x3D;",
        }
      )[s]
    );
  };

  const id = ticket._id ?? ticket.id ?? "N/A";
  const subjectText = ticket.subject ?? "Support Request";
  const createdByName = ticket.createdByName ?? ticket.createdByEmail ?? "Guest";
  const createdByEmail = ticket.createdByEmail ?? "";
  const createdAtText = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString()
    : new Date().toLocaleString();
  const orderId = ticket.orderId ?? null;
  const viewUrl = `${frontendUrl.replace(/\/$/, "")}/support/${id}`;
  const orderUrl = orderId
    ? `${frontendUrl.replace(/\/$/, "")}/orders/${orderId}`
    : null;

  // HTML email template
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 700px; margin: auto; background: #fff; padding: 28px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 18px;">
        <img src="https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png" alt="Seamless Art Logo" style="height: 28px;" />
      </div>

      <h2 style="color: #333; margin: 6px 0 10px; font-size: 20px;">New Support Ticket Received</h2>

      <p style="font-size: 15px; color: #555; margin-top: 0;">
        A new support ticket was submitted by <strong>${escapeHtml(
          createdByName
        )}</strong>${
    createdByEmail
      ? ` (<a href="mailto:${escapeHtml(
          createdByEmail
        )}">${escapeHtml(createdByEmail)}</a>)`
      : ""
  }.
      </p>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 14px 0;">
        <div style="font-size: 13px; color: #444; padding: 8px 10px; border-radius: 6px; background: #f4f4f4;">
          <strong>Ticket ID:</strong> ${escapeHtml(id)}
        </div>

        ${
          orderId
            ? `<div style="font-size:13px; color:#444; padding:8px 10px; border-radius:6px; background:#fafafa;">
          <strong>Order:</strong> <a href="${escapeHtml(
            orderUrl
          )}" style="color:#007bff; text-decoration:none;">${escapeHtml(
                orderId
              )}</a>
        </div>`
            : ""
        }
      </div>

      <div style="border:1px solid #eee; background:#fafafa; padding:16px; border-radius:8px; margin-top: 10px;">
        <div style="color:#222; font-weight:600; margin-bottom:8px;">${escapeHtml(
          subjectText
        )}</div>
        <div style="color:#444; white-space:pre-wrap; line-height:1.5;">${escapeHtml(
          ticket.message ?? "(no message provided)"
        )}</div>
      </div>

      ${
        Array.isArray(ticket.attachments) && ticket.attachments.length
          ? `<div style="margin-top:12px; font-size:13px; color:#444;">
             <strong>Attachments:</strong>
             <ul style="padding-left: 18px; margin:6px 0;">
               ${ticket.attachments
                 .map(
                   (a) =>
                     `<li><a href="${escapeHtml(
                       a.url
                     )}" style="color:#007bff;">${escapeHtml(
                       a.filename ?? a.url
                     )}</a></li>`
                 )
                 .join("")}
             </ul>
           </div>`
          : ""
      }

      <div style="text-align:center; margin: 22px 0;">
        <a href="${escapeHtml(
          viewUrl
        )}" style="display:inline-block; padding:12px 22px; background-color:#007bff; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">
          View Ticket
        </a>
      </div>

      <p style="font-size:13px; color:#777; margin:0;">
        Received on ${escapeHtml(createdAtText)}.
      </p>

      <hr style="margin: 22px 0; border: none; border-top: 1px solid #eee;">

      <p style="font-size:13px; color:#999; margin:0;">
        Reply via the support panel or directly email ${
          createdByEmail
            ? `<a href="mailto:${escapeHtml(
                createdByEmail
              )}" style="color:#007bff; text-decoration:none;">${escapeHtml(
                createdByEmail
              )}</a>`
            : "the user"
        }.
      </p>

      <p style="font-size:13px; color:#999; margin-top:6px;">
        Thanks,<br/>The Seamless Art Team
      </p>
    </div>
  </div>
  `;

  // plain text fallback
  const text = [
    `New Support Ticket Received`,
    `Ticket ID: ${id}`,
    `Subject: ${subjectText}`,
    `From: ${createdByName}${
      createdByEmail ? ` <${createdByEmail}>` : ""
    }`,
    `Priority: ${priority}`,
    orderId ? `Order: ${orderId} (${orderUrl})` : null,
    `Created at: ${createdAtText}`,
    ``,
    `Message:`,
    ticket.message ?? "(no message provided)",
    ``,
    `View ticket: ${viewUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const mailOptions = {
    from: `"Seamless Art Support" <${process.env.EMAIL_USER}>`, // always from your app email
    to: toEmail, // your support inbox (process.env.EMAIL_USER or other)
    subject: `Support Ticket: ${subjectText}`,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};
