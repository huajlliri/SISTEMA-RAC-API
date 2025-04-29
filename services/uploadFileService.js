const path = require("path");
const sharp = require("sharp");
const { nanoid } = require("nanoid");
const fs = require("fs");

const uploadFile = async ({
  fileData,
  fileName = null,
  folder,
  resizeImage = false,
  options = { width: 1500, height: 1500, quality: 90 },
}) => {
  if (!fileData || !folder) {
    throw new Error("Faltan parámetros necesarios para subir el archivo.");
  }

  const extension = fileData.mimetype.split("/")[1] || "bin";
  const randomName = fileName || `${nanoid()}.${extension}`;
  const uploadFolder = path.resolve(__dirname, `../public/${folder}`);

  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  const uploadPath = path.join(uploadFolder, randomName);

  if (resizeImage && fileData.mimetype.startsWith("image/")) {
    await sharp(fileData.data, { failOnError: false })
      .resize({ width: options.width, height: options.height, fit: "inside" })
      .webp({ quality: options.quality })
      .toFile(uploadPath);
  } else {
    await fs.promises.writeFile(uploadPath, fileData.data);
  }

  return `${folder}/${randomName}`;
};

module.exports = uploadFile;
