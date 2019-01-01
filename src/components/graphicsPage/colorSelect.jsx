import React from "react";

export default function ColorSelect(props) {
  const selectPalette = props.edit ? <div className="palette" onClick={()=>props.edit(props.colorIndex)}>Edit</div> : null;
  let className = "color";
  className += props.selected ? " selected" : "";

  let NEScolorIndex;
  if(isNaN(props.color)){
    console.log("color nan",props.color);
    Object.keys(props.palette).some((hexcolor, i) => {  if(props.palette[hexcolor] === props.color){NEScolorIndex = i; return true} })
  }
  else {
    NEScolorIndex = props.color;
  }

  const style = {
    backgroundColor: props.palette[NEScolorIndex]
  };


  let hexString = NEScolorIndex.toString(16).toUpperCase();
  hexString = hexString.length % 2 ? "0"+hexString : hexString;

  return (
    
    <div className="color-control">
      <div className={className} style={style} onClick={()=>props.callback(props.colorIndex)}>{hexString}</div>
      {selectPalette}
    </div>
  );
}
