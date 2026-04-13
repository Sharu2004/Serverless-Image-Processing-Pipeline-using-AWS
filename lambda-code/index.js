
---

## Lambda Function (Core Logic)

```javascript
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client();

export const handler = async (event) => {
    const record = event.Records[0];

    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log("Processing:", key);

    // Get image from S3
    const data = await s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key
    }));

    const body = await data.Body.transformToByteArray();

    // Resize image
    const resizedImage = await sharp(body)
        .resize(300, 300)
        .toBuffer();

    // Upload resized image
    await s3.send(new PutObjectCommand({
        Bucket: "YOUR-OUTPUT-BUCKET-NAME",
        Key: `resized-${key}`,
        Body: resizedImage,
        ContentType: "image/jpeg"
    }));

    console.log("Image resized successfully");

    return "Done";
};
