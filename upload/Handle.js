import React from '../dom/preactComponent.js';
import DropArea from './DropArea.js';

export const Handle = (options, { handle }) =>
  h(DropArea, null, isDrag =>
    h(
      'div',
      {
        className: `upload-handle ${isDrag ? '__dragging' : ''}`
      },
      h(
        'svg',
        {
          viewBox: '0 -5 32 52',
          className: 'upload-handle-icon'
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
      ),
      h(
        'div',
        {
          className: 'upload-handle-info'
        },
        typeof handle === 'function'
          ? handle(options)
          : h(
              React.Fragment,
              null,
              h(
                'div',
                {
                  className: 'upload-handle-drop-text'
                },
                'Drag and drop Images Here to Upload'
              ),
              h('span', null, 'Or'),
              h(
                'div',
                {
                  onClick: options.openDialogue,
                  className: 'upload-handle-button'
                },
                'Select Images to Upload'
              )
            )
      )
    )
  );

export default Handle;
