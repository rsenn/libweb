import React from '../../dom/preactComponent.js';
import RefreshIcon from './RefreshIcon.js';

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

export class Card extends React.Component {
  constructor() {
    super();
    this.state = {
      spin: false
    };
  }

  render() {
    const {
        image: { uid, name, size, done, abort, click, error, remove, src, upload, refresh, progress, uploading },
        ...props
      } = this.props,
      { spin } = this.state;
    return h(
      'div',
      _extends({}, props, {
        key: uid,
        className: `upload-card ${error ? '__error' : ''}`
      }),
      h(
        'div',
        {
          className: 'upload-card-name',
          onClick: click
        },
        h(
          'div',
          null,
          name,
          h(
            'div',
            {
              className: 'upload-card-size'
            },
            size
          )
        )
      ),
      h('div', {
        style: {
          backgroundImage: `url(${src})`
        },
        onClick: click,
        className: 'upload-card-image'
      }),
      !done &&
        !error &&
        uploading &&
        h(
          Fragment,
          null,
          h(
            'svg',
            {
              viewBox: '0 0 36 38',
              className: 'upload-card-progress'
            },
            h('path', {
              className: '__progress-cricle',
              style: {
                strokeDasharray: `${progress}, 100`
              },
              d: 'M18 2.5845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
            })
          ),
          h(
            'div',
            {
              className: 'upload-card-progress-count'
            },
            progress
          )
        ),
      !(done || error || uploading) &&
        h(
          'div',
          {
            onClick: upload,
            className: 'upload-card-upload-button'
          },
          h(
            'svg',
            {
              viewBox: '0 -5 32 52'
            },
            h(
              'g',
              null,
              h('polyline', {
                points: '1 19 1 31 31 31 31 19'
              }),
              h('polyline', {
                className: '__arrow',
                points: '8 9 16 1 24 9'
              }),
              h('line', {
                className: '__arrow',
                x1: '16',
                x2: '16',
                y1: '1',
                y2: '25'
              })
            )
          )
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
            className: `upload-card-refresh ${spin ? '__spin' : ''}`
          },
          h(
            'div',
            {
              style: {
                padding: 7
              }
            },
            h(RefreshIcon, null)
          )
        ),
      h(
        'div',
        {
          className: 'upload-card-remove',
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

export default Card;
