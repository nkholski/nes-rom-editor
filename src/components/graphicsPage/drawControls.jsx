// import renderBlock from "../services/renderBlock";
// import NesIO from "../services/nesIO";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  Row,
  Col
} from "reactstrap";

import DrawCanvas from "./drawCanvas";

import {
  clearComposition,
  expand,
  crop,
  setZoom,
  setComposition
} from "../../redux/actions/canvasActions";
import {
  setColors,
  setActiveColor,
  mapPaletteToColors,
  pushHEXToColors,
  setMode
} from "../../redux/actions/drawActions";
import { alterByte } from "../../redux/actions/nesRomActions";

import ColorSelect from "./colorSelect";
import PaletteModal from "./paletteModal";
import SaveCompositionModal from "./saveCompositionModal";
import SelectCompositionModal from "./selectCompositionModal";

import CompositionService from "../../services/compositionService";
import classnames from "classnames";

class DrawControls extends Component {
  constructor(props) {
    super(props);

    console.log(props.presetCompositions);
    const compositions = props.compositions ? [...props.compositions] : [];

    try {
      const storedCompositions = JSON.parse(
        localStorage.getItem("compositions")
      );
      compositions.push({ ...storedCompositions });
    } catch (error) {}

    //  ...props.presetCompositions

    this.state = {
      dropdownOpen: { expand: false },
      paletteModal: { isOpen: false, colorIndex: 0 },
      selectCompositionModal: false,
      saveCompositionModal: false,
      compositions,
      zoom: 1,
      currentPalette: null,
      availablePalettes: null
    };

    


    //    this.loadComposition();

    // const storedCompositions = JSON.parse(localStorage.getItem("compositions"));
    //    console.log("compo", storedCompositions);
  }

  render() {
    //   const storedCompositions = JSON.parse(localStorage.getItem("compositions"));

    const colors = [0, 1, 2, 3].map(colorIndex => {
      return (
        <ColorSelect
          callback={this.props.setActiveColor}
          colorIndex={colorIndex}
          color={this.props.colors[colorIndex]}
          selected={this.props.activeColorIndex === colorIndex && this.props.mode === "draw"}
          edit={this.showPaletteModal.bind(this)}
          palette={this.props.nesPalette}
          key={colorIndex}
        />
      );
    });

    const dropDownData = [
      /*{ title: "Move content", id: "move", top: "Up", bottom: "Down" },*/
      { title: "Expand canvas", id: "expand" },
      { title: "Crop canvas", id: "crop" }
    ];

    const dropDown = dropDownData.map(data => {
      return this.makeDropDown(data);
    });

    const paletteDropDown = this.getPaletteDropDown();

    let savePaletteToRom = "";
    if(this.state.currentPalette && this.state.currentPalette.hasOwnProperty("address") && this.state.currentPalette.address.length>0) {
      savePaletteToRom = <Button className="nes-btn is-primary" onClick={() => this.savePaletteToRom()}>
        Save palette to rom
      </Button>;
    }



    return (
      <div id="draw-controls">


        <PaletteModal
          colorIndex={this.state.paletteModal.colorIndex}
          isOpen={this.state.paletteModal.isOpen}
          palette={this.props.nesPalette}
          callback={this.shiftPaletteRef.bind(this)}
        />
        <SaveCompositionModal
          isOpen={this.state.saveCompositionModal}
          close={this.saveComposition}
        />
        <SelectCompositionModal
          isOpen={this.state.selectCompositionModal}
          callback={cI => this.setComposition(cI)}
          compositions={this.state.compositions}
        />

        <div className="md-12" id="colors">
           {colors}
          <div class="color-control">
            <div onClick={()=>this.props.setMode('flipX')} className = { classnames({ color: true, flip: true, selected: this.props.mode === "flipX"})} >&harr;</div>
            <div class="palette">&nbsp;</div>
          </div>
          <div class="color-control">
            <div class="color flip" onClick={() => this.props.setMode('flipY')} className={classnames({ color: true, flip: true, selected: this.props.mode === "flipY" })}>&uarr; &darr;</div>
            <div class="palette">&nbsp;</div>
          </div>  
          {paletteDropDown}
          {savePaletteToRom}
   
        </div>
        <div className="md-6">{dropDown}</div>
        <div className="md-6">
          <Button className="nes-btn is-primary" onClick={() => this.props.clearComposition()}>Clear composition</Button>{" "}
          <Button className="nes-btn is-primary" onClick={() => this.setComposition(-1)}>
            Load composition
          </Button>{" "}
          <Button className="nes-btn is-primary" onClick={() => this.saveComposition(true)}>
            Save composition
          </Button>
        </div>
      </div>
    );
  }

  showPaletteModal(colorIndex) {
    this.setState({
      paletteModal: {
        isOpen: true,
        colorIndex
      }
    });
  }

  clearComposition(){

  }

