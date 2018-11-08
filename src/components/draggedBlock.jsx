// import renderBlock from "../services/renderBlock";
// import NesIO from "../services/nesIO";
import React, { Component } from "react";
import { connect } from "react-redux";
import { dropBlock } from "../redux/actions/canvasActions";

class DraggedBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
        width: props.width,
        height: props.height
    }
  }

  render() {      
    
    return (
        <canvas id="clip" width="8px" height="8px" onClick={this.clicked}></canvas>
    );
  }

  clicked = (event) => {
    console.log(this.props);
    const canvas = document.getElementById("clip")
    canvas.style.display = "none";
    canvas.style.transform = `scale(${this.state.scale})`;
    this.props.dropBlock({ x: event.clientX, y: event.clientY }, this.props.romData, this.props.clipByte, this.props.colors);
    // Kör dispatch dropBlock({e.x, e,y}, this.props.byteIndex)
    }

}


const mapStateToProps = state => {
  return { ...state.canvasReducer, romData: state.nesRomReducer.romData, colors: state.drawReducer.colors, scale: state.drawReducer.scale };
};

const mapDispatchToProps = dispatch => {
  return {
    dropBlock: (globalCoords, romData, byteIndex, colors) => {
      dispatch(dropBlock(globalCoords, romData, byteIndex, colors));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DraggedBlock);