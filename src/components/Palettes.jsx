import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { bindActionCreators } from "redux";
import ColorSelect from "./graphicsPage/colorSelect";
import PaletteModal from "./graphicsPage/paletteModal";

class Palettes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paletteModal: {
        isOpen: false,
        colorIndex: 0
      },
      colors: {}
    };
    this.hasData = false;
    this.compositions = [];
  }

  render() {
    if (!this.hasData) {
      return (
        <div>
          <h1>Palettes</h1>
          No palettes was found. info about palettes...
        </div>
      );
    }

    const colors = [0, 1, 2].map(colorIndex => {
      console.log(this.props.activeColorIndex);

      return (
        <ColorSelect
          setActiveColor={this.props.setActiveColor}
          colorIndex={colorIndex}
          color={3}
          selected={false}
          callback={this.showPaletteModal.bind(this)}
          palette={this.props.nesPalette}
          key={colorIndex}
        />
      );
    });

    /*const colorOptions = this.props.nesPalette.map((color, index) => {
            let hexString = index.toString(16).toUpperCase();
            hexString = hexString.length % 2 ? "0" + hexString : hexString;

            return <option value={index} key={index + "." + color} style={{ backgroundColor: color }}>{hexString}</option>;

        }
        );
        const paletteDropdown = [0, 1, 2].map(index => {
            return <select key={index} onChange={e => this.paletteChange(index, e.target.value)}>
                {colorOptions} {colors}
              </select>;
        }
        );*/
    const palettes = [];
 
    this.compositions.forEach(i => {
      const composition = this.props.compositions[i];
      const paletteList = this.props.compositions[i].palettes.map((p, pI) => {
        if (!p.address) {
          return null;
        }
        const paletteSelectors = [0, 1, 2].map(colorIndex => {
          console.log(this.props.activeColorIndex);
          return (
            <ColorSelect
              setActiveColor={this.props.setActiveColor}
              colorIndex={i + ":" + pI + ":" + colorIndex}
              color={this.state.colors[i + ":" + pI][colorIndex]}
              selected={false}
              callback={this.showPaletteModal.bind(this)}
              palette={this.props.nesPalette}
              key={colorIndex}
            />
          );
        });

        return (
          <div key={p.name + i}>
            {p.name}:{paletteSelectors}
          </div>
        );
      });

      palettes.push(
        <div key={i}>
          <h2>Composition: {composition.name}</h2>
          {paletteList}
        </div>
      );
    });

    return (
      <div>
        <PaletteModal
          colorIndex={this.state.paletteModal.colorIndex}
          isOpen={this.state.paletteModal.isOpen}
          palette={this.props.nesPalette}
          callback={this.paletteChange.bind(this)}
        />
        <h1>Palettes</h1>
        {palettes} {colors}
      </div>
    );
  }

  paletteChange(target, color) {
    const [compI, palI, colI ] = target.split(":");
    const colors = {...this.state.colors};
    colors[compI+":"+palI][colI] = color;

    const address = this.props.compositions[compI].palettes[palI].address[1 + 1 * colI];

      this.props.romData.setUint8(address, color);  

    this.setState({
      paletteModal: {
        isOpen: false,
        colorIndex: 0
      },
      colors
    });
  }

  componentWillMount() {
    // Check for data
    const global = [];
    const colors = {};

    this.compositions = [];

    if (this.props.palettes) {
      console.log(this.props.palettes);
    }

    if (this.props.compositions && this.props.compositions.length > 0) {
      this.props.compositions.forEach((composition, i) => {
        if (composition.hasOwnProperty("palettes")) {
            let addrExists = false;
            composition.palettes.forEach((pal, pI) => {
            if(!pal.address){return;}
            addrExists = true;
            colors[i + ":" + pI] = [];
            ([0,1,2]).forEach((colorIndex) => {
              console.log(pal.address[colorIndex]);
              const color = pal.address[colorIndex] > -1 ? pal.address[colorIndex] : 0;

              colors[i + ":" + pI].push(this.props.romData.getUint8(pal.address[colorIndex+1]));  
            });
            
            // colors[i + ":" + pI] = [2,3,4];
            
          });
          if (addrExists) {
            this.compositions.push(i);
          }
        }
      });
      this.hasData = true;
    }

    this.setState({colors});
  }

  showPaletteModal(colorIndex) {
    this.setState({
      paletteModal: {
        isOpen: true,
        colorIndex
      }
    });
  }
}

const mapStateToProps = state => {
  return {
    compositions: state.romSettingsReducer.compositions,
    palettes: state.romSettingsReducer.palettes,
    nesPalette: state.drawReducer.nesPalette,
    romData: state.nesRomReducer.romData
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Palettes);
