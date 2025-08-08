import PDFDocument from "pdfkit";
import axios from "axios";
import { uploadBufferToS3 } from "../services/s3Service.js";
import InvoiceCounter from "../models/InvoiceCounter.js";

const getNextInvoiceNumber = async () => {
  let counter = await InvoiceCounter.findOne();
  if (!counter) {
    counter = await InvoiceCounter.create({ count: 1 });
  } else {
    counter.count += 1;
    await counter.save();
  }
  return counter.count.toString().padStart(6, "0");
};

export const generateInvoicePdf = async ({
  orderId,
  email,
  product,
  total,
  discount,
  finalTotal,
  date,
}) => {
  return new Promise(async (resolve, reject) => {
    const formattedInvoiceNumber = await getNextInvoiceNumber();

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const { url } = await uploadBufferToS3(
          pdfBuffer,
          "invoices",
          `invoice-${orderId}.pdf`
        );
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });

    // ===== 1. Header Logo =====
    try {
      const logoRes = await axios.get(
        "https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png",
        { responseType: "arraybuffer" }
      );
      const logoBuffer = Buffer.from(logoRes.data);
      doc.image(logoBuffer, doc.page.width / 2 - 40, 30, { width: 100 });
    } catch {
      doc
        .fontSize(20)
        .fillColor("#333")
        .text("SEAMLESSART", { align: "center" });
    }

    doc.moveDown(2);

    // ===== 2. Invoice Info =====

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#000")
      .text("Invoice Details", {
        align: "left",
        underline: true,
      });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#000")
      .text(`Invoice: #${formattedInvoiceNumber}`, {
        align: "right",
      })
      .text(`Date: ${new Date().toLocaleDateString()}`, {
        align: "right",
      });

    doc.moveDown(2);

    doc.font("Helvetica").fontSize(11).fillColor("#000");

    doc
      .font("Helvetica-Bold")
      .text("Order ID: ", { continued: true })
      .font("Helvetica")
      .text(`${orderId}`);

    doc.moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Email: ", { continued: true })
      .font("Helvetica")
      .text(`${email}`);

    doc.moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Order Date: ", { continued: true })
      .font("Helvetica")
      .text(new Date(date).toLocaleDateString());

    doc.moveDown(1.5);

    // ===== 3. Products Section =====
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Product", { underline: true });

    doc.moveDown(1);

    for (let i = 0; i < product.length; i++) {
      const p = product[i];
      const boxTop = doc.y;
      const boxHeight = 90;
      const boxLeft = 50;
      const boxWidth = 500;
      const imageSize = 70;
      const padding = 10;

      // Draw bordered box
      doc
        .rect(boxLeft, boxTop, boxWidth, boxHeight)
        .strokeColor("#ddd")
        .lineWidth(1)
        .stroke();

      // Image placement
      const imageX = boxLeft + padding; // e.g. 60
      const imageY = boxTop + padding; // e.g. 60
      try {
        const imgRes = await axios.get(p.originalImage.url, {
          responseType: "arraybuffer",
        });
        const imgBuffer = Buffer.from(imgRes.data);
        doc.image(imgBuffer, imageX, imageY, {
          width: imageSize,
          height: imageSize,
          fit: [imageSize, imageSize],
        });
      } catch {
        doc
          .rect(imageX, imageY, imageSize, imageSize)
          .strokeColor("#ccc")
          .stroke()
          .fontSize(10)
          .fillColor("gray")
          .text("No Image", imageX + 8, imageY + 25);
      }

      // Text placement
      const textX = imageX + imageSize + 20; // Space after image
      const textY = boxTop + padding + 5; // vertically aligned better

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#000")
        .text(p.title, textX, textY);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#555")
        .text(`SKU: ${p.slug}`, textX, textY + 18);

      doc.moveDown(6); // space after box
    }

    doc.moveDown(2);

    // ===== 4. Summary Section =====
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#000")
      .text("Summary", { underline: true, align: "right" });

    doc.moveDown(1);

    // Align using x and y manually (not doc.y shifting randomly)
    const summaryLabelX = 380;
    const summaryValueX = 460;
    let summaryY = doc.y;

    // Labels
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#333")
      .text("Subtotal:", summaryLabelX, summaryY)
      .text("Discount:", summaryLabelX, summaryY + 20)
      .text("Total Paid:", summaryLabelX, summaryY + 40);

    // Values
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#000")
      .text(`${total} USD`, summaryValueX, summaryY, { align: "right" })
      .text(`${discount} USD`, summaryValueX, summaryY + 20, { align: "right" })
      .text(`${finalTotal} USD`, summaryValueX, summaryY + 40, {
        align: "right",
      });

    doc.moveDown(4);

    // ===== 5. Footer =====

    const footerLineY = doc.page.height - 110;

    const margin = 50;
    const pageWidth = doc.page.width;
    const contactY = footerLineY - 20;

    doc.font("Helvetica").fontSize(10).fillColor("#444");

    doc.text("infoseamlessart@gmail.com", margin, contactY);

    const phoneText = "+91 8485956850";
    const phoneWidth = doc.widthOfString(phoneText);
    doc.text(phoneText, pageWidth - margin - phoneWidth, contactY);

    doc
      .moveTo(margin, footerLineY)
      .lineTo(pageWidth - margin, footerLineY)
      .strokeColor("#000")
      .lineWidth(1)
      .stroke();

    const footerText = `“One less package, one more planet.\nMake this paper your next masterpiece, list, or love note.”\n\nThank you for making a difference.`;

    doc
      .font("Helvetica-Oblique") // italic style
      .fontSize(10)
      .fillColor("#555")
      .text(footerText, 50, footerLineY + 10, {
        align: "center",
        width: doc.page.width - 100,
      });

    doc.end();
  });
};
