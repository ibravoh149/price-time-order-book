const fs = require("fs");
const path = require("path");
const db = path.join(__dirname, "../lib/order_book.json");

const getOrderBookRecords = Symbol.for("getOrderBookRecords");
const updateOrderBookRecords = Symbol.for("updateOrderBookRecords");
const writeData = Symbol.for("writeData");
const processOrder = Symbol.for("processOrder");
const common = Symbol.for("common");
const validate = Symbol.for("validate");

const getLastInsertedId = (list) => {
  return list[list.length - 1].id;
};

const comparePrice = (a, b) => {
  return a - b;
};

class Order {
  constructor(id, isBuyOrder, quantity, price, executedQuantity) {
    this.id = id;
    this.isBuyOrder = isBuyOrder;
    this.quantity = quantity;
    this.price = price;
    this.executedQuantity = executedQuantity;
  }
  get order() {
    return {
      id: this.id,
      isBuyOrder: this.isBuyOrder,
      quantity: this.quantity,
      executedQuantity: this.executedQuantity,
      price: this.price,
    };
  }
}

// validate quantiy and prices integers;
class Exchange {
  constructor() {
    // TODO
    this.orderBookRecord = null;
    this.file = db;
  }

  [getOrderBookRecords](fileName) {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(fileName, { encoding: "utf-8" });
      stream.on("data", (data) => {
        resolve(data);
      });
      stream.on("error", (err) => {
        reject("Failed to read order book records." + "\n " + err);
      });
    });
  }

  [writeData](chunk, stream) {
    return new Promise((resolve, reject) => {
      stream.on("open", () => {
        stream.write(chunk);
        stream.end();
        resolve();
      });
      stream.on("error", (e) =>
        reject("Failed to update order book records." + "\n" + e)
      );
    });
  }

  [validate](quantity, price) {
    if (!quantity || !price)
      throw new Error("Quantity or price cannot be null or undefined");

    const quantityType = typeof quantity;
    const priceType = typeof price;
    if (quantityType !== "number") {
      throw new Error(
        "expected quantity to be of type 'number' but got " + quantityType
      );
    }
    if (priceType !== "number") {
      throw new Error(
        "expected price to be of type 'number' but got " + priceType
      );
    }
  }

  async [common](orderBookRecords, order, comparePrice) {
    const matchingOrders = orderBookRecords.filter((o) => {
      return (
        o.isBuyOrder != order.isBuyOrder &&
        o.quantity > o.executedQuantity &&
        comparePrice(o.price, order.price) <= 0
      );
    });

    const sortedMatchingRecords = matchingOrders.sort((a, b) => {
      return comparePrice(a.price, b.price) || a.id - b.id;
    });

    for (let record of sortedMatchingRecords) {
      if (order.quantity > order.executedQuantity) {
        this[processOrder](orderBookRecords, order, record);
      } else {
        break;
      }
    }
    orderBookRecords.push(order);
    await this[updateOrderBookRecords](this.file, orderBookRecords);
    return order;
  }

  [processOrder](records, order, matchedOrder) {
    const matchingOrder = Array.isArray(matchedOrder)
      ? matchedOrder[0]
      : matchedOrder;
    const matchingOrderDiff =
      Number(matchingOrder.quantity) - Number(matchingOrder.executedQuantity);
    const orderDifference = order.quantity - order.executedQuantity;

    const _quantity =
      matchingOrderDiff >= orderDifference
        ? orderDifference
        : matchingOrderDiff;

    matchingOrder.executedQuantity += _quantity;
    order.executedQuantity += _quantity;
    const index = records.findIndex((r) => r.id === matchingOrder.id);
    records[index] = matchingOrder;
  }

  async [updateOrderBookRecords](fileName, records) {
    const strigified = JSON.stringify(records);
    const stream = fs.createWriteStream(fileName);
    return await this[writeData](strigified, stream);
  }

  async sync(fileName) {
    // TODO
    if (!fileName)
      throw new Error(
        "Invalid fileName arguement was supplied, expects a string"
      );
    if (typeof fileName !== "string")
      throw new Error(
        "Invalid fileName arguement was supplied, expects a string but got " +
          typeof fileName
      );

    try {
      this.orderBookRecord = await this[getOrderBookRecords](fileName);
    } catch (e) {
      throw new Error(e);
    }
    return (this.orderBookRecord = JSON.parse(this.orderBookRecord));
  }

  async buy(quantity, price) {
    // TODO
    // comparePrice;

    this[validate](quantity, price);
    try {
      const orderBookRecords = (await this.sync(this.file)) || [];
      const id =
        orderBookRecords.length === 0
          ? 1
          : getLastInsertedId(orderBookRecords) + 1;
      const order = new Order(id, true, quantity, price, 0).order;
      return await this[common](orderBookRecords, order, (a, b) => a - b);
    } catch (e) {
      Promise.reject(e);
    }
  }

  async sell(quantity, price) {
    this[validate](quantity, price);
    // TODO
    try {
      const orderBookRecords = (await this.sync(this.file)) || [];
      const id =
        orderBookRecords.length === 0
          ? 1
          : getLastInsertedId(orderBookRecords) + 1;
      const order = new Order(id, false, quantity, price, 0).order;
      return await this[common](orderBookRecords, order, (a, b) => b - a);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getQuantityAtPrice(price) {
    // TODO

    if (!price) throw new Error("Expects a price arguement but got nothing");

    const priceType = typeof price;
    if (priceType !== "number") {
      throw new Error(
        "expected price to be of type 'number' but got " + priceType
      );
    }
    let quantityCount = 0;
    try {
      const orderBookRecords = (await this.sync(this.file)) || [];
      orderBookRecords.map((record) => {
        if (
          record.price === price &&
          record.quantity > record.executedQuantity &&
          record.isBuyOrder === false
        ) {
          quantityCount += record.quantity - record.executedQuantity;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }

    return quantityCount;
  }

  async getOrder(id) {
    // TODO
    if (!id) throw new Error("Expects an id arguement but got nothing");
    const idType = typeof id;
    if (id && idType !== "number") {
      throw new Error("expected id to be of type 'number' but got " + idType);
    }

    try {
      const orderBookRecords = (await this.sync(this.file)) || [];
      if (orderBookRecords.length === 0) {
        return null;
      }
      const record = orderBookRecords.find((record) => record.id === id);

      return record
        ? new Order(
            record.id,
            record.isBuyOrder,
            record.quantity,
            record.price,
            record.executedQuantity
          ).order
        : null;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

module.exports = Exchange;
