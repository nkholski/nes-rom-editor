import React from "react";
import { connect } from "react-redux";

import { setPalette } from "./redux/actions/drawActions";

import ChrNav from "./components/chrNav";
import DrawCanvas from "./components/drawCanvas";
import DrawControls from "./components/drawControls";
import RomHacks from "./components/romHacks";

import { Button } from "reactstrap";

import DownloadNes from "./services/downloadNes"


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
    fetch("/files/nesgames.dat")
      .then(res => res.text())
      .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
      .then(nesgames => {
        /* window.nes = nesgames;
        nes.querySelectorAll('[md5="7F7A89EF806464338B1722C120648E7D"]')[0].parentElement.getAttribute("name")
        */
        // console.log("res", nesgames);
      });

  }


  render() {
    if(!this.state.ready){
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
  return { nesRomReducer: state.nesRomReducer, canvasReducer: state.canvasReducer, romData: state.nesRomReducer.romData };
};

const mapDispatchToProps = dispatch => {
  return {
    setPalette: palette => {
      dispatch(setPalette(palette));
    }  
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
