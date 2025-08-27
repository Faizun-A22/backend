const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if not exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.uploadFile = async (file, subfolder = '') => {
    try {
        const uploadPath = path.join(uploadDir, subfolder);
        
        // Create subfolder if not exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const fileExt = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadPath, fileName);
        const relativePath = path.join('uploads', subfolder, fileName);

        await file.mv(filePath);

        return {
            name: file.name,
            path: relativePath,
            size: file.size,
            mimetype: file.mimetype
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('File upload failed');
    }
};

exports.deleteFile = async (filePath) => {
    try {
        if (!filePath) return;
        
        const absolutePath = path.join(__dirname, '../../', filePath);
        
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('File deletion failed');
    }
};