import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";

class Emulator extends Component {
    render() {
        const prgBytes = 16 * this.props.romInfo.prg;
        const chrBytes = 8 * this.props.romInfo.chr;
        const chrText = chrBytes > 0 ? <span>{this.props.romInfo.chr} bank(s)({chrBytes} kb)</span> : "No CHR-Rom see note below";
        const ramNote = chrBytes === 0 ? <span>Note: This rom has no CHR-Rom which means it uses CHR-Ram. You will need to dig through PRG-Rom to manipulate GFX.</span> : "";
        return <div id="rom-page" className="row">
            <Container className="nes-container with-title is-centered">
                <p class="title">Welcome to NES Tamp</p>
                <Row>
                    <Col>
                    NES Tamp the result of a birthday suprise rom hack project going overboard and morphed into a tool. It's a general tool for hacking nes roms
                        with focus on graphics editing and basic hacks. It has support for game specific hacks but not advanced features like level editors. 
                    <strong>Features</strong>
                    <ul>
                        <li>Edit compositions of tiles</li>
                        <li>Import compositions and palettes from images</li>
                        <li>Identify rom specific text tables and edit strings</li>
                        <li>Identify rom specific palette settings and alter palettes</li>
                        <li>Add rom spefic hacks such as invincibility</li>
                        <li>Find hacks using Game Genie codes</li>
                    </ul>
                    </Col>
                </Row>
            </Container>

            <Container className="nes-container with-title is-centered">
                <p class="title">Current rom info</p>
            <Row>
                <Col>
                filename: { this.props.romInfo.name }<br/> 
                md5: {this.props.md5}<br />
                no-intro md5: {this.props.md5}<br />
                prg-rom: {this.props.romInfo.prg} bank(s) ({prgBytes} kb)<br/>
                chr-rom: {chrText}<br/>
                Hacks: 15<br/>
                Palette references: 10<br/>
                Compostions: 5 (20% of CHR-Rom mapped)<br/>
                Text tables: 1<br/>
                Text references: 10<br/>
    
                { ramNote }
                </Col>
            </Row>
            </Container>

            <Container className="nes-container with-title is-centered">
                <p class="title">Rom actions</p>
                <Row>
                
                    <input type="file" id="input" onChange={e => this.parseImage(e.target.files)}/>;

                 <Col><Button className="nes-btn is-primary">Load rom</Button></Col>
                 <Col><Button className="nes-btn is-primary">Save rom to localStorage</Button></Col>
                 <Col><Button className="nes-btn is-primary">Download rom</Button></Col>
                 <Col><Button className="nes-btn is-primary">Download IPS</Button></Col>
                </Row>
            </Container>

            <Container className="nes-container with-title is-centered">
                <p class="title">Revision history</p>
                <Row>
                    <Col>Type of action</Col>
                    <Col>Details</Col>
                    <Col>Time</Col>
                    <Col>Bytes affected</Col>
                    <Col>Revert</Col>
                </Row>
                <Row>
                    <Col>Draw</Col>
                    <Col>Mario compostiion</Col>
                    <Col>11/11 12:32</Col>
                    <Col>20</Col>
                    <Col>Revert</Col>
                </Row>
                <Row>
                    <Col>Hack</Col>
                    <Col>invincibility: true</Col>
                    <Col>11/11 12:32</Col>
                    <Col>1</Col>
                    <Col>Revert</Col>
                </Row>
            </Container>



1
        </div>;
    }
}

  

const mapStateToProps = state => {
    return {
        romInfo: state.nesRomReducer.romInfo,
        md5: state.nesRomReducer.md5,
    };
};

export default connect(mapStateToProps)(Emulator);
