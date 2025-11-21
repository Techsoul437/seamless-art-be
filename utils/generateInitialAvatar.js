import sharp from "sharp";
import { uploadAvatarToS3 } from "../services/s3AvatarService.js";

export const generateInitialAvatar = async (name) => {
  const initial = (name?.charAt(0) || "U").toUpperCase();

  // Background color
  const bgColor = "#7e3230";

  // Create 300x300 background
  const background = {
    create: {
      width: 300,
      height: 300,
      channels: 3,
      background: bgColor,
    },
  };

  // Create SVG text layer (works everywhere — no font issues)
  const textSvg = `
    <svg width="300" height="300">
      <text 
        x="50%" 
        y="50%" 
        font-size="160" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle"
        dominant-baseline="central"
      >
        ${initial}
      </text>
    </svg>
  `;

  const textBuffer = Buffer.from(textSvg);

  // Merge background + text
  const finalImage = await sharp(background)
    .composite([{ input: textBuffer, gravity: "center" }])
    .jpeg()              // Output as JPG
    .toBuffer();

  return await uploadAvatarToS3(finalImage, "image/jpeg");
};
