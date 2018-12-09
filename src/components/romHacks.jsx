// import renderBlock from "../services/renderBlock";
// import NesIO from "../services/nesIO";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";

import GameGenie from "../services/gameGenie";

class RomHacks extends Component {
  constructor(props) {
    super(props);
    this.defaults = {};
    
  }

  render() {
    console.log("HACK RENDER", this.props.hacks)
    const hacks = this.props.hacks ? this.getHacks(this.props.hacks) : "No hacks for this rom";
    return <div>
    
      {hacks}
    
      Game Genie: <input type="text" id="gameGenieCode" />
      <Button onClick={() => this.gameGenie()}>
        Test it
      </Button>

      Search value: <input type="text" id="searchValue" />
      <Button onClick={() => this.findValue()}>
        Find it!
      </Button>
      
    </div>;
    /*[ADD NEW] [RESET TO ROM DEFAULTS]  [SAVE TO ROM]*/
  }

  findTextValue(searchString) {
    searchString = searchString.toUpperCase();
    const lastCheck = this.props.romData.byteLength - searchString.length;
    const firstLetter = searchString.charCodeAt(0);
    const sequence = searchString.split("").map((letter,i) => {
      if(i === 0) {
        return;
      }
      if(!letter.match(/[a-zA-Z]/)) {
        console.log("NULL")
        return null;
      } 
      return letter.charCodeAt(0) - firstLetter;
    });

    let step = 0;
    let baseValue; 
    let found = false;
    for (let i = 0; i < lastCheck; i++) {
      const value = this.props.romData.getUint8(i);
      if(!sequence[step] && step>0){
        step++;
        return;
      }
      if(step === 0) {
        baseValue = value;
        step++;
      }
      else {
        if(value-baseValue === sequence[step]){
          step++;
          if(found){
            console.log("INDING");
            found = false;
          }
        }
        else {
          step=0;
        }
      }
      if(step === sequence.length ) {
        const startAddress = i - sequence.length + 1;
        // this.props.romData.setUint8(startAddress, value);
        const letterDiff = searchString.charCodeAt(0) - baseValue;
        console.log("LETTERDIF", baseValue, letterDiff, searchString.charCodeAt(0));

        const alphabeth = {};
        for(let chr=0; chr<25; chr++) {
          alphabeth[chr + 10] = String.fromCharCode(65+chr);

        }

        this.findStrings(alphabeth);
        step = 0;
        found = true;
      }

    }



  }

  findStrings(alphabeth) {
    const minLength = 3;
    let treshold = 2;
    const lastCheck = this.props.romData.byteLength - minLength;
    console.log("CHECKING", alphabeth);
    let step = 0;
    let string = "";
    for (let i = 0; i < lastCheck; i++) {
      const value = this.props.romData.getUint8(i);
      if(alphabeth.hasOwnProperty(value)) {
        string+=alphabeth[value];
        step++;
        treshold = 2;
      }
      else {
        treshold--;
        if(step>=minLength){
          if(treshold > 0) {
            string+="?";
            continue;
          }
          else {
            console.log(string);
          }
        }
        string = "";
        step = 0;
      }

    }

  }


  findValue(){
    const inputValue = document.getElementById("searchValue").value;
    console.log(inputValue);
    if (inputValue.match(/[^0-9]/)) {
      this.findTextValue(inputValue);
      return;
    }
    const value = parseInt(document.getElementById("searchValue").value);



    console.log("SEARCH BEGAN");
    let len = 1;
    const values = [];
    
    const pieces = Math.ceil(value/255);
      const binaryString = ("000000000000000000000" + (value).toString(2)).slice(-8*pieces);
      console.log(binaryString);
      for(let i=0;i<pieces;i++){
        const binStr = binaryString.substr(i * 8, 8);
        values.push(parseInt(binStr, 2));
      }
    


    let occurances = 0;
    for (let i = 0; i < this.props.romData.byteLength-pieces+1; i++) {
      let found = true;
      for(let l = 0; l < pieces; l++) {
        if (this.props.romData.getUint8(i+l) !== value[l]) {
          found = false;
          break;
        }
      }
      if(found){
        occurances++;
        console.log("Found",i);
      }
    }
    console.log("SEARCH FINISHED, FOUND: " + occurances);
  }


  gameGenie() {
    const result = GameGenie(document.getElementById("gameGenieCode").value)

    console.log("code", result, result.address + 16 - 16384 * 2, this.props.romData.byteLength);
    if(result){
      console.log(this.props.romData.getUint8(result.address));
      console.log(this.props.romData.getUint8(result.address+16));
      console.log(this.props.romData.getUint8(result.address+16-16384));
      console.log(this.props.romData.getUint8(result.address + 16 - 16384*2));
      if(result.data === 8) {
        result.data = 44;
      }
      if(result.data === 206){
        result.data = 0;
      }
      this.props.romData.setUint8(result.address + 16 - 16384 * 2, result.data);
    }
  }

  getHacks = (data, key=null) => {
    console.log("SKAFFA HACK", data);


    if(!data.map){
      let setting;
      if(!this.defaults.hasOwnProperty(data.address)){
        this.defaults[data.address] = this.props.romData.getUint8(data.address);
      }
      if(false || data.dropdown){
        const options = data.dropdown.map((option, i)=>{
          console.log(option);
          return <option key={i+":"+option.value} defaultValue={option.value}>{option.name}</option>
        });
        console.log("key"+key);
        setting = <select>{options}</select>;
      }
      else {
        setting = <input type="text" value={this.defaults[data.address]}/>;
      }
      console.log("key->", key);
      return <div key={key}><h5>{data.name} (0x{data.address.toString(16)})</h5>{ setting }</div>;
    }

    const hacks = data.map((entity, i) => {
      let content = "";
      if (entity.children) {
        const content = entity.children.map((entity, i2) => {
          return this.getHacks(entity, i+":"+i2);
        });
        console.log(content);
        return (
          <div key={entity.name + i}>
            <h2>{entity.name}</h2>
            {content}
          </div>
        );
      }
      else {
        return this.getHacks(entity);
      }
    });
    return hacks;
  }
}




const mapStateToProps = state => {
  return { 
    hacks: state.nesRomReducer.romSettings.hacks,
    romData: state.nesRomReducer.romData
  };
};

const mapDispatchToProps = dispatch => {
  return { a: ()=> {console.log("d")}}
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RomHacks);