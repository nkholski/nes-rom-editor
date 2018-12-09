import React from "react";

export default function ColorSelect(props) {
  const selectPalette = <div className="palette" onClick={()=>props.showPaletteModal(props.colorIndex)}>Edit</div>;
  let className = "color";
  className += props.selected ? " selected" : "";

  const style = {
    backgroundColor: props.color
  };

  return (
    <div className="color-control">
      <div className={className} style={style} onClick={()=>props.setActiveColor(props.colorIndex)}/>
      {selectPalette}
    </div>
  );
}
