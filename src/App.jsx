import React from "react";
import { connect } from "react-redux";

import { setPalette } from "./redux/actions/drawActions";

import ChrNav from "./components/chrNav";
import DrawCanvas from "./components/drawCanvas";
import DrawControls from "./components/drawControls";


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
      ready: false
    }
    fetch("/files/NESPalette.json")
        .then(response => response.json())
        .then(palette => {
          this.props.setPalette(palette);
          this.setState({ready: true});
        });

  }


  render() {
    if(!this.state.ready){
      return <div>Loading...</div>;
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
      <div className="col-md-8">
        <div id="draw-canvas-container"><DrawCanvas /></div>
        <DrawControls />
        new canvas,
        load canvas
        save canvas
      </div>
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
        
        Graphics editor | Palette editor | .nes Info | Rom hacks

      </div>
    </div>
  </div>);
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
