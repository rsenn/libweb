import React from './dom/preactComponent.js';
import invariant from './invariant.js';
import PropTypes from './prop-types.js';
/* --------------------------- start of 'header' ---------------------------- */
function findDOMNode(component) {
  return (component && (component.base || (component.nodeType === 1 && component))) || null;
}

/* ---------------------------- end of 'header' ----------------------------- */
// ==UserScript==
// @name         stdout
// @namespace    https://github.com/rsenn
// @version      1.0
// @description  react-sortable-hoc/src/index.js
// @author       Roman L. Senn
// @match        http*://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-start
// @downloadURL  https://localhost:9000/stdout
// @updateURL    https://localhost:9000/stdout
// ==/UserScript==

('use strict');

/* ---------- start of './react-sortable-hoc/src/Manager/index.js' ---------- */
export class Manager {
  refs = {};

  add(collection, ref) {
    if(!this.refs[collection]) {
      this.refs[collection] = [];
    }

    this.refs[collection].push(ref);
  }

  remove(collection, ref) {
    const index = this.getIndex(collection, ref);

    if(index !== -1) {
      this.refs[collection].splice(index, 1);
    }
  }

  isActive() {
    return this.active;
  }

  getActive() {
    return this.refs[this.active.collection].find(
      // eslint-disable-next-line eqeqeq
      ({ node }) => node.sortableInfo.index == this.active.index
    );
  }

  getIndex(collection, ref) {
    return this.refs[collection].indexOf(ref);
  }

  getOrderedRefs(collection = this.active.collection) {
    return this.refs[collection].sort(sortByIndex);
  }
}

function sortByIndex(
  {
    node: {
      sortableInfo: { index: index1 }
    }
  },
  {
    node: {
      sortableInfo: { index: index2 }
    }
  }
) {
  return index1 - index2;
}

/* ----------- end of './react-sortable-hoc/src/Manager/index.js' ----------- */

/* -------------- start of './react-sortable-hoc/src/utils.js' -------------- */

/* global process */

function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);

  return array;
}

function omit(obj, keysToOmit) {
  return Object.keys(obj).reduce((acc, key) => {
    if(keysToOmit.indexOf(key) === -1) {
      acc[key] = obj[key];
    }

    return acc;
  }, {});
}

const events = {
  end: ['touchend', 'touchcancel', 'mouseup'],
  move: ['touchmove', 'mousemove'],
  start: ['touchstart', 'mousedown']
};

const vendorPrefix = (function () {
  if(typeof window === 'undefined' || typeof document === 'undefined') {
    // Server environment
    return '';
  }

  // fix for: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  // window.getComputedStyle() returns null inside an iframe with display: none
  // in this case return an array with a fake mozilla style in it.
  const styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
  const pre = (Array.prototype.slice
    .call(styles)
    .join('')
    .match(/-(moz|webkit|ms)-/) ||
    (styles.OLink === '' && ['', 'o']))[1];

  switch (pre) {
    case 'ms':
      return 'ms';
    default:
      return pre && pre.length ? pre[0].toUpperCase() + pre.substr(1) : '';
  }
})();

function setInlineStyles(node, styles) {
  Object.keys(styles).forEach(key => {
    node.style[key] = styles[key];
  });
}

function setTranslate3d(node, translate) {
  node.style[`${vendorPrefix}Transform`] = translate == null ? '' : `translate3d(${translate.x}px,${translate.y}px,0)`;
}

function setTransitionDuration(node, duration) {
  node.style[`${vendorPrefix}TransitionDuration`] = duration == null ? '' : `${duration}ms`;
}

function closest(el, fn) {
  while(el) {
    if(fn(el)) {
      return el;
    }

    el = el.parentNode;
  }

  return null;
}

function limit(min, max, value) {
  return Math.max(min, Math.min(value, max));
}

function getPixelValue(stringValue) {
  if(stringValue.substr(-2) === 'px') {
    return parseFloat(stringValue);
  }

  return 0;
}

function getElementMargin(element) {
  const style = window.getComputedStyle(element);

  return {
    bottom: getPixelValue(style.marginBottom),
    left: getPixelValue(style.marginLeft),
    right: getPixelValue(style.marginRight),
    top: getPixelValue(style.marginTop)
  };
}

function provideDisplayName(prefix, Component) {
  const componentName = Component.displayName || Component.name;

  return componentName ? `${prefix}(${componentName})` : prefix;
}

function getScrollAdjustedBoundingClientRect(node, scrollDelta) {
  const boundingClientRect = node.getBoundingClientRect();

  return {
    top: boundingClientRect.top + scrollDelta.top,
    left: boundingClientRect.left + scrollDelta.left
  };
}

function getPosition(event) {
  if(event.touches && event.touches.length) {
    return {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
    };
  } else if(event.changedTouches && event.changedTouches.length) {
    return {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY
    };
  } else {
    return {
      x: event.pageX,
      y: event.pageY
    };
  }
}

function isTouchEvent(event) {
  return (event.touches && event.touches.length) || (event.changedTouches && event.changedTouches.length);
}

function getEdgeOffset(node, parent, offset = { left: 0, top: 0 }) {
  if(!node) {
    return undefined;
  }

  // Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested
  const nodeOffset = {
    left: offset.left + node.offsetLeft,
    top: offset.top + node.offsetTop
  };

  if(node.parentNode === parent) {
    return nodeOffset;
  }

  return getEdgeOffset(node.parentNode, parent, nodeOffset);
}

function getTargetIndex(newIndex, prevIndex, oldIndex) {
  if(newIndex < oldIndex && newIndex > prevIndex) {
    return newIndex - 1;
  } else if(newIndex > oldIndex && newIndex < prevIndex) {
    return newIndex + 1;
  } else {
    return newIndex;
  }
}

