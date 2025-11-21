import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Bucket, s3 } from "../config/s3Config.js";

export const uploadAvatarToS3 = async (buffer, contentType = "image/jpeg") => {
  const ext = contentType === "image/jpeg" ? "jpg" : "png";
  const filename = `${uuidv4()}.${ext}`;
  const key = `users/${filename}`;

  const params = {
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await s3.send(new PutObjectCommand(params));

  return {
    key,
    url: `https://${Bucket}.s3.amazonaws.com/${key}`,
  };
};
