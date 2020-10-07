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

checkOrCreateFile(filePath);

describe("Get Quantity at price", () => {
  before(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  after(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  it("it should throw an error if price was not provided", async () => {
    await expect(exchange.getQuantityAtPrice()).to.be.rejectedWith(
      "Expects a price arguement but got nothing"
    );
  });

  it("it should throw an error if price is not of type number", async () => {
    const price = "4";
    await expect(exchange.getQuantityAtPrice(price)).to.be.rejectedWith(
      "expected price to be of type 'number' but got " + typeof price
    );
  });

  it("it should return 0 if no order has been created", async () => {
    const getQuantity = await exchange.getQuantityAtPrice(10);
    expect(getQuantity).to.equal(0);
  });

  it("it should return a 0 if no open order at that price was found", async () => {
    await exchange.buy(5, 12);
    await exchange.sell(5, 13);
    const getQuantity = await exchange.getQuantityAtPrice(10);
    expect(getQuantity).to.equal(0);
  });

  it("it should return a total of 9 for two sell orders selling 20. 4 @ 20 and 5 @ 20 respectively", async () => {
    await exchange.sell(4, 20);
    await exchange.sell(5, 20);
    const getQuantity = await exchange.getQuantityAtPrice(20);
    expect(getQuantity).to.equal(9);
  });
});
