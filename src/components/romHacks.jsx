import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";

import GameGenie from "../services/gameGenie";

class RomHacks extends Component {
  constructor(props) {
    super(props);
    this.defaults = {};
    this.hexValues = [null, null, null];
  }

  render() {
    console.log("HACK RENDER", this.props.hacks);
    const hacks = this.props.hacks
      ? this.getHacks(this.props.hacks)
      : "No hacks for this rom";
    return (
      <>
        <Container className="nes-container with-title is-centered">
          <p className="title">Rom hacks</p>
          <p>
            Use the different tools from the tools section to add hacks to this
            page.
          </p>
        </Container>
        {hacks}
      </>
    );

    /*[ADD NEW] [RESET TO ROM DEFAULTS]  [SAVE TO ROM]*/
  }

  inputChanged = ({ ...params }) => {
    console.log("ch", params);
  };

  pushHack = id => {
    let needle = null;
    this.props.hacks.some(hacksGroup => {
      needle = hacksGroup.children.find(hack => {
        return hack.id === id;
      });
      if (needle) {
        return true;
      }
    });

    if (!needle) {
      alert("Something went wrong!");
      return;
    }

    let value;
    if (needle.false) {
      value = document.getElementById("input-" + needle.id).checked
        ? needle.true
        : needle.false;
    } else {
      let value =
        parseInt(document.getElementById("input-" + needle.id).value, 10) -
        (Number.isInteger(needle.adjust) ? needle.adjust : 0);
    }

    value = value > 255 ? 255 : value;
    value = value < 0 ? 0 : value;
    let addressJump = 0;
    const compValue = this.props.romData.getUint8(needle.address);

    while (needle.address + addressJump < this.props.romData.byteLength) {
      const currentValue = this.props.romData.getUint8(
        needle.address + addressJump
      );
      if (currentValue === compValue) {
        this.props.romData.setUint8(needle.address + addressJump, value);
      } else {
        console.log("NO");
      }
      console.log("AT", addressJump, compValue, currentValue);

      addressJump += 0x4000; // compensate for bank swapping
    }

    console.log(needle, value);

    console.log("hack", id, typeof id);
  };

  getHacks = (data, key = null) => {
    if (!data.map) {
      if (!data.hasOwnProperty("id")) {
        data.id = Math.floor(10000000 * Math.random());
      }

      let setting;
      if (!this.defaults.hasOwnProperty(data.address)) {
        this.defaults[data.address] = this.props.romData.getUint8(data.address);
      }
      if (data.dropdown) {
        const options = data.dropdown.map((option, i) => {
          console.log(option);
          return (
            <option key={i + ":" + option.value} defaultValue={option.value}>
              {option.name}
            </option>
          );
        });
        console.log("key" + key);
        setting = <select>{options}</select>;
      } else if (data.hasOwnProperty("true")) {
        const currentValue = this.props.romData.getUint8(data.address);
        data.true = data.true === -1 ? currentValue : data.true;
        data.false = data.false === -1 ? currentValue : data.false;
        const checked = data.true === currentValue;
        setting = (
          <label>
            <input
              id={"input-" + data.id}
              type="checkbox"
              className="nes-checkbox"
              defaultChecked={checked}
            />
            <span />
          </label>
        );
        return (
          <Row key={key}>
            <Col>{setting}</Col>
            <Col>{data.name}</Col>
            <Col>0x{data.address.toString(16)}</Col>
            <Col>
              <Button onClick={() => this.pushHack(data.id)}>
                Push to rom
              </Button>
            </Col>
          </Row>
        );
      } else {
        setting = (
          <input
            id={"input-" + data.id}
            type="text"
            onChange={this.inputChanged}
            defaultValue={
              this.defaults[data.address] +
              (Number.isInteger(data.adjust) ? data.adjust : 0)
            }
          />
        );
      }
      console.log("key->", key);
      return (
        <Row key={key}>
          <Col>{data.name}</Col>
          <Col>{setting}</Col>
          <Col>0x{data.address.toString(16)}</Col>
          <Col>
            <Button onClick={() => this.pushHack(data.id)}>Push to rom</Button>
          </Col>
        </Row>
      );
    }

    const hacks = data.map((entity, i) => {
      let content = "";
      if (entity.children) {
        const content = entity.children.map((entity, i2) => {
          return this.getHacks(entity, i + ":" + i2);
        });
        console.log(content);
        return (
          <Container
            className="nes-container with-title is-centered"
            key={entity.name + i}
          >
            <p className="title">{entity.name}</p>

            {content}
          </Container>
        );
      } else {
        return this.getHacks(entity);
      }
    });
    return hacks;
  };
}

const mapStateToProps = state => {
  return {
    hacks: state.romSettingsReducer.hacks,
    textTables: state.romSettingsReducer.textTables,
    romData: state.nesRomReducer.romData,
    nesPalette: state.drawReducer.nesPalette,
    chrSpan: state.nesRomReducer.chrSpan
  };
};

const mapDispatchToProps = dispatch => {
  return {
    a: () => {
      console.log("d");
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RomHacks);
