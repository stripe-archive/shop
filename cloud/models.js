var config = require('cloud/config')
  , Order = Parse.Object.extend('Order')
  , orderTypeRegex = /^[UW]$/
  , orderColorRegex = /^[G]$/
  , orderSizeRegex = /^(S|M|L|XL|2XL)$/
  ;

function getError(spec, name, value) {
  if (spec.required && value === undefined) {
    return name + ' field is missing';
  }

  if (value !== undefined && spec.type && typeof(value) != spec.type) {
    return name + ' has the wrong type';
  }

  if (spec.min_length && value.length < spec.min_length) {
    return name + ' must be at least ' + value.length + ' characters long.';
  }

  if (spec.max_length && value.length > spec.max_length) {
    return name + ' must be at least ' + value.length + ' characters long.';
  }

  if (spec.getError) {
    var error = spec.getError(value);
    if (error)
      return error;
  }
}

function orderError(serializedOrder) {
  try {
    order = JSON.parse(serializedOrder);
  } catch (e) {
    return 'Your order format is invalid.';
  }

  if (!(order instanceof Array)) {
    return 'Your order is not an array.';
  }

  if (order.length == 0) {
    return 'Your order is empty.';
  }

  for (var i = 0; i < order.length; i++) {
    var item = order[i];
    var type = item.type;
    var color = item.color;
    var size = item.size;
    var quantity = item.quantity;

    if (Object.keys(item).length != 4)
      return 'Your order has an invalid item.';
    else if (!(typeof(type) == 'string') || !type.match(orderTypeRegex))
      return 'Your order has an invalid type for one item.';
    else if (!(typeof(color) == 'string') || !color.match(orderColorRegex))
      return 'Your order has an invalid type for one item.';
    else if (!(typeof(size) == 'string') || !size.match(orderSizeRegex))
      return 'Your order has an invalid size for one item.';
    else if (!(typeof(quantity) == 'number') || quantity == 0)
      return 'Your order has an invalid quantity for one item.';
  }
}

Parse.Cloud.beforeSave('Order', function(request, response) {
  for (param in Order.schema) {
    var error = getError(Order.schema[param], param, request.object.get(param))
    if (error) {
      response.error(error);
      return;
    }
  }

  response.success();
});

Order.schema = {
  name: {required: true, min_length: 2, max_length: 100, type: 'string'},
  stripe_token: {required: true, min_length: 2, max_length: 100, type: 'string'},

  address_line_1: {type: 'string'},
  address_line_2: {type: 'string'},
  address_city: {type: 'string'},
  address_state: {type: 'string'},
  address_zip: {type: 'string'},
  address_country: {type: 'string'},
  order: {required: true, getError: orderError, type: 'string'}
}

Order.prototype.calculateAmount = function() {
  var order = JSON.parse(this.get('order'))
    , quantity  = 0
    ;

  for (var i = 0; i < order.length; i++) {
    quantity += order[i].quantity
  }

  return quantity * config.price_per_shirt * 100;
}

exports.Order = Order;
