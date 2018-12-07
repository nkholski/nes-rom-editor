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
} from "../redux/actions/canvasActions";
import {
  setActiveColor,
  mapPaletteToColors,
  pushHEXToColors
} from "../redux/actions/drawActions";
import { alterByte } from "../redux/actions/nesRomActions";

import ColorSelect from "./colorSelect";
import PaletteModal from "./paletteModal";
import SaveCompositionModal from "./saveCompositionModal";
import SelectCompositionModal from "./selectCompositionModal";

import CompositionService from "./../services/compositionService";

class DrawControls extends Component {
  constructor(props) {
    super(props);
    console.log(props.presetCompositions);
    const compositions = props.presetCompositions
      ? [...props.presetCompositions]
      : [];

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
          selected={this.props.activeColorIndex === colorIndex}
          showPaletteModal={this.showPaletteModal.bind(this)}
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

    const zoom = this.getZoomDropDown();

    const marks = {
      4: "x4",
      6: "x6",
      8: "x8",
      10: "x10",
      12: "x12",
      14: "x14",
      16: "x16"
    };

    return (
      <Container className="draw-controls">
        <Row className="drawing-area">
          <Col>
            <div id="draw-canvas-container">
              <DrawCanvas />
            </div>
          </Col>
        </Row>

        <Row>
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
            <Button onClick={() => this.expand(1)}>Clear composition</Button>{" "}
            <Button onClick={() => this.setComposition(-1)}>
              Load composition
            </Button>{" "}
            <Button onClick={() => this.saveComposition(true)}>
              Save composition
            </Button>
          </div>
        </Row>
      </Container>
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
    if (prevProps.presetCompositions !== this.props.presetCompositions) {
      this.setState({
        compositions: [
          // ...JSON.parse(localStorage.getItem("compositions")),
          ...this.props.presetCompositions
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
    presetCompositions: state.canvasReducer.presetCompositions
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
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawControls);
