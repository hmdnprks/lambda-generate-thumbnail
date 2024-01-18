const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const sourceBucket = event.Records[0].s3.bucket.name;
    const sourceKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const targetBucket = 'image-thumbnail-lambda-test';
    const targetKey = `thumbnail-${sourceKey}`;

    try {
        const image = await s3.getObject({ Bucket: sourceBucket, Key: sourceKey }).promise();
        const resizedImage = await sharp(image.Body).resize(200).toBuffer();

        await s3.putObject({
            Bucket: targetBucket,
            Key: targetKey,
            Body: resizedImage,
            ContentType: 'image/jpeg'
        }).promise();

        return { status: 'Thumbnail created successfully' };
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error processing S3 event');
    }
};
