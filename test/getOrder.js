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

describe("Get Order", () => {
  before(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  after(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  it("it should throw an error if order id was not provided", async () => {
    await expect(exchange.getOrder()).to.be.rejectedWith(
      "Expects an id arguement but got nothing"
    );
  });

  it("it should throw an error if id is not of type number", async () => {
    const id = "5";
    await expect(exchange.getOrder(id)).to.be.rejectedWith(
      "expected id to be of type 'number' but got " + typeof id
    );
  });

  it("it should return a null if no order book is empty", async () => {
    const getOrder = await exchange.getOrder(10);
    expect(getOrder).to.equal(null);
  });

  it("it should return a null if no matching order with supplied id", async () => {
    await exchange.buy(5, 12);
    await exchange.sell(5, 13);
    const getOrder = await exchange.getOrder(10);
    expect(getOrder).to.equal(null);
  });

  it("it should return an object when a record is found with the supplied id", async () => {
    const id = 2;
    await exchange.sell(6, 4);
    const getOrder = await exchange.getOrder(id);
    expect(getOrder).to.be.a("object");
  });

  it("it should return an object whose id match the supplied id when a matching record if found", async () => {
    const id = 1;
    await exchange.sell(1, 4);
    const getOrder = await exchange.getOrder(id);
    expect(getOrder.id).to.equal(id);
  });
});
