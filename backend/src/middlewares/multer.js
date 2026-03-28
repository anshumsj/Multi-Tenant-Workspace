const multer = require('multer');

// store file in memory temporarily before sending to cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // preserve original mimetype
        file.mimetype = file.mimetype;
        cb(null, true);
    }
});

module.exports = upload;