// http://www.dustmop.io/blog/2015/04/28/nes-graphics-part-1/

console.log("KÖR!");
let vaaaa = new ArrayBuffer(8);
class Reader {
  constructor(nesFile) {
    this.dataView;
    this.chr;
    this.moved = 0;
    this.heart = [
      0x66,
      0x7f,
      0xff,
      0xff,
      0xff,
      0x7e,
      0x3c,
      0x18,
      0x66,
      0x5f,
      0xbf,
      0xbf,
      0xff,
      0x7e,
      0x3c,
      0x18
    ]; //$66 $7f $ff $ff $ff $7e $3c $18 $66 $5f $bf $bf $ff $7e $3c $18
    /*this.palette = [
      "rgb(0,0,0)",
      "rgb(255,0,0)",
      "rgb(0,255,0)",
      "rgb(0,0,255)"
    ];*/
    this.palette = [
    "#000000",
    "#F83800",
    "#FCA044",
    "#AC7C00"
    ];
    this.currentColor = 0;
    this.currentByteIndex = 0;
    this.a_save = document.createElement("a");
    document.body.appendChild(this.a_save);
    this.a_save.style = "display: none";

    // Color elements
    const colorElements = document
      .getElementById("colors")
      .getElementsByTagName("div");
    for (let i = 0; i < 4; i++) {
      colorElements[i].style.backgroundColor = this.palette[i];
      colorElements[i].addEventListener("click", () => {
        this.currentColor = i;
      });
    }

    this.chrCanvas = document.getElementById("chrCanvas");
    console.log(document.getElementById("chrCanvas").width);
    document.getElementById("chrCanvas").width = 64 + 8;
    document.getElementById("canvasNav").width = 64 + 8; // * (this.chrCanvas.getBoundingClientRect().width / this.chrCanvas.offsetWidth);

    this.chrCtx = this.chrCanvas.getContext("2d");
    this.chrCanvas.addEventListener("click", event => {
      const scale =
        this.chrCanvas.getBoundingClientRect().width /
        this.chrCanvas.offsetWidth;
      const mousePos = this.getMousePos(this.chrCanvas, event);
      // Get 8x8 block coordiante
      const x = Math.floor(mousePos.x / (9 * scale));
      const y = Math.floor(mousePos.y / (9 * scale)) + Math.floor((this.chr.first) / 128);
      console.log(x, y, Math.floor((this.chr.first) / 128));
      // Get first byte! 8 rows, 16 bytes per block
      const byteIndex = (x + y * 8) * 16;
      this.currentByteIndex = byteIndex;
      this.editBlock(byteIndex);
    });

    this.drawCanvas = document.getElementById("drawCanvas");
    this.drawCtx = this.drawCanvas.getContext("2d");
    this.drawCanvas.addEventListener("click", event => {
      const scale =
        this.drawCanvas.getBoundingClientRect().width /
        this.drawCanvas.offsetWidth;
      const mousePos = this.getMousePos(this.drawCanvas, event);
      // Get 8x8 block coordiante
      const x = Math.floor(mousePos.x / scale) - 1; // Border räknas in
      const y = Math.floor(mousePos.y / scale) - 1;
      console.log("XXX", x, y);
      if (x > -1 && y > -1 && x < 8 && y < 8) {
        this.putPixel(x, y);
      }
    });

    (async () => {
      await Promise.all([
        fetch("NESPalette.json")
          .then(response => response.json())
          .then(NESPalette => {
            this.NESPalette = NESPalette;
          }),
        fetch(nesFile)
          .then(response => checkStatus(response) && response.arrayBuffer())
          .then(arrayBuffer => {
            this.dataView = new DataView(arrayBuffer);
          })
      ]);

      this.chr = {
        first: 16 + 16384 * this.dataView.getUint8(4),
        len: 8192 * this.dataView.getUint8(5)
      };
      
      // 32640, 32783
      console.log(this.chr, this.chr.first + this.chr.len, this.dataView.byteLength )

      /*this.chr = {
        first: 0, //this.chr.first,
        len: this.dataView.byteLength //this.chr.len //dataView.byteLength
      };*/
/*      console.log(`
PRG Size (x 16384 byte): ${dataView.getUint8(4)}
CHR Size (x 8192 byte): ${dataView.getUint8(5)}                    
    `);*/
      this.draw(this.chr.first, this.chr.first + this.chr.len);
      this.getPalettes();
    })();

    /*fetch(test)
            .then(
                (response) => checkStatus(response) && response.arrayBuffer())
            .then(
                (data) => {
                    const dataView = new DataView(data);
                    dataView.setUint8(0x005E8, 0);
                    // const dataView = new DataView(new Uint8Array(this.heart).buffer);
                    console.log(dataView);
                    window.dataView = dataView;
                    this.chr = {
                        first: 15 + 16384 * dataView.getUint8(4),
                        len: 8192 * dataView.getUint8(5)
                    };
                    this.chr = {
                        first: 0,
                        len: dataView.byteLength
                    }
                    //  this.data2pixels(dataView, 0, 8 * 8 * 2);

                    console.log(`
PRG Size (x 16384 byte): ${dataView.getUint8(4)}
CHR Size (x 8192 byte): ${dataView.getUint8(5)}                    
                    `);
                    this.dataView = dataView;
                    // setInterval(() => {
                    //     this.draw();
                    //  }, 1000);
                    this.draw(this.chr.first, this.chr.first + this.chr.len);
                })
        /* .catch(
             (e) => {
                 console.log("ERROR", e);
             });*/
    //this.getPalettes();
  }

  getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  editBlock(byteIndex) {
      console.log("EDIT BYTE", byteIndex);
    this.render8x8block(byteIndex, 0, 0, this.drawCtx);
  }

  putPixel(x, y) {
    const setBit = [[0, 0], [1, 0], [0, 1], [1, 1]][this.currentColor];
    console.log("xy", x, y);
    const byteIndex = this.currentByteIndex + y;

    for (let i2 = 0; i2 < 2; i2++) {
      const index = byteIndex + i2 * 8;
      let byte = byteToBinary(this.dataView.getUint8(index));
      /*       let test = this.dataView.getUint8(index);
                   this.dataView.setUint8(index, test);*/
      // console.log(test,">>",this.dataView.getUint8(index));
      console.log("Byte " + i2, byte);
      byte = byte.slice(0, x) + setBit[i2] + byte.slice(x + 1);
      console.log("Byte new " + i2, byte, parseInt(byte, 2));
      //          console.log(index, "--->", parseInt(byte,2));
      this.dataView.setUint8(index, parseInt(byte, 2));
    }
    // this.draw(this.chr.first, this.chr.first + this.chr.len);
    const x2 = this.currentByteIndex % 128;
    const y2 = Math.floor(this.currentByteIndex / 128);
    this.render8x8block(this.currentByteIndex, x2 / 2 + x2 / 16, y2 * 9);
    this.render8x8block(this.currentByteIndex, 0, 0, this.drawCtx);
  }

  draw(from, to) {
    console.log("FIRST DRAW");
    console.log("ft", from, to);
    //this.chr.first = 0;
    //this.chr.len*=1;
    for (let i = from; i < to; i += 16) {
      const x = i % 128;
      const y = Math.floor((i - this.chr.first) / 128) ;
      this.render8x8block(i, x / 2 + x / 16, y * 9);
    }
    return;

    console.log("a", this.chr.len);
    this.render8x8block(0, 5, 5);
    return;
    // this.moved++;
    for (let i = 0; i < 8; i++) {
      console.log("i=", i);
      const colorSettings = this.palette;
      const bytes = [];
      for (let i2 = 0; i2 < 2; i2++) {
        bytes[i2] = byteToBinary(
          this.dataView.getUint8(this.chr.first + i + i2 * 8)
        );
      }
      console.log(".", bytes);

      for (let x = 0; x < 8; x++) {
        let cI = 1 * bytes[0].substr(x, 1) + 2 * bytes[1].substr(x, 1);
        this.chrCtx.fillStyle = colorSettings[cI];
        this.chrCtx.fillRect(x, i, 1, 1);
      }

      console.log(".", bytes);
      continue;

      //const colors = byteToPixels(this.dataView.getUint8(this.chr.first + i));

      let i2 = i + this.moved;
      // 64px wide, 4 per byte
      const x = (i2 * 4) % 64;
      const y = Math.floor((i2 * 4) / 64);
      //  console.log(y);

      // 64px wide

      colors.forEach((color, cI) => {
        this.chrCtx.fillStyle = colorSettings[color];
        this.chrCtx.fillRect(x + cI, y, 1, 1);
      });
    }
  }

