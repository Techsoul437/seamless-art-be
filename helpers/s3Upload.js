export const uploadBufferToS3 = async (
  buffer,
  folder,
  key = null,
  contentType = "application/octet-stream"
) => {
  const finalKey = key || `${folder}/${uuidv4()}`;

  const uploadParams = {
    Bucket,
    Key: finalKey,
    Body: buffer,
    ContentType: contentType,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return {
    key: finalKey,
    url: `https://${Bucket}.s3.amazonaws.com/${finalKey}`,
    folder,
  };
};
