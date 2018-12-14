import React, { Component } from "react";
import { connect } from "react-redux";
import ImportImage from "./importImage";

class Tools extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            imageBinaryData: null
        }
    }

    render() {


        const importImage = 
                this.state.imageBinaryData ? 
                <ImportImage imageBinaryData={this.state.imageBinaryData}/> 
                : 
                <input type="file" id="input" onChange={e => this.parseImage(e.target.files)} />;
            


        return <div>
            <h1>Tools</h1>
            <ImportImage/>
            {importImage}
          </div>;
    }

    parseImage(data){
        const reader = new FileReader();

        if(data[0]){
            reader.onload = (e) => {
                console.log(e.target.result);
                this.setState({imageBinaryData: e.target.result});
            }
            reader.readAsBinaryString(data[0]);
        }
        else {
            alert("FAIL");
        }

    }


}


const mapStateToProps = state => {
    return { ...state.canvasReducer, romData: state.nesRomReducer.romData, colors: state.drawReducer.colors, scale: state.drawReducer.scale };
};

const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Tools);