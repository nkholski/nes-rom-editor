import React from "react";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";

export default function SelectCompositionModal(props) {
  let compositions;

  console.log("compprops",props)

  if(props.compositions){
    const compIds = Object.keys(props.compositions);


    compositions = compIds.map((id, i) => {
      const comp = props.compositions[id];

      return <tr key={id + i} className="composition-row" onClick={() => {
            props.callback(props.colorIndex, 1);
          }}>
          <td>{id}</td>
          <td>4 Palette links</td>
        </tr>;
    });
  }
  else {
    compositions = <tr><td>Nothing found...</td></tr>;
  }


  let isOpen = true || props.isOpen;
  return (
    <Modal
      isOpen={isOpen}
    >
      <ModalHeader>Select a composition from the list{props.colorIndex}</ModalHeader>
      <ModalBody>
        <p>
          Select composition to edit. If palette link exists you may alter the rom palette settings from within the graphics editor.
        </p>
        <table width="100%">{compositions}</table>
      </ModalBody>
      <ModalFooter>
        <Button color ="secondary" onClick={()=>{isOpen = false}}>
          Cancel
            </Button>{" "}
        <Button color="primary" /*onClick={this.toggle}*/>
          Select
            </Button>
      </ModalFooter>
    </Modal>
  );
}
