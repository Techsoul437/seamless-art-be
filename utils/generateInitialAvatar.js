import sharp from "sharp";
import { uploadAvatarToS3 } from "../services/s3AvatarService.js";

export const generateInitialAvatar = async (name) => {
  const initial = (name?.charAt(0) || "U").toUpperCase();

  // Convert hex to RGB (Sharp needs this format)
  const background = {
    create: {
      width: 300,
      height: 300,
      channels: 3,
      background: { r: 126, g: 50, b: 48 }, // FIXED
    },
  };

  // SVG layer
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

  // Merge background + SVG
  const finalImage = await sharp(background)
    .composite([{ input: textBuffer, gravity: "center" }])
    .jpeg()
    .toBuffer();

  return await uploadAvatarToS3(finalImage, "image/jpeg");
};
