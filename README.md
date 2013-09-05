# Shop

![Shop](https://raw.github.com/stripe/shop/master/examples/screenshot.png)

This project contains the code behind the single-page store at [Stripe
Shop](https://shop.stripe.com). We ported the backend to
[Parse](https://parse.com/)'s Code Cloud so you can easily launch and
modify your own copy. (Also, we didn't want to open-source the photo
of Kat and Thairu, so we decided to take a replacement.)

Feel free to take whatever pieces you find useful! We ask only that
you don't use it to sell actual Stripe T-shirts ☺. Improvements are
welcome — just open a pull request.

## The details

We have a running [live demo](https://shop-demo.parseapp.com/) of the
app. It's running in Stripe's [test
mode](https://stripe.com/docs/testing), so you'll have to use
`4242-4242-4242-4242` as the card (and we won't actually send you a
shirt, sorry!).

## Getting up and running

To get your own instance of Shop up and running, you'll need to do the
following:

1. Create a [new Parse app](https://parse.com/apps/new).
1. Copy `config/global.json` to `config/local.json`.
1. Add the Application ID and Master Key to `config/local.json`.
1. Set up the `parse` command line utility (you may find [their
docs](https://parse.com/docs/cloud_code_guide) helpful).
1. Create a `parseapp.com` subdomain for your app. The same docs
should be helpful.
1. Run `parse deploy`. You now have a running Shop!

Not required to get the app running, but you'll probaby also want to:

1. Create your own Stripe account and puts its keys into
`cloud/config.js`. (By default, Shop uses a fixed test account.)
1. Put your Google analytics tracking information into
`public/assets/js/ga.js`.

## Contributors

- [Karthik Viswanathan](https://twitter.com/karthikvnet)
- [Ludwig Pettersson](https://twitter.com/ludwig)
- [Greg Cooper](https://twitter.com/awfy)
- [Greg Brockman](https://twitter.com/thegdb)
