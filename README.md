## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn coverage
```

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```

## Todo
- Deployment -> https://ourcodeworld.com/articles/read/977/how-to-deploy-a-node-js-application-on-aws-ec2-server
- create migration for referenceable_id [int(10)] and referenceable_type [varchar] in sales invoice table
- create table setting logo
```
CREATE TABLE `setting_logos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(191) NOT NULL,
  `public_url` varchar(191) NOT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

```
- create table setting end notes
```
CREATE TABLE `setting_end_notes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `purchase_request` varchar(255) DEFAULT NULL,
  `purchase_order` varchar(255) DEFAULT NULL,
  `purchase_down_payment` varchar(255) DEFAULT NULL,
  `purchase_receive` varchar(255) DEFAULT NULL,
  `purchase_invoice` varchar(255) DEFAULT NULL,
  `purchase_return` varchar(255) DEFAULT NULL,
  `payment_order_purchase` varchar(255) DEFAULT NULL,
  `point_of_sales` varchar(255) DEFAULT NULL,
  `sales_quotation` varchar(255) DEFAULT NULL,
  `sales_order` varchar(255) DEFAULT NULL,
  `sales_down_payment` varchar(255) DEFAULT NULL,
  `sales_invoice` varchar(255) DEFAULT NULL,
  `sales_return` varchar(255) DEFAULT NULL,
  `payment_collection_sales` varchar(255) DEFAULT NULL,
  `expedition_order` varchar(255) DEFAULT NULL,
  `expedition_down_payment` varchar(255) DEFAULT NULL,
  `expedition_invoice` varchar(255) DEFAULT NULL,
  `payment_order_expedition` varchar(255) DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

```