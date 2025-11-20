import sharp from "sharp";
import { uploadBufferToS3 } from "../services/s3Service.js";
import { v4 as uuidv4 } from "uuid";

export const generateInitialAvatar = async (name) => {
  const initial = name?.charAt(0)?.toUpperCase() || "U";

  const svg = `
  <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="#7e3230" />

    <!-- Initial Letter -->
    <text
      x="50%"
      y="50%"
      fill="#f9f5f1"
      font-size="160"
      font-weight="bold"
      font-family="Arial, sans-serif"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      ${initial}
    </text>
  </svg>
  `;

  // Convert SVG → PNG
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  const key = `users/${uuidv4()}.png`;

  const uploaded = await uploadBufferToS3(buffer, "users", key, "image/png");

  return uploaded; // { key, url }
};
