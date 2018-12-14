import React, { Component } from "react";
import { connect } from "react-redux";

import { setZoom } from "../../redux/actions/canvasActions";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

class ZoomControl extends Component {
    constructor(props) {
        super(props);
        console.log("z", props);    
    }
    render(){

        const marks = {
            4: 'x4',
            6: 'x6',
            8: 'x8',
            10: 'x10',
            12: 'x12',
            14: 'x14',
            16: 'x16',
            32: 'x32'
        };
        return  <div id="zoom-container">
            <span className="zoom-span">zoom</span><br />
            <Slider vertical included={false} marks={marks} defaultValue={this.props.zoom} step={1} min={4} max={16} onChange={this.props.setZoom} />
        </div>;

    }
}

const mapStateToProps = state => {
    return { zoom: state.canvasReducer.zoom };
};

const mapDispatchToProps = dispatch => {
    return {
        setZoom: zoom => {
            dispatch(setZoom(zoom));
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ZoomControl);