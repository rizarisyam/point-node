const { Op } = require('sequelize');
let {
  DeliveryNote,
  Form,
  Customer,
  DeliveryNoteItem,
  Allocation,
  DeliveryOrder,
  SalesOrder,
  SalesVisitation,
  SalesVisitationDetail,
  Item,
  DeliveryOrderItem,
  SalesOrderItem,
} = require('@src/models').tenant;

module.exports = async function getAllReferenceFormSalesInvoice({ currentTenantDatabase, queries }) {
  setTenantDatabase(currentTenantDatabase);
  const [queryLimit, queryPage] = [parseInt(queries.limit, 10), parseInt(queries.page, 10)];
  const { count: total, rows: formReferences } = await Form.findAndCountAll({
    where: generateFilters(queries),
    include: generateIncludes(),
    order: [['createdAt', 'ASC']],
    limit: queryLimit,
    offset: offsetParams(queryPage, queryLimit),
    subQuery: false,
  });
  removeUnusedAttributes(formReferences);
  parseDeliveryNoteItemNumberStringToFLoat(formReferences);

  return { total, formReferences };
};

function generateFilters(queries) {
  const filter = { [Op.and]: [] };

  // form done status
  const filterDoneForm = { done: false };
  filter[Op.and] = [...filter[Op.and], filterDoneForm];

  // form type
  const filterFormType = generateFilterFormType();
  filter[Op.and] = [...filter[Op.and], filterFormType];

  // like
  const filterLike = generateFilterLike(queries.filter_like);
  if (filterLike.length > 0) {
    filter[Op.and] = [...filter[Op.and], { [Op.or]: filterLike }];
  }

  return filter;
}

function generateFilterFormType() {
  return {
    [Op.or]: [{ number: { [Op.startsWith]: 'DN' } }, { number: { [Op.startsWith]: 'SV' } }],
  };
}

function generateFilterLike(likeQueries) {
  const filtersObject = JSON.parse(likeQueries);
  const filterKeys = Object.keys(filtersObject);

  const result = filterKeys.map((key) => {
    const likeKey = key.split('.').length > 1 ? `$${key}$` : key;

    return {
      [likeKey]: { [Op.substring]: filtersObject[key] || '' },
    };
  });

  return result;
}

function generateIncludes() {
  return [
    {
      model: DeliveryNote,
      as: 'salesDeliveryNote',
      include: [
        { model: DeliveryNoteItem, as: 'itemsQuery' },
        {
          model: DeliveryNoteItem,
          as: 'items',
          include: [
            { model: Allocation, as: 'allocation' },
            {
              model: DeliveryOrderItem,
              as: 'deliveryOrderItem',
              include: [{ model: SalesOrderItem, as: 'salesOrderItem' }],
            },
          ],
        },
        { model: Customer, as: 'customer' },
        {
          model: DeliveryOrder,
          as: 'deliveryOrder',
          include: [
            {
              model: SalesOrder,
              as: 'salesOrder',
              include: [{ model: Form, as: 'form' }],
            },
          ],
        },
      ],
    },
    {
      model: SalesVisitation,
      as: 'salesVisitation',
      include: [
        { model: Customer, as: 'customer' },
        {
          model: SalesVisitationDetail,
          as: 'items',
          include: [{ model: Item, as: 'item' }],
        },
      ],
    },
  ];
}

function parseDeliveryNoteItemNumberStringToFLoat(formReferences) {
  formReferences.forEach((formReference) => {
    if (formReference.salesDeliveryNote?.items) {
      formReference.salesDeliveryNote.items.forEach((item) => {
        item.price = parseFloat(item.price);
        item.quantity = parseFloat(item.quantity);
        item.discountPercent = parseFloat(item.discountPercent);
        item.discountValue = parseFloat(item.discountValue);
      });
    }

    if (formReference.salesVisitation?.items) {
      formReference.salesVisitation.items.forEach((item) => {
        item.price = parseFloat(item.price);
        item.quantity = parseFloat(item.quantity);
        item.discountPercent = parseFloat(item.discountPercent);
        item.discountValue = parseFloat(item.discountValue);
      });
    }
  });
}

function removeUnusedAttributes(formReferences) {
  formReferences.forEach((formReference) => {
    if (formReference.salesDeliveryNote?.dataValues?.itemsQuery) {
      formReference.salesDeliveryNote.dataValues.itemsQuery = undefined;
    }
  });
}

function offsetParams(page = 1, maxItem = 10) {
  return page > 1 ? maxItem * (page - 1) : 0;
}

function setTenantDatabase(currentTenantDatabase) {
  ({
    DeliveryNote,
    Form,
    Customer,
    DeliveryNoteItem,
    Allocation,
    DeliveryOrder,
    SalesOrder,
    SalesVisitation,
    SalesVisitationDetail,
    Item,
    DeliveryOrderItem,
    SalesOrderItem,
  } = currentTenantDatabase);
}
