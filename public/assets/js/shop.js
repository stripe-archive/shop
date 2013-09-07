$(function() {
  var CENTS_IN_DOLLAR = 100;
  var FADE_TIME_MS = 250;

  var $window = $(window);
  var $emptyMessage = $('.dropdown .empty');
  var $itemContainer = $('.item-container');

  var $items = $('.items');
  var itemTemplate = _.template($('#item-template').html());

  var $bagButton = $('.bag .button');
  var $bagDropdown = $('.bag .dropdown');
  var $bagCount = $('.count .number');
  var $bagTotal = $('.total .value');

  var bag = new Bag({
    addHandler: function(items) {
      // render everything and show bag
      $bagDropdown.addClass('visible');
      renderItems(items);
      renderTotalQuantityAndPrice(items);
    },

    removeHandler: function(items) {
      // render everything
      renderItems(items);
      renderTotalQuantityAndPrice(items);
    }
  });

  /* Renders all the given Bag items.
   *
   * Arguments:
   * items -- the items to render
   */
  function renderItems(items) {
    $items.empty();

    // show bag when items are present
    if (items.length > 0) {
      $bagDropdown.addClass('visible');
      $emptyMessage.hide();
      $itemContainer.show();
    } else {
      $bagDropdown.removeClass('visible');
      $emptyMessage.show();
      $itemContainer.hide();
    }

    // re-render item-by-item
    _.each(items, function(item) {
      $items.append(itemTemplate({ item: item }));
      $items.find('.item:last')
        .data('item', item)
        .addClass('visible');
    });
  }

  /* Get the total quantity of items.
   *
   * Arguments:
   * items -- the items in the Bag
   */
  function getTotalQuantity(items) {
    return _.reduce(items, function(memo, item) {
      return memo + item.quantity;
    }, 0);
  }

  /* Get the total price of items.
   *
   * Arguments:
   * items -- the items in the Bag
   */
  function getTotalPrice(items) {
    return _.reduce(items, function(memo, item) {
      return memo + item.quantity * item.price;
    }, 0);
  }

  /* Renders the total quantity and price of the given items in the Bag.
   *
   * Arguments:
   * items -- the items in the Bag
   */
  function renderTotalQuantityAndPrice(items) {
    var totalQuantity = getTotalQuantity(items);

    // show bag count when quantity is positive
    if (totalQuantity > 0) {
      $bagCount.addClass('visible');
    } else {
      $bagCount.removeClass('visible');
    }

    $bagCount.text(totalQuantity);
    $bagTotal.text('$' + getTotalPrice(items) + '.00');
  }

  $bagButton.click(function() {
    $bagDropdown.toggleClass('visible');
  });

  // only allow numbers in quantity field
  $items.on('keydown', '.qty', function(event) {
    if (!event.ctrlKey && !event.metaKey && event.which != 8 &&
        (event.which < 48 || event.which > 57)) {
      event.preventDefault();
    }
  });

  // update quantity to match input value
  $items.on('keyup', '.qty', function() {
    var $qty = $(this);
    var $item = $qty.parents('.item');

    // default to a quantity of 0
    var newQuantity = parseInt($qty.val(), 10) || 0;

    if (newQuantity >= 0) {
      // update bag
      $item.data('item').quantity = newQuantity;
      bag.save();
      renderTotalQuantityAndPrice(bag.getItems());
    }
  });

  // remove items from the bag when the remove button is clicked
  $items.on('click', '.remove', function() {
    var $item = $(this).parents('.item');
    bag.removeItem($item.data('item').id);
  });

  var $messageModal = $('.message');
  var $messageInner = $('.message .inner');
  var $messageTitle = $messageModal.find('.title');
  var $messageSubline = $messageModal.find('.subline');
  var $messageIcon = $messageModal.find('.icon');
  var $inner = $messageModal.find('.inner');

  /* Hides the message modal if the given element is outside of it.
   *
   * Arguments:
   * $element -- the element to check
   */
  function hideModalIfOutside($element) {
    if ($messageModal.is(':visible') &&
        $inner.has($element).length === 0) {
      $messageModal.fadeOut(FADE_TIME_MS);
    }
  }

  // hide message if user clicks/touches outside it
  $window.click(function(event) {
    var $target = $(event.target);
    hideModalIfOutside($target);
  });

  /* Hides modal if the touch event is outside of it.
   *
   * Arguments:
   * event -- the touch event
   */
  function hideModalTouchHandler(event) {
    var $target = $(event.touches[0].target);
    hideModalIfOutside($target);
  }

  window.addEventListener('touchstart', hideModalTouchHandler);
  window.addEventListener('touchmove', hideModalTouchHandler);

  var $order = $('#order');
  var $stripeButton = $('.stripe-button-el');
  var $errorMessage = $('.error-message');
  var $form = $('form');

  $stripeButton.click(function(event) {
    event.preventDefault();

    StripeCheckout.open({
      key: stripeKey,
      name: 'Shop',
      description: 'Complete your order',
      currency: 'usd',
      image: '/assets/images/marketplace.png',
      shippingAddress: true,
      label: 'Purchase',
      token: submitForm,
      amount: getTotalPrice(bag.getItems()) * 100,
      applicationID: 'ShopV1'
    });
  });

  /* Submits the t-shirt form using AJAX.
   *
   * Arguments:
   * token -- the Stripe token
   * fields -- object of name and address fields submitted during checkout
   */
  function submitForm(token, fields) {
    var orders = [];

    _.each(bag.getItems(), function(item) {
      // type is U for unisex and W for womens
      orders.push({
        type: item.name[0],
        color: item.color,
        size: item.size,
        quantity: item.quantity
      });
    });

    if (orders.length > 0) {
      $order.val(JSON.stringify(orders));

      // accumulate data from checkout
      var data = { stripe_token: token.id };
      data.name = fields.shipping_name;
      data.address = fields.shipping_address;
      data.address_line_1 = fields.shipping_address_line1;
      data.address_line_2 = fields.shipping_address_line2;
      data.address_city = fields.shipping_address_city;
      data.address_state = fields.shipping_address_state;
      data.address_zip = fields.shipping_address_zip;
      data.address_country = fields.shipping_address_country;

      // form data in query string form
      var dataQueryString = $form.serialize() + '&' + $.param(data);
      fadeMessageModalIn();

      // show loading modal
      $messageTitle.text('Processing your order!');
      $messageSubline.html('Give us a few seconds&hellip;');

      $messageIcon.removeClass().addClass('icon loading');
      var spinner = addLoadingIcon($messageIcon[0]);

      $.ajax({
        type: 'POST',
        url: $form.attr('action'),
        data: dataQueryString,

        // show thank you message on success
        success: function() {
          spinner.stop();
          $messageIcon.removeClass().addClass('icon success');

          $messageTitle.text('T-shirt ordered!');
          $messageSubline.html("We'll send you an e-mail once it has been" +
            ' shipped. If you have any questions, get in touch at' +
            ' <a href="mailto:shop@example.com">shop@example.com</a>.');

          // show modal again in case it was closed
          fadeMessageModalIn();

          bag.empty();
          renderTotalQuantityAndPrice(bag.getItems());
        },

        // display error message on failure
        error: function(xhr) {
          spinner.stop();
          $messageIcon.removeClass().addClass('icon error');

          $messageTitle.text('Oops...');
          if (xhr.responseText) {
            // use message sent by server
            $messageSubline.text(xhr.responseText);
          } else {
            // use generic message
            $messageSubline.text('An error occurred while processing your' +
                ' payment. Please try again');
          }

          // show modal again in case it was closed
          fadeMessageModalIn();
        }
      });
    }
  }

  /* Adds a loading icon to the given element. Returns the spinner to use for
   * starting/stopping the animation.
   *
   * Arguments:
   * element -- the element to add the icon to
   */
  function addLoadingIcon(element) {
    var opts = {
      lines: 12, // The number of lines to draw
      length: 8, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#333', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };

    return new Spinner(opts).spin(element);
  }

  /* Centers the message modal and displays it. */
  function fadeMessageModalIn() {
    $messageModal.fadeIn(FADE_TIME_MS);
    $messageInner.css('top',
      ($window.height() - $messageInner.outerHeight()) / 2);
  }

  var $shirt = $('#shirt');
  var $shirtName = $('.item_name');
  var $thumbnails = $('.thumbnail');

  // when thumbnail is clicked, select the corresponding shirt
  $thumbnails.click(function() {
    var $thumbnail = $(this);
    var color = $thumbnail.data('color');

    // update image and item name
    $shirt.attr('src', $thumbnail.attr('src'));
    $shirtName.text(color + ' shirt');

    $thumbnails.removeClass('active');
    $thumbnail.addClass('active');
  });

  var $size = $('.size');

  /* Adds the given item to the bag. If the item already exists in the bag,
   * updates the quantity.
   *
   * Arguments:
   * item -- the item to add
   */
  function addItem(item) {
    var foundItem = false;

    // if there's another item exactly like this one, update its quantity
    _.each(bag.getItems(), function(curItem) {
      if (curItem.name == item.name && curItem.size == item.size &&
          curItem.price == item.price && curItem.color == item.color) {
        curItem.quantity += item.quantity;
        foundItem = true;
      }
    });

    // otherwise, add a new item
    if (!foundItem) {
      bag.addItem(item);
    } else {
      var items = bag.getItems();

      // item was updated, re-render
      renderItems(items);
      renderTotalQuantityAndPrice(items);
    }
  }

  // when size is changed, add bag item
  $size.change(function() {
    var $this = $(this);
    var size = $this.find(':selected').val();

    if (size) {
      // animate adding shirt to the bag
      window.animateAddToBag($this, function() {
        var $item = $this.parents('.item');
        var name = $item.find('.item_name').text();

        // remove all unexpected characters from price
        var price = $item.find('.item_price').text();
        price = parseFloat(price.replace(/[^\d\.]/g, ''));

        addItem({
          name: name + ' (' + size + ')',
          price: price,
          size: size,
          quantity: 1,
          color: 'G'
        });
      });

      // reset size
      $this.find('option').eq(0).prop('selected', true);
    }
  });
});
