import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";
import { loadFile } from "../services/romIO";

import {
  setRomInfo,
  storeRom,
  setRomSettings
} from "../redux/actions/nesRomActions";

class File extends Component {
    render() {
        let page = null;
        if(this.props.romVersion > 0 && Object.keys(this.props.romInfo).length>0) {
            const prgBytes = this.props.romInfo ? 16 * this.props.romInfo.prg.length : -1;
            const chrBytes = 8 * this.props.romInfo.chr.length;
            const chrText = chrBytes > 0 ? <span>{this.props.romInfo.chr.length} bank(s)({chrBytes} kb)</span> : "No CHR-Rom see note below";
            const ramNote = chrBytes === 0 ? <span>Note: This rom has no CHR-Rom which means it uses CHR-Ram. You will need to dig through PRG-Rom to manipulate GFX.</span> : "";
            page = <Container className="nes-container with-title is-centered">
                <p className="title">Current rom info</p>
                <Row>
                    <Col>
                        name: {this.props.romInfo.name}<br />
                        filename: {this.props.romInfo.filename}<br />
                        md5: {this.props.romInfo.md5}<br />
                        no-intro md5: {this.props.romInfo.noIntroMD5}<br />
                        prg-rom: {this.props.romInfo.prg.length} bank(s) ({prgBytes} kb)<br />
                        chr-rom: {chrText}<br />
                        Hacks: 15<br />
                        Palette references: 10<br />
                        Compostions: 5 (20% of CHR-Rom mapped)<br />
                        Text tables: 1<br />
                        Text references: 10<br />

                        {ramNote}
                    </Col>
                </Row>
            </Container>;

        }

       
        

        console.log("romifnoidnex", this.props.romInfoIndex);
       
       return <div id="rom-page" className="row">
            <Container className="nes-container with-title is-centered">
                <p className="title">Welcome to NES Tamp</p>
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

           {page}

           <input type="file" id="rom-input" onChange={e => this.loadRom(e.target.files)} className="file-input" accept=".nes" />
            <Container className="nes-container with-title is-centered">
                <p className="title">Rom actions</p>
                <Button className="nes-btn is-primary" onClick={() => { document.getElementById("rom-input").click()}}>Load rom</Button>
                <Button className="nes-btn is-primary">Save rom to localStorage</Button>
                <Button className="nes-btn is-primary">Download rom</Button>
                <Button className="nes-btn is-primary" onClick={()=> { this.downloadIPS();}}>Download IPS</Button>
                
            </Container>

            <Container className="nes-container with-title is-centered">
                <p className="title">Revision history</p>
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
        this.props.loadFile(data[0], this.props.romNames, this.props.romInfoIndex);
    }

