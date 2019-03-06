import React, { Component } from "react";
import { connect } from "react-redux";
import ImportImage from "./importImage";
import TextFinder from "./tools/TextFinder";
import IPSPatcher from "./tools/IPSpatcher";
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
      tool: null,
      imageBinaryData: null
    };
  }

  render() {
    // return <IPSPatcher />;

    if (this.state.tool === null) {
      return (
        <div id="tools-page">
          <h1>Tools</h1>
          <div className="nes-container">
            The tools on this page is used to identify custom settings for the
            current rom.
          </div>
          <div className="grid">
            <Container className="nes-container with-title is-centered">
              <p className="title">Import image</p>
              <Row>
                <Col>
                  Identitify tile compositions and palettes from an imported
                  image. Please read the instructions for best result.
                </Col>
              </Row>
              <Row className="actions">
                <Col>
                  <Button
                    className="nes-btn is-primary"
                    onClick={() => {
                      this.setTool("imageImport");
                    }}
                  >
                    Go to import!
                  </Button>
                </Col>
              </Row>
            </Container>
            <Container className="nes-container with-title is-centered">
              <p className="title">Find palette address</p>
              <Row>
                <Col>
                  Search PRG ROM for possible palette defining addresses. Export
                  to hack section.
                </Col>
              </Row>
              <Row className="actions">
                <Col>
                  <Button
                    className="nes-btn is-primary"
                    onClick={() => {
                      this.setTool("imageImport");
                    }}
                  >
                    Find palette
                  </Button>
                </Col>
              </Row>
            </Container>
            <Container className="nes-container with-title is-centered">
              <p className="title">Text tools</p>
              <Row>
                <Col>
                  Identify text tables and addresses to exoprt to the hack
                  section.
                </Col>
              </Row>
              <Row className="actions">
                <Col>
                  <Button
                    className="nes-btn is-primary"
                    onClick={() => {
                      this.setTool("text");
                    }}
                  >
                    Do text stuff
                  </Button>
                </Col>
              </Row>
            </Container>
            <Container className="nes-container with-title is-centered">
              <p className="title">Game Genie</p>
              <Row>
                <Col>
                  Decode Game Genie codes, manipulate them and export to the
                  hack sextion..
                </Col>
              </Row>
              <Row className="actions">
                <Col>
                  <Button
                    className="nes-btn is-primary"
                    onClick={() => {
                      this.setTool("imageImport");
                    }}
                  >
                    Go Game Genie
                  </Button>
                </Col>
              </Row>
            </Container>
            <Container className="nes-container with-title is-centered">
              <p className="title">IPS Patcher</p>
              <Row>
                <Col>Apply an whole or partial IPS patch.</Col>
              </Row>
              <Row className="actions">
                <Col>
                  <Button
                    className="nes-btn is-primary"
                    onClick={() => {
                      this.setTool("imageImport");
                    }}
                  >
                    Patch!
                  </Button>
                </Col>
              </Row>
            </Container>
            <Container className="nes-container with-title is-centered">
              <p className="title">Rom Settings</p>
              <Row>
                <Col>
                  Edit the settings JSON directly (if you dare), import json
                  settings or download it to share it.
                </Col>
              </Row>
              <Row className="actions">
                <Col>
                  <Button
                    className="nes-btn is-primary"
                    onClick={() => {
                      this.setTool("imageImport");
                    }}
                  >
                    Do json settings stuff
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      );
    }

    let currentPage = "";
    switch (this.state.tool) {
      case "imageImport":
        const page = this.state.imageBinaryData ? (
          <ImportImage imageBinaryData={this.state.imageBinaryData} />
        ) : (
          <div>
            <input
              type="file"
              id="input"
              onChange={e => this.parseImage(e.target.files)}
            />
          </div>
        );
        currentPage = (
          <div>
            {" "}
            <img id="source-image" />
            {page}
          </div>
        );
        //             <ImportImage/>
        /* currentPage = (
          <div>
            <ImportImage targetFile={this.state.imageBinaryData} />
            <img id="source-image" />
            <input
              type="file"
              id="input"
              onChange={e => this.parseImage(e.target.files)}
            />
          </div>
        );*/
        break;
      case "text":
        currentPage = <TextFinder />;
        break;
    }

    /*const importImage =
                this.state.imageBinaryData ?
                <ImportImage imageBinaryData={this.state.imageBinaryData}/>
                :
                <input type="file" id="input" onChange={e => this.parseImage(e.target.files)} />;*/

    //             <ImportImage/>

    return (
      <div>
        <h1>Tools</h1>
        <div className="nes-container" onClick={() => this.setTool(null)}>
          Click here to return to tools selection.
        </div>
        {currentPage}
      </div>
    );
  }

  setTool(tool) {
    this.setState({ tool });
  }

  parseImage(data) {
    console.log("PARSE");
    const reader = new FileReader();
    if (data[0]) {
      reader.onload = e => {
        this.setState({ imageBinaryData: e.target.result });
      };
      reader.readAsBinaryString(data[0]);
    }
  }
}

const mapStateToProps = state => {
  return {
    ...state.canvasReducer,
    romData: state.nesRomReducer.romData,
    colors: state.drawReducer.colors,
    scale: state.drawReducer.scale
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);
