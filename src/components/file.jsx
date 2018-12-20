import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";
import md5 from "js-md5";

import {
    setRomInfo,
    storeRom
} from "../redux/actions/nesRomActions";

class File extends Component {
    render() {
        const prgBytes = 16 * this.props.romInfo.prg;
        const chrBytes = 8 * this.props.romInfo.chr;
        const chrText = chrBytes > 0 ? <span>{this.props.romInfo.chr} bank(s)({chrBytes} kb)</span> : "No CHR-Rom see note below";
        const ramNote = chrBytes === 0 ? <span>Note: This rom has no CHR-Rom which means it uses CHR-Ram. You will need to dig through PRG-Rom to manipulate GFX.</span> : "";
       
        




        console.log("romifnoidnex", this.props.romInfoIndex);
       
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
                name: { this.props.romInfo.name }<br/>
                filename: { this.props.romInfo.filename}<br /> 
                md5: {this.props.romInfo.md5}<br />
                no-intro md5: {this.props.romInfo.noIntroMD5}<br />
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
                
                    <input type="file" id="rom-input" onChange={e => this.loadRom(e.target.files)} className="file-input"/>;

                 <Col><Button className="nes-btn is-primary" onClick={() => { document.getElementById("rom-input").click()}}>Load rom</Button></Col>
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
        </div>;
    }

    loadRom(data) {
        const reader = new FileReader();
        if (data[0]) {
            console.log("FINNSD ATA");
            reader.onload = (e) => {
                const dataView = new DataView(e.target.result);
                const isNes = (dataView.getUint8(0) + dataView.getUint8(1) + dataView.getUint8(2)) === 230; // I'm lazy
                if(!isNes) {
                    alert("Not a valid nes rom!");
                    return;
                }
                const noIntroMD5 = md5(dataView.buffer.slice(16)).toUpperCase();
                const name = (this.props.romNames.hasOwnProperty(noIntroMD5)) ? this.props.romNames[noIntroMD5] : "Unknown";


                const romInfo = {
                    name,
                    filename: data[0].name,
                    prg: dataView.getUint8(4),
                    noIntroMD5,
                    md5: md5(dataView.buffer).toUpperCase(),
                    chr: dataView.getUint8(5),
                    mapper: dataView.getUint8(6),
                    mapper2: dataView.getUint8(7),
                    ram: dataView.getUint8(8),
                    tv: dataView.getUint8(9),
                    ramExists: dataView.getUint8(10)
                };

                console.log(romInfo);
                

                let chrSpan;
                if (romInfo.chr > 0) {
                    chrSpan = {
                        first: 16 + 16384 * romInfo.prg,
                        len: 8192 * romInfo.chr
                    };
                } else {
                    chrSpan = {
                        first: 16,
                        len: dataView.byteLength - 100
                    };
                }
                // 

                if (this.props.romInfoIndex.md5.hasOwnProperty(noIntroMD5)) {
                    fetch("rom-info/games/" + this.props.romInfoIndex.md5[noIntroMD5] + ".json").then(response => response.json()).then( response => {
                 
                        console.log("GOT DATA", response)
                        // Kolla texttables om A-Z, a-z, 0-9

                    });
                    
                    
                    alert("DATA EXISTS");
                }


                this.props.storeRom(dataView, chrSpan);

                this.props.setRomInfo(romInfo);

            }
            reader.readAsArrayBuffer(data[0]);

        }
        else {
            alert("FAIL");
        }


    }
}

const mapDispatchToProps = dispatch => {
    return {
        setRomInfo: romInfo => {
            dispatch(setRomInfo(romInfo));
        },
        storeRom: (romData, chrSpan) => {
            dispatch(storeRom(romData, chrSpan))
        }
    }
}

const mapStateToProps = state => {
    return {
        romInfo: state.nesRomReducer.romInfo,
        romInfoIndex: state.nesRomReducer.romInfoIndex,
        romNames: state.nesRomReducer.romNames
    };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(File);
