
import React, { Component } from "react";
import { connect } from "react-redux";
import { renderBlocks } from "../redux/actions/canvasActions";
import { putPixel } from "../redux/actions/nesRomActions";

class DrawCanvas extends Component {
  render() {
    const { width, height, scale } = this.props;
    return (
      <canvas
        id="draw-canvas"
        width={8 * scale * width}
        height={8 * scale * height}
        onClick={this.putPixel}
      />
    );
  }

  componentDidUpdate() {
    if(!this.props.romData || this.props.romData.length === 0){
      return;
    }
    this.props.renderBlocks(this.props.romData, this.props.colors);
  }

  putPixel = event => {
    const { scale, blocks } = this.props;
    const x = event.clientX;
    const y = event.clientY;
    const canvas = document.getElementById("draw-canvas");
    const rect = canvas.getBoundingClientRect();
    const gridCoordinates = {
      x: Math.floor((x - rect.left) / (scale * 8)),
      y: Math.floor((y - rect.top) / (scale * 8))
    };
    const byteIndex = blocks[gridCoordinates.x][gridCoordinates.y];

    console.log("grid", gridCoordinates);
    // No byte in grid, just return
    if (!byteIndex) {
      return;
    }

    // Find pixel
    const pixelCoordinates = {
      x: Math.floor((x - rect.left) / scale) % 8,
      y: Math.floor((y - rect.top) / scale) % 8
    };

    // Update CHR-rom
    this.props.putPixel(
      byteIndex,
      pixelCoordinates.x,
      pixelCoordinates.y,
      this.props.activeColorIndex
    );
    // Update draw canvas
  };
}

const mapStateToProps = state => {
  return {
    ...state.canvasReducer,
    lastAltered: state.nesRomReducer.lastAltered,
    version: state.nesRomReducer.version,
    blocks: state.canvasReducer.blocks,
    romData: state.nesRomReducer.romData,
    colors: state.drawReducer.colors,
    activeColorIndex: state.drawReducer.activeColorIndex
  };
};

const mapDispatchToProps = dispatch => {
  return {
    renderBlocks: (romData, colors) => {
      dispatch(renderBlocks(romData, colors));
    },
    putPixel(byteIndex, x, y, colorIndex) {
      dispatch(putPixel(byteIndex, x, y, colorIndex));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawCanvas);
