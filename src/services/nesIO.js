import * as jsnes from "jsnes";
import md5 from "js-md5";

export default class NesIO {
  constructor() {
    this.fileName = null;
    this.chrSpan = null;
    this.dataView = null;
    this.chrCanvas = null;
    this.romInfo = null;

    fetch("/files/nespalette.json")
      .then(response => {
        console.log("palette OK");
        return response;
      })
      .then(response => response.json())
      .then(NESPalette => {
        this.NESPalette = NESPalette;
      });
  }

  loadFile(fileName) {
    //fileName = "/rom/smb.nes";
    //const rom = "Mega\ Man\ 2\ \(U\)";
      const rom = "smb";
    fileName = "/rom/" + rom + ".nes";
    this.fileName = fileName;
    const promise = fetch(fileName)
      .then(response => this.checkStatus(response) && response.arrayBuffer())
      .then(arrayBuffer => {
        console.log("ROM OK", arrayBuffer);

       /* const binary = String.fromCharCode.apply(
          null,
          new Uint8Array(arrayBuffer)
        );*/

       /* console.log("BIN", typeof (binary));*/

        
        this.dataView = new DataView(arrayBuffer);


        this.romInfo = {
          name: rom,
          prg: this.dataView.getUint8(4),
          chr: this.dataView.getUint8(5),
          mapper: this.dataView.getUint8(6),
          mapper2: this.dataView.getUint8(7),
          ram: this.dataView.getUint8(8),
          tv: this.dataView.getUint8(9),
          ramExists: this.dataView.getUint8(10)
        };

        const chrRomBlocks = this.dataView.getUint8(5);

        if (chrRomBlocks > 0) {
          this.chrSpan = {
            first: 16 + 16384 * this.dataView.getUint8(4),
            len: 8192 * this.dataView.getUint8(5)
          };
        } else {
          this.chrSpan = {
            first: 16,
            len: this.dataView.byteLength - 100
          };
        }


      /*  const blob = new Blob(new Uint8Array(this.dataView.buffer), {
          type: "octet/stream"
        });*/


        // const binary2 = new Uint8Array(this.dataView.buffer);
        // const binary2 = new TextDecoder("utf-8").decode(new Uint8Array(this.dataView));
       /* const binary2 = String.fromCharCode.apply(
          null,
          new Uint8Array(this.dataView.buffer)
        );*/



     //   console.log("BIN2", typeof (binary2));

    //    console.log("IS BINARY SAME", (binary == binary2));

        // debugger;
        /** INTEGRATE JSNES FIRST TEST 

        const nes = new jsnes.NES({
          onFrame: function(frameBuffer) {
            console.log("FRAME", frameBuffer);
          }
        });
        // nes.romData = 0;
        nes.loadROM(binary);
      */

        // this.findPaletteInRom(this.dataView, [this.dataView.getUint8(1512), this.dataView.getUint8(1513), this.dataView.getUint8(1514)], this.chrSpan.first)
        return this.dataView;
      });
    return promise;
  }

  findPaletteInRom(romData, paletteArray, prgLen) { // Just a test for future feature, will move somwhere else
    let step = 0;
    console.log("Will try", prgLen, paletteArray);
    for (let i = 0; i < prgLen; i++) {
      if (romData.getUint8(i) === paletteArray[step]) {
        step++;
      } else if (romData.getUint8(i) === paletteArray[0]) {
        step = 1;
      } else {
        step = 0;
      }
      if (step === 3) {
        console.log(`Possible byteIndex  ${i-2} to ${i}.`);
      }

    }
  }

  checkStatus(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
  }
}