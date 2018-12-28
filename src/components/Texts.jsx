import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";

class Tools extends Component {
  constructor(props) {
    super(props);
    /* this.state = {
            width: props.width,
            height: props.height,
            imageBinaryData: null
        }*/
    this.state = {
      upperCaseWarning: false,
      textValues: []
    };
  }

  render() {
    console.log(this.props.romSettings);
    const textelements = this.props.texts.map((text, textIndex) => {
      const letters = [];
      console.log(text);
      for (let i = text.address; i < text.address + text.length; i++) {
        letters.push(this.props.romData.getUint8(i));
      }
      const currentValue = letters.reduce((str, i) => {
        return str + this.props.textTables[0].tbl[i];
      }, "");

      text.description = !text.description ? currentValue : text.description;

      const defaultValue = this.state.textValues[textIndex] !== undefined
        ? this.state.textValues[textIndex]
        : currentValue;
    
      const changed = defaultValue !== currentValue ? " Reset change" : "";

      return (
        <div key={text.description + textIndex}>
          {text.description}:{" "}
          <input
            type="text"
            value={defaultValue}
            maxLength={text.length}
            data-array-index={textIndex}
            onChange={this.textChange}
          /> {changed}
        </div>
      );
    });

    return (
      <div>
        <h1>Texts</h1>
        {textelements}
        <Button onClick={()=>{this.pushToRom()}}>Push to rom</Button>
      </div>
    );
  }

  textChange = event => {
    const textIndex = event.target.getAttribute("data-array-index");
    const letters = event.target.value.split("");
      let modified = "";
      let caseChanged = false;


    letters.forEach(letter => {
      if (this.getTableIndex(letter)>-1) {
        modified += letter;
        return;
      }
      if (this.getTableIndex(letter.toUpperCase())>-1) {
        modified += letter.toUpperCase();
        caseChanged = true;
        return;
      } else {
        alert("There is no '" + letter + "' in the text table.");
      }
    });

    if (caseChanged && !this.state.upperCaseWarning) {
      alert("The text table only allows upper case letters");
      this.setState({ upperCaseWarning: true });
    }

    const textValues = this.state.textValues;
    textValues[textIndex] = modified;
    this.setState({textValues});

  };

  getTableIndex(letter) {
    const table = this.props.textTables[0].tbl;
    let keys = Object.keys(table);
    let found = -1;
    keys.some(key => {
      console.log(key);
      if (table[key] === letter) {
        found = key;
        return true;
      }
    });
    return found;
  }

  pushToRom = () => {
    
      this.props.texts.forEach((text, textIndex) => {
          const word = this.state.textValues[textIndex];
            if(!word){
                return;
            }
            const letters = word.split("");

          for (let i = 0; i < text.length; i++) {
            const letter = (i>(letters.length-1)) ? " " : letters[i];
            const address = text.address+i;
            const tableIndex = this.getTableIndex(letter);
            this.props.romData.setUint8(address,tableIndex);
          }
      });   
  }
}

const mapStateToProps = state => {
  return {
    textTables: state.romSettingsReducer.textTables,
    texts: state.romSettingsReducer.textStrings,
    romSettings: state.nesRomReducer.romSettings,
    romData: state.nesRomReducer.romData
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);