function getLockPixelOffset({ lockOffset, width, height }) {
  let offsetX = lockOffset;
  let offsetY = lockOffset;
  let unit = 'px';

  if(typeof lockOffset === 'string') {
    const match = /^[+-]?\d*(?:\.\d*)?(px|%)$/.exec(lockOffset);

    invariant(match !== null, 'lockOffset value should be a number or a string of a ' + 'number followed by "px" or "%". Given %s', lockOffset);

    offsetX = parseFloat(lockOffset);
    offsetY = parseFloat(lockOffset);
    unit = match[1];
  }

  invariant(isFinite(offsetX) && isFinite(offsetY), 'lockOffset value should be a finite. Given %s', lockOffset);

  if(unit === '%') {
    offsetX = (offsetX * width) / 100;
    offsetY = (offsetY * height) / 100;
  }

  return {
    x: offsetX,
    y: offsetY
  };
}

function getLockPixelOffsets({ height, width, lockOffset }) {
  const offsets = Array.isArray(lockOffset) ? lockOffset : [lockOffset, lockOffset];

  invariant(offsets.length === 2, 'lockOffset prop of SortableContainer should be a single ' + 'value or an array of exactly two values. Given %s', lockOffset);

  const [minLockOffset, maxLockOffset] = offsets;

  return [getLockPixelOffset({ height, lockOffset: minLockOffset, width }), getLockPixelOffset({ height, lockOffset: maxLockOffset, width })];
}

function isScrollable(el) {
  const computedStyle = window.getComputedStyle(el);
  const overflowRegex = /(auto|scroll)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return properties.find(property => overflowRegex.test(computedStyle[property]));
}

function getScrollingParent(el) {
  if(!(el instanceof HTMLElement)) {
    return null;
  } else if(isScrollable(el)) {
    return el;
  } else {
    return getScrollingParent(el.parentNode);
  }
}

function getContainerGridGap(element) {
  const style = window.getComputedStyle(element);

  if(style.display === 'grid') {
    return {
      x: getPixelValue(style.gridColumnGap),
      y: getPixelValue(style.gridRowGap)
    };
  }

  return { x: 0, y: 0 };
}

