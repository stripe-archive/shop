$(function() {
  var SHOWCASE_IMAGE_PREFIX = '/assets/images/showcase/';
  var backgroundImage = new Image();

  // possible a random showcase image to use
  var imageChoices = [
    { url: 'llamas.jpg', left: '33%', right: '33%' },
  ];

  var userSelected = false;
  var image;

  // if user explicitly specified a showcase image in the hash, use it
  _.each(imageChoices, function(imageChoice) {
    if (imageChoice.url.substring(0, imageChoice.url.length - 4) ===
        window.location.hash.substring(1)) {
      image = imageChoice;
      userSelected = true;
    }
  });

  _.each(imageChoices, function(image) {
    image.url = SHOWCASE_IMAGE_PREFIX + image.url;
  });

  // otherwise, use random showcase image
  if (!userSelected) {
    var index = Math.floor(Math.random() * imageChoices.length);
    image = imageChoices[index];
  }

  /* Sets the given image (from the imageChoices array) as the showcase image
   *
   * Arguments:
   * image -- the image to set
   */
  function setShowcaseImage(image) {
    $('.showcase').css('background-image', 'url("' + image.url + '")');
    $('.item.left').css('left', image.left);
    $('.item.right').css('right', image.right);
  }

  // show loading indicator initially
  $('.shop-container.hidden').removeClass('hidden');

  // loading icon
  var opts = {
    lines: 12, // The number of lines to draw
    length: 8, // The length of each line
    width: 4, // The line thickness
    radius: 10, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#ddd', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };

  var loadingSpinner = new Spinner(opts).
    spin($(".loading-indicator .spinner").get(0));

  // when image has loaded, remove indicator
  $(backgroundImage).load(function() {
    loadingSpinner.stop();

    var loadingIndicator = $('.loading-indicator');
    var showcase = $('div.showcase');

    /* Removes the loading indicator. */
    function removeLoadingIndicator() {
      loadingIndicator.remove();
      showcase.removeClass('animatable');
    }

    //showcase.one('webkitTransitionEnd', removeLoadingIndicator);
    //showcase.one('transitionend', removeLoadingIndicator);
    setTimeout(removeLoadingIndicator, 750 + 75);

    // add and remove transitions in a separate class to avoid flickering
    showcase.addClass('animatable');

    // start animations!
    loadingIndicator.addClass('hideAnimation');
    showcase.removeClass('scaled');

  });

  setShowcaseImage(image);
  backgroundImage.src = image.url;

  // easter egg: when 'llamas' is typed, switch to an easter egg
  // image (not supplied).
  var SECRET_STRING = 'llamas';
  var llamas = { url: SHOWCASE_IMAGE_PREFIX + 'egg.jpg', left: '33%',
    right: '33%' };
  var stringTyped = '';

  $(window).bind('keyup', function(event) {
    stringTyped += String.fromCharCode(event.keyCode);

    if (stringTyped.toLowerCase().indexOf(SECRET_STRING) !== -1) {
      setShowcaseImage(llamas);
      stringTyped = '';
    }
  });

  // preload images to prevent them from appearing mid-animation
  var preload = ['/assets/images/flying-shirt.png',
                 '/assets/images/flying-shirt@2x.png',
                 '/assets/images/success.png',
                 '/assets/images/success@2x.png'];
  for (var i = 0; i < preload.length; i++) {
    var img = new Image();
    img.src = preload[i];
  }

  /* Performs a bounce animation on the given element.
   *
   * Arguments:
   * element -- the element to bounce
   */
  function animateBounce(element) {
    /* Ends the bounce. */
    function endBounceAnimation() {
      element.removeClass('bounce');
    }

    element.one('webkitAnimationEnd', endBounceAnimation);
    element.one('animationend', endBounceAnimation);

    element.addClass('bounce');
  }

  /* Performs an add to bag animation.
   *
   * Arguments:
   * startButton -- the add to bag button to start the animation from
   * callback -- the callback to call once finished
   */
  window.animateAddToBag = function(startButton, callback) {
    var helper = $('div.add-to-bag-helper').get(0);
    var shirt = $('div.add-to-bag-helper div.image').get(0);
    var endButton = $('.bag .button');
    var animationDuration = 700;

    // animation attributes at the start, middle, and end
    var start = {
      'scale': 1.0,
      'x': startButton.offset().left + startButton.outerWidth() / 2,
      'y': startButton.offset().top + startButton.outerHeight() / 2
    };

    var end = {
      'scale': 0.0,
      'x': endButton.offset().left + endButton.outerWidth() / 2,
      'y': endButton.offset().top + endButton.outerHeight() / 2
    };

    var mid = {
      'scale': 4.0,
      'x': Math.min(start.x, end.x) + 50,
      'y': Math.min(start.y, end.y) + 50
    };

    init();
    animate();

    // animation helper
    $(helper).css({
      '-webkit-transform': 'translate(' + start.x + 'px, ' + start.y + 'px)',
      'transform': 'translate(' + start.x + 'px, ' + start.y + 'px)',
    }).show();

    /* Initializes the TWEEN animation. */
    function init() {
      var tween = new TWEEN.Tween(start);
      tween.to({
        'x': [mid.x, end.x],
        'y': [mid.y, end.y],
        'scale': [mid.scale, end.scale]
      }, animationDuration);

      tween.easing(TWEEN.Easing.Sinusoidal.Out);
      tween.onUpdate(function() {
        helper.style.webkitTransform = 'translate(' + this.x + 'px, ' +
          this.y + 'px)';
        shirt.style.webkitTransform = 'scale(' + this.scale + ')';

        helper.style.transform = 'translate(' + this.x + 'px, ' +
          this.y + 'px)';
        shirt.style.transform = 'scale(' + this.scale + ')';
      });

      tween.interpolation(TWEEN.Interpolation.Bezier);
      tween.onComplete(function() {
        $(helper).hide();
        animateBounce(endButton);

        if (callback) {
          setTimeout(callback, 400);
        }
      });

      tween.start();
    }

    /* Performs the animation. */
    function animate() {
      window.requestAnimationFrame(animate);
      TWEEN.update();
    }
  };
});
