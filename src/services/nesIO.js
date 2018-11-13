import * as jsnes from "jsnes";
import md5 from "js-md5";

export default class NesIO {
  constructor() {
    this.fileName = null;
    this.chrSpan = null;
    this.dataView = null;
    this.chrCanvas = null;
    console.log("jsnes", jsnes);

    fetch("../files/NESPalette.json")
    .then(response => {console.log(md5(response.body)); return response;})
      .then(response => response.json())
      .then(NESPalette => {
        this.NESPalette = NESPalette;
      });
  }

  loadFile(fileName) {
    fileName = "../files/smb.nes";
    this.fileName = fileName;
    const promise = fetch(fileName)
      .then(response => this.checkStatus(response) && response.arrayBuffer())
      .then(arrayBuffer => {
        this.dataView = new DataView(arrayBuffer);
        this.chrSpan = {
          first: 16 + 16384 * this.dataView.getUint8(4),
          len: 8192 * this.dataView.getUint8(5)
        };

        const blob = new Blob(new Uint8Array(this.dataView.buffer), {
          type: "octet/stream"
        });

        /** INTEGRATE JSNES FIRST TEST */ 
        const binary = String.fromCharCode.apply(
          null,
          new Uint8Array(arrayBuffer)
        );

        const md5correct = "673913a23cd612daf5ad32d4085e0760";
        // ---> Rätt  console.log("MD5", md5(this.dataView.buffer));


        /** 
        console.log(binary.length);

        const nes = new jsnes.NES({
          onFrame: function(frameBuffer) {
            console.log("FRAME", frameBuffer);
          }
        });
        // nes.romData = 0;
        nes.loadROM(binary);
      */

        return this.dataView;
      });
    return promise;
  }

  checkStatus(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
  }
}
