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
  expand,
  setZoom,
  setComposition
} from "../../redux/actions/canvasActions";
import {
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
      zoom: 1
    };

    //    this.loadComposition();

    // const storedCompositions = JSON.parse(localStorage.getItem("compositions"));
    //    console.log("compo", storedCompositions);
  }

  render() {
    //   const storedCompositions = JSON.parse(localStorage.getItem("compositions"));

    const colors = [0, 1, 2, 3].map(colorIndex => {
      console.log(this.props.activeColorIndex);
      return (
        <ColorSelect
          setActiveColor={this.props.setActiveColor}
          colorIndex={colorIndex}
          color={this.props.colors[colorIndex]}
          selected={this.props.activeColorIndex === colorIndex && this.props.mode === "draw"}
          showPaletteModal={this.showPaletteModal.bind(this)}
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
          <Button onClick={() => this.savePaletteToRom()}>
            Save palette to rom
          </Button>
        </div>
        <div className="md-6">{dropDown}</div>
        <div className="md-6">
          <Button onClick={() => this.expand(1)}>Clear composition</Button>{" "}
          <Button onClick={() => this.setComposition(-1)}>
            Load composition
          </Button>{" "}
          <Button onClick={() => this.saveComposition(true)}>
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

  saveComposition = (isOpen = false) => {
    this.setState({
      saveCompositionModal: isOpen
    });
  };

  shiftPaletteRef(colorIndex, HEXColor) {
    this.setState({
      paletteModal: {
        isOpen: false
      }
    });
    if (colorIndex === -1) {
      return;
    } else {
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

  savePaletteToRom() {
    const currentComposition = this.state.compositions[0];
    const selectedTarget = 2;

    //const jobToDo = currentComposition.palettes[selectedTarget].address;
    const jobToDo = [-1, 1520, 1521, 1522];

    jobToDo.forEach((address, colorIndex) => {
      const value = this.props.nesPalette.indexOf(
        this.props.colors[colorIndex]
      );
      if (address === -1 || value === -1) {
        return;
      }
      // colors to index
      console.log("PUSH", value, "to", address);
      this.props.alterByte(address, value);
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
    fetch("/rom-info/games/Super Mario Bros.json")
      .then(res => res.json())
      .then(data => {
        this.setState({ compositions: data.compositions });
        this.props.setComposition(data.compositions[0]);
      });
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
    console.log("COMPOSITION", cI, this.state.compositions);
    this.props.setComposition(this.state.compositions[cI]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.compositions !== this.props.compositions) {
      this.setState({
        compositions: [
          // ...JSON.parse(localStorage.getItem("compositions")),
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
    compositions: state.romSettingsReducer.compositions
  };
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
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawControls);
