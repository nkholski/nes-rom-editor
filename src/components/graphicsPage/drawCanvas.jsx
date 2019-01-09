
import React, { Component } from "react";
import { connect } from "react-redux";
import { renderBlocks, flipBlock } from "../../redux/actions/canvasActions";
import { putPixel } from "../../redux/actions/nesRomActions";

class DrawCanvas extends Component {
   
  render() {
    
    const { width, height, scale, compositionName } = this.props;
    return (
      <div id="draw-canvas-container" className={this.props.mode}>
      <canvas
        id="draw-canvas"
        data-composition-name={compositionName}
        width={8 * scale * width}
        height={8 * scale * height}
        onClick={this.manipulate}
      />
      </div>
    );
  }



  componentDidMount(){
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if(!this.props.romData || this.props.romData.length === 0){
      return;
    }
    this.props.renderBlocks(this.props.romData, this.props.colors);
  }

  shouldComponentUpdate(nextProps) {
    console.log("COLORS???",this.props.colors, nextProps.colors)
    let shouldUpdate = false;
    ["width", "height", "scale", "compositionName"].forEach(property => {
      if(this.props[property] !== nextProps[property]){
        shouldUpdate = true;
      }
    });
    if(shouldUpdate) {
      return true;
    }
    this.props.renderBlocks(this.props.romData, nextProps.colors);
    return false;
  }

  manipulate = event => {
    const { scale } = this.props;
    const x = event.clientX;
    const y = event.clientY;
    const canvas = document.getElementById("draw-canvas");
    const rect = canvas.getBoundingClientRect();
    const gridCoordinates = {
      x: Math.floor((x - rect.left) / (scale * 8)),
      y: Math.floor((y - rect.top) / (scale * 8))
    };

    if (this.props.mode !== "draw") {
      this.props.flipBlock(gridCoordinates.x, gridCoordinates.y, this.props.mode);
      this.props.renderBlocks(this.props.romData, this.props.colors);
    }
    else {
      const pixelCoordinates = {
        x: Math.floor((x - rect.left) / scale) % 8,
        y: Math.floor((y - rect.top) / scale) % 8
      };
      this.putPixel(gridCoordinates.x, gridCoordinates.y,pixelCoordinates.x,pixelCoordinates.y);
    }


  }
  

  putPixel = (X,Y,x,y) => {
    const block = this.props.blocks[X][Y];
    
    // No byte in grid, just return
    if (!block) {
      return;
    }
    const byteIndex = block.byteIndex;

    if(block.flipX) {
      x = 7-x;
    }
    if(block.flipY) {
      y = 7-y;
    }

    this.props.putPixel(
      byteIndex,
      x,
      y,
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
    compositionName: state.canvasReducer.compositionName,
    romData: state.nesRomReducer.romData,
    colors: state.drawReducer.colors,
    activeColorIndex: state.drawReducer.activeColorIndex,
    mode: state.drawReducer.mode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    renderBlocks: (romData, colors) => {
      dispatch(renderBlocks(romData, colors));
    },
    putPixel(byteIndex, x, y, colorIndex) {
      dispatch(putPixel(byteIndex, x, y, colorIndex));
    },
    flipBlock(x,y,dir) {
      dispatch(flipBlock(x,y,dir));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawCanvas);
