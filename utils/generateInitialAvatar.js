import sharp from "sharp";
import { uploadAvatarToS3 } from "../services/s3AvatarService.js";

export const generateInitialAvatar = async (name) => {
  const initial = (name?.charAt(0) || "U").toUpperCase();

  const background = {
    create: {
      width: 300,
      height: 300,
      channels: 3,
      background: { r: 126, g: 50, b: 48 },
    },
  };

  const textSvg = `
    <svg width="300" height="300">
      <text 
        x="50%" 
        y="50%" 
        dy="20"
        font-size="200"
        font-weight="700"
        fill="white"
        text-anchor="middle"
      >
        ${initial}
      </text>
    </svg>
  `;

  const finalImage = await sharp(background)
    .composite([{ input: Buffer.from(textSvg), gravity: "center" }])
    .jpeg()
    .toBuffer();

  return await uploadAvatarToS3(finalImage, "image/jpeg");
};
