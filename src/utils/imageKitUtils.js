const imagekit = require("../config/imagekit");

// Shared ImageKit upload helper for controllers that already validated the file.
const uploadToImageKit = async (file, fileName, folder) => {
  console.log("file", file);
  console.log("fileName", fileName);
  console.log("folder", folder);
  const result = await imagekit.upload({
    file,
    fileName,
    folder,
  });
  return result;
};
module.exports = uploadToImageKit;
