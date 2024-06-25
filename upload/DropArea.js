import React from '../dom/preactComponent.js';
import PropTypes from '../prop-types.js';
import Context from './Context.js';
import { getEventFiles } from './Utils.js';
function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for(var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for(var key in source) {
          if(Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

export class DropArea extends React.Component {
  constructor() {
    super();
    this.onDrop = this.onDrop.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.state = {
      isDrag: false,
      rejected: false
    };
    this.dragCounter = 0;
  }

  onDrop(event) {
    const { onDrop, uploadFiles } = this.props;
    this.dragCounter = 0;
    event.preventDefault();
    event.stopPropagation();
    const files = [...getEventFiles(event)];
    this.setState({
      isDrag: false
    });
    uploadFiles(files);
    onDrop(event);
  }

  onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onDragOver(event);
  }

  onDragEnter(event) {
    const items = [...event.dataTransfer.items];
    this.setState({
      isDrag: items.length > 0
    });
    this.dragCounter++;
    this.props.onDragEnter(event);
  }

  onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;

    if(this.dragCounter === 0) {
      this.setState({
        isDrag: false
      });
    }

    this.props.onDragLeave(event);
  }

  render() {
    const { children } = this.props,
      { isDrag } = this.state;
    return h(
      'div',
      {
        onDrop: this.onDrop,
        onDragOver: this.onDragOver,
        onDragEnter: this.onDragEnter,
        onDragLeave: this.onDragLeave
      },
      children(isDrag)
    );
  }
}

const func = () => {};

DropArea.defaultProps = {
  onDrop: func,
  onDragOver: func,
  onDragEnter: func,
  onDragLeave: func
};
DropArea.propTypes = {
  onDrop: PropTypes.func,
  onDragOver: PropTypes.func,
  onDragEnter: PropTypes.func,
  onDragLeave: PropTypes.func
};

export default props => h(Context.Consumer, null, values => h(DropArea, _extends({}, props, values)));
