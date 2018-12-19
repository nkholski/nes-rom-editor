import React, { Component } from "react";
import { connect } from "react-redux";
import ImportImage from "./importImage";
import { Button, Container, Row, Col } from "reactstrap";

class Tools extends Component {
    constructor(props) {
        super(props);
        /* this.state = {
            width: props.width,
            height: props.height,
            imageBinaryData: null
        }*/
        this.state = {
            page: null
        }
    }

    render() {
        if(this.state.page === 2) {
            return <div id="tools-page">

                <ImportImage />


            <div class="grid">
                    <Container className="nes-container with-title is-centered">
                        <p class="title">Import image</p>
                        <Row>
                            <Col>Identitify tile compositions and palettes from an imported image. Please read the instructions for best result.</Col>
                        </Row>
                        <Row className="actions">
                            <Col><Button className="nes-btn is-primary">Go to import!</Button></Col>
                        </Row>
                    </Container>
                    <Container className="nes-container with-title is-centered">
                        <p class="title">Find palette address</p>
                        <Row>
                            <Col>Search PRG ROM for possible palette defining addresses. Export to hack section.</Col>
                        </Row>
                        <Row className="actions">
                            <Col><Button className="nes-btn is-primary">Find palette</Button></Col>
                        </Row>
                    </Container>
                    <Container className="nes-container with-title is-centered">
                        <p class="title">Text tools</p>
                        <Row>
                            <Col>Identify text tables and addresses to exåprt to the hack section.</Col>
                        </Row>
                        <Row className="actions">
                            <Col><Button className="nes-btn is-primary">Do text stuff</Button></Col>
                        </Row>
                    </Container>
                    <Container className="nes-container with-title is-centered">
                        <p class="title">Game Genie</p>
                        <Row>
                            <Col>Decode Game Genie codes, manipulate them and export to the hack sextion..</Col>
                        </Row>
                        <Row className="actions">
                            <Col><Button className="nes-btn is-primary">Go Game Genie</Button></Col>
                        </Row>
                    </Container>
            
            </div>
            

           
            
            
            
            </div>;


        }



        const importImage = 
                this.state.imageBinaryData ? 
                <ImportImage imageBinaryData={this.state.imageBinaryData}/> 
                : 
                <input type="file" id="input" onChange={e => this.parseImage(e.target.files)} />;
            

        //             <ImportImage/>

        return <div>
            <h1>Tools</h1>
             <ImportImage />
            <img id="source-image" />
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