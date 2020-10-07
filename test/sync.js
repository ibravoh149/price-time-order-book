// const assert = require("assert");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const Exchange = require("../lib/index.js");
const { checkOrCreateFile } = require("./helper/helper.js");
const path = require("path");
const fs = require("fs");
const filePath = path.resolve(__dirname, "../lib/order_book.json");

const exchange = new Exchange();
const expect = chai.expect;
chai.use(chaiAsPromised);
checkOrCreateFile();

describe("Sync", () => {
  after(() => {
    fs.writeFileSync(filePath, JSON.stringify([]));
  });

  it("it should throw an error if invalid file path was supplied", async () => {
    const path = {};
    await expect(exchange.sync(path)).to.be.rejectedWith(
      "Invalid fileName arguement was supplied, expects a string but got " +
        typeof path
    );
  });

  it("it should throw an error if no arguement was passed", async () => {
    await expect(exchange.sync()).to.be.rejectedWith(
      "Invalid fileName arguement was supplied, expects a string"
    );
  });

  it("it should return an empty array if no record was found", async () => {
    const sync = await exchange.sync(filePath);
    expect(sync).to.have.lengthOf(0);
  });

  it("it should return 2 as the length of items in the record", async () => {
    await exchange.buy(4, 2);
    await exchange.sell(5, 6);
    const sync = await exchange.sync(filePath);
    expect(sync).to.have.lengthOf(2);
  });
});
