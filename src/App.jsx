import React from "react";
// import PropTypes from "prop-types";

import { connect } from "react-redux";
// import Init from "./services/init";
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// Actions
import { init } from "./services/init";
// import { loadURL } from "./services/romIO";
// import { setPalette } from "./redux/actions/drawActions";
import {
  setPresetCompositions,
  mouseWheelZoom
} from "./redux/actions/canvasActions";
import {
  setRomInfoIndex,
  setRomInfo,
  storeRom,
  setRomSettings,
  setRomNames
} from "./redux/actions/nesRomActions";

import classnames from "classnames";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";

// import ChrNav from "./components/chrNav";
import RomHacks from "./components/romHacks";
import Emulator from "./components/emulator";
import Tools from "./components/tools";
import File from "./components/file";
import Texts from "./components/Texts";
import Palettes from "./components/Palettes";
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
    document.addEventListener(
      "mousewheel",
      e => {
        this.props.mouseWheelZoom(e);
      },
      false
    );
  }

  render() {
    const pageIds = [
      "File",
      "Graphics",
      "Palettes",
      "Texts",
      "Hacks",
      "Emulator",
      "Tools",
      "Help"
    ];
    const disabled = this.state.disabled;

    pageIds.forEach(page => {
      if (page === "Help") {
        disabled[page] = true;
      } else {
        disabled[page] = false;
      }
    });

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

      if (page === this.state.activeTab) {
        switch (page) {
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
            pageTag = <RomHacks />;
            break;
          case "Emulator":
            pageTag = <Emulator />;
            break;
          case "Tools":
            pageTag = <Tools />;
            break;
          case "Palettes":
            pageTag = <Palettes />;
            break;
          default:
            pageTag = <h1>{page}</h1>;
            break;
        }
      } else {
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
        <a
          className="github-link"
          href="https://github.com/nkholski/nes-rom-editor"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="balloon from-right">
            Fork me
            <br />
            on GitHub
          </p>
          <i className="octocat" />
        </a>
        <div id="titlebar">
          <h1 className="main">NEStamp</h1>
          <span className="version">beta</span>
        </div>
        <Nav tabs>{tabs}</Nav>
        <TabContent activeTab={this.state.activeTab}>{pages}</TabContent>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !this.props.romStatus &&
      !nextProps.romStatus &&
      nextProps.romNames &&
      nextProps.romInfoIndex
    ) {
      if (localStorage.getItem("romData")) {
        // alert("Rom xxx");
      }

      // this.props.loadURL("smb", nextProps.romNames, nextProps.romInfoIndex);
    }
    if (!nextProps.isReady) {
      return false;
    }
    return (
      nextState.activeTab !== this.state.activeTab ||
      nextState.ready !== this.state.ready
    );
  }

  componentDidUpdate() {
    /*alert("!!!");
    if (
      this.state.md5 !== this.props.md5 &&
      this.props.md5 &&
      this.props.romInfoIndex
    ) {
      // A new rom was loaded. Let's see if we can find out anything about it.
      this.getRomSpecificStuff();
      this.setState({ md5: this.props.md5 });
    }*/
  }

  toggle(activeTab) {
    if (this.state.disabled[activeTab]) {
      return;
    }
    this.setState({ activeTab });
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
    /*    loadURL: (fileName, romNames, romInfoIndex) => {
      dispatch(loadURL(fileName, romNames, romInfoIndex));
    },*/
    mouseWheelZoom: e => {
      dispatch(mouseWheelZoom(e));
    }
    /*,
    setGameList: gameList => {
      dispatch(setGameList(gameList));
    }  */
  };
};

/*App.propTypes = {
  init: PropTypes.func(),
  mouseWheelZoom: PropTypes.func(),
  romStatus: PropTypes.any(),
  romNames: PropTypes.any(),
  romInfoIndex: PropTypes.object,
  loadURL: PropTypes.func(),
  isReady: PropTypes.bool
};*/

App.defaultProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
