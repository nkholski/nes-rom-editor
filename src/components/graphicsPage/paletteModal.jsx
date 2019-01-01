import React from "react";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";

export default function PaletteModal(props) {
  const colors = props.palette.map((color, i)=>{
    let colorRef = props.hexColor ? color : i;
    return <div style={{backgroundColor: color}} key={i} className="palette-color-box" onClick={()=>{props.callback(props.colorIndex, colorRef)}}></div> 
  });
  let isOpen = props.isOpen;
  
  return (
    <Modal
      isOpen={isOpen}
    >
      <ModalHeader>Select palette for color #{props.colorIndex}</ModalHeader>
      <ModalBody>
        <p>
          Select a color to use for color {props.colorIndex}. Note that this won't affect the appearance in the game or alter the rom, it's just for better visualization.
          However, for some roms we do know where in the code the palette is set and give the option to push the palette to the program rom.
          Due to NES hardware limitations only 4 simultanous colors are allowed limited to the palette below. 
        </p>
        {colors}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={()=>{isOpen = false}}>
          Overwrite
            </Button>{" "}
        <Button color="secondary" /*onClick={this.toggle}*/>
          Cancel
            </Button>
      </ModalFooter>
    </Modal>
  );
}
