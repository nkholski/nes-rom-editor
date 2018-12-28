import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";

class IPSPatcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      IPSView: null
    };
  }

  render() {
    if (!this.state.IPSView) {
      return (
        <div>
          IPS-patcher Patch the currently loaded rom with a IPS-file.
          <input
            type="file"
            id="rom-input"
            onChange={e => this.loadIPS(e.target.files)}
            className="file-input"
            accept=".ips"
          />
          ;
          <Col>
            <Button
              className="nes-btn is-primary"
              onClick={() => {
                document.getElementById("rom-input").click();
              }}
            >
              Load IPS
            </Button>
          </Col>
        </div>
      );
    }

    /*
        In the future if we know here graphics is defined:
                    [ ] GRAPHICS ONLY / PRG ONLY /ALL
        */

    return (
      <div>
        The patch file was parsed sucessfully. [ ] PRG ROM [ ] CHR ROM PATCH!
        <Button
                onClick={() => {
                    this.applyIPS();
                }}
            >
                PATCH
            </Button>
      </div>
    );
  }

  loadIPS(files) {
    const IPSFile = files[0];
    if (!IPSFile) {
      alert("No data");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      // Find out where IPS is doing stuff and
      // PRG ROM, bank 1: 100 bytes
      // CHR ROM, bank 3: 1367 bytes
      this.setState({ IPSView: new DataView(e.target.result) });
    };
    reader.readAsArrayBuffer(IPSFile);
  }

  applyIPS() {
    /**
     * 
     *  TODO: Create new dataview and allow length> original rom length.
     *  Also: Patch only untouched data in current hack (good for pushing levels)
     */
    let IPS = this.state.IPSView;
    let IPSLen = IPS.byteLength;
    let ROMMax = this.props.romData.byteLength;
    let endedWell = false;
    console.log(IPSLen);
    for(let rI = 5;;){
        if (rI + 6 > IPS.dataLenght) {
            alert("Corrupt IPS file");
            break;
        }
        if (
            IPS.getUint8(rI) === 69 &&
            IPS.getUint8(rI + 1) === 79 &&
            IPS.getUint8(rI + 2) === 70
        ) {
            endedWell = true;
            break;
        }
        const address = IPS.getUint8(rI) * 256 * 256 +
                IPS.getUint8(rI + 1) * 256 +
                IPS.getUint8(rI + 2);
        
        const size = IPS.getUint16(rI + 3);

        if(rI + 3 + 2 + size - 3 > ROMMax) {
            alert("BAD IPS");
            break;
        }
        
        for (let bI = 0; bI < size; bI++) {
            this.props.romData.setUint8(
                address + bI,
                IPS.getUint8(rI + 5 + bI)
            );
        }
        rI += 3 + 2 + size;
    }
    console.log("END", endedWell);

  }

  patchIPS() {
    // IPS
    fetch("/files/smb-test2.ips")
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const ipsView = new DataView(arrayBuffer);
        let recordStart = 5;
        //while(true) {

        // LOOP

        console.log("O=", ipsView.getUint8(ipsView.length - 3));

        for (;;) {
          if (recordStart + 6 > ipsView.dataLenght) {
            alert("Corrupt IPS file");
            break;
          }
          if (
            ipsView.getUint8(recordStart) === 69 &&
            ipsView.getUint8(recordStart + 1) === 79 &&
            ipsView.getUint8(recordStart + 2) === 70
          ) {
            console.log("END OF FILE");
            break;
          }

          // CHECK FOR EOF, bail

          // First 3 bytes is address
          const address =
            ipsView.getUint8(recordStart) * 256 * 256 +
            ipsView.getUint8(recordStart + 1) * 256 +
            ipsView.getUint8(recordStart + 2);

          console.log("ADDRESS", address);

          // Byte 4,5 is size
          const size = ipsView.getUint16(recordStart + 3);
          for (let i = 0; i < size; i++) {
            this.props.romData.setUint8(
              address + i,
              ipsView.getUint8(recordStart + 5 + i)
            );
          }
          recordStart += 3 + 2 + size;
        }
        // this.props.replaceRom(this.props.romData, false);
      });
  }
}

const mapStateToProps = state => {
  return {
    chrSpan: state.nesRomReducer.chrSpan,
    romData: state.nesRomReducer.romData
  };
};

/*const mapDispatchToProps = dispatch => {
  return {
    setClipByte: byteIndex => {
      dispatch(setClipByte(byteIndex));
    },
    setRomSettings: romSettings => {
      dispatch(setRomSettings(romSettings));
    }
  };
};*/

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(IPSPatcher);
