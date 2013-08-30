(function(window, document, undefined) {
  /* Constructor for a Bag, which represents a set of objects that is backed by
   * local storage.
   *
   * addHandler -- function to call when an item has been added; passed the
   *  array of items in the Bag
   * removeHandler -- function to call when an item has been removed; passed
   *  the array of items in the Bag
   */ 
  function Bag(options) {
    this.addHandler = options.addHandler || function() {};
    this.removeHandler = options.removeHandler || function() {};

    this.id = 0;
    this.items = [];
    this.load();
  }

  /* Adds the given item object to the Bag. Sets an id tag on the item.
   *
   * Arguments:
   * item -- the item to add
   */
  Bag.prototype.addItem = function(item) {
    item.id = this.id;
    this.id++;

    this.items.push(item);
    this.addHandler(this.items, item);
    this.save();
  };

  /* Removes the item with the given id from the Bag. Does nothing if no such
   * item exists.
   *
   * Arguments:
   * id -- the id of the item to remove
   */
  Bag.prototype.removeItem = function(id) {
    var targetIndex = 0;
    var targetItem;

    _.each(this.items, function(item, index) {
      if (item.id == id) {
        targetIndex = index;
        targetItem = item;
      }
    });

    this.items.splice(targetIndex, 1);
    this.removeHandler(this.items, targetItem);
    this.save();
  };

  /* Returns the list of items in this Bag. */
  Bag.prototype.getItems = function() {
    return this.items;
  };

  /* Saves the Bag in local storage. */
  Bag.prototype.save = function() {
    window.localStorage.bag = JSON.stringify({
      id: this.id,
      items: this.items
    });
  };

  /* Loads the Bag from local storage. */
  Bag.prototype.load = function() {
    if (window.localStorage.bag) {
      // use the bag in local storage
      var bagObj = JSON.parse(window.localStorage.bag);

      this.id = bagObj.id;
      this.items = bagObj.items;

      if (this.items.length > 0) {
        this.addHandler(this.items);
      }
    } else {
      // start with an empty bag
      this.empty();
    }
  };

  /* Empty the bag. */
  Bag.prototype.empty = function() {
    this.id = 0;

    if (this.items.length > 0) {
      this.items = [];
      this.removeHandler(this.items);
    }

    this.save();
  };

  window.Bag = Bag;
})(this, this.document);
