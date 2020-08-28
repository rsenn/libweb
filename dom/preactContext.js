(function (root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['tslib', 'preact'], factory);
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory(require('tslib'), require('preact'));
  } else {
    root.plotCv = factory(root.tslib, root.preact);
  }
})(typeof self !== 'undefined' ? self : this, (tslib, preact) =>
  (function (contextFactory, tslib, preact, contextValueEmitterFactory, utilsFactory) {
    let utilsExports = utilsFactory();
    let contextValueEmitterExports = contextValueEmitterFactory();
    return contextFactory(tslib, preact, contextValueEmitterExports, utilsExports);
  })((tslib, preact, contextValueEmitter, utils) => {
      let __extends = tslib.__extends,
        h = preact.h,
        Component = preact.Component,
        createEmitter = contextValueEmitter.createEmitter,
        noopEmitter = contextValueEmitter.noopEmitter,
        getOnlyChildAndChildren = utils.getOnlyChildAndChildren;
      function getRenderer(props) {
        let child = getOnlyChildAndChildren(props).child;

        return child || ('render' in props && props.render);
      }
      let MAX_SIGNED_31_BIT_INT = 1073741823;
      let defaultBitmaskFactory = function () {
        return MAX_SIGNED_31_BIT_INT;
      };
      let ids = 0;
      function _createContext(value, bitmaskFactory) {
        let key = '_preactContextProvider-' + ids++;
        let Provider = (function (_super) {
          __extends(Provider, _super);
          function Provider(props) {
            let _this = _super.call(this, props) || this;
            _this._emitter = createEmitter(props.value, bitmaskFactory || defaultBitmaskFactory);
            return _this;
          }
          Provider.prototype.getChildContext = function () {
            let _a;
            return (_a = {}), (_a[key] = this._emitter), _a;
          };
          Provider.prototype.componentDidUpdate = function () {
            this._emitter.val(this.props.value);
          };
          Provider.prototype.render = function () {
            let _a = getOnlyChildAndChildren(this.props),
              child = _a.child,
              children = _a.children;
            if(child) {
              return child;
            }

            return h('span', null, children);
          };
          return Provider;
        })(Component);
        let Consumer = (function (_super) {
          __extends(Consumer, _super);
          function Consumer(props, ctx) {
            let _this = _super.call(this, props, ctx) || this;
            _this._updateContext = function (value, bitmask) {
              let unstable_observedBits = _this.props.unstable_observedBits;
              let observed = unstable_observedBits === undefined || unstable_observedBits === null ? MAX_SIGNED_31_BIT_INT : unstable_observedBits;
              observed = observed | 0;
              if((observed & bitmask) === 0) {
                return;
              }
              _this.setState({ value });
            };
            _this.state = { value: _this._getEmitter().val() || value };
            return _this;
          }
          Consumer.prototype.componentDidMount = function () {
            this._getEmitter().register(this._updateContext);
          };
          Consumer.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return this.state.value !== nextState.value || getRenderer(this.props) !== getRenderer(nextProps);
          };
          Consumer.prototype.componentWillUnmount = function () {
            this._getEmitter().unregister(this._updateContext);
          };
          Consumer.prototype.componentDidUpdate = function (_, __, prevCtx) {
            let previousProvider = prevCtx[key];
            if(previousProvider === this.context[key]) {
              return;
            }
            (previousProvider || noopEmitter).unregister(this._updateContext);
            this.componentDidMount();
          };
          Consumer.prototype.render = function () {
            let render = 'render' in this.props && this.props.render;
            let r = getRenderer(this.props);
            if(render && render !== r) {
              console.warn('Both children and a render function are defined. Children will be used');
            }
            if(typeof r === 'function') {
              return r(this.state.value);
            }
            console.warn("Consumer is expecting a function as one and only child but didn't find any");
          };
          Consumer.prototype._getEmitter = function () {
            return this.context[key] || noopEmitter;
          };
          return Consumer;
        })(Component);
        return {
          Provider,
          Consumer
        };
      }

      let $default = _createContext;
      let createContext = _createContext;
      return { createContext, default: $default };
    },
    tslib,
    preact,
    () => {
      function createEmitter(initialValue, bitmaskFactory) {
        let registeredUpdaters = [];
        let value = initialValue;
        let diff = function (newValue) {
          return bitmaskFactory(value, newValue) | 0;
        };
        return {
          register(updater) {
            registeredUpdaters.push(updater);
            updater(value, diff(value));
          },
          unregister(updater) {
            registeredUpdaters = registeredUpdaters.filter((i) => i !== updater);
          },
          val(newValue) {
            if(newValue === undefined || newValue == value) {
              return value;
            }
            let bitmask = diff(newValue);
            value = newValue;
            registeredUpdaters.forEach((up) => up(newValue, bitmask));
            return value;
          }
        };
      }
      let noopEmitter = {
        register(_) {
          console.warn('Consumer used without a Provider');
        },
        unregister(_) {},
        val(_) {}
      };
      return { createEmitter, noopEmitter };
    },
    () => {
      function getOnlyChildAndChildren(props) {
        let children = props.children;
        let child = children.length === 1 ? children[0] : null;
        return { child, children };
      }
      return { getOnlyChildAndChildren };
    }
  )
);
