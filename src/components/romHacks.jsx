// import renderBlock from "../services/renderBlock";
// import NesIO from "../services/nesIO";
import React, { Component } from "react";
import { connect } from "react-redux";

class RomHacks extends Component {
  constructor(props) {
    super(props);
    this.defaults = {};


  }

  render() {
    const hacks = this.getHacks(this.props.hacks);

    return <div>{hacks}
    [ADD NEW] [RESET TO ROM DEFAULTS]  [SAVE TO ROM]
    </div>;
  }

  getHacks = (data, key=null) => {
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
  };
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