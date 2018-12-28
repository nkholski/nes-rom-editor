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

/*
        fetch("/files/test1.ips").then(response => response.arrayBuffer()).then((arrayBuffer) => {
          const ipsView = new DataView(arrayBuffer);
          let recordStart = 5;
          //while(true) {
          console.log(ipsView.byteLength - 3);
                    console.log("O=", ipsView.getUint8(ipsView.byteLength - 3));

          console.log("O=", ipsView.getUint8(ipsView.byteLength - 2));
          // LOOP

          console.log("F=", ipsView.getUint8(ipsView.byteLength - 1));
   
          for(;;){
          if (recordStart + 6 > ipsView.byteLength) {
            alert("Corrupt IPS file");
            break;
          }
          if (ipsView.getUint8(recordStart) === 69 && ipsView.getUint8(recordStart + 1) === 79 && ipsView.getUint8(recordStart + 2) === 70) {
            console.log("END OF FILE");
            break;
          }

          
            // CHECK FOR EOF, bail

          console.log("start",  ipsView.getUint8(recordStart));

          // First 3 bytes is address
          const address = ipsView.getUint8(recordStart) * 256 * 256 + ipsView.getUint8(recordStart + 1) * 256 + ipsView.getUint8(recordStart + 2);


                  /*
Addr, 3 bytes 32784
file.jsx: 247 Size, 2 bytes 1
file.jsx: 238 Addr, 3 bytes 32792
file.jsx: 247 Size, 2 bytes 1

Addr, 3 bytes 32784
file.jsx: 243 doing byte 2
file.jsx: 243 doing byte 1
file.jsx: 243 doing byte 0
file.jsx: 248 Size, 2 bytes 1
file.jsx: 238 Addr, 3 bytes 32792
file.jsx: 243 doing byte 2
file.jsx: 243 doing byte 1
file.jsx: 243 doing byte 0
file.jsx: 248 Size, 2 bytes 1
                  */
/*
          // Byte 4,5 is size
          const size = ipsView.getUint16(recordStart + 3);

                              console.log("address", address, size);

                              debugger;


          for (let i = 0; i < size; i++) {
            this.dataView.setUint8(address + i, ipsView.getUint8(recordStart + 5 + i))
          }
          recordStart += 3 + 2 + size;

          }
          console.log("IPS DONW");


          //}*/

/*
          console.log("A", ipsView.getUint8(1));

          console.log("IPS", ipsView);

        })
*/
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