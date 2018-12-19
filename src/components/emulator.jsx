import React, { Component } from "react";
import { connect } from "react-redux";
import * as jsnes from "jsnes";

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

class Emulator extends Component {

  render() {
    return <div id="emulator-page" className="row">
        <div class="tv">
          <canvas id="screen" className="Screen" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} onMouseDown={this.handleMouseDown} onMouseUp={this.props.onMouseUp} ref={canvas => {
              this.canvas = canvas;
            }} />
        </div>
        <div class="container with-title is-center">
          <p class="title">Emulator</p>
          <p>
            The nes emulation is provided by jsnes
            (https://github.com/bfirsh/jsnes). You should check it out!
          </p>
        </div>
      </div>;
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    console.log("component update");
    if (this.props.romVersion < 1) {
      return false;
    }

    //const binary = new TextDecoder("utf-8").decode(this.props.romData);
    // const binary = String.fromCharCode.apply( this.props.romData.buffer );

    /*const binary = String.fromCharCode.apply(
          null,
          this.props.romData.buffer
      );*/
    const binary = String.fromCharCode.apply(
      null,
      new Uint8Array(this.props.romData.buffer)
    );

    const canvas = document.getElementById("screen");

    if (!canvas) {
      console.log("WAIT");
      setTimeout(() => {
        this.componentDidUpdate();
      }, 1000);
      return;
    }
    console.log("YES");

    this.ctx = canvas.getContext("2d");

    // Allocate framebuffer array.
    this.image = this.ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const buffer = new ArrayBuffer(this.image.data.length);
    this.framebuffer_u8 = new Uint8ClampedArray(buffer);
    this.framebuffer_u32 = new Uint32Array(buffer);

    this.nes = new jsnes.NES({
      onFrame: framebuffer_24 => {
        for (var i = 0; i < FRAMEBUFFER_SIZE; i++)
          this.framebuffer_u32[i] = 0xff000000 | framebuffer_24[i];
      }
    });

    this.nes.loadROM(binary);

    // this.nes.stop = () => { };

    //  this.nes.frame()

    // console.log(this.nes);
    this.onAnimationFrame();
    return true;
  }

  onAnimationFrame = () => {
    window.requestAnimationFrame(this.onAnimationFrame);
    this.image.data.set(this.framebuffer_u8);
    this.ctx.putImageData(this.image, 0, 0);
    this.nes.frame();
  };

  drawBuffer(frameBuffer) {
    const color = [
      "#7C7C7C",
      "#0000FC",
      "#0000BC",
      "#4428BC",
      "#940084",
      "#A80020",
      "#A81000",
      "#881400",
      "#503000",
      "#007800",
      "#006800",
      "#005800",
      "#004058",
      "#000000",
      "#000000",
      "#000000",
      "#BCBCBC",
      "#0078F8",
      "#0058F8",
      "#6844FC",
      "#D800CC",
      "#E40058",
      "#F83800",
      "#E45C10",
      "#AC7C00",
      "#00B800",
      "#00A800",
      "#00A844",
      "#008888",
      "#000000",
      "#000000",
      "#000000",
      "#F8F8F8",
      "#3CBCFC",
      "#6888FC",
      "#9878F8",
      "#F878F8",
      "#F85898",
      "#F87858",
      "#FCA044",
      "#F8B800",
      "#B8F818",
      "#58D854",
      "#58F898",
      "#00E8D8",
      "#787878",
      "#000000",
      "#000000",
      "#FCFCFC",
      "#A4E4FC",
      "#B8B8F8",
      "#D8B8F8",
      "#F8B8F8",
      "#F8A4C0",
      "#F0D0B0",
      "#FCE0A8",
      "#F8D878",
      "#D8F878",
      "#B8F8B8",
      "#B8F8D8",
      "#00FCFC",
      "#F8D8F8",
      "#000000",
      "#000000"
    ];
    frameBuffer[1] = Math.floor(color.length * Math.random());
    const scale = 1;
    const X = 0;
    const Y = 0;

    for (let y = 0; y < 240; y++) {
      for (let x = 0; x < 256; x++) {
        this.ctx.fillStyle = color[frameBuffer[y * 256 + x]];
        this.ctx.fillRect((X + x) * scale, (Y + y) * scale, scale, scale);
      }
    }
  }
}

const mapStateToProps = state => {
  return {
    romData: state.nesRomReducer.romData,
    md5: state.nesRomReducer.md5,
    version: state.nesRomReducer.version
  };
};

export default connect(mapStateToProps)(Emulator);
