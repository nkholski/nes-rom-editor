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


    compositions = props.compositions.map((comp, cI) => {

      return <tr key={comp.name + cI} className="composition-row" onClick={() => {
            props.callback(cI);
          }}>
          <td>{comp.name}</td>
          <td>4 Palette links</td>
        </tr>;
    });
  }
  else {
    compositions = <tr><td>Nothing found...</td></tr>;
  }


  const isOpen = props.isOpen;
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
        <Button color ="primary" onClick={()=>{ props.callback()}}>
          Cancel
            </Button>{" "}
       
      </ModalFooter>
    </Modal>
  );
}
