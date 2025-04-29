const fs = require("fs");
const path = require("path");

const deleteFile = async (relativePath) => {
  if (!relativePath) {
    throw new Error("Se debe proporcionar una ruta de archivo para eliminar.");
  }

  const fullPath = path.resolve(__dirname, "../public", relativePath);

  try {
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.error(`Error eliminando archivo: ${error.message}`);
    throw error;
  }
};

module.exports = deleteFile;
