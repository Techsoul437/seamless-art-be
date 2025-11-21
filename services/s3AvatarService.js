// services/s3AvatarService.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Bucket, s3 } from "../config/s3Config.js";

export const uploadAvatarToS3 = async (buffer) => {
  const filename = `${uuidv4()}.png`;
  const key = `users/${filename}`;

  const params = {
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: "image/png",
  };

  await s3.send(new PutObjectCommand(params));

  return {
    key,
    url: `https://${Bucket}.s3.amazonaws.com/${key}`,
  };
};