    downloadIPS(){
        const len = this.props.romData.byteLength;
        let ipsString = "PATCH";
        let diffStart = -1;
        let diffBlock = [];
        let noDiffCount = 0;
        let dataviewLength = 5+3;
        const records = [];
        let currentRecord = { addr: -1, values: []};
        for(let i = 0; i<len; i++){
            const diff = this.props.untouchedRom.getUint8(i) !== this.props.romData.getUint8(i);

            // Remember new value if different or we're already started from a diff
            if (diff || (currentRecord.addr !== -1)) {
                currentRecord.values.push(this.props.romData.getUint8(i));
            }

            // If there is a diff, reset the noDiffCount and check if we new about it since before.
            if(diff) {
                noDiffCount = 0;
                if (currentRecord.addr === -1) {
                  currentRecord.addr = i;
                } 
            }
            else {
                noDiffCount++;
            }

            if(noDiffCount===5 && currentRecord.addr !== -1) {
                currentRecord.values = currentRecord.values.slice(0, currentRecord.values.length - 5);
                currentRecord.size = currentRecord.values.length;
                records.push(currentRecord);
                dataviewLength += 5 + currentRecord.values.length;
                currentRecord = { addr: -1, values: []};
            }

        }

        if (records.length === 0) {
            alert("No changes detected");
            return;
        }

        
        let IPSview = new DataView(new ArrayBuffer(dataviewLength));

        ("PATCH").split("").forEach((letter, i) => {
            IPSview.setUint8(i, letter.charCodeAt(0));
        });
        ("EOF").split("").forEach((letter, i) => {
            IPSview.setUint8(dataviewLength-3+i, letter.charCodeAt(0));
        });

        console.log(IPSview.getUint8(1));

        console.log("DV",dataviewLength, IPSview);
        let currentPos = 5;       
        records.forEach(record => {
            // Turn start address to 24 bit number, expressed in three bytes
            const startAddrString = ("000000000000000000000000" + record.addr.toString(2)).slice(-24);
            for (let byte = 0; byte < 3; byte++) {
                const num = parseInt(startAddrString.substring(8 * byte, 8 * byte + 8), 2);
                IPSview.setUint8(currentPos++, num)
            }
            // Turn size (record.values.length) into a 16 bit number as above
            const sizeString = ("0000000000000000" + record.values.length.toString(2)).slice(-16);
            for (let byte = 0; byte < 2; byte++) {
                const num = parseInt(sizeString.substring(8 * byte, 8 * byte + 8), 2);
                IPSview.setUint8(currentPos++, num);
            }
            // Push all number as bytes into the string
            record.values.forEach((num) => {
                IPSview.setUint8(currentPos++, num);
            });
        });
        /*
        let IPSdata = "PATCH"; 
        records.forEach(record => {
            // Turn start address to 24 bit number, expressed in three bytes
            const startAddrString = ("000000000000000000000000" + record.addr.toString(2)).slice(-24);
            for (let byte = 0; byte < 3; byte++) {
                const ascii = parseInt(startAddrString.substring(8 * byte, 8 * byte + 8), 2);
                IPSdata += String.fromCharCode(ascii);
            }
            // Turn size (record.values.length) into a 16 bit number as above
            const sizeString = ("0000000000000000" + record.values.length.toString(2)).slice(-16);
            for (let byte = 0; byte < 2; byte++) {
                const ascii = parseInt(sizeString.substring(8 * byte, 8 * byte + 8), 2);
                IPSdata += String.fromCharCode(ascii);
            }
            // Push all number as bytes into the string
            record.values.forEach((n) => {
                IPSdata += String.fromCharCode(n);
            });
        });
        IPSdata+="EOF";
        */



       // console.log(records);

         /*   if(diffCnt === 10 && diffStart !== -1) {
                let recordString = "";
                console.log("Addr, 3 bytes", diffCnt, diffStart);

                // Turn start address to 24 bit number, expressed in three bytes
                const startAddrString = ("000000000000000000000000" + diffStart.toString(2)).slice(-24);
                let charCodes = [];
                for(let byte=0; byte<3; byte++){
                    const ascii = parseInt(startAddrString.substring(8 * byte, 8 * byte + 8),2);
                    recordString += String.fromCharCode(ascii);
                    charCodes.push(String.fromCharCode(ascii).charCodeAt(0));
                }

                //console.log("THE SAME?", diffStart, charCodes[0] * 256 * 256 + charCodes[1] * 256 + charCodes[2]);
                //const decodedAddress = ipsView.getUint8(recordStart) * 256 * 256 + ipsView.getUint8(recordStart + 1) * 256 + ipsView.getUint8(recordStart + 2);


                //console.log("Size, 2 bytes", diffBlock.length);
                // Turn size (diffBlock.length) into a 16 bit number as above
                const sizeString = ("0000000000000000" + diffBlock.length.toString(2)).slice(-16);
                for (let byte = 0; byte < 2; byte++) {
                    const ascii = parseInt(sizeString.substring(8 * byte, 8 * byte + 8), 2);
                    recordString += String.fromCharCode(ascii);
                }

                // Push all number as bytes into the string
                diffBlock.forEach((n) => {
                    recordString += String.fromCharCode(n);
                });
                
                // Add it all to the IPS-output string
                ipsString += recordString;

                // Reset
                diffStart = -1;
                diffBlock = [];
                diffCnt = 0;
            }
            
            
        


        }*/

        //console.log(ipsString);
        console.log(records);

        const filename = this.props.romData.filename + ".ips";
        const blob = new Blob([new Uint8Array(IPSview.buffer)], {
            type: "octet/stream"
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);


        //console.log("IPS", ipsString);
    }
}

/*const mapDispatchToProps = dispatch => {
    return {
        setRomInfo: romInfo => {
            dispatch(setRomInfo(romInfo));
        },
        storeRom: (romData, chrSpan) => {
            dispatch(storeRom(romData, chrSpan))
        },
    }
}*/

const mapDispatchToProps = dispatch =>
  bindActionCreators({ setRomInfo , storeRom, setRomSettings, loadFile }, dispatch);


const mapStateToProps = state => {
    return {
        romInfo: state.nesRomReducer.romInfo,
        romInfoIndex: state.nesRomReducer.romInfoIndex,
        romNames: state.nesRomReducer.romNames,
        romData: state.nesRomReducer.romData,
        untouchedRom: state.nesRomReducer.untouchedRom,
        romVersion: state.nesRomReducer.version
    };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(File);
