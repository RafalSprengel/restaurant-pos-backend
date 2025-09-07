const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadPath = path.join(__dirname, '../public/uploads/products');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Images Only!'));
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
});

const resizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const filePath = path.join(uploadPath, req.file.filename);
    const thumbPath = path.join(uploadPath, 'thumb_' + req.file.filename);

    try {
        // reduce the main file to 600px width (overwriting the original)
        await sharp(filePath)
            .resize({ width: 600 })
            .toFile(filePath + '_tmp');

        await fs.promises.rename(filePath + '_tmp', filePath);

        // create a 300px thumbnail
        await sharp(filePath)
            .resize({ width: 300 })
            .toFile(thumbPath);

        req.file.thumbnail = '/api/uploads/products/' + 'thumb_' + req.file.filename;
        next();
    } catch (err) {
        console.error('Error resizing image:', err);
        next(err);
    }
};

module.exports = { upload, resizeImage };
