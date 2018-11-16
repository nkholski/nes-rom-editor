import React from "react";
import { connect } from "react-redux";

import { setPalette } from "./redux/actions/drawActions";
import { setRomInfoIndex, storeRom } from "./redux/actions/nesRomActions";

import ChrNav from "./components/chrNav";
import DrawCanvas from "./components/drawCanvas";
import DrawControls from "./components/drawControls";
import RomHacks from "./components/romHacks";

import { Button } from "reactstrap";

import DownloadNes from "./services/downloadNes"

import NesIO from "./services/nesIO";

import "./App.css";
import "./bootstrap-cyborg.min.css";
import DraggedBlock from "./components/draggedBlock";

// http://datomatic.no-intro.org/index.php?page=download&fun=dat

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      page: "editor"
    }
    fetch("/files/NESPalette.json")
        .then(response => response.json())
        .then(palette => {
          this.props.setPalette(palette);
          this.setState({ready: true});
        });
    fetch("/rom-info/index.json")
        .then(response => response.json())
        .then(romInfo => {
          this.props.setRomInfoIndex(romInfo)
        });
    fetch("/files/nesgames.dat")
      .then(res => res.text())
      .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
      .then(nesgames => {
        // this.
        /* window.nes = nesgames;
        nes.querySelectorAll('[md5="7F7A89EF806464338B1722C120648E7D"]')[0].parentElement.getAttribute("name")
        */
        // console.log("res", nesgames);
      });


   /// return new Promise(resolve => { let i = new Image(); i.onload = () => { resolve(i) }; i.src = url; });
    
    


    fetch("/screenshot-source.png")
    .then(res => new Image(res))
    .then(img => {
      // console.log("img",img);
      /*
      const tmpCanvas = document.createElement("canvas");
      const tmpCtx = tmpCanvas.getContext("2d");

      let imageStr = '';
      const bytes = [].slice.call(new Uint8Array(buffer));

      bytes.forEach(b => (imageStr += String.fromCharCode(b)));

      imageStr = window.btoa(imageStr);

      const base64Flag = 'data:image/jpeg;base64,';
      //const imageStr = arrayBufferToBase64(buffer);
      const img = base64Flag + imageStr;*/

     //  tmpCtx.drawImage(img, 0, 0, img.width, img.height);


    });


    const nesIO = new NesIO();
    nesIO.loadFile("/files/smb.nes").then((romData) => {
      console.log("LOAD", romData);
      this.props.storeRom(romData, nesIO.chrSpan);
      console.log("OK");
      /*this.chrSpan = nesIO.chrSpan;
      // const width = 9 * 8; // Eight block wide, line between*/
      /*this.setState({
        height: 9 * (nesIO.chrSpan.len / 128)
      });*/

      // OH. It's Mario
      /*fetch("/rom-info/games/Super Mario Bros.json").then(data => data.json()).then(data => {
        // Convert all string-hex numbers to decimal ints
        this.props.setRomSettings(data);
      });*/

    });

    // TEST
    // row = [1,0,3,1,2,0,1,2];


    //console.log("Varianter:", colorToIndex.length);  


  }


  render() {
    if(!this.state.ready || this.props.romVersion<1){
      return <div>Loading...</div>;
    }


    let currentPage = "";
    
    switch(this.state.page){
      case "romhacks":
        currentPage = <RomHacks type="hacks" />;
        break;
      case "palette":
        currentPage = <RomHacks type="palette"/>;
        break;
      default:
        currentPage = <div className="col-md-8">
          <div id="draw-canvas-container"><DrawCanvas /></div>
          <DrawControls />
          new canvas,
          load canvas
          save canvas
        </div>;
    }


  return(<div id="app">
    <DraggedBlock/>
    <div className="row">
      <div className="col-md-12">
        <h1>NES Edit</h1>
      </div>
    </div>
    <div className="row">
      <div className="col-md-4">
        <ChrNav />
      </div>
      { currentPage }
    </div>
    <div className="row">
      <div className="col-md-4">
        Show all ROM
        Load .nes
        <Button onClick={this.download}>Download .nes</Button>
        Download .nes
        Identify game
      </div>
      <div className="col-md-8">
        
        <Button onClick={() => this.page("editor")}>Graphics editor</Button> | Palette editor | .nes Info | <Button onClick={()=>this.page("romhacks")}>Rom hacks</Button>

      </div>
    </div>
  </div>);
  }

  page(pg) {
    this.setState({page: pg});
  }

  download = () => {
    console.log(this.props);
    DownloadNes("hack.nes", this.props.romData);
  }
}

const mapStateToProps = state => {
  return { nesRomReducer: state.nesRomReducer, canvasReducer: state.canvasReducer, romData: state.nesRomReducer.romData, romVersion: state.nesRomReducer.version };
};

const mapDispatchToProps = dispatch => {
  return {
    setPalette: palette => {
      dispatch(setPalette(palette));
    },
    setRomInfoIndex: romInfoIndex => {
      dispatch(setRomInfoIndex(romInfoIndex));
    },
    storeRom: (romData, chrSpan) => {
      dispatch(storeRom(romData, chrSpan));
    },
    /*,
    setGameList: gameList => {
      dispatch(setGameList(gameList));
    }  */
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
