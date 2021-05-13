let viewport = (function () {
  let self = {};

  let elementRect = function(element, result) {
    result = result || {};

    if(element === window) {
      result.x = 0;
      result.y = 0;
      result.w = self.width;
      result.h = self.height;
      return result;
    }

    if(element === document) {
      element = document.body;
    }

    if(element === document.body) {
      result.x = -self.x;
      result.y = -self.y;
      result.width = element.scrollWidth;
      result.height = element.scrollHeight;
      return result;
    }

    let bounds = element.getBoundingClientRect();

    result.x = bounds.left;
    result.y = bounds.top;
    result.width = element.offsetWidth;
    result.height = element.offsetHeight;

    return result;
  };

  let intersects = function(rect, inset) {
    let left = rect.x;
    let right = left + rect.width;
    let top = rect.y;
    let bottom = top + rect.height;

    if(inset) {
      left += inset.left || 0;
      right -= inset.right || 0;
      top += inset.top || 0;
      bottom -= inset.bottom || 0;
    }

    if(left >= self.width) {
      return false;
    }
    if(right <= 0) {
      return false;
    }
    if(top >= self.height) {
      return false;
    }
    if(bottom <= 0) {
      return false;
    }
    return true;
  };

  let regions = [];

  let update = function() {
    let w = window;
    let d = document;
    let e = d.documentElement;
    let b = d.body;
    self.x = w.pageXOffset || (e && e.scrollLeft) || (b && b.scrollLeft) || 0;
    self.y = w.pageYOffset || (e && e.scrollTop) || (b && b.scrollTop) || 0;
    self.width = w.innerWidth || (e && e.clientWidth) || (b && b.clientWidth);
    self.height =
      w.innerHeight || (e && e.clientHeight) || (b && b.clientHeight);

    let length = regions.length;
    let i = 0;
    let region;
    while(i < length) {
      region = regions[i];
      if(region.disposed) {
        regions.splice(i, 1);
        length--;
      } else {
        region.validate();
        i++;
      }
    }
  };

  if(window.addEventListener) {
    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
  } else if(window.attachEvent) {
    window.attachEvent('onscroll', update);
    window.attachEvent('onresize', update);
  }

  update();

  function Region(delegate, element, inset) {
    this.delegate = delegate;
    this.element = element;
    this.inset = inset;
    this.bounds = elementRect(this.element);
    this.visible =
      this.bounds.width > 0 &&
      this.bounds.height > 0 &&
      intersects(this.bounds, inset);
  }

  Region.prototype.validate = function() {
    let bounds = this.bounds;
    let oldX = bounds.x;
    let oldY = bounds.y;
    let oldWidth = bounds.width;
    let oldHeight = bounds.height;
    elementRect(this.element, bounds);

    let oldVisible = this.visible;
    let newVisible =
      bounds.width > 0 && bounds.height > 0 && intersects(bounds, this.inset);
    this.visible = newVisible;

    let delegate = this.delegate;

    if(newVisible) {
      if(delegate.regionShow && !oldVisible) {
        delegate.regionShow(this);
      }
      if(delegate.regionScroll && (bounds.x !== oldX || bounds.y !== oldY)) {
        delegate.regionScroll(this);
      }
      if(delegate.regionResize &&
        (bounds.width !== oldWidth || bounds.height !== oldHeight)
      ) {
        delegate.regionResize(this);
      }
    } else if(delegate.regionHide && oldVisible) {
      delegate.regionHide(this);
    }
  };
  Region.prototype.dispose = function() {
    this.disposed = true;
  };

  self.intersects = intersects;
  self.elementRect = elementRect;
  self.createRegion = function(delegate, element, inset) {
    let region = new Region(delegate, element, inset);
    regions.push(region);
    return region;
  };

  return self;
})();

if(typeof module !== 'undefined') {
  module.exports = viewport;
}
