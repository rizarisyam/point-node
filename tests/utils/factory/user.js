const faker = require('faker');
const { User } = require('@src/models').tenant;

async function create() {
  const user = await User.create({
    name: faker.name.findName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    emailConfirmationCode: faker.datatype.string(),
    emailConfirmed: true,
  });

  return user;
}

module.exports = { create };
