const AWS = require("aws-sdk");
require("dotenv").config();

// Configure AWS with your access and secret keys (Ensure these are set in your .env for security)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Function to upload an image to S3
const uploadImageToS3 = async (imageName, imageData) => {
  if (!imageData || !imageName) {
    throw new Error("Invalid image data or name");
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Use an environment variable for the bucket name
    Key: imageName,
    Body: imageData,
    ACL: 'public-read' // Assuming you want the uploaded images to be publicly readable
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error; // Re-throw the error for caller to handle
  }
};

// Function to delete an object from S3
const deleteFromS3 = async name => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Consistently use the environment variable
    Key: name
  };
  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error("Error deleting object:", error);
    throw error;
  }
};

// Additional utility functions can also include bucket name from environment variables
const renameS3Object = async (newImageName, oldImageName) => {
  if (newImageName === oldImageName) {
    return; // No need to rename if names are the same
  }

  const copyParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    CopySource: `${process.env.S3_BUCKET_NAME}/${oldImageName}`,
    Key: newImageName
  };

  try {
    await s3.copyObject(copyParams).promise();
    await deleteFromS3(oldImageName); 
  } catch (error) {
    console.error("Error renaming object:", error);
    throw error;
  }
};

const listS3Objects = async folder => {
  const listParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: folder ? `${folder}/` : ""
  };

  try {
    const data = await s3.listObjectsV2(listParams).promise();
    return data.Contents;
  } catch (error) {
    console.error("Error listing objects:", error);
    throw error;
  }
};

module.exports = {
  uploadImageToS3,
  deleteFromS3,
  renameS3Object,
  listS3Objects
};
