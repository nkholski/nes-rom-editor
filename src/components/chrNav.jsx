import renderBlock from "../services/renderBlock";
import NesIO from "../services/nesIO";

import React, { Component } from "react";
import { connect } from "react-redux";

import { storeRom } from "../redux/actions/nesRomActions";
import { setClipByte } from "../redux/actions/canvasActions";

class ChrNav extends Component {
  constructor() {
    super();
    this.canvas = null;
    this.context = null;
    this.clip = null;
    this.clipContext = null;
    this.chrSpan = null;

    const nesIO = new NesIO();
    nesIO.loadFile("/files/smb.nes").then((romData) => {
      this.props.storeRom(romData);
      this.chrSpan = nesIO.chrSpan;
      // const width = 9 * 8; // Eight block wide, line between
      this.setState({
        height: 9 * (nesIO.chrSpan.len / 128),
        md5: "673913a23cd612daf5ad32d4085e0760"
      });
    });
    this.nesIO = nesIO;
    this.state = {
      height: 0
    };

    document
      .getElementsByTagName("body")[0]
      .addEventListener("mousemove", event => {
        const clip = document.getElementById("clip");
        clip.style.top = event.clientY + "px";
        clip.style.left = event.clientX + "px";
      });
  }
  drawCHR() {
    console.log("DRAW CHR")
    const correctX = this.chrSpan.first % 128;
    for (
      let i = this.chrSpan.first;
      i < this.chrSpan.first + this.chrSpan.len;
      i += 16
    ) {
        const corrected = i-correctX;
      const x = corrected % 128;
      const y = Math.floor((corrected - this.chrSpan.first + 16) / 128);
      renderBlock(i, this.props.romData, x / 2 + x / 16, y * 9, this.context, 1, this.props.colors);
    }
  }

  render() {
    return (
      <div id="chr-nav" onClick={this.copyChrToClip}>
        <canvas id="chr-canvas" width={9 * 8 - 1} height={this.state.height} />
      </div>
    );
  }

  copyChrToClip = event => {
    const rect = this.canvas.getBoundingClientRect();
    const scale = rect.width / this.canvas.offsetWidth;
    const gridCoordinates = {
      x: Math.floor((event.clientX - rect.left) / (scale * 9)), // 9 becase 8x8 block + 1 pixel space
      y: Math.floor((event.clientY - rect.top) / (scale * 9))
    };
    const byteIndex = this.chrSpan.first + 16 * (gridCoordinates.x + gridCoordinates.y * 8); // 16 bytes per block, and every new row is another 8 blocks
    this.clip.style.display = "block";
    this.props.setClipByte(byteIndex);
    renderBlock(byteIndex, this.props.romData, 0, 0, this.clipContext, 1, this.props.colors);
  };
  componentDidUpdate() {
    if (!this.chrSpan) {
      return;
    }
    this.canvas = document.getElementById("chr-canvas");
    this.context = this.canvas.getContext("2d");
    this.clip = document.getElementById("clip");
    this.clipContext = document.getElementById("clip").getContext("2d");
    this.drawCHR();
  }
}

const mapStateToProps = state => {
  return { ...state.nesRomReducer, colors: state.drawReducer.colors };
};

const mapDispatchToProps = dispatch => {
  return {
    storeRom: romData => {
      dispatch(storeRom(romData));
    },
    setClipByte: byteIndex => {
      dispatch(setClipByte(byteIndex));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChrNav);