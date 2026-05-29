const multer = require("multer");

// Memory storage is used so controllers can stream buffers directly to ImageKit.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5 Mb
  },
  fileFilter: (req, file, cb) => {
    console.log("file in multer middleware-->", file);
    // Reject non-image uploads before they reach controller-level provider checks.
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are alowed"), false);
    }
    cb(null , true);
  },
});

module.exports = upload;
