var Stripe = require('stripe')
  , express = require('express')
  , app = express()
  , path = require('path')
  , models = require('cloud/models')
  , config = require('cloud/config')
  ;

Stripe.initialize(config.stripe_secret_key);

app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: config.secret,
  cookie: { httpOnly: true }
}));
app.use(express.csrf());
app.use(function(req, res, next) {
  res.locals.csrf_field = req.session._csrf;
  next();
});

app.get('/', function(req, res) {
  res.render('index', {
    config: config
  });
});

app.post('/pay', function(req, res) {
  var order = new models.Order()
    , token = null;

  for (param in models.Order.schema) {
    order.set(param, req.body[param]);
  }

  // Coerce to a string out of paranoia
  Stripe.Tokens.retrieve(req.body.stripe_token + '').then(function(result) {
    token = result
    if (!token.email) {
      return Parse.Promise.error('You did not provide an email address.\n');
    }

    order.set('email', token.email);
    order.set('state', 'unpaid');
    return order.save();
  }).then(function(order) {
    return Stripe.Customers.create({
      description: order.get('name'),
      email: token.email,
      card: token.id
    })
  }).then(function(customer) {
    return Stripe.Charges.create({
      amount: order.calculateAmount(),
      description: order.get('name') +
        ' <' + order.get('email') + ' > - Shop T-Shirt Order',
      currency: 'usd',
      customer: customer.id
    });
  }).then(function(charge) {
    order.set('charge_id', charge.id);
    order.set('state', 'paid');
    return order.save();
  }).then(function(order) {
    res.send('Success!\n');
  }, function(error) {
    console.log(error);
    res.send(400, error.message + '\n');
  })
});

app.listen();
