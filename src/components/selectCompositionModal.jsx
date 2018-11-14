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
  if(props.composition){
    compositions = props.composition.map((comp, i) => {
      return <tr key={comp.name + i} className="composition-row" onClick={() => { props.callback(props.colorIndex, 1) }}><td>{comp.name}</td><td>4 Palette links</td></tr>
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
      <ModalHeader>Select palette for color #{props.colorIndex}</ModalHeader>
      <ModalBody>
        <p>
          Select composition to edit. If palette link exists you may alter the rom palette settings from within the graphics editor.
        </p>
        <table>{compositions}</table>
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
