const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/') },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)) }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else { cb('Error: Images Only!') }
};

const upload = multer({
    storage: storage,
    limits: { filesize: 10 * 1024 * 1024 }, //max 5MB
    fileFilter: fileFilter
})

module.exports = upload;