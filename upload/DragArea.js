import { SortableContainer, SortableElement } from '../sortable.js';
import Context from './Context.js';
import { arrayMove } from './Utils.js';
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

const DragItem = SortableElement(({ children }) => h('div', null, children));

const SortableList = SortableContainer(({ children }) => children);

export const DragArea = props => {
  const { children, className, style } = props;
  return h(Context.Consumer, null, ({ images, setSort }) =>
    h(
      SortableList,
      _extends({}, props, {
        helperClass: 'upload-dragging-item',
        onSortEnd: ({ oldIndex, newIndex }) => {
          setSort(arrayMove(images, oldIndex, newIndex));
        },
      }),
      h(
        'div',
        {
          className: className,
          style: style,
        },
        images.map((image, key) =>
          h(
            DragItem,
            {
              key: key,
              index: key,
            },
            children(image),
          ),
        ),
      ),
    ),
  );
};

DragArea.defaultProps = {
  lockAxis: null,
  useWindowAsScrollContainer: true,
  pressDelay: 200,
  axis: 'xy',
  style: {},
};

export default DragArea;
