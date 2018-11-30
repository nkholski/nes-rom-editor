import React from "react";
import { connect } from "react-redux";

import { setPalette } from "./redux/actions/drawActions";
import { setPresetCompositions } from "./redux/actions/canvasActions";
import { setRomInfoIndex, storeRom } from "./redux/actions/nesRomActions";

import ChrNav from "./components/chrNav";
import DrawCanvas from "./components/drawCanvas";
import DrawControls from "./components/drawControls";
import RomHacks from "./components/romHacks";
import GeneralModal from "./components/generalModal";
import ImportImage from "./components/importImage";

import { Button } from "reactstrap";

import DownloadNes from "./services/downloadNes";

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
      md5: null,
      page: "",
      modal: {
        isOpen: false,
        title: null,
        body: null
      }
    };
    fetch("/files/NESPalette.json")
      .then(response => response.json())
      .then(palette => {
        this.props.setPalette(palette);
        this.setState({ ready: true });
      });
    fetch("/rom-info/index.json")
      .then(response => response.json())
      .then(romInfo => {
        this.props.setRomInfoIndex(romInfo);
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
    nesIO.loadFile("/files/smb.nes").then(romData => {
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
    if (!this.state.ready || this.props.romVersion < 1) {
      return <div>Loading...</div>;
    }

    let currentPage = "";

    switch (this.state.page) {
      case "importImage":
        currentPage = <ImportImage/>;
        break;
      case "romhacks":
        currentPage = <RomHacks type="hacks" />;
        break;
      case "palette":
        currentPage = <RomHacks type="palette" />;
        break;
      default:
        currentPage = (
          <div className="col-md-8">
            <DrawControls />
            new canvas, load canvas save canvas
          </div>
        );
    }

    const { modal } = this.state;

    return (
      <div id="app">
        <DraggedBlock />
        <GeneralModal
          isOpen={modal.isOpen}
          title={modal.title}
          body={modal.body}
          close={() => {
            const modal = this.state.modal;
            modal.isOpen = false;
            this.setState({ modal });
          }}
        />
        <div className="row">
          <div className="col-md-12">
            <h1>NES Edit</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ChrNav />
          </div>
          {currentPage}
        </div>
        <div className="row">
          <div className="col-md-4">
            Show all ROM Load .nes
            <Button onClick={this.download}>Download .nes</Button>
            Download .nes Identify game
          </div>
          <div className="col-md-8">
            <Button onClick={() => this.page("editor")}>Graphics editor</Button>{" "}
            | Palette editor | .nes Info |{" "}
            <Button onClick={() => this.page("romhacks")}>Rom hacks</Button>
          </div>
        </div>
      </div>
    );
  }

  page(pg) {
    this.setState({ page: pg });
  }

  download = () => {
    console.log(this.props);
    DownloadNes("hack.nes", this.props.romData);
  };

  componentDidUpdate() {
    if (
      this.state.md5 !== this.props.md5 &&
      this.props.md5 &&
      this.props.romInfoIndex
    ) {
      // A new rom was loaded. Let's see if we can find out anything about it.
      this.getRomSpecificStuff();
      this.setState({ md5: this.props.md5 });
    }
  }

  getRomSpecificStuff(){
    if (this.props.romInfoIndex.md5.hasOwnProperty(this.props.md5)) {
      const romFile = this.props.romInfoIndex.md5[this.props.md5];
      fetch("/rom-info/games/" + romFile + ".json")
        .then(res => res.json())
        .then(res => {
          // Crawl tree
          const counter = obj => {
            console.log("OBJ", obj);
            let cnt = 0;
            if (typeof obj[Symbol.iterator] === "function") {
              // First of array
              obj.forEach(child => {
                cnt += counter(child);
              });
            } else if (obj.hasOwnProperty("children")) {
              obj.children.forEach(child => {
                cnt += counter(child);
              });
            } else {
              cnt++;
            }
            return cnt;
          };

          let hacks = counter(res.hacks);
          let palettes = counter(res.palettes);
          let compositionCount = res.compositions.length;
          
          this.props.setPresetCompositions(res.compositions);

          this.setState({
            modal: {
              isOpen: true,
              title: "Game identified!",
              body: `The Game was identified as ${
                res.name
                }. Loaded ${compositionCount} compositions, ${hacks} hacks and ${palettes} palette connections. Happy hacking!`
            }
          });
        });
    } else {
      this.setState({
        modal: {
          isOpen: true,
          title: "Rom not recognized",
          body:
            "Couldn't identify the game. No information on palettes, hacks or compositions. You're own your own. (This is normal for the vast majority of roms)"
        }
      });
    }
  }

}

const mapStateToProps = state => {
  return {
    nesRomReducer: state.nesRomReducer,
    canvasReducer: state.canvasReducer,
    romData: state.nesRomReducer.romData,
    romVersion: state.nesRomReducer.version,
    md5: state.nesRomReducer.md5,
    romInfoIndex: state.nesRomReducer.romInfoIndex
  };
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
    setPresetCompositions: (compositions) => {
      dispatch(setPresetCompositions(compositions));
    }
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
