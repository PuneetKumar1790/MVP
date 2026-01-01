const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

// Initialize Azure Blob Service Client
const getContainerClient = () => {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!accountName || !accountKey || !containerName) {
        throw new Error('Azure Blob Storage configuration missing in environment variables');
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
    );

    return {
        containerClient: blobServiceClient.getContainerClient(containerName),
        sharedKeyCredential,
        accountName,
        containerName
    };
};

/**
 * Upload file to Azure Blob Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original file name
 * @param {string} mimeType - MIME type
 * @returns {Object} - Upload result with blobUrl and blobName
 */
const uploadToBlob = async (fileBuffer, originalName, mimeType) => {
    const { containerClient } = getContainerClient();

    // Generate unique blob name
    const extension = originalName.split('.').pop();
    const blobName = `${uuidv4()}.${extension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload with content type
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
            blobContentType: mimeType
        }
    });

    return {
        blobUrl: blockBlobClient.url,
        blobName
    };
};

/**
 * Generate SAS URL for private blob access
 * @param {string} blobName - Name of the blob
 * @param {number} expiryMinutes - SAS URL expiry in minutes (default 10)
 * @returns {string} - SAS URL
 */
const generateSasUrl = (blobName, expiryMinutes = 10) => {
    const { containerClient, sharedKeyCredential, accountName, containerName } = getContainerClient();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Set SAS token expiry
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + expiryMinutes * 60 * 1000);

    // Generate SAS query parameters
    const sasOptions = {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'), // Read only
        startsOn,
        expiresOn
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    return `${blockBlobClient.url}?${sasToken}`;
};

/**
 * Delete blob from Azure Blob Storage
 * @param {string} blobName - Name of the blob to delete
 */
const deleteBlob = async (blobName) => {
    const { containerClient } = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists();
};

/**
 * Check if blob exists
 * @param {string} blobName - Name of the blob
 * @returns {boolean}
 */
const blobExists = async (blobName) => {
    const { containerClient } = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    return await blockBlobClient.exists();
};

module.exports = {
    uploadToBlob,
    generateSasUrl,
    deleteBlob,
    blobExists
};