  saveComposition = (isOpen = false) => {
    this.setState({
      saveCompositionModal: isOpen
    });
  };

  shiftPaletteRef(colorIndex, nesColorIndex) {

    console.log("colorIndex",colorIndex, nesColorIndex);
    this.setState({
      paletteModal: {
        isOpen: false
      }
    });
    if (colorIndex === -1) {
      return;
    } else {
      const nesColorIndicies = [...this.props.nesColorIndicies];
      nesColorIndicies[colorIndex] = nesColorIndex;
      console.log("nesColorIndicies", nesColorIndicies);  
      this.props.setColors(nesColorIndicies);
    }
  }

  toggleDropDown(id) {
    const dropDownOpen = this.state.dropdownOpen;
    dropDownOpen[id] = !dropDownOpen[id];
    this.setState({ dropDownOpen });
  }

  dropDownClick(action, direction) {
    switch (action) {
      case "expand":
        this.props.expand(direction);
        break;
      default:
        this.props.crop(direction);
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

  savePaletteToRom() {
    //const jobToDo = currentComposition.palettes[selectedTarget].address;

    this.state.currentPalette.address.forEach((address, colorIndex) => {
      const value = this.props.nesColorIndicies[colorIndex];
      if (address === -1 || value === -1) {
        return;
      }
      // colors to index
      this.props.alterByte(address, value);
    });
    console.log(this.state.compositions);
  }

  getPaletteDropDown() {
    


    let buttonText = this.state.currentPalette ? ">> "+this.state.currentPalette.name : "Palette presets";
    let choices = null;


    if(!this.state.availablePalettes) {
      choices = null;
      return null;
    }
    else {
    const custom = {
      name: "Custom",
      colors: [0,1,2,3]
    }

    choices = [custom, ...this.state.availablePalettes].map((palette, i) => {
      return (
        <DropdownItem
          key={i}
          onClick={() => {
            this.setPalette(palette)
          }}
        >
          {palette.name}
        </DropdownItem>
      );
    });
  }

    return (
      <ButtonDropdown
        isOpen={this.state.dropdownOpen.palette}
        toggle={() => this.toggleDropDown("palette")}
      >
        <DropdownToggle caret>{buttonText}</DropdownToggle>
        <DropdownMenu>{choices}</DropdownMenu>
      </ButtonDropdown>
    );
  }

  setPalette(palette) {
    let nesColorIndicies = null;
    if(palette.address) {
      nesColorIndicies = [];
      console.log("Setting colors",palette.address);
      [0,1,2,3].forEach((i) => {
        if(palette.address[i]>0){
          nesColorIndicies.push(this.props.romData.getUint8(palette.address[i]));
        }
        else {
          nesColorIndicies.push(this.props.nesColorIndicies[i])
        }    
      });
      this.props.setColors(nesColorIndicies);
    }
    else {
      // Kolla om det finns färger?

    }

    
    this.setState({currentPalette: palette});
    

  }

  setComposition(cI = -2) {
    if (cI === -1) {
      this.setState({ selectCompositionModal: true });
      return;
    }
    this.setState({ selectCompositionModal: false });
    if (cI === -2) {
      return;
    }
    const composition = this.state.compositions[cI];
    console.log(this.state.compositions, cI);
  //  debugger;

    if(composition.hasOwnProperty("palettes") && composition.palettes.length > 0) {
      this.setState({availablePalettes: composition.palettes});
    }
    this.props.setComposition(composition);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.compositions !== this.props.compositions) {
      this.setState({
        compositions: [
          ...this.props.compositions
        ]
      });
    }
  }

  sliderChange(what) {
    console.log("SLIDER", what);
  }
}

const mapStateToProps = state => {
  return {
    ...state.canvasReducer,
    ...state.drawReducer,
    nesColorIndicies: state.drawReducer.nesColorIndicies,
    romData: state.nesRomReducer.romData,
    palettes: state.romSettingsReducer.palettes,
    compositions: state.romSettingsReducer.compositions
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearComposition: () => {
      dispatch(clearComposition());
    },
    expand: direction => {
      dispatch(expand(direction));
    },
    crop: side => {
      dispatch(crop(side));
    },
    setZoom: zoom => {
      dispatch(setZoom(zoom));
    },
    setActiveColor: colorIndex => {
      dispatch(setActiveColor(colorIndex));
    },
    setComposition: compositionObj => {
      dispatch(setComposition(compositionObj));
    },
    mapPaletteToColors: palette => {
      dispatch(mapPaletteToColors(palette));
    },
    pushHEXToColors: palette => {
      dispatch(pushHEXToColors(palette));
    },
    alterByte: (address, value) => {
      dispatch(alterByte(address, value));
    },
    setMode: (mode) => {
      dispatch(setMode(mode))
    },
    setColors: (nesColorIndicies) => {
      dispatch(setColors(nesColorIndicies))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawControls);
