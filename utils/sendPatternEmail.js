import transporter from "./mailTransporter.js";

export const sendPatternDownloadEmail = async (email, products = []) => {
  if (!email || products.length === 0) {
    console.warn(
      "sendPatternDownloadEmail skipped: Missing email or empty products array"
    );
    return;
  }

  const downloadItemsHtml = products
    .map(
      (p) => `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #eee;">
        <table cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <!-- Product Image -->
            <td style="width: 100px;">
              <img src="${p.imageUrl}" alt="${
        p.name
      }" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />
            </td>

            <!-- Product Details -->
            <td style="padding-left: 20px; vertical-align: top;">
              <h3 style="margin: 0; font-size: 16px; color: #333;">${
                p.name
              }</h3>
              <p style="margin: 4px 0 8px; font-size: 14px; color: #555;">
                Size: ${p.size || "3780 x 3780 px"}
              </p>
              <a href="${
                p.downloadUrl
              }" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">
                Download Pattern
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 40px 20px;">
      <div style="max-width: 620px; margin: auto; background: #ffffff; border-radius: 10px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #f9f9f9; padding: 24px; text-align: center;">
          <img src="https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png" alt="Seamless Art Logo" style="height: 26px;" />
        </div>

        <!-- Greeting -->
        <div style="padding: 30px;">
          <h2 style="margin: 0 0 12px; color: #333;">Hey Creative Soul! 🎨</h2>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thank you so much for shopping with <strong>Seamless Art</strong>. We’re thrilled you’ve chosen our patterns to bring your next project to life!
            <br/><br/>
            Below you’ll find your download links along with a summary of your purchase.
          </p>
        </div>

        <!-- Products -->
        <table style="width: 100%; padding: 0 30px;">
          ${downloadItemsHtml}
        </table>

        <!-- Footer -->
        <div style="padding: 40px 30px 30px; text-align: center;">
          <p style="font-size: 13px; color: #999; line-height: 1.5;">
            If you have any issues or need help, just reply to this email — we’re here for you!<br/>
            <span style="color: #e25555;">❤️</span> from the Seamless Art Team
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Seamless Art" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Seamless Patterns Are Ready to Download!",
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Pattern download email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending pattern download email:", err);
  }
};
