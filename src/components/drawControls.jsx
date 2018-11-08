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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputGroupAddon
} from "reactstrap";

import { expand, setZoom } from "../redux/actions/canvasActions";
import { setActiveColor } from "../redux/actions/drawActions";

import ColorSelect from "./colorSelect";

class DrawControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: {
        expand: false
      }
    };
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

    return (
      <div className="draw-controls">
        <div className="md-12" id="colors">
          {colors}
          {paletteDropDown}
          <Button onClick={() => this.expand(1)} disabled>
            Save palette to rom
          </Button>
        </div>
        <div className="md-6">
          {dropDown}
          {zoom}
        </div>
        <div className="md-6">
          <Button onClick={() => this.expand(1)}>Clear composition</Button>{" "}
          <Button onClick={() => this.expand(1)}>Load composition</Button>{" "}
          <Button onClick={() => this.expand(1)}>Save composition</Button>
        </div>
        <Modal
          isOpen={false}
         /* toggle={this.toggle}
          className={this.props.className} */
        >
          <ModalHeader /* toggle={this.toggle} */>Save composition</ModalHeader>
          <ModalBody>
            <p>
              Save current composition to be able to access it quickly when editing the rom in the future. The current composition consists of 1x1 blocks of 8x8 pixels.
            </p>
            <InputGroup>
              <Input placeholder="composition name (i.e. Mario, turtle or first room)" />
            </InputGroup> 
          </ModalBody>
          <ModalFooter>
            <Button color="primary" /*onClick={this.toggle}*/>
              Overwrite
            </Button>{" "}
            <Button color="secondary" /*onClick={this.toggle}*/>
              Save
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
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
            this.props.setPalette(palette.colors);
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
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawControls);
