import React from "react";
import classNames from "classnames";
import List from "./List.js";
import Card from "./Card.js";
import DragArea from "../DragArea.js";

const Item = (type, image) => {
  //console.log("UploadItem.render ", { type, image });
  switch (type) {
    case "card":
      return <Card image={image} />;

    case "list":
      return <List image={image} />;

    default:
  }
};

export const View = ({ type, sorting }, images) => {
  const className = `upload-items __${type} ${sorting ? "__sorting" : ""}`;

  const options = typeof sorting === "object" ? sorting : {};
  //console.log("UploadView.render ", { type, sorting, images });

  return sorting ? (
    <DragArea {...options} className={classNames(className, "upload-dragarea")}>
      {image => <div className='upload-item'>{Item(type, image)}</div>}
    </DragArea>
  ) : (
    <div className={className}>
      {images.map((image, key) => (
        <div className='upload-item' key={key}>
          {Item(type, image)}
        </div>
      ))}
    </div>
  );
};

export default View;
export { List, Card };
