import React, { Component } from "react";
import { connect } from "react-redux";
import CompositionService from "../../services/compositionService";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, InputGroup, Input } from "reactstrap";

class SaveCompositionModal extends Component {
    constructor(props){
        super(props);
        this.state = {
            name: ""
        }
    }

    render(){
        console.log("props",this.props);
  let isOpen = this.props.isOpen;
  
  const composition = this.props.composition;

    return <Modal isOpen={isOpen}>
        <ModalHeader>Save composition</ModalHeader>
        <ModalBody>
          <p>
            Save current composition to be able to access it quickly when editing the rom in the future. The current composition consists of {composition.length}x{composition[0].length} blocks of 8x8 pixels.
          </p>
          <InputGroup>
                <Input placeholder="composition name (i.e. Mario, turtle or first room)" value={this.state.name} onChange={event => this.updateName(event)}/>
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={()=>this.props.close()}>                
            Cancel
          </Button> 
           <Button color="primary" /*onClick={this.toggle}*/>
            Overwrite
          </Button>
            <Button color="primary" onClick={()=>{CompositionService.save(this.state.name, composition); this.props.close();}}>
            Save as new
          </Button>
        </ModalFooter>
      </Modal>;
    }

    updateName = (event)=> {
        console.log(event, event.target, event.target.value)
        this.setState({name: event.target.value});
    }
}

const mapStateToProps = (state) => { return { composition: state.canvasReducer.blocks}};

export default connect(mapStateToProps)(SaveCompositionModal);