// import renderBlock from "../../services/renderBlock";

import React, { Component } from "react";
import { connect } from "react-redux";

import { setRomSettings } from "../../redux/actions/nesRomActions";
import { setClipByte } from "../../redux/actions/canvasActions";

import { renderTile } from "../../services/render";


class ChrNav extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.context = null;
    this.clip = null;
    this.clipContext = null;
    this.renderedVersion = -1;

    if(this.props.romInfo.chr && this.props.romInfo.chr.length>0) {
    this.chrSpan = {
      first: this.props.romInfo.chr[0],
      len: 8192 * this.props.romInfo.chr.length
    };
  }

    this.state = {
      height: 9 * (this.chrSpan.len / 128),
      romCheckupDone: false
    };

    console.log("CHRNAV was created");

    document
      .getElementsByTagName("body")[0]
      .addEventListener("mousemove", event => {
        const clip = document.getElementById("clip");
        clip.style.top = event.clientY + "px";
        clip.style.left = event.clientX + "px";
      });
  }
  drawCHR(colors = this.props.colors) {
    const correctX = this.chrSpan.first % 128;

    // Havn't figuered out why context is forgotten...
    this.context = this.context.hasOwnProperty("fillStyle") ? this.context : this.canvas.getContext("2d");


    for (
      let i = this.chrSpan.first;
      i < this.chrSpan.first + this.chrSpan.len;
      i += 16
    ) {
      const corrected = i - correctX;
      const x = corrected % 128;
      const y = Math.floor((corrected - this.chrSpan.first + 16) / 128);
      this.props.renderTile(
        i,
        this.props.romData,
        x / 2 + x / 16,
        y * 9,
        this.context,
        1,
        colors
      );
    }
  }

  render() {
    console.log("Made CHR", this.renderedVersion, this.props.version);
    this.renderedVersion = this.props.version;
    return (
      <div id="chr-nav" onClick={this.copyChrToClip}>
        <h4>CHR-Rom</h4>
        <canvas id="chr-canvas" width={9 * 8 - 1} height={this.state.height} />
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    let colorChange = this.props.colors.reduce((changed, value, index)=>{ return changed || value!==nextProps[index];}, false);
    if(colorChange && this.canvas){
      /*console.log(this);
      this.canvas = document.getElementById("chr-canvas");
      this.clip = document.getElementById("clip");
      this.clipContext = document.getElementById("clip").getContext("2d");*/
      this.drawCHR(nextProps.colors);
    }

    return this.props.version !== this.renderedVersion;
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  copyChrToClip = event => {
    const rect = this.canvas.getBoundingClientRect();
    const scale = rect.width / this.canvas.offsetWidth;
    const gridCoordinates = {
      x: Math.floor((event.clientX - rect.left) / (scale * 9)), // 9 becase 8x8 block + 1 pixel space
      y: Math.floor((event.clientY - rect.top) / (scale * 9))
    };
    const byteIndex =
      this.chrSpan.first + 16 * (gridCoordinates.x + gridCoordinates.y * 8); // 16 bytes per block, and every new row is another 8 blocks
    this.clip.style.display = "block";
    this.props.setClipByte(byteIndex);
    this.props.renderTile(
      byteIndex,
      this.props.romData,
      0,
      0,
      this.clipContext,
      1,
      this.props.colors
    );
  };
  componentDidUpdate() {
    console.log("RENDER CHR");
    this.canvas = document.getElementById("chr-canvas");
    this.context = this.canvas.getContext("2d");
    this.clip = document.getElementById("clip");
    this.clipContext = document.getElementById("clip").getContext("2d");
    this.drawCHR();
  }
}

const mapStateToProps = state => {
  return {
    ...state.nesRomReducer,
    colors: state.drawReducer.colors,
    md5: state.nesRomReducer.md5,
    version: state.nesRomReducer.version,
    romInfo: state.nesRomReducer.romInfo
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setClipByte: byteIndex => {
      dispatch(setClipByte(byteIndex));
    },
    setRomSettings: romSettings => {
      dispatch(setRomSettings(romSettings));
    },
    renderTile: (...args) => {
      dispatch(renderTile(...args))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChrNav);