const KEYCODE = {
  TAB: 9,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

const NodeType = {
  Anchor: 'A',
  Button: 'BUTTON',
  Canvas: 'CANVAS',
  Input: 'INPUT',
  Option: 'OPTION',
  Textarea: 'TEXTAREA',
  Select: 'SELECT'
};

function cloneNode(node) {
  const selector = 'input, textarea, select, canvas, [contenteditable]';
  const fields = node.querySelectorAll(selector);
  const clonedNode = node.cloneNode(true);
  const clonedFields = [...clonedNode.querySelectorAll(selector)];

  clonedFields.forEach((field, i) => {
    if(field.type !== 'file') {
      field.value = fields[i].value;
    }

    // Fixes an issue with original radio buttons losing their value once the
    // clone is inserted in the DOM, as radio button `name` attributes must be unique
    if(field.type === 'radio' && field.name) {
      field.name = `__sortableClone__${field.name}`;
    }

    if(field.tagName === NodeType.Canvas && fields[i].width > 0 && fields[i].height > 0) {
      const destCtx = field.getContext('2d');
      destCtx.drawImage(fields[i], 0, 0);
    }
  });

  return clonedNode;
}

/* --------------- end of './react-sortable-hoc/src/utils.js' --------------- */

/* ------ start of './react-sortable-hoc/src/SortableHandle/index.js' ------- */

export function SortableHandle(WrappedComponent, config = { withRef: false }) {
  return class WithSortableHandle extends React.Component {
    static displayName = provideDisplayName('SortableHandle', WrappedComponent);

    componentDidMount() {
      const node = findDOMNode(this);
      node.sortableHandle = true;
    }

    getWrappedInstance() {
      invariant(config.withRef, 'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableHandle() call');
      return this.wrappedInstance.current;
    }

    wrappedInstance = React.createRef();

    render() {
      const ref = config.withRef ? this.wrappedInstance : null;

      return h(WrappedComponent, { ref, ...this.props }, []);
      //return <WrappedComponent ref={ref} {...this.props} />;
    }
  };
}

function isSortableHandle(node) {
  return node.sortableHandle != null;
}

/* ------- end of './react-sortable-hoc/src/SortableHandle/index.js' -------- */

/* ------- start of './react-sortable-hoc/src/AutoScroller/index.js' -------- */
class AutoScroller {
  constructor(container, onScrollCallback) {
    this.container = container;

    this.onScrollCallback = onScrollCallback;
  }

  clear() {
    if(this.interval == null) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
  }

  update({ translate, minTranslate, maxTranslate, width, height }) {
    const direction = {
      x: 0,
      y: 0
    };
    const speed = {
      x: 1,
      y: 1
    };
    const acceleration = {
      x: 10,
      y: 10
    };

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = this.container;

    const isTop = scrollTop === 0;
    const isBottom = scrollHeight - scrollTop - clientHeight === 0;
    const isLeft = scrollLeft === 0;
    const isRight = scrollWidth - scrollLeft - clientWidth === 0;

    if(translate.y >= maxTranslate.y - height / 2 && !isBottom) {
      // Scroll Down
      direction.y = 1;
      speed.y = acceleration.y * Math.abs((maxTranslate.y - height / 2 - translate.y) / height);
    } else if(translate.x >= maxTranslate.x - width / 2 && !isRight) {
      // Scroll Right
      direction.x = 1;
      speed.x = acceleration.x * Math.abs((maxTranslate.x - width / 2 - translate.x) / width);
    } else if(translate.y <= minTranslate.y + height / 2 && !isTop) {
      // Scroll Up
      direction.y = -1;
      speed.y = acceleration.y * Math.abs((translate.y - height / 2 - minTranslate.y) / height);
    } else if(translate.x <= minTranslate.x + width / 2 && !isLeft) {
      // Scroll Left
      direction.x = -1;
      speed.x = acceleration.x * Math.abs((translate.x - width / 2 - minTranslate.x) / width);
    }

    if(this.interval) {
      this.clear();
      this.isAutoScrolling = false;
    }

    if(direction.x !== 0 || direction.y !== 0) {
      this.interval = setInterval(() => {
        this.isAutoScrolling = true;
        const offset = {
          left: speed.x * direction.x,
          top: speed.y * direction.y
        };
        this.container.scrollTop += offset.top;
        this.container.scrollLeft += offset.left;

        this.onScrollCallback(offset);
      }, 5);
    }
  }
}

/* -------- end of './react-sortable-hoc/src/AutoScroller/index.js' --------- */

/*  start of './react-sortable-hoc/src/SortableContainer/defaultGetHelperDimensions.js'  */
function defaultGetHelperDimensions({ node }) {
  return {
    height: node.offsetHeight,
    width: node.offsetWidth
  };
}

/*  end of './react-sortable-hoc/src/SortableContainer/defaultGetHelperDimensions.js'  */

/*  start of './react-sortable-hoc/src/SortableContainer/defaultShouldCancelStart.js'  */
function defaultShouldCancelStart(event) {
  if(interactiveElements.indexOf(event.target.tagName) !== -1) {
    // Return true to cancel sorting
    return true;
  }

  if(closest(event.target, el => el.contentEditable === 'true')) {
    return true;
  }

  return false;
}

/*  end of './react-sortable-hoc/src/SortableContainer/defaultShouldCancelStart.js'  */

/* ----- start of './react-sortable-hoc/src/SortableContainer/props.js' ----- */

/* ------ end of './react-sortable-hoc/src/SortableContainer/props.js' ------ */

/* ----- start of './react-sortable-hoc/src/SortableContainer/index.js' ----- */

const SortableContext = React.createContext({
  manager: {}
});

export function SortableContainer(WrappedComponent, config = { withRef: false }) {
  const propTypes = {
    axis: PropTypes.oneOf(['x', 'y', 'xy']),
    contentWindow: PropTypes.any,
    disableAutoscroll: PropTypes.bool,
    distance: PropTypes.number,
    getContainer: PropTypes.func,
    getHelperDimensions: PropTypes.func,
    helperClass: PropTypes.string,
    helperContainer: PropTypes.oneOfType([PropTypes.func, typeof HTMLElement === 'undefined' ? PropTypes.any : PropTypes.instanceOf(HTMLElement)]),
    hideSortableGhost: PropTypes.bool,
    keyboardSortingTransitionDuration: PropTypes.number,
    lockAxis: PropTypes.string,
    lockOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))]),
    lockToContainerEdges: PropTypes.bool,
    onSortEnd: PropTypes.func,
    onSortMove: PropTypes.func,
    onSortOver: PropTypes.func,
    onSortStart: PropTypes.func,
    pressDelay: PropTypes.number,
    pressThreshold: PropTypes.number,
    keyCodes: PropTypes.shape({
      lift: PropTypes.arrayOf(PropTypes.number),
      drop: PropTypes.arrayOf(PropTypes.number),
      cancel: PropTypes.arrayOf(PropTypes.number),
      up: PropTypes.arrayOf(PropTypes.number),
      down: PropTypes.arrayOf(PropTypes.number)
    }),
    shouldCancelStart: PropTypes.func,
    transitionDuration: PropTypes.number,
    updateBeforeSortStart: PropTypes.func,
    useDragHandle: PropTypes.bool,
    useWindowAsScrollContainer: PropTypes.bool
  };

  const defaultKeyCodes = {
    lift: [KEYCODE.SPACE],
    drop: [KEYCODE.SPACE],
    cancel: [KEYCODE.ESC],
    up: [KEYCODE.UP, KEYCODE.LEFT],
    down: [KEYCODE.DOWN, KEYCODE.RIGHT]
  };

  const defaultProps = {
    axis: 'y',
    disableAutoscroll: false,
    distance: 0,
    getHelperDimensions: defaultGetHelperDimensions,
    hideSortableGhost: true,
    lockOffset: '50%',
    lockToContainerEdges: false,
    pressDelay: 0,
    pressThreshold: 5,
    keyCodes: defaultKeyCodes,
    shouldCancelStart: defaultShouldCancelStart,
    transitionDuration: 300,
    useWindowAsScrollContainer: false
  };

  const omittedProps = Object.keys(propTypes);

  function validateProps(props) {
    invariant(!(props.distance && props.pressDelay), 'Attempted to set both `pressDelay` and `distance` on SortableContainer, you may only use one or the other, not both at the same time.');
  }

  return class WithSortableContainer extends React.Component {
    constructor(props) {
      super(props);

      const manager = new Manager();

      validateProps(props);

      this.manager = manager;
      this.wrappedInstance = React.createRef();
      this.sortableContextValue = { manager };
      this.events = {
        end: this.handleEnd,
        move: this.handleMove,
        start: this.handleStart
      };
    }

    state = {};

    static displayName = provideDisplayName('sortableList', WrappedComponent);
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    componentDidMount() {
      const { useWindowAsScrollContainer } = this.props;
      const container = this.getContainer();

      Promise.resolve(container).then(containerNode => {
        this.container = containerNode;
        this.document = this.container.ownerDocument || document;

        /*
         *  Set our own default rather than using defaultProps because Jest
         *  snapshots will serialize window, causing a RangeError
         *  https://github.com/clauderic/react-sortable-hoc/issues/249
         */
        const contentWindow = this.props.contentWindow || this.document.defaultView || window;

        this.contentWindow = typeof contentWindow === 'function' ? contentWindow() : contentWindow;

        this.scrollContainer = useWindowAsScrollContainer ? this.document.scrollingElement || this.document.documentElement : getScrollingParent(this.container) || this.container;

        this.autoScroller = new AutoScroller(this.scrollContainer, this.onAutoScroll);

        Object.keys(this.events).forEach(key => events[key].forEach(eventName => this.container.addEventListener(eventName, this.events[key], false)));

        this.container.addEventListener('keydown', this.handleKeyDown);
      });
    }

    componentWillUnmount() {
      if(this.helper && this.helper.parentNode) {
        this.helper.parentNode.removeChild(this.helper);
      }
      if(!this.container) {
        return;
      }

      Object.keys(this.events).forEach(key => events[key].forEach(eventName => this.container.removeEventListener(eventName, this.events[key])));
      this.container.removeEventListener('keydown', this.handleKeyDown);
    }

    handleStart = event => {
      const { distance, shouldCancelStart } = this.props;

      if(event.button === 2 || shouldCancelStart(event)) {
        return;
      }

      this.touched = true;
      this.position = getPosition(event);

      const node = closest(event.target, el => el.sortableInfo != null);

      if(node && node.sortableInfo && this.nodeIsChild(node) && !this.state.sorting) {
        const { useDragHandle } = this.props;
        const { index, collection, disabled } = node.sortableInfo;

        if(disabled) {
          return;
        }

        if(useDragHandle && !closest(event.target, isSortableHandle)) {
          return;
        }

        this.manager.active = { collection, index };

        /*
         * Fixes a bug in Firefox where the :active state of anchor tags
         * prevent subsequent 'mousemove' events from being fired
         * (see https://github.com/clauderic/react-sortable-hoc/issues/118)
         */
        if(!isTouchEvent(event) && event.target.tagName === NodeType.Anchor) {
          event.preventDefault();
        }

        if(!distance) {
          if(this.props.pressDelay === 0) {
            this.handlePress(event);
          } else {
            this.pressTimer = setTimeout(() => this.handlePress(event), this.props.pressDelay);
          }
        }
      }
    };

    nodeIsChild = node => {
      return node.sortableInfo.manager === this.manager;
    };

    handleMove = event => {
      const { distance, pressThreshold } = this.props;

      if(!this.state.sorting && this.touched && !this._awaitingUpdateBeforeSortStart) {
        const position = getPosition(event);
        const delta = {
          x: this.position.x - position.x,
          y: this.position.y - position.y
        };
        const combinedDelta = Math.abs(delta.x) + Math.abs(delta.y);

        this.delta = delta;

        if(!distance && (!pressThreshold || combinedDelta >= pressThreshold)) {
          clearTimeout(this.cancelTimer);
          this.cancelTimer = setTimeout(this.cancel, 0);
        } else if(distance && combinedDelta >= distance && this.manager.isActive()) {
          this.handlePress(event);
        }
      }
    };

    handleEnd = () => {
      this.touched = false;
      this.cancel();
    };

    cancel = () => {
      const { distance } = this.props;
      const { sorting } = this.state;

      if(!sorting) {
        if(!distance) {
          clearTimeout(this.pressTimer);
        }
        this.manager.active = null;
      }
    };

    handlePress = async event => {
      const active = this.manager.getActive();

      if(active) {
        const { axis, getHelperDimensions, helperClass, hideSortableGhost, updateBeforeSortStart, onSortStart, useWindowAsScrollContainer } = this.props;
        const { node, collection } = active;
        const { isKeySorting } = this.manager;

        if(typeof updateBeforeSortStart === 'function') {
          this._awaitingUpdateBeforeSortStart = true;

          try {
            const { index } = node.sortableInfo;
            await updateBeforeSortStart({ collection, index, node, isKeySorting }, event);
          } finally {
            this._awaitingUpdateBeforeSortStart = false;
          }
        }

        // Need to get the latest value for `index` in case it changes during `updateBeforeSortStart`
        const { index } = node.sortableInfo;
        const margin = getElementMargin(node);
        const gridGap = getContainerGridGap(this.container);
        const containerBoundingRect = this.scrollContainer.getBoundingClientRect();
        const dimensions = getHelperDimensions({ index, node, collection });

        this.node = node;
        this.margin = margin;
        this.gridGap = gridGap;
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.marginOffset = {
          x: this.margin.left + this.margin.right + this.gridGap.x,
          y: Math.max(this.margin.top, this.margin.bottom, this.gridGap.y)
        };
        this.boundingClientRect = node.getBoundingClientRect();
        this.containerBoundingRect = containerBoundingRect;
        this.index = index;
        this.newIndex = index;

        this.axis = {
          x: axis.indexOf('x') >= 0,
          y: axis.indexOf('y') >= 0
        };
        this.offsetEdge = getEdgeOffset(node, this.container);

        if(isKeySorting) {
          this.initialOffset = getPosition({
            ...event,
            pageX: this.boundingClientRect.left,
            pageY: this.boundingClientRect.top
          });
        } else {
          this.initialOffset = getPosition(event);
        }

        this.initialScroll = {
          left: this.scrollContainer.scrollLeft,
          top: this.scrollContainer.scrollTop
        };

        this.initialWindowScroll = {
          left: window.pageXOffset,
          top: window.pageYOffset
        };

        this.helper = this.helperContainer.appendChild(cloneNode(node));

        setInlineStyles(this.helper, {
          boxSizing: 'border-box',
          height: `${this.height}px`,
          left: `${this.boundingClientRect.left - margin.left}px`,
          pointerEvents: 'none',
          position: 'fixed',
          top: `${this.boundingClientRect.top - margin.top}px`,
          width: `${this.width}px`
        });

        if(isKeySorting) {
          this.helper.focus();
        }

        if(hideSortableGhost) {
          this.sortableGhost = node;

          setInlineStyles(node, {
            opacity: 0,
            visibility: 'hidden'
          });
        }

        this.minTranslate = {};
        this.maxTranslate = {};

        if(isKeySorting) {
          const {
            top: containerTop,
            left: containerLeft,
            width: containerWidth,
            height: containerHeight
          } = useWindowAsScrollContainer
            ? {
                top: 0,
                left: 0,
                width: this.contentWindow.innerWidth,
                height: this.contentWindow.innerHeight
              }
            : this.containerBoundingRect;
          const containerBottom = containerTop + containerHeight;
          const containerRight = containerLeft + containerWidth;

          if(this.axis.x) {
            this.minTranslate.x = containerLeft - this.boundingClientRect.left;
            this.maxTranslate.x = containerRight - (this.boundingClientRect.left + this.width);
          }

          if(this.axis.y) {
            this.minTranslate.y = containerTop - this.boundingClientRect.top;
            this.maxTranslate.y = containerBottom - (this.boundingClientRect.top + this.height);
          }
        } else {
          if(this.axis.x) {
            this.minTranslate.x = (useWindowAsScrollContainer ? 0 : containerBoundingRect.left) - this.boundingClientRect.left - this.width / 2;
            this.maxTranslate.x =
              (useWindowAsScrollContainer ? this.contentWindow.innerWidth : containerBoundingRect.left + containerBoundingRect.width) - this.boundingClientRect.left - this.width / 2;
          }

          if(this.axis.y) {
            this.minTranslate.y = (useWindowAsScrollContainer ? 0 : containerBoundingRect.top) - this.boundingClientRect.top - this.height / 2;
            this.maxTranslate.y =
              (useWindowAsScrollContainer ? this.contentWindow.innerHeight : containerBoundingRect.top + containerBoundingRect.height) - this.boundingClientRect.top - this.height / 2;
          }
        }

        if(helperClass) {
          helperClass.split(' ').forEach(className => this.helper.classList.add(className));
        }

        this.listenerNode = event.touches ? event.target : this.contentWindow;

        if(isKeySorting) {
          this.listenerNode.addEventListener('wheel', this.handleKeyEnd, true);
          this.listenerNode.addEventListener('mousedown', this.handleKeyEnd, true);
          this.listenerNode.addEventListener('keydown', this.handleKeyDown);
        } else {
          events.move.forEach(eventName => this.listenerNode.addEventListener(eventName, this.handleSortMove, false));
          events.end.forEach(eventName => this.listenerNode.addEventListener(eventName, this.handleSortEnd, false));
        }

        this.setState({
          sorting: true,
          sortingIndex: index
        });

        if(onSortStart) {
          onSortStart(
            {
              node,
              index,
              collection,
              isKeySorting,
              nodes: this.manager.getOrderedRefs(),
              helper: this.helper
            },
            event
          );
        }

        if(isKeySorting) {
          // Readjust positioning in case re-rendering occurs onSortStart
          this.keyMove(0);
        }
      }
    };

    handleSortMove = event => {
      const { onSortMove } = this.props;

      // Prevent scrolling on mobile
      if(typeof event.preventDefault === 'function' && event.cancelable) {
        event.preventDefault();
      }

      this.updateHelperPosition(event);
      this.animateNodes();
      this.autoscroll();

      if(onSortMove) {
        onSortMove(event);
      }
    };

    handleSortEnd = event => {
      const { hideSortableGhost, onSortEnd } = this.props;
      const {
        active: { collection },
        isKeySorting
      } = this.manager;
      const nodes = this.manager.getOrderedRefs();

      // Remove the event listeners if the node is still in the DOM
      if(this.listenerNode) {
        if(isKeySorting) {
          this.listenerNode.removeEventListener('wheel', this.handleKeyEnd, true);
          this.listenerNode.removeEventListener('mousedown', this.handleKeyEnd, true);
          this.listenerNode.removeEventListener('keydown', this.handleKeyDown);
        } else {
          events.move.forEach(eventName => this.listenerNode.removeEventListener(eventName, this.handleSortMove));
          events.end.forEach(eventName => this.listenerNode.removeEventListener(eventName, this.handleSortEnd));
        }
      }

      // Remove the helper from the DOM
      this.helper.parentNode.removeChild(this.helper);

      if(hideSortableGhost && this.sortableGhost) {
        setInlineStyles(this.sortableGhost, {
          opacity: '',
          visibility: ''
        });
      }

      for(let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];
        const el = node.node;

        // Clear the cached offset/boundingClientRect
        node.edgeOffset = null;
        node.boundingClientRect = null;

        // Remove the transforms / transitions
        setTranslate3d(el, null);
        setTransitionDuration(el, null);
        node.translate = null;
      }

      // Stop autoscroll
      this.autoScroller.clear();

      // Update manager state
      this.manager.active = null;
      this.manager.isKeySorting = false;

      this.setState({
        sorting: false,
        sortingIndex: null
      });

      if(typeof onSortEnd === 'function') {
        onSortEnd(
          {
            collection,
            newIndex: this.newIndex,
            oldIndex: this.index,
            isKeySorting,
            nodes
          },
          event
        );
      }

      this.touched = false;
    };

    updateHelperPosition(event) {
      const { lockAxis, lockOffset, lockToContainerEdges, transitionDuration, keyboardSortingTransitionDuration = transitionDuration } = this.props;
      const { isKeySorting } = this.manager;
      const { ignoreTransition } = event;

      const offset = getPosition(event);
      const translate = {
        x: offset.x - this.initialOffset.x,
        y: offset.y - this.initialOffset.y
      };

      // Adjust for window scroll
      translate.y -= window.pageYOffset - this.initialWindowScroll.top;
      translate.x -= window.pageXOffset - this.initialWindowScroll.left;

      this.translate = translate;

      if(lockToContainerEdges) {
        const [minLockOffset, maxLockOffset] = getLockPixelOffsets({
          height: this.height,
          lockOffset,
          width: this.width
        });
        const minOffset = {
          x: this.width / 2 - minLockOffset.x,
          y: this.height / 2 - minLockOffset.y
        };
        const maxOffset = {
          x: this.width / 2 - maxLockOffset.x,
          y: this.height / 2 - maxLockOffset.y
        };

        translate.x = limit(this.minTranslate.x + minOffset.x, this.maxTranslate.x - maxOffset.x, translate.x);
        translate.y = limit(this.minTranslate.y + minOffset.y, this.maxTranslate.y - maxOffset.y, translate.y);
      }

      if(lockAxis === 'x') {
        translate.y = 0;
      } else if(lockAxis === 'y') {
        translate.x = 0;
      }

      if(isKeySorting && keyboardSortingTransitionDuration && !ignoreTransition) {
        setTransitionDuration(this.helper, keyboardSortingTransitionDuration);
      }

      setTranslate3d(this.helper, translate);
    }

    animateNodes() {
      const { transitionDuration, hideSortableGhost, onSortOver } = this.props;
      const { containerScrollDelta, windowScrollDelta } = this;
      const nodes = this.manager.getOrderedRefs();
      const sortingOffset = {
        left: this.offsetEdge.left + this.translate.x + containerScrollDelta.left,
        top: this.offsetEdge.top + this.translate.y + containerScrollDelta.top
      };
      const { isKeySorting } = this.manager;

      const prevIndex = this.newIndex;
      this.newIndex = null;

      for(let i = 0, len = nodes.length; i < len; i++) {
        const { node } = nodes[i];
        const { index } = node.sortableInfo;
        const width = node.offsetWidth;
        const height = node.offsetHeight;
        const offset = {
          height: this.height > height ? height / 2 : this.height / 2,
          width: this.width > width ? width / 2 : this.width / 2
        };

        // For keyboard sorting, we want user input to dictate the position of the nodes
        const mustShiftBackward = isKeySorting && index > this.index && index <= prevIndex;
        const mustShiftForward = isKeySorting && index < this.index && index >= prevIndex;

        const translate = {
          x: 0,
          y: 0
        };
        let { edgeOffset } = nodes[i];

        // If we haven't cached the node's offsetTop / offsetLeft value
        if(!edgeOffset) {
          edgeOffset = getEdgeOffset(node, this.container);
          nodes[i].edgeOffset = edgeOffset;
          // While we're at it, cache the boundingClientRect, used during keyboard sorting
          if(isKeySorting) {
            nodes[i].boundingClientRect = getScrollAdjustedBoundingClientRect(node, containerScrollDelta);
          }
        }

        // Get a reference to the next and previous node
        const nextNode = i < nodes.length - 1 && nodes[i + 1];
        const prevNode = i > 0 && nodes[i - 1];

        // Also cache the next node's edge offset if needed.
        // We need this for calculating the animation in a grid setup
        if(nextNode && !nextNode.edgeOffset) {
          nextNode.edgeOffset = getEdgeOffset(nextNode.node, this.container);
          if(isKeySorting) {
            nextNode.boundingClientRect = getScrollAdjustedBoundingClientRect(nextNode.node, containerScrollDelta);
          }
        }

        // If the node is the one we're currently animating, skip it
        if(index === this.index) {
          if(hideSortableGhost) {
            /*
             * With windowing libraries such as `react-virtualized`, the sortableGhost
             * node may change while scrolling down and then back up (or vice-versa),
             * so we need to update the reference to the new node just to be safe.
             */
            this.sortableGhost = node;

            setInlineStyles(node, {
              opacity: 0,
              visibility: 'hidden'
            });
          }
          continue;
        }

        if(transitionDuration) {
          setTransitionDuration(node, transitionDuration);
        }

        if(this.axis.x) {
          if(this.axis.y) {
            // Calculations for a grid setup
            if(
              mustShiftForward ||
              (index < this.index &&
                ((sortingOffset.left + windowScrollDelta.left - offset.width <= edgeOffset.left && sortingOffset.top + windowScrollDelta.top <= edgeOffset.top + offset.height) ||
                  sortingOffset.top + windowScrollDelta.top + offset.height <= edgeOffset.top))
            ) {
              // If the current node is to the left on the same row, or above the node that's being dragged
              // then move it to the right
              translate.x = this.width + this.marginOffset.x;
              if(edgeOffset.left + translate.x > this.containerBoundingRect.width - offset.width * 2) {
                // If it moves passed the right bounds, then animate it to the first position of the next row.
                // We just use the offset of the next node to calculate where to move, because that node's original position
                // is exactly where we want to go
                if(nextNode) {
                  translate.x = nextNode.edgeOffset.left - edgeOffset.left;
                  translate.y = nextNode.edgeOffset.top - edgeOffset.top;
                }
              }
              if(this.newIndex === null) {
                this.newIndex = index;
              }
            } else if(
              mustShiftBackward ||
              (index > this.index &&
                ((sortingOffset.left + windowScrollDelta.left + offset.width >= edgeOffset.left && sortingOffset.top + windowScrollDelta.top + offset.height >= edgeOffset.top) ||
                  sortingOffset.top + windowScrollDelta.top + offset.height >= edgeOffset.top + height))
            ) {
              // If the current node is to the right on the same row, or below the node that's being dragged
              // then move it to the left
              translate.x = -(this.width + this.marginOffset.x);
              if(edgeOffset.left + translate.x < this.containerBoundingRect.left + offset.width) {
                // If it moves passed the left bounds, then animate it to the last position of the previous row.
                // We just use the offset of the previous node to calculate where to move, because that node's original position
                // is exactly where we want to go
                if(prevNode) {
                  translate.x = prevNode.edgeOffset.left - edgeOffset.left;
                  translate.y = prevNode.edgeOffset.top - edgeOffset.top;
                }
              }
              this.newIndex = index;
            }
          } else {
            if(mustShiftBackward || (index > this.index && sortingOffset.left + windowScrollDelta.left + offset.width >= edgeOffset.left)) {
              translate.x = -(this.width + this.marginOffset.x);
              this.newIndex = index;
            } else if(mustShiftForward || (index < this.index && sortingOffset.left + windowScrollDelta.left <= edgeOffset.left + offset.width)) {
              translate.x = this.width + this.marginOffset.x;

              if(this.newIndex == null) {
                this.newIndex = index;
              }
            }
          }
        } else if(this.axis.y) {
          if(mustShiftBackward || (index > this.index && sortingOffset.top + windowScrollDelta.top + offset.height >= edgeOffset.top)) {
            translate.y = -(this.height + this.marginOffset.y);
            this.newIndex = index;
          } else if(mustShiftForward || (index < this.index && sortingOffset.top + windowScrollDelta.top <= edgeOffset.top + offset.height)) {
            translate.y = this.height + this.marginOffset.y;
            if(this.newIndex == null) {
              this.newIndex = index;
            }
          }
        }

        setTranslate3d(node, translate);
        nodes[i].translate = translate;
      }

      if(this.newIndex == null) {
        this.newIndex = this.index;
      }

      if(isKeySorting) {
        // If keyboard sorting, we want the user input to dictate index, not location of the helper
        this.newIndex = prevIndex;
      }

      const oldIndex = isKeySorting ? this.prevIndex : prevIndex;
      if(onSortOver && this.newIndex !== oldIndex) {
        onSortOver({
          collection: this.manager.active.collection,
          index: this.index,
          newIndex: this.newIndex,
          oldIndex,
          isKeySorting,
          nodes,
          helper: this.helper
        });
      }
    }

    autoscroll = () => {
      const { disableAutoscroll } = this.props;
      const { isKeySorting } = this.manager;

      if(disableAutoscroll) {
        this.autoScroller.clear();
        return;
      }

      if(isKeySorting) {
        const translate = { ...this.translate };
        let scrollX = 0;
        let scrollY = 0;

        if(this.axis.x) {
          translate.x = Math.min(this.maxTranslate.x, Math.max(this.minTranslate.x, this.translate.x));
          scrollX = this.translate.x - translate.x;
        }

        if(this.axis.y) {
          translate.y = Math.min(this.maxTranslate.y, Math.max(this.minTranslate.y, this.translate.y));
          scrollY = this.translate.y - translate.y;
        }

        this.translate = translate;
        setTranslate3d(this.helper, this.translate);
        this.scrollContainer.scrollLeft += scrollX;
        this.scrollContainer.scrollTop += scrollY;

        return;
      }

      this.autoScroller.update({
        height: this.height,
        maxTranslate: this.maxTranslate,
        minTranslate: this.minTranslate,
        translate: this.translate,
        width: this.width
      });
    };

    onAutoScroll = offset => {
      this.translate.x += offset.left;
      this.translate.y += offset.top;

      this.animateNodes();
    };

    getWrappedInstance() {
      invariant(config.withRef, 'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableContainer() call');

      return this.wrappedInstance.current;
    }

    getContainer() {
      const { getContainer } = this.props;

      if(typeof getContainer !== 'function') {
        return findDOMNode(this);
      }

      return getContainer(config.withRef ? this.getWrappedInstance() : undefined);
    }

    handleKeyDown = event => {
      const { keyCode } = event;
      const { shouldCancelStart, keyCodes: customKeyCodes = {} } = this.props;

      const keyCodes = {
        ...defaultKeyCodes,
        ...customKeyCodes
      };

      if((this.manager.active && !this.manager.isKeySorting) || (!this.manager.active && (!keyCodes.lift.includes(keyCode) || shouldCancelStart(event) || !this.isValidSortingTarget(event)))) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

      if(keyCodes.lift.includes(keyCode) && !this.manager.active) {
        this.keyLift(event);
      } else if(keyCodes.drop.includes(keyCode) && this.manager.active) {
        this.keyDrop(event);
      } else if(keyCodes.cancel.includes(keyCode)) {
        this.newIndex = this.manager.active.index;
        this.keyDrop(event);
      } else if(keyCodes.up.includes(keyCode)) {
        this.keyMove(-1);
      } else if(keyCodes.down.includes(keyCode)) {
        this.keyMove(1);
      }
    };

    keyLift = event => {
      const { target } = event;
      const node = closest(target, el => el.sortableInfo != null);
      const { index, collection } = node.sortableInfo;

      this.initialFocusedNode = target;

      this.manager.isKeySorting = true;
      this.manager.active = {
        index,
        collection
      };

      this.handlePress(event);
    };

    keyMove = shift => {
      const nodes = this.manager.getOrderedRefs();
      const { index: lastIndex } = nodes[nodes.length - 1].node.sortableInfo;
      const newIndex = this.newIndex + shift;
      const prevIndex = this.newIndex;

      if(newIndex < 0 || newIndex > lastIndex) {
        return;
      }

      this.prevIndex = prevIndex;
      this.newIndex = newIndex;

      const targetIndex = getTargetIndex(this.newIndex, this.prevIndex, this.index);
      const target = nodes.find(({ node }) => node.sortableInfo.index === targetIndex);
      const { node: targetNode } = target;

      const scrollDelta = this.containerScrollDelta;
      const targetBoundingClientRect = target.boundingClientRect || getScrollAdjustedBoundingClientRect(targetNode, scrollDelta);
      const targetTranslate = target.translate || { x: 0, y: 0 };

      const targetPosition = {
        top: targetBoundingClientRect.top + targetTranslate.y - scrollDelta.top,
        left: targetBoundingClientRect.left + targetTranslate.x - scrollDelta.left
      };

      const shouldAdjustForSize = prevIndex < newIndex;
      const sizeAdjustment = {
        x: shouldAdjustForSize && this.axis.x ? targetNode.offsetWidth - this.width : 0,
        y: shouldAdjustForSize && this.axis.y ? targetNode.offsetHeight - this.height : 0
      };

      this.handleSortMove({
        pageX: targetPosition.left + sizeAdjustment.x,
        pageY: targetPosition.top + sizeAdjustment.y,
        ignoreTransition: shift === 0
      });
    };

    keyDrop = event => {
      this.handleSortEnd(event);

      if(this.initialFocusedNode) {
        this.initialFocusedNode.focus();
      }
    };

    handleKeyEnd = event => {
      if(this.manager.active) {
        this.keyDrop(event);
      }
    };

    isValidSortingTarget = event => {
      const { useDragHandle } = this.props;
      const { target } = event;
      const node = closest(target, el => el.sortableInfo != null);

      return node && node.sortableInfo && !node.sortableInfo.disabled && (useDragHandle ? isSortableHandle(target) : target.sortableInfo);
    };

    render() {
      const ref = config.withRef ? this.wrappedInstance : null;

      return h(SortableContext.Provider, { value: this.sortableContextValue }, [h(WrappedComponent, { ref, ...omit(this.props, omittedProps) })]);
      /*return (
        <SortableContext.Provider value={this.sortableContextValue}>
        <WrappedComponent ref={ref} {...omit(this.props, omittedProps)} />
        </SortableContext.Provider>
        );*/
    }

    get helperContainer() {
      const { helperContainer } = this.props;

      if(typeof helperContainer === 'function') {
        return helperContainer();
      }

      return this.props.helperContainer || this.document.body;
    }

    get containerScrollDelta() {
      const { useWindowAsScrollContainer } = this.props;

      if(useWindowAsScrollContainer) {
        return { left: 0, top: 0 };
      }

      return {
        left: this.scrollContainer.scrollLeft - this.initialScroll.left,
        top: this.scrollContainer.scrollTop - this.initialScroll.top
      };
    }

    get windowScrollDelta() {
      return {
        left: this.contentWindow.pageXOffset - this.initialWindowScroll.left,
        top: this.contentWindow.pageYOffset - this.initialWindowScroll.top
      };
    }
  };
}

/* ------ end of './react-sortable-hoc/src/SortableContainer/index.js' ------ */

/* ------ start of './react-sortable-hoc/src/SortableElement/index.js' ------ */

export function SortableElement(WrappedComponent, config = { withRef: false }) {
  const propTypes = {
    index: PropTypes.number.isRequired,
    collection: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    disabled: PropTypes.bool
  };

  const omittedProps = Object.keys(propTypes);
  return class WithSortableElement extends React.Component {
    static displayName = provideDisplayName('SortableElement', WrappedComponent);

    static contextType = SortableContext;

    static propTypes = propTypes;

    static defaultProps = {
      collection: 0
    };

    componentDidMount() {
      this.register();
    }

    componentDidUpdate(prevProps) {
      if(this.node) {
        if(prevProps.index !== this.props.index) {
          this.node.sortableInfo.index = this.props.index;
        }

        if(prevProps.disabled !== this.props.disabled) {
          this.node.sortableInfo.disabled = this.props.disabled;
        }
      }

      if(prevProps.collection !== this.props.collection) {
        this.unregister(prevProps.collection);
        this.register();
      }
    }

    componentWillUnmount() {
      this.unregister();
    }

    register() {
      const { collection, disabled, index } = this.props;
      const node = findDOMNode(this);

      node.sortableInfo = {
        collection,
        disabled,
        index,
        manager: this.context.manager
      };

      this.node = node;
      this.ref = { node };

      this.context.manager.add(collection, this.ref);
    }

    unregister(collection = this.props.collection) {
      this.context.manager.remove(collection, this.ref);
    }

    getWrappedInstance() {
      invariant(config.withRef, 'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableElement() call');
      return this.wrappedInstance.current;
    }

    wrappedInstance = React.createRef();

    render() {
      const ref = config.withRef ? this.wrappedInstance : null;

      return h(WrappedComponent, { ref, ...omit(this.props, omittedProps) });
      //return <WrappedComponent ref={ref} {...omit(this.props, omittedProps)} />;
    }
  };
}