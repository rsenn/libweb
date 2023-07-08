import { useState } from '../preact.mjs';

export function useDrag() {
  // const state = {
  //   left: 0,
  //   top: 0
  // }
  // const [a, b] = [{left:0, top: 0}, () => {}]
  const [state, setState] = useState({
    left: 0,
    top: 0
  });

  var handleDown = e => {
    // var startX = e.clientX;
    // var startY = e.clientY;
    // let obj = e.target.getBoundingClientRect();
    // Reset the starting point
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  var handleMove = e => {
    // var newX = e.clientX;
    // var newY = e.clientY;
    // const diffX = newX;
    // const diffY = newY;
    setState({
      left: e.clientX,
      top: e.clientY
    });
  };

  var handleUp = () => {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleUp);
  }; // parseUrl

  return {
    left: state.left,
    top: state.top,
    handleDown
  };
}

function Drag() {
  const { left, top, handleDown } = useDrag();
  return preact.h(
    'div',
    {
      style: {
        left,
        top
      },
      className: 'dragable',
      onMouseDown: handleDown
    },
    'drag1'
  );
}

export default useDrag;