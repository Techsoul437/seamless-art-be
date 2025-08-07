import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const Bucket = process.env.AWS_S3_BUCKET_NAME;

export const uploadToS3 = async (file, folder) => {
  const ext = path.extname(file.originalname);
  const filename = `${uuidv4()}${ext}`;
  const key = `${folder}/${filename}`;

  const uploadParams = {
    Bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return {
    key,
    url: `https://${Bucket}.s3.amazonaws.com/${key}`,
    folder,
  };
};

export const uploadBufferToS3 = async (buffer, folder, filename = null) => {
  const key = `${folder}/${filename || uuidv4()}.pdf`;

  const uploadParams = {
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return {
    key,
    url: `https://${Bucket}.s3.amazonaws.com/${key}`,
    folder,
  };
};

export const deleteFromS3 = async (key) => {
  if (!key) throw new Error("S3 key is required");

  const params = {
    Bucket,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  const response = await s3.send(command);

  return { key, deleted: true, response };
};

export const updateS3Image = async (oldKey, newFile, folder) => {
  await deleteFromS3(oldKey);
  return await uploadToS3(newFile, folder);
};

export const generateSignedDownloadUrl = async (key) => {
  if (!key) throw new Error("S3 key is required for download");

  const command = new GetObjectCommand({
    Bucket,
    Key: key,
    ResponseContentDisposition: "attachment", 
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 600 }); 

  return signedUrl;
};
