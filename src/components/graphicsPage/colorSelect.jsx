import React from "react";

export default function ColorSelect(props) {
  const selectPalette = <div className="palette" onClick={()=>props.showPaletteModal(props.colorIndex)}>Edit</div>;
  let className = "color";
  className += props.selected ? " selected" : "";




  const style = {
    backgroundColor: props.color
  };

  let NEScolorIndex;
  Object.keys(props.palette).some((hexcolor, i) => { console.log(hexcolor, i); if(props.palette[hexcolor] === props.color){NEScolorIndex = i; return true} })


  let hexString = NEScolorIndex.toString(16).toUpperCase();
  hexString = hexString.length % 2 ? "0"+hexString : hexString;

  return (
    
    <div className="color-control">
      <div className={className} style={style} onClick={()=>props.setActiveColor(props.colorIndex)}>{hexString}</div>
      {selectPalette}
    </div>
  );
}
