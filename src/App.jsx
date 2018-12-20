import React from "react";
import { connect } from "react-redux";
import Init from "./services/init";

// import { BrowserRouter as Router, Route, Link } from "react-router-dom";


import { setPalette } from "./redux/actions/drawActions";
import { setPresetCompositions } from "./redux/actions/canvasActions";
import {
  setRomInfoIndex,
  setRomInfo,
  storeRom,
  setRomSettings,
  setRomNames
} from "./redux/actions/nesRomActions";

import classnames from "classnames";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col
} from "reactstrap";

// import ChrNav from "./components/chrNav";
import RomHacks from "./components/romHacks";
import GeneralModal from "./components/generalModal";
import ImportImage from "./components/importImage";
import Emulator from "./components/emulator";
import Tools from "./components/tools";
import File from "./components/file";

// import { Button } from "reactstrap";

import DownloadNes from "./services/downloadNes";

import NesIO from "./services/nesIO";

import "./App.css";
import "nes.css/css/nes.css";
import "./tabs.css";
import "./chr-nav.css";
import "./slider.css";
import "./colors.css";
import "./draw-canvas.css";
import "./emulator.css";
import "./importImage.css";
import "./tools.css";


// import "./bootstrap-cyborg.min.css";
import DraggedBlock from "./components/graphicsPage/draggedBlock";
import GraphicsPage from "./components/graphicsPage";

// http://datomatic.no-intro.org/index.php?page=download&fun=dat

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      md5: null,
      page: "importImage",
      activeTab: "Graphics",
      modal: {
        isOpen: false,
        title: null,
        body: null
      },
      disabled: []
    };

    const init = new Init(this.props);
    init.init().then(() => {
      this.setState({ ready: true });
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
      this.props.storeRom(romData, nesIO.chrSpan);
      /*this.chrSpan = nesIO.chrSpan;
      // const width = 9 * 8; // Eight block wide, line between*/
      /*this.setState({
        height: 9 * (nesIO.chrSpan.len / 128)
      });*/

      // OH. It's Mario
      fetch("/rom-info/games/Super Mario Bros.json")
        .then(data => data.json())
        .then(data => {
          // Convert all string-hex numbers to decimal ints
          this.props.setRomSettings(data);
          this.props.setRomInfo(nesIO.romInfo);
        });
    });

    // TEST
    // row = [1,0,3,1,2,0,1,2];

    //console.log("Varianter:", colorToIndex.length);
  }

  render() {
    console.log(this.state.activeTab);
    const pageIds = ["File", "Graphics", "Palettes", "Hacks", "Emulator", "Tools", "Rom info", "Help"];
    const disabled = this.state.disabled;
    
    pageIds.forEach(page => { 
      if(page==="Help") {
        disabled[page] = true; 

      }
      else {
        disabled[page] = false; 

      }
    });
    this.setState({disabled});

    if (!this.state.ready || this.props.romVersion < 1) {
      return <div>Loading...</div>;
    }
    const tabs = pageIds.map(page => (
      <NavItem key={page}>
        <NavLink
          className={classnames({
            active: this.state.activeTab === page,
            disabled: disabled[page]
          })}
          onClick={() => {
            this.toggle(page);
          }}
          
        >
          {page}
        </NavLink>
      </NavItem>
    ));

    const pages = pageIds.map(page => {
      let pageTag;

      if(page === this.state.activeTab) {
      switch(page){
        case "File":
          pageTag = <File />;
          break;
        case "Graphics":
          pageTag = <GraphicsPage />;
          break;
        case "Hacks":
          pageTag = <RomHacks/>;
          break;
        case "Emulator":
          pageTag = <Emulator/>;
          break;
        case "Tools":
          pageTag = <Tools/>;
          break;
          case "Rom info":
          pageTag = <p>
            filename:
            prg-rom: bytes
            chr-rom: x banks x bytes || No CHR-Rom see note

            Hacks: 15
            Palette references: 10
            Compostions: 5 (20% of CHR-Rom mapped)
            Text tables: 1
            Text references: 10


            Note: This rom has no CHR-Rom which means it uses CHR-Ram. You will need to dig through PRG-Rom to manipulate GFX.
            
          </p>
          
          
          
          
    







          break;
        default:
          pageTag = <h1>{page}</h1>;
          break;
      }
      }
      else {
        // I want the page to reset render when visited
        pageTag = <div>Waiting...</div>;
      }

     
      return (
        <TabPane key={page} tabId={page}>
            {pageTag} 
        </TabPane>
      );
    });

   // return <ImportImage/>;

    return (
      <div>
        <DraggedBlock />
        <a className="github-link" href="https://github.com/nkholski/nes-rom-editor" target="_blank">
          <p className="balloon from-right">Fork me<br/>on GitHub</p>
          <i className="octocat"></i>
        </a>
        <div id="titlebar"><h1 className="main">NEStamptation</h1><span className="version">beta</span></div>
        <Nav tabs>{tabs}</Nav>
        <TabContent activeTab={this.state.activeTab}>{pages}</TabContent>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextState.activeTab, nextState.ready, nextProps.romVersion);
    return nextState.activeTab !== this.state.activeTab ||
      nextState.ready !== this.state.ready ||
      this.props.romVersion !== nextProps.romVersion;
  }

  /*page(pg) {
    alert("USED PAGE(PG)");
    console.log("disabled",this.disabled);
    if(this.disabled[pg]){
      return;
    }
    this.setState({ page: pg });
  }*/

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

  toggle(activeTab){
    
    if (this.state.disabled[activeTab]) {
      return;
    }
    this.setState({activeTab});

  }

  getRomSpecificStuff() {
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
    setPresetCompositions: compositions => {
      dispatch(setPresetCompositions(compositions));
    },
    setRomSettings: data => {
      dispatch(setRomSettings(data));
    },
    setRomInfo: romInfo => {
      dispatch(setRomInfo(romInfo));
    },
    setRomNames: romNames => {
      dispatch(setRomNames(romNames));
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
