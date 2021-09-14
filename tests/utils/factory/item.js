const faker = require('faker');
const { Item } = require('@src/models').tenant;

async function create() {
  const item = await Item.create({
    code: faker.datatype.string(),
    name: faker.commerce.productName(),
    stock: 100,
  });

  return item;
}

module.exports = { create };
