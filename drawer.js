function AriaDrawer(_id) {
  this.id = '#menu-drawer';
  this.menuEl = null;
  this.menuChildren = null;
  this.rootItems = [];
  this.items = [];
  this.parents = [];
  this.titles = [];
  this.allItems = [];
  this.childMenus = [];
  this.activeItem = null;
  this.isMoving = false;

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
AriaDrawer.prototype.handleTitleClick = handleTitleClick;
AriaDrawer.prototype.showSubMenu = showSubMenu;
AriaDrawer.prototype.hideSubMenu = hideSubMenu;
AriaDrawer.prototype.slideInMenu = slideInMenu;
AriaDrawer.prototype.slideOutMenu = slideOutMenu;
AriaDrawer.prototype.moveToPrevMenu = moveToPrevMenu;
AriaDrawer.prototype.moveToNextMenu = moveToNextMenu
AriaDrawer.prototype.moveToPrevItem = moveToPrevItem;
AriaDrawer.prototype.moveToNextItem = moveToNextItem;
AriaDrawer.prototype.setKeyActiveItem = setKeyActiveItem;

function initReferences() {
  this.menuEl = document.querySelector(this.id);
  if (this.menuEl === null) {
    return false;
  }

  this.rootItems = this.menuEl.querySelectorAll(':scope > li');
  if (this.rootItems.length === 0) {
    return false;
  }

  this.items = this.menuEl.querySelectorAll('.menu-drawer-item');
  if (this.items.length === 0) {
    return false;
  }

  this.parents = this.menuEl.querySelectorAll('.menu-drawer-parent');
  if (this.parents.length === 0) {
    return false;
  }

  this.titles = this.menuEl.querySelectorAll('.menu-drawer-title');
  if (this.titles.length === 0) {
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

  // Titles
  var title = null;
  for (i = 0, l = vd.titles.length; i < l; i++) {
    title = vd.titles[i];

    title.onclick = (function () {
      var title = vd.titles[i];
      return function (e) {
        return vd.handleTitleClick(title, e);
      }
    })();
  }

  document.onclick = function (e) {
    return vd.handleDocumentClick(e);
  };
}

function handleDocumentClick() {
  var vd = this;
  var i = 0;
  var l = 0;

  var stillMoving = setInterval(function () {
    if (vd.isMoving) { return true; }

    vd.isMoving = true;
    for (i = 0, l = vd.childMenus.length; i < l; i++) {
      vd.childMenus[i].style.left = '100%';
      vd.childMenus[i].style.right = '-100%';
      vd.childMenus[i].setAttribute('aria-hidden', 'true');
    }
    setTimeout(function () {
      for (i = 0, l = vd.childMenus.length; i < l; i++) {
        vd.childMenus[i].style.display = 'none';
      }
      vd.isMoving = false;
    }, 500);

    if (vd.activeItem) { vd.activeItem.style.color = ''; }
    vd.activeItem = null;

    clearInterval(stillMoving);
  }, 100);
}

function handleMenuKeydown(e) {
  var vd = this;
  var i = 0;
  var l = 0;

  if (e.keyCode === this.keys.tab) {
    vd.isMoving = true;
    for (i = 0, l = vd.childMenus.length; i < l; i++) {
      vd.childMenus[i].style.left = '100%';
      vd.childMenus[i].style.right = '-100%';
      vd.childMenus[i].setAttribute('aria-hidden', 'true');
    }
    if (vd.activeItem) { vd.activeItem.style.color = ''; }
    vd.activeItem = null;
    setTimeout(function () {
      vd.isMoving = false;
    }, 500);
    e.stopPropagation();
    return false;
  }
}

function handleParentClick(parent, e) {
  if (this.isMoving) {
    e.stopPropagation();
    return false;
  }

  this.showSubMenu(parent);
  e.stopPropagation();
  return false;
}

function handleParentKeydown(parent, e) {
  if (e.altKey || e.ctrlKey) {
    return true;
  }

  if (this.isMoving) {
    return true;
  }

  switch (e.keyCode) {
    case this.keys.enter:
    case this.keys.space:
      this.showSubMenu(parent);
      e.stopPropagation();
      return false;
    case this.keys.left:
      if (parent.className.indexOf('menu-drawer-root') === -1) {
        this.hideSubMenu(parent);
      }
      e.stopPropagation();
      return false;
    case this.keys.right:
      this.showSubMenu(parent);
      e.stopPropagation();
      return false;
    case this.keys.up:
      this.moveToPrevMenu(parent);
      e.stopPropagation();
      return false;
    case this.keys.down:
      this.moveToNextMenu(parent);
      e.stopPropagation();
      return false;
  }

  return true;
}

function handleItemClick(item, e) {
  if (this.isMoving) {
    e.stopPropagation();
    return false;
  }

  if (this.activeItem) { this.activeItem.style.color = ''; }
  item.style.color = 'red';
  this.activeItem = item;
  var href = item.getAttribute('data-href')
  if (href !== null) { window.location = href; }
  e.stopPropagation();
  return false;
}

function handleItemKeydown(item, e) {
  if (e.altKey || e.ctrlKey) {
    return true;
  }

  if (this.isMoving) {
    return true;
  }

  var parent = item.parentElement.parentElement;

  switch (e.keyCode) {
    case this.keys.enter:
    case this.keys.space:
      var href = item.getAttribute('data-href')
      if (href !== null) { window.location = href; }
      e.stopPropagation();
      return false;
    case this.keys.left:
      this.hideSubMenu(item);
      e.stopPropagation();
      return false;
    case this.keys.right:
      e.stopPropagation();
      return false;
    case this.keys.up:
      this.moveToPrevItem(item);
      e.stopPropagation();
      return false;
    case this.keys.down:
      this.moveToNextItem(item);
      e.stopPropagation();
      return false;
  }

  return true;
}

function handleTitleClick(title, e) {
  if (this.isMoving) {
    e.stopPropagation();
    return false;
  }

  this.hideSubMenu(title);
  e.stopPropagation();
  return false;
}

function showSubMenu(parent) {
  var vd = this;
  var subUL = parent.querySelector('ul');
  var firstLI = subUL.querySelector(':scope > li:not(.menu-drawer-title)');

  this.slideInMenu(subUL, function () {
    parent.style.color = '';
    firstLI.style.color = 'red';
    firstLI.focus();
    vd.activeItem = firstLI;
  });
}

function hideSubMenu(item) {
  var vd = this;
  var parentUL = item.parentElement;
  var parentLI = parentUL.parentElement;

  this.slideOutMenu(parentUL, function () {
    parentLI.focus();
    parentLI.style.color = 'red';
    vd.activeItem = parentLI;
  });
}

function slideInMenu(UL, callback) {
  var vd = this;

  vd.isMoving = true;

  UL.setAttribute('aria-hidden', 'false');
  UL.style.display = 'block';
  setTimeout(function () {
    UL.style.left = '0';
    UL.style.right = '0';
  }, 0);

  setTimeout(function () {
    if (vd.activeItem) { vd.activeItem.style.color = ''; }
    callback();
    vd.isMoving = false;
  }, 500);
}

function slideOutMenu(UL, callback) {
  var vd = this;

  vd.isMoving = true;

  UL.setAttribute('aria-hidden', 'true');
  UL.style.left = '100%';
  UL.style.right = '-100%';

  setTimeout(function () {
    UL.style.display = 'none';
    if (vd.activeItem) { vd.activeItem.style.color = ''; }
    callback();
    vd.isMoving = false;
  }, 500);
}

function moveToPrevMenu(item) {
  var itemUL = item.querySelector('ul');
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.menu-drawer-title)');
  var newItem = null;
  var newItemUL = null;

  newItem = item.previousElementSibling;

  if (newItem === null) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  if (newItem.className.indexOf('menu-drawer-title') > -1) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function moveToNextMenu(item) {
  var itemUL = item.querySelector('ul');
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.menu-drawer-title)');
  var newItem = null;

  newItem = item.nextElementSibling;

  if (newItem === null) {
    newItem = siblingsLI[0];
  }

  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function moveToPrevItem(item) {
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.menu-drawer-title)');
  var newItem = null;
  var newItemUL = null;

  newItem = item.previousElementSibling;

  if (newItem === null) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  if (newItem.className.indexOf('menu-drawer-title') > -1) {
    newItem = siblingsLI[siblingsLI.length - 1];
  }

  item.style.color = '';
  this.setKeyActiveItem(newItem);

  return newItem;
}

function moveToNextItem(item) {
  var parentUL = item.parentElement;
  var siblingsLI = parentUL.querySelectorAll(':scope > li:not(.menu-drawer-title)');
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
  if (this.activeItem) { this.activeItem.style.color = ''; }
  this.activeItem = newItem;
  this.activeItem.focus();
  this.activeItem.style.color = 'red';
}