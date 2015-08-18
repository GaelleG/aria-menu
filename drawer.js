function AriaDrawer(_id) {
  this.id = '#aria-drawer';
  this.menuEl = null;
  this.menuChildren = null;
  this.rootItems = [];
  this.items = [];
  this.parents = [];
  this.allItems = [];
  this.childMenus = [];
  this.activeItem = null;

  this.keys = {
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  }

  if (typeof _id === 'string') {
    this.id = _id;
  }

  if (!this.initReferences()) { return; }

  this.bindHandlers();
}

AriaDrawer.prototype.initReferences = initReferences;
AriaDrawer.prototype.bindHandlers = bindHandlers;
AriaDrawer.prototype.handleDocumentClick = handleDocumentClick;
AriaDrawer.prototype.handleMenuKeydown = handleMenuKeydown;
AriaDrawer.prototype.handleParentClick = handleParentClick;
AriaDrawer.prototype.handleParentKeydown = handleParentKeydown;
AriaDrawer.prototype.handleItemClick = handleItemClick;
AriaDrawer.prototype.handleItemKeydown = handleItemKeydown;
AriaDrawer.prototype.toggleSubMenu = toggleSubMenu;
AriaDrawer.prototype.showSubMenu = showSubMenu;
AriaDrawer.prototype.hideSubMenu = hideSubMenu;
AriaDrawer.prototype.moveToPrevMenu = moveToPrevMenu;
AriaDrawer.prototype.moveToNextMenu = moveToNextMenu
AriaDrawer.prototype.moveToPrevItem = moveToPrevItem;
AriaDrawer.prototype.moveToNextItem = moveToNextItem;
AriaDrawer.prototype.setKeyActiveItem = setKeyActiveItem;
AriaDrawer.prototype.setActiveItem = setActiveItem;

function initReferences() {
  this.menuEl = document.querySelector(this.id);
  if (this.menuEl === null) {
    return false;
  }

  this.rootItems = this.menuEl.querySelectorAll(':scope > li');
  if (this.rootItems.length === 0) {
    return false;
  }

  this.items = this.menuEl.querySelectorAll('.aria-drawer-item');
  if (this.items.length === 0) {
    return false;
  }

  this.parents = this.menuEl.querySelectorAll('.aria-drawer-parent');
  if (this.parents.length === 0) {
    return false;
  }

  this.childMenus = this.menuEl.querySelectorAll('ul');
  if (this.childMenus.length === 0) {
    return false;
  }

  return true;
}

function bindHandlers() {
  var vd = this;
  var i = 0;
  var l = 0;

  // Menu
  vd.menuEl.onkeydown = (function () {
    return function (e) {
      vd.handleMenuKeydown(e);
    }
  })();

  // Items
  var item = null;
  for (i = 0, l = vd.items.length; i < l; i++) {
    item = vd.items[i];

    item.onclick = (function () {
      var item = vd.items[i];
      return function (e) {
        return vd.handleItemClick(item, e);
      }
    })();

    item.onkeydown = (function () {
      var item = vd.items[i];
      return function (e) {
        return vd.handleItemKeydown(item, e);
      }
    })();
  }

  // Parents
  var parent = null;
  for (i = 0, l = vd.parents.length; i < l; i++) {
    parent = vd.parents[i];

    parent.onclick = (function () {
      var parent = vd.parents[i];
      return function (e) {
        return vd.handleParentClick(parent, e);
      }
    })();

    parent.onkeydown = (function () {
      var parent = vd.parents[i];
      return function (e) {
        return vd.handleParentKeydown(parent, e);
      }
    })();
  }

  document.onclick = function(e) {
    return vd.handleDocumentClick(e);
  };
}

function handleDocumentClick() {
  var vd = this;
  var i = 0;
  var l = 0;

  for (i = 0, l = vd.childMenus.length; i < l; i++) {
    vd.childMenus[i].style.display = 'none';
    vd.childMenus[i].setAttribute('aria-hidden', 'true');
  }

  if (vd.activeItem) vd.activeItem.style.color = '';
  vd.activeItem = null;
}

function handleMenuKeydown(e) {
  var vd = this;
  var i = 0;
  var l = 0;

  if (e.keyCode === this.keys.tab) {
    for (i = 0, l = vd.childMenus.length; i < l; i++) {
      vd.childMenus[i].style.display = 'none';
      vd.childMenus[i].setAttribute('aria-hidden', 'true');
    }
    if (vd.activeItem) vd.activeItem.style.color = '';
    vd.activeItem = null;
    e.stopPropagation();
    return false;
  }
}

function handleParentClick(parent, e) {
  this.toggleSubMenu(parent);
  e.stopPropagation();
  return false;
}

