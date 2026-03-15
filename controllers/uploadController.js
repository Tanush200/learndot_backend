const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: "NEVER",
    responseChecksumValidation: "NEVER"
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;


const getPresignedUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        if (req.user.role !== 'creator' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only creators can upload files' });

        }

        if (!fileName || !fileType) {
            return res.status(400).json({ message: 'File name and type are required' });
        }

        const uniqueFileName = `${Date.now()}-${req.user._id}-${fileName.replace(/\s+/g, '-')}`;


        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueFileName,
            ContentType: fileType
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 900,
        });

        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
        res.json({
            presignedUrl,
            publicUrl,
        });


    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({ message: 'Failed to generate presigned URL', error: error.message });
    }
};

module.exports = {
    getPresignedUrl
}