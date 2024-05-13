import React from '../../dom/preactComponent.js';
import RefreshIcon from './RefreshIcon.js';
import UploadIcon from './UploadIcon.js';
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
export class List extends React.Component {
  constructor() {
    super();
    this.state = {
      spin: false
    };
  }

  render() {
    const {
        image: {
          uid,
          name,
          size,
          done,
          abort,
          click,
          error,
          remove,
          src,
          upload,
          refresh,
          progress,
          uploading
        },
        ...props
      } = this.props,
      { spin } = this.state,
      showProgress = !done && !error ? '__active' : '';
    return h(
      'div',
      _extends({}, props, {
        key: uid,
        className: 'upload-list'
      }),
      uploading &&
        h('div', {
          className: `upload-list-progress ${showProgress}`,
          style: {
            width: `${progress}%`
          }
        }),
      uploading &&
        h(
          'span',
          {
            className: `upload-list-progress-count ${showProgress}`
          },
          progress || 0,
          '%'
        ),
      !(done || error || uploading) &&
        h(
          'div',
          {
            onClick: upload,
            className: 'upload-list-upload-button'
          },
          h(UploadIcon, null)
        ),
      error &&
        typeof refresh === 'function' &&
        h(
          'div',
          {
            onClick: () => {
              if(spin) return;
              this.setState({
                spin: true
              });
              setTimeout(() => {
                this.setState({
                  spin: false
                });
                refresh();
              }, 700);
            },
            className: `upload-list-refresh ${spin ? '__spin' : ''}`
          },
          h(
            'div',
            {
              style: {
                padding: 3
              }
            },
            h(RefreshIcon, null)
          )
        ),
      h(
        'div',
        {
          className: 'upload-list-image',
          onClick: click
        },
        h('img', {
          src: src,
          alt: name
        })
      ),
      h(
        'div',
        {
          className: 'upload-list-content',
          onClick: click
        },
        h(
          'div',
          {
            className: 'upload-list-name'
          },
          name
        ),
        h(
          'div',
          {
            className: 'upload-list-size'
          },
          size
        )
      ),
      h(
        'div',
        {
          className: 'upload-list-remove',
          onClick: remove
        },
        h(
          'svg',
          {
            viewBox: '0 0 40 40'
          },
          h('path', {
            stroke: 'current',
            strokeLinecap: 'round',
            strokeWidth: '4',
            d: 'M 10,10 L 30,30 M 30,10 L 10,30'
          })
        )
      )
    );
  }
}

export default List;
