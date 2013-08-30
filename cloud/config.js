var config = {
    // Price in dollars for each shirt
    price_per_shirt: 10,

    // Set to your Stripe publishable key. (The one here is for a test
    // account, which may or may not be working.)
    stripe_publishable_key: 'pk_test_qZ3TjohtOSXEeXhPubJgY64y',

    // Set to your Stripe secret key. (The one here is for a test account,
    // which may or may not be working.)
    stripe_secret_key: 'sk_test_ZBEMC1TnpX2tlRC6L1Aqm9yM',

    // You should set this to a static (but secret) value, as it's
    // used to authenticate session data. `openssl rand -base64 24`
    // should do the trick. (It doesn't matter for the default app
    // since we only use the session for the CSRF token.)
    secret: 'set to a secret!!'
  };

module.exports = config;
