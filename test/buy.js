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

describe("Buy", () => {
  after(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  it("it should throw an error if quantity or price was not provided", async () => {
    await expect(exchange.buy()).to.be.rejectedWith(
      "Quantity or price cannot be null or undefined"
    );
  });

  it("it should throw an error if quantity is not of type number", async () => {
    const quantity = "4";
    await expect(exchange.buy(quantity, 3)).to.be.rejectedWith(
      "expected quantity to be of type 'number' but got " + typeof quantity
    );
  });

  it("it should throw an error if price is not of type number", async () => {
    const price = true;
    await expect(exchange.buy(4, price)).to.be.rejectedWith(
      "expected price to be of type 'number' but got " + typeof price
    );
  });

  it("it should return a buy order whose id is 1 if it is the first order", async () => {
    const buy = await exchange.buy(10, 2);
    expect(buy.id).to.equal(1);
  });

  it("it should return a buy order whose id is 2", async () => {
    const buy = await exchange.buy(5, 3);
    expect(buy.id).to.equal(2);
  });

  it("it should return a successful trade for a buy order whose executedQauntity will be 50 when a buy order of 51 @ 9 is placed after a sell order of 50 @ 8 has been added initially", async () => {
    await exchange.sell(50, 8);
    await exchange.sell(5, 12);
    const buy = await exchange.buy(51, 9);
    expect(buy.executedQuantity).to.equal(50);
  });

  it("it should prioritize older orders first waiting to get matched if a group of matching orders have the same price", async () => {
    await exchange.sell(10, 12);
    await exchange.sell(1, 12);
    await exchange.sell(2, 12);
    const buy = await exchange.buy(15, 13);
    expect(buy.executedQuantity).to.equal(15);
  });
});
