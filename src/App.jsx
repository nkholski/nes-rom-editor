import React from "react";
import { connect } from "react-redux";
// import Init from "./services/init";
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// Actions
import { init } from "./services/init";
import { loadURL } from "./services/romIO";
// import { setPalette } from "./redux/actions/drawActions";
import { setPresetCompositions, mouseWheelZoom } from "./redux/actions/canvasActions";
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
import Texts from "./components/Texts";
import Palettes from "./components/Palettes";

// import { Button } from "reactstrap";

import DownloadNes from "./services/downloadNes";

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
      activeTab: "File",
      modal: {
        isOpen: false,
        title: null,
        body: null
      },
      disabled: []
    };

    props.init();
    document.addEventListener("mousewheel", (e)=>{console.dir(e); this.props.mouseWheelZoom(e)}, false);
   
  }

  render() {
    console.log(this.state.activeTab);
    const pageIds = ["File", "Graphics", "Palettes", "Texts", "Hacks", "Emulator", "Tools", "Help"];
    const disabled = this.state.disabled;
    
    pageIds.forEach(page => { 
      if(page==="Help") {
        disabled[page] = true; 

      }
      else {
        disabled[page] = false; 

      }
    });
    // this.setState({disabled});


    console.log("ändrar", this.props, this.props.romInfo, this.props.romNames, this.props.romInfoIndex);



    if (!this.state.ready) {
     // return <div>Loading...</div>;
    }
    else if(this.romVersion<1 && this.props.romNames && this.props.romInfoIndex){
      console.log("LOAD")
     // this.props.loadURL("smb", this.props.romNames, this.props.romInfoIndex);
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
        case "Texts":
          pageTag = <Texts />;
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
        case "Palettes":
          pageTag = <Palettes/>;
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
    if (!this.props.romStatus && !nextProps.romStatus && nextProps.romNames && nextProps.romInfoIndex) {
      this.props.loadURL("smb", nextProps.romNames, nextProps.romInfoIndex);
    }
    if(!nextProps.isReady) {
      return false;
    }
    return (nextState.activeTab !== this.state.activeTab ||
      nextState.ready !== this.state.ready);
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
    return;
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
    romData: state.nesRomReducer.romData, // Bort!
    romVersion: state.nesRomReducer.version,
    md5: state.nesRomReducer.md5,
    romInfoIndex: state.nesRomReducer.romInfoIndex,
    romNames: state.nesRomReducer.romNames,
    isReady: state.nesRomReducer.isReady,
    romStatus: state.nesRomReducer.romStatus
  };
};

const mapDispatchToProps = dispatch => {
  return {
    init: () => {
      dispatch(init());
    },
   /* setPalette: palette => {
      dispatch(setPalette(palette));
    },*/
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
    },
    loadURL: (fileName, romNames, romInfoIndex) => {
      dispatch(loadURL(fileName, romNames, romInfoIndex))
    },
    mouseWheelZoom: (e) => {
      dispatch(mouseWheelZoom(e))
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
