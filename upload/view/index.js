import React from '../../dom/preactComponent.js';
import classNames from '../../classNames.js';
import List from './List.js';
import Card from './Card.js';
import DragArea from '../DragArea.js';

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

const Item = (type, image) => {
  //console.log("UploadItem.render ", { type, image });
  switch (type) {
    case 'card':
      return h(Card, {
        image: image
      });

    case 'list':
      return h(List, {
        image: image
      });

    default:
  }
};

export const View = ({ type, sorting }, images) => {
  const className = `upload-items __${type} ${sorting ? '__sorting' : ''}`;
  const options = typeof sorting === 'object' ? sorting : {}; //console.log("UploadView.render ", { type, sorting, images });

  return sorting
    ? h(
        DragArea,
        _extends({}, options, {
          className: classNames(className, 'upload-dragarea')
        }),
        image =>
          h(
            'div',
            {
              className: 'upload-item'
            },
            Item(type, image)
          )
      )
    : h(
        'div',
        {
          className: className
        },
        images.map((image, key) =>
          h(
            'div',
            {
              className: 'upload-item',
              key: key
            },
            Item(type, image)
          )
        )
      );
};
export default View;
export { List, Card };