function handleParentKeydown(parent, e) {
  if (e.altKey || e.ctrlKey) {
    return true;
  }

  switch (e.keyCode) {
    case this.keys.enter:
    case this.keys.space:
      {
        this.showSubMenu(parent);
        e.stopPropagation();
        return false;
      }
    case this.keys.left:
      {
        if (parent.className.indexOf('aria-drawer-root') === -1) {
          this.hideSubMenu(parent);
        }
        e.stopPropagation();
        return false;
      }
    case this.keys.right:
      {
        this.showSubMenu(parent);
        e.stopPropagation();
        return false;
      }
    case this.keys.up:
      {
        this.moveToPrevMenu(parent);
        e.stopPropagation();
        return false;
      }
    case this.keys.down:
      {
        this.moveToNextMenu(parent);
        e.stopPropagation();
        return false;
      }
  } // end switch

  return true;
}

function handleItemClick(item, e) {
  if (this.activeItem) this.activeItem.style.color = '';
  item.style.color = 'red';
  this.activeItem = item;
  e.stopPropagation();
  return false;
}

function handleItemKeydown(item, e) {
  if (e.altKey || e.ctrlKey) {
    return true;
  }

  var parent = item.parentElement.parentElement;

  switch (e.keyCode) {
    case this.keys.enter:
    case this.keys.space:
      {
        console.log('enter | space');
        e.stopPropagation();
        return false;
      }
    case this.keys.left:
      {
        this.hideSubMenu(item);
        e.stopPropagation();
        return false;
      }
    case this.keys.right:
      {
        e.stopPropagation();
        return false;
      }
    case this.keys.up:
      {
        this.moveToPrevItem(item);
        e.stopPropagation();
        return false;
      }
    case this.keys.down:
      {
        this.moveToNextItem(item);
        e.stopPropagation();
        return false;
      }
  } // end switch

  return true;
}

function toggleSubMenu(parent) {
  var subUL = parent.querySelector('ul');
  var firstLI = subUL.querySelector(':scope > li:not(.aria-drawer-title)');

  if (this.activeItem) this.activeItem.style.color = '';

  if (subUL.getAttribute('aria-hidden') === 'true') {
    parent.style.color = '';
    subUL.style.display = 'block';
    subUL.setAttribute('aria-hidden', 'false');
    firstLI.focus();
    firstLI.style.color = 'red';
    this.activeItem = firstLI;
  } else {
    subUL.style.display = 'none';
    subUL.setAttribute('aria-hidden', 'true');
    parent.focus();
    parent.style.color = 'red';
    this.activeItem = parent;
  }
}

function showSubMenu(parent) {
  var subUL = parent.querySelector('ul');
  var firstLI = subUL.querySelector(':scope > li:not(.aria-drawer-title)');
  if (this.activeItem) this.activeItem.style.color = '';
  parent.style.color = '';
  subUL.style.display = 'block';
  subUL.setAttribute('aria-hidden', 'false');
  firstLI.focus();
  firstLI.style.color = 'red';
  this.activeItem = firstLI;
}

function hideSubMenu(item) {
  var parentUL = item.parentElement;
  var parentLI = parentUL.parentElement;
  if (this.activeItem) this.activeItem.style.color = '';
  parentUL.style.display = 'none';
  parentUL.setAttribute('aria-hidden', 'false');
  parentLI.focus();
  parentLI.style.color = 'red';
  this.activeItem = parentLI;
}

function moveToPrevMenu(item) {
  var itemUL = item.querySelector('ul');
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.aria-drawer-title)');
  var newItem = null;
  var newItemUL = null;

  newItem = item.previousElementSibling;
  
  if (newItem === null) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  if (newItem.className.indexOf('aria-drawer-title') > -1) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  itemUL.style.display = 'none';
  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function moveToNextMenu(item) {
  var itemUL = item.querySelector('ul');
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.aria-drawer-title)');
  var newItem = null;

  newItem = item.nextElementSibling;
  
  if (newItem === null) {
    newItem = siblingsLI[0];
  }

  itemUL.style.display = 'none';
  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function moveToPrevItem(item) {
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.aria-drawer-title)');
  var newItem = null;
  var newItemUL = null;

  newItem = item.previousElementSibling;

  if (newItem === null) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  if (newItem.className.indexOf('aria-drawer-title') > -1) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function moveToNextItem(item) {
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.aria-drawer-title)');
  var newItem = null;
  var newItemUL = null;

  newItem = item.nextElementSibling;

  if (newItem === null) {
    newItem = siblingsLI[0];
  }

  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function setKeyActiveItem(newItem) {
  if (this.activeItem) this.activeItem.style.color = '';
  this.activeItem = newItem;
  this.activeItem.focus();
  this.activeItem.style.color = 'red';
}

function setActiveItem(item) {
  if (this.activeItem !== null) {
    var UL = this.activeItem.querySelector(':scope > ul');
    UL.style.display = 'none';
    UL.setAttribute('aria-hidden', 'false');
    UL.style.color = 'black';
  }
  this.activeItem = item;
}