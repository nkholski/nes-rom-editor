// import renderBlock from "../services/renderBlock";
// import NesIO from "../services/nesIO";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import { expand, setZoom, setComposition } from "../redux/actions/canvasActions";
import { setActiveColor, mapPaletteToColors, pushHEXToColors } from "../redux/actions/drawActions";
import { alterByte } from "../redux/actions/nesRomActions";

import ColorSelect from "./colorSelect";
import PaletteModal from "./paletteModal";
import SaveCompositionModal from "./saveCompositionModal";

import CompositionService from "./../services/compositionService";

class DrawControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: {
        expand: false
      },
      paletteModal: {
        isOpen: false,
        colorIndex: 0
      },
      saveCompositionModal: false
    };
    this.loadComposition();

    const storedCompositions = JSON.parse(localStorage.getItem("compositions"));
    console.log("compo",storedCompositions);


  }

  render() {
    const colors = [0, 1, 2, 3].map(colorIndex => {
      console.log(this.props.activeColorIndex);
      return (
        <ColorSelect
          setActiveColor={this.props.setActiveColor}
          colorIndex={colorIndex}
          color={this.props.colors[colorIndex]}
          selected={this.props.activeColorIndex === colorIndex}
          showPaletteModal={this.showPaletteModal.bind(this)}
          key={colorIndex}
        />
      );
    });

    const dropDownData = [
      { title: "Move content", id: "move", top: "Up", bottom: "Down" },
      { title: "Expand canvas", id: "expand" },
      { title: "Crop canvas", id: "crop" }
    ];

    const dropDown = dropDownData.map(data => {
      return this.makeDropDown(data);
    });

    const paletteDropDown = this.getPaletteDropDown();

    const zoom = this.getZoomDropDown();
    return <div className="draw-controls">
        <PaletteModal colorIndex={this.state.paletteModal.colorIndex} isOpen={this.state.paletteModal.isOpen} palette={this.props.nesPalette} callback={this.shiftPaletteRef.bind(this)} />
        <SaveCompositionModal isOpen={this.state.saveCompositionModal} close={this.saveComposition} />
        <div className="md-12" id="colors">
          {colors}
          {paletteDropDown}
          <Button onClick={() => this.savePaletteToRom()}>
            Save palette to rom
          </Button>
        </div>
        <div className="md-6">
          {dropDown}
          {zoom}
        </div>
        <div className="md-6">
          <Button onClick={() => this.expand(1)}>Clear composition</Button> <Button
            onClick={() => this.expand(1)}
          >
            Load composition
          </Button> <Button onClick={() => this.saveComposition(true)}>
            Save composition
          </Button>
        </div>
      </div>;
  }

  showPaletteModal(colorIndex) {
    this.setState({
      paletteModal: {
        isOpen: true,
        colorIndex
      }
    });
  }



  saveComposition = (isOpen = false) => {
    this.setState({
      saveCompositionModal: isOpen
    })
  }

  shiftPaletteRef(colorIndex, HEXColor) {
    this.setState({
      paletteModal: {
        isOpen: false
      }
    });
    if(colorIndex === -1){
      return;
    }
    else {
      const colors = [...this.props.colors];
      colors[colorIndex] = HEXColor;
      this.props.pushHEXToColors(colors);
    }

  }


  expand = direction => {
    this.props.expand(direction);
  };

  toggleDropDown(id) {
    const dropDownOpen = this.state.dropdownOpen;
    dropDownOpen[id] = !dropDownOpen[id];
    this.setState({ dropDownOpen });
  }

  dropDownClick(action, direction) {
    switch (action) {
      case "expand":
        this.expand(direction);
        break;
      default:
        break;
    }
  }

  makeDropDown({ title, id, top, bottom }) {
    top = top ? top : "Top";
    bottom = bottom ? bottom : "Bottom";
    return (
      <ButtonDropdown
        key={id}
        isOpen={this.state.dropdownOpen[id]}
        toggle={() => this.toggleDropDown(id)}
      >
        {" "}
        <DropdownToggle caret>{title}</DropdownToggle>
        <DropdownMenu>
          <DropdownItem
            onClick={() => {
              this.dropDownClick(id, 0);
            }}
          >
            {top}
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              this.dropDownClick(id, 1);
            }}
          >
            Right
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              this.dropDownClick(id, 2);
            }}
          >
            {bottom}
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              this.dropDownClick(id, 3);
            }}
          >
            Left
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    );
  }
  getZoomDropDown() {
    const levels = [1, 2, 4, 8, 16].map(level => {
      return (
        <DropdownItem
          key={level}
          onClick={() => {
            this.props.setZoom(level);
          }}
        >
          x{level}
        </DropdownItem>
      );
    });
    return (
      <ButtonDropdown
        isOpen={this.state.dropdownOpen.zoom}
        toggle={() => this.toggleDropDown("zoom")}
      >
        <DropdownToggle caret>Zoom</DropdownToggle>
        <DropdownMenu>{levels}</DropdownMenu>
      </ButtonDropdown>
    );
  }

  savePaletteToRom() {
    const currentComposition = this.state.compositions[0];
    const selectedTarget = 0;
    const jobToDo = currentComposition.palettes[selectedTarget].address;

    jobToDo.forEach((address, colorIndex) => {
      const value = this.props.nesPalette.indexOf(this.props.colors[colorIndex]);
      if(address === -1 || value === -1){
        return;
      }
      // colors to index
      console.log("PUSH",value,"to",address)
      this.props.alterByte(address, value)
    });
    console.log(this.state.compositions);
  }

  getPaletteDropDown() {
    const palettes = [
      {
        name: "Mario",
        colors: ["#3CBCFC", "#F83800", "#FCA044", "#AC7C00"]
      },
      {
        name: "RGB (non-NES)",
        colors: ["#000000", "#FF0000", "#00FF00", "#0000FF"]
      }
    ];

    const choices = palettes.map((palette, i) => {
      return (
        <DropdownItem
          key={i}
          onClick={() => {
            this.props.pushHEXToColors(palette.colors);
          }}
        >
          {palette.name}
        </DropdownItem>
      );
    });
    return (
      <ButtonDropdown
        isOpen={this.state.dropdownOpen.palette}
        toggle={() => this.toggleDropDown("palette")}
      >
        <DropdownToggle caret>Palette presets</DropdownToggle>
        <DropdownMenu>{choices}</DropdownMenu>
      </ButtonDropdown>
    );
  }

  loadComposition() {
    fetch("rom-data/games/Super Mario Bros.json").then(res =>res.json()).then((data)=>{
      this.setState({compositions: data.compositions});
      this.props.setComposition(data.compositions[0]);

    });
  }

}

const mapStateToProps = state => {
  return { ...state.canvasReducer, ...state.drawReducer };
};

const mapDispatchToProps = dispatch => {
  return {
    expand: direction => {
      dispatch(expand(direction));
    },
    setZoom: zoom => {
      dispatch(setZoom(zoom));
    },
    setActiveColor: colorIndex => {
      dispatch(setActiveColor(colorIndex));
    },
    setComposition: compositionObj => {
      dispatch(setComposition(compositionObj))
    },
    mapPaletteToColors: palette => {
      dispatch(mapPaletteToColors(palette));
    },
    pushHEXToColors: palette => {
      dispatch(pushHEXToColors(palette));
    },
    alterByte: (address, value) => {
      dispatch(alterByte(address, value));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawControls);
