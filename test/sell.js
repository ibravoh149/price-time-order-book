// const assert = require("assert");
const chai = require("chai");
const Exchange = require("../lib/index.js");
const { checkOrCreateFile } = require("./helper/helper.js");
const path = require("path");
const fs = require("fs");
const filePath = path.resolve(__dirname, "../lib/order_book.json");
const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const exchange = new Exchange();

checkOrCreateFile();

describe("Sell", () => {
  after(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  it("it should throw an error if quantity or price was not provided", async () => {
    await expect(exchange.sell()).to.be.rejectedWith(
      "Quantity or price cannot be null or undefined"
    );
  });

  it("it should throw an error if quantity is not of type number", async () => {
    const quantity = "4";
    await expect(exchange.sell(quantity, 3)).to.be.rejectedWith(
      "expected quantity to be of type 'number' but got " + typeof quantity
    );
  });

  it("it should throw an error if price is not of type number", async () => {
    const price = true;
    await expect(exchange.sell(4, price)).to.be.rejectedWith(
      "expected price to be of type 'number' but got " + typeof price
    );
  });

  it("it should return a sell order whose id is 1 if it is the first order", async () => {
    const sell = await exchange.sell(10, 2);
    expect(sell.id).to.equal(1);
  });

  it("it should return a successful trade for a sell order whose executedQauntity will be 5 when a sell order of 51 @ 9 is placed after a buy order of 5 @ 12 has been placed", async () => {
    await exchange.buy(5, 12);
    const buy = await exchange.buy(50, 9);
    expect(buy.executedQuantity).to.equal(5);
  });
});
