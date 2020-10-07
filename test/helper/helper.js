const path = require("path");
const fs = require("fs");
const filePath = path.resolve(__dirname, "../../lib/order_book.json");

const checkOrCreateFile = () => {
  try {
    if (!fs.existsSync(filePath)) {
      //file exists
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  checkOrCreateFile,
};
