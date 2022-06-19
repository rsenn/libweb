import React from "react";
import DropArea from "./DropArea.js";

export default (options, { handle }) => (
  <DropArea>
    {isDrag => (
      <div className={`upload-handle ${isDrag ? "__dragging" : ""}`}>
        <svg viewBox='0 -5 32 52' className='upload-handle-icon'>
          <g>
            <polyline points='1 19 1 31 31 31 31 19' />
            <polyline className='__arrow' points='8 9 16 1 24 9' />
            <line className='__arrow' x1='16' x2='16' y1='1' y2='25' />
          </g>
        </svg>

        <div className='upload-handle-info'>
          {typeof handle === "function" ? (
            handle(options)
          ) : (
            <React.Fragment>
              <div className='upload-handle-drop-text'>Drag and drop Images Here to Upload</div>

              <span>Or</span>

              <div onClick={options.openDialogue} className='upload-handle-button'>
                Select Images to Upload
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    )}
  </DropArea>
);
