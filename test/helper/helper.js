// const path = require("path");
const fs = require("fs");

const checkOrCreateFile = (path) => {
  // const pathFile = env === "test" ? filePathTest : filePath;
  try {
    if (!fs.existsSync(path)) {
      //file exists
      fs.writeFileSync(path, JSON.stringify([]));
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  checkOrCreateFile,
};
