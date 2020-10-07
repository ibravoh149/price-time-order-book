const path = require("path");
const db = path.join(__dirname, "./lib/order_book.json");

const Exchange = require("./lib");
const { checkOrCreateFile } = require("./test/helper/helper");
checkOrCreateFile();

const exchange = new Exchange();

async function main() {
  const sync = await exchange.sync(db);
  // const buy = await exchange.buy(20, 9);
  // const sell = await exchange.sell(25, 5);
  // const getQuantitiyAtPrice = await exchange.getQuantityAtPrice(10);
  // const getOrder = await exchange.getOrder(1);
  console.log(sync);
}

main();