  render8x8block(I, X, Y, ctx = this.chrCtx) {
      console.log("TEST", I);
    for (let i = 0; i < 8; i++) {
      const bytes = [];
      for (let i2 = 0; i2 < 2; i2++) {
        bytes[i2] = byteToBinary(
          this.dataView.getUint8(I + i + i2 * 8) //this.chr.first + 
        );
      }
      for (let x = 0; x < 8; x++) {
        let cI = 1 * bytes[0].substr(x, 1) + 2 * bytes[1].substr(x, 1);
        ctx.fillStyle = this.palette[cI];
        ctx.fillRect(X + x, Y + i, 1, 1);
      }
    }
  }

  save() {
    //  new File(new Uint8Array(this.dataView.buffer), "filename.nes", { type: "octet/stream" });
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(this.dataView.buffer))
    );
    /* const blob = new Blob(base64String, {
            type: "application/x-binary"
        });*/
    const blob = new Blob([new Uint8Array(this.dataView.buffer)], {
      type: "octet/stream"
    });
    const url = window.URL.createObjectURL(blob);
    this.a_save.href = url;
    this.a_save.download = "smb-hack.nes";
    this.a_save.click();
    window.URL.revokeObjectURL(url);
  }

  getPalettes() {
    const data = `#Characters
0x005E8 to 0x----- (0001) = Color of Small/Big Mario's hat + outer clothing
0x005E9 to 0x----- (0001) = Color of Small/Big Mario's skin
0x005EA to 0x----- (0001) = Color of Small/Big Mario's hair + inner clothing
0x005EC to 0x----- (0001) = Color of Small/Big Luigi's hat + outer clothing
0x005ED to 0x----- (0001) = Color of Small/Big Luigi's skin
0x005EE to 0x----- (0001) = Color of Small/Big Luigi's hair + inner clothing
0x005F0 to 0x----- (0001) = Color of Fire Mario/Luigi's hat + outer clothing
0x005F1 to 0x----- (0001) = Color of Fire Mario/Luigi's skin
0x005F2 to 0x----- (0001) = Color of Fire Mario/Luigi's hair + inner clothing`;
    const rows = data.split("\n");
    let html = "";

    let colorSelectOptions = "";
    this.NESPalette.forEach((color, i) => {
      if (i > 13 && color == "#000000") {
        return;
      }
      colorSelectOptions +=
        '\n<option style="background-color: ' +
        color +
        '" value="' +
        i +
        '">' +
        color +
        "</option>";
    });
    console.log(colorSelectOptions);

    rows.forEach(row => {
      if (row.substr(0, 1) === "#") {
        // html+="<h2>"+row.substr(1,100)+"</h2>";
      } else {
        const addr = parseInt(row.substr(0, 7), 16);
        const desc = row.substr(28);
        const original = this.dataView.getUint8(addr);
        const options = colorSelectOptions.replace(
          new RegExp('(value="' + original + '")'),
          "$1 selected"
        );
        html += `<br><select id="color-${addr}" style="background-color: ${
          this.NESPalette[original]
        }" onchange="nesGfx.paletteShift(this)">${options}</select> ${desc}`;
      }
      html += "\n";
    });
    document.getElementById("paletteEditor").innerHTML = html;
    //    console.log(html);
  }

  paletteShift(element){
    const addr = element.id.substr(6);
    const value = parseInt(element.value);
    window.element = element;
    element.style.backgroundColor = this.NESPalette[value];
    this.dataView.setUint8(addr, value);
  }
}

byteToBinary = byte => {
  return byte.toString(2).padStart(8, "0");
};

byteToPixels = byte => {
  const binary = byte.toString(2).padStart(8, "0");

  //console.log(byte,binary);
  return [
    parseInt(binary.substr(0, 2), 2),
    parseInt(binary.substr(2, 2), 2),
    parseInt(binary.substr(4, 2), 2),
    parseInt(binary.substr(6, 2), 2)
  ];
};

if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log("YES");
  // Great success! All the File APIs are supported.
  //https://www.html5rocks.com/en/tutorials/file/dndfiles/
} else {
  alert("The File APIs are not fully supported in this browser.");
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  //return binary;
  return window.btoa(binary);
}

const nesGfx = new Reader("smb.nes");
