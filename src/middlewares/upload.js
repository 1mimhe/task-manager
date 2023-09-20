const multer = require('multer');

module.exports = multer({
   limits: {
       fileSize: 500_000
   },
   fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            cb(new Error('File must be a jpg or png file.'));
        }

        cb(undefined, true);
    }
});