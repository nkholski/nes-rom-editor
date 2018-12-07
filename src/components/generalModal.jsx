import React from "react";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";

export default function GeneralModal(props) {
 // let compositions;

  return (
    <Modal
      isOpen={props.isOpen}
    >
      <ModalHeader>{props.title}</ModalHeader>
      <ModalBody>
        {props.body}
      </ModalBody>
      <ModalFooter>
        <Button color ="primary" onClick={()=>{ props.close() }}>
          Ok
        </Button>{" "}
       
      </ModalFooter>
    </Modal>
  );
}
