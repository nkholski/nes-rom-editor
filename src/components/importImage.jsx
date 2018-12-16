import React, { Component } from "react";
import { connect } from "react-redux";
import { Progress } from "reactstrap";
import CompositionService from "../services/compositionService";
import { timingSafeEqual } from "crypto";


import {
  Input,
  FormGroup,
  Label
} from "reactstrap";

class ImportImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      skipped: 0,
      identified: 0,
      unknown: 0,
      task: 0,
      total: 0,
      progress: 0,
      palette: [],
      composition: [],
      checkedPalettes: []
    };
    this.task = 0;
  }

  render() {
    if(this.state.progress !== 100) {
      return <h2>Parsing the image (this might take a while)</h2>
    }

    const unknownTiles = this.state.total - this.state.skipped - this.state.identified;
    let text = "The image was successfully scanned. ";
    if(unknownTiles === 0){
      text += "All tiles was mapped to the rom. ";
    }
    else {
      text += "I could'nt make head or tail of " + unknownTiles + "tiles. Either the tiles are generated in an unknown way or more likely the tiles isn't totally pure (like some grass pixels by the characters shoe) or the entire tile is aligned wrong in a 8x8 grid.";
      text += "However, "+this.state.identified+" tiles was found and mapped to the rom. "
    }
    if (this.state.skipped !== 0) {
      text += this.state.skipped + " one colored or transparent tiles was found and was skipped.";
    }

    let paletteText = "";
    const checkedPalettes = [];
    if(this.state.palettes.length>0){
      const paletteTable = this.state.palettes.map((palette, i) => {
        checkedPalettes[i] = this.state.checkedPalettes.hasOwnProperty(i) ? this.state.checkedPalettes[i] : (palette[3] === 0);
        const className = "palette-boxes " + (checkedPalettes[i] ? "" : "unchecked ") + (palette[3] === 1 ? "grouped" : "");
        return <tr key={i + "." + palette[0] + "."+palette[1]+"."+palette[2]}>

            <td>
              <input type="checkbox" checked={checkedPalettes[i]} id={"palette-checkbox-"+i} onChange={this.togglePalette} />
            </td>
            <td class={className}>
              <div style={{ backgroundColor: this.props.nesPalette[palette[0]] }}>{palette[0]}</div> 
              <div style={{ backgroundColor: this.props.nesPalette[palette[1]] }}>{palette[1]}</div>
              <div style={{ backgroundColor: this.props.nesPalette[palette[2]] }}>{palette[2]}</div>
            </td>
            <td>
            <Input type="text" id={"palette-name-"+i} data-index={i} className="palette-name" placeholder="Palette name" />

            </td>
        
  
        </tr>
      });
      paletteText = <div>
          <p>
            {this.state.palettes.length} palettes was identified and mapped to the NES Color table. It's suggested to save this for easier graphical rendering, and change the palette in the actual game. Not all colors are used in all parts of a sprite. The suggested approach is to save the longest unique combinations, if you have one 16-27-18 palette and a 16-??-18 palette, the latter one is probably be the same as the former and you're adviced to skip it.
            <Input type="text" id="composition-name" placeholder="Composition name" />
          </p>
          <table>
            <tbody>{paletteTable}</tbody>
          </table>
        </div>;
    }

    const rgbOptions = this.props.nesPalette.map((color,i) => {
      return <option style={{backgroundColor: color}} key={i+color}>{i}</option>;
    });

    return (
      <div>
        <img id="testar" />

      {this.state.identified}
        {this.state.total}
        <h2>Result</h2>
        <p>{text}</p>
        {paletteText}
        <button onClick={this.saveComposition}>Save composition</button>
        <select>{rgbOptions}</select>
      </div>)
      ;

/*        <br />
        Identified tiles: {this.state.identified}
        <br />
        Unknown tiles:
        {}
        <br />
        <div className="text-center">Progress {this.state.progress}%</div>
        <Progress value={this.state.progress} />
        <div>
          Possible palettes: 1. [c1][c2][c3] - [Highligth] alternative 1: input
          ett namn ör alterntivet
        </div>
      </div>
    );*/
  }
  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (this.task === 0) {
      this.task = 1;

      if (this.props.imageBinaryData) {
        const img = document.getElementById("testar");
        img.src = "data:image/png;base64," + btoa(this.props.imageBinaryData);
        this.tileCollector(img);
      } else {
        this.loadFromFile("/smb-items.png").then(img =>
          this.tileCollector(img)
        );
      }
    }
  }


  saveComposition = () => {
    const paletteNames = document.getElementsByClassName("palette-name");
    const palettes = []; // Palettes to save
    for(let i=0; i<paletteNames.length; i++){
      if(this.state.checkedPalettes[i]){
        const colors = [
          -1,
          this.state.palettes[i][0],
          this.state.palettes[i][1],
          this.state.palettes[i][2]
        ];
        palettes.push(
          {
            name: paletteNames[i].value,
            colors,
            addr: null
          }
        )
      }
    }
    console.log(palettes);
    // parseInt(document.getElementsByClassName("palette-name")[0].getAttribute("data-index"),10);


    console.log(paletteNames);


  }

  /* componentWillReceiveProps(){
        console.log("YUP");
    }*/

  updateProgress(img, X, Y) {
    const total = (img.width * img.height) / 64;
    const done = (img.height / 8) * X + Y;
    const progress = Math.round((100 * done) / total);
    if (progress !== this.state.progress) {
      this.setState({
        progress
      });
      // this.forceUpdate();
    }
  }

  togglePalette = (e) => {
    const {id, checked} = e.target;
    const index = parseInt(id.match(/[0-9]+/),10);
    const checkedPalettes = [...this.state.checkedPalettes];
    checkedPalettes[index] = checked;
    this.setState({
      checkedPalettes
    })
  }

  loadFromFile(url) {
    return new Promise(resolve => {
      const i = new Image();
      i.onload = () => {
        resolve(i);
      };
      i.src = url;
    });
  }

  binaryToImg(bin) {
    const i = new Image();
    //        i.src = url;
  }

  tileCollector(img) {
    // Variants of possible color index mapping
    const mappingVariants = [];
    for (let i1 = 0; i1 < 4; i1++) {
      for (let i2 = 0; i2 < 4; i2++) {
        if (i2 !== i1) {
          for (let i3 = 0; i3 < 4; i3++) {
            if (i3 !== i1 && i3 !== i2) {
              for (let i4 = 0; i4 < 4; i4++) {
                if (i4 !== i1 && i4 !== i2 && i4 !== i3) {
                  mappingVariants.push([i1, i2, i3, i4]);
                }
              }
            }
          }
        }
      }
    }
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    tmpCtx.drawImage(img, 0, 0, img.width, img.height);
    const { composition, palettes} = this.imageScan({
      composition: [],
      img,
      tmpCtx,
      mappingVariants
    });


    console.log("DONE", composition, palettes);

    const checkedPalettes = [];
    for(let i=0; i<palettes.length; i++) {
      checkedPalettes[i] = palettes[i][3] === 0;
    }



    this.setState({
      total: (img.width * img.height) / 64,
      composition,
      palettes,
      checkedPalettes,
      progress: 100
    });



    // window.composition = composition;
    // CompositionService.save(Math.random(), composition);
    ;
  }

  imageScan({ composition, img, tmpCtx, mappingVariants }) {
    const { chrSpan, romData } = this.props;
    const foundPalettes = [];
    let identified = 0; // ?

    let skipped = 0;
    // X, Y is the tile coordinates (jumps 8 pixels)
    // x, y is the coordinates within the tile (0-7)

    for (let X = 0; X < img.width / 8; X++) {
      composition[X] = [];
      for (let Y = 0; Y < img.height / 8; Y++) {
        this.updateProgress(img, X, Y);
        composition[X][Y] = null;

        // Get tile from bitmap
        const tile = tmpCtx.getImageData(X * 8, Y * 8, 8, 8).data;
        let backgroundExists = false;

        // Skip if tile is has just one color:
        let diffExists = false;
        for (let y = 0; y < 8; y++) {
          if (diffExists) {
            break;
          }
          for (let x = 0; x < 8; x++) {
            const i = (x + y * 8) * 4;
            if (
              tile[i] !== tile[0] ||
              tile[i + 1] !== tile[1] ||
              tile[i + 2] !== tile[2]
            ) {
              diffExists = true;
              break;
            }
          }
        }
        if (!diffExists) {
          skipped++;
          this.setState({ skipped });
          continue;
        }

        // Each tile need to define its own colorIndex
        let colorToTempIndex = {};
        let colorToIndex = 0;
        // We often start of with multiple matches, and then they drop off for each horizontal line that's analysed
        let matches = [];
        let backgroundIndex = -1;

// eslint-disable-next-line
        [false, true].forEach(flipX => {
          [false, true].forEach(flipY => {
            if (composition[X][Y] != null) {
              console.log("GOT IT");
              return;
            }
            if (flipY) {
              console.log("flipl");
            }
            // Scan through the tile from the rom data, compare it to the tile from the bitmap
            for (let stepY = 0; stepY < 8; stepY++) {
              const compareArray = [];

              // Get a slice
              const y = flipY ? 7 - stepY : stepY;
              for (let stepX = 0; stepX < 8; stepX++) {
                // Get pixel from tile, c[0] = red, 1 = g, 2 = b
                const x = flipX ? 7 - stepX : stepX;
                let color = "";

                const alpha = tile[(x + y * 8) * 4 + 3];

                if (alpha !== 255) {
                  //color = "background";
                  
                   color = "background";
                  backgroundExists = true;
                  /*if(colorToTempIndex.length != 0){
                continue;
              }*/
                } else {
                  for (let c = 0; c < 3; c++) {
                    const dec = tile[(x + y * 8) * 4 + c]; // * 4 to skip alpha (rgba)
                    color += ("00" + dec.toString(16)).slice(-2);
                  }
                 }

                // Update index for this bitmap tile
                if (!colorToTempIndex.hasOwnProperty(color)) {
                  if(color === "background") {
                    backgroundIndex = colorToIndex;
                  }
                  colorToTempIndex[color] = colorToIndex++;
                }
                // Push the temporary index number of the color to the compareArray
                compareArray.push(colorToTempIndex[color]);
              }
              if (colorToTempIndex.length > 4) {
                alert(
                  "Found a tile with more than four colors!\nRead the instructions for parsing images."
                );
              }
             
             // console.log(compareArray, backgroundIndex, colorToTempIndex);

              // Check slice, we need to do this for all possible indices for the first row,
              // because the indicies we got is just by the order the color appears and has
              // nothing to do with indices to expect in the rom. However, because the tile
              // will use the same indices for all rows this rigous test is just needed for
              // the first row.
              if (stepY === 0) {
                mappingVariants.forEach((indexMapping, mI) => {
                  const testArray = [];

                  compareArray.forEach(pixel => {
                    //console.log(pixel);
                    testArray.push(indexMapping[pixel]);
                  });
                  // console.log(compareIndex, testArray);
                  ;
                  if (backgroundIndex > -1 && indexMapping[backgroundIndex] !== 0) {
                  //  console.log("BG", compareArray,testArray, backgroundIndex, indexMapping);
                    return;
                  }


                  matches[mI] = findInRom(testArray, 0, chrSpan, romData);
                });
              } else {
                // We already got some matches, lets build on that.
                let newMatches = [...matches];
                matches.forEach((match, mI) => {
                  // mI = match index, but and the variant index of mappingVariants to use
                  // to do the comparsion using the same palette to color index mapping as
                  // for the first row. We reset it and will loose anything that fail to
                  // continue matching.

                  newMatches[mI] = [];

                  
                  if (!match || match.length === 0) {
                    return;
                  }
                  const testArray = [];
                  compareArray.forEach(pixel => {
                    testArray.push(mappingVariants[mI][pixel]);
                  });
                  match.forEach(index => {
                    if (compareAtIndex(testArray, index, stepY, romData)) {
                      newMatches[mI].push(index);
                    }
                  });
                });
                matches = newMatches;

                // y === 7 means that the tile is fully scanned!
                if (stepY === 7) {
                  // eslint-disable-next-line
                  matches.some((match, mI) => {
                    // If we have a match, push it to the composition. First match is taken,
                    // in the future it should notice this somehow and suggest tiles that are close to eachother in the rom first.
                    if (match.length > 0) {
                      composition[X][Y] = {
                        flipX,
                        flipY,
                        byteIndex: match[0]
                      };
                      identified++;

                      console.log(
                        "COLORS",
                        colorToTempIndex,
                        mappingVariants[mI]
                      );
                      const paletteMapping = [-1,-1,-1,-1];
                      mappingVariants[mI].forEach((from, to)=>{
                        Object.keys(colorToTempIndex).forEach((hexColor) => {
                          if(colorToTempIndex[hexColor] === to) {
                            paletteMapping[from] = hexColor;
                          }

                        });
                      });
                      const nesPalette = this.paletteToNESIndex(paletteMapping);
                      if ((foundPalettes.map(nesI => nesI[0] + "." + nesI[1] + "." + nesI[2])).indexOf(nesPalette[0]+"."+nesPalette[1]+"."+nesPalette[2])===-1) {
                        foundPalettes.push(nesPalette);
                      }

                      return true;
                    }
                  });
                }
              } // x
            } // y
          }); // flipY
        }); // flipX
      }
    }

    this.setState({
      identified,
      skipped
    })

    let palettes = foundPalettes.sort((a, b) => {
      // Sort in best order possible, first step (higher to lower)
      if (a[0] !== b[0]) {
        return a[0] - b[0];
      }
      else if (a[1] !== b[1]) {
        return a[1] - b[1];
      }
      else {
        return a[2] - b[2];
      }
    }).sort((a,b) => {
      // Change the sort to rank most complete mappings on top
      let [aMinus, bMinus] = [0,0];
      for(let i=0;i<3;i++){
        aMinus += a[i] === -1 ? 1 : 0;
        bMinus += b[i] === -1 ? 1 : 0;
      }
      return aMinus-bMinus;

    });

    // Try to bubble up
    for(let i=0; i<palettes.length; i++) {
      if(palettes[i].length === 3) {
        palettes[i][3] = 0; // 0 = original, 1 = grouped with above
      }
      const currentColor = palettes[i];
      if(currentColor[0]===-1 ||currentColor[1] === -1 || currentColor[2] === -1) {
        // Try to move it upwards to a complete combo
        for(let i2=0; i2<palettes.length; i2++){
          const fullColor = palettes[i2];
          if (fullColor[0] !== -1 && fullColor[1] !== -1 && fullColor[2] !== -1) {
            if (
              (fullColor[0] === currentColor[0] || currentColor[0] === -1)
              &&  (fullColor[1] === currentColor[1] || currentColor[1] === -1)
              && (fullColor[2] === currentColor[2] || currentColor[2] === -1)
            ){
              // Moved value
              const movedValue = palettes.splice(i,1)[0];
              movedValue[3] = 1;
              palettes.splice(i2+1, 0, 1);
              palettes[i2+1] = movedValue;
            }

          }
        }

      }


    }


    return { composition, palettes };
  }

  paletteToNESIndex(paletteMapping) {
    const nesIndicies = [];
    paletteMapping.forEach(rgbString => {
      if(rgbString === -1){
        nesIndicies.push(-1);
      }
      else if(rgbString !== "background") {
        nesIndicies.push(this.getClosestColor(rgbString));
      }
    });
    return nesIndicies;
  }

  getClosestColor(rgbString) {
    // Shortest distance in euclidian 3d-space.
    // (Skipped sqrt because the actual distance is irrelevant, we just need the shortest)
    const rgb = [];
    for (let i = 0; i < 3; i++) {
      
      try {
        rgb[i] = parseInt(rgbString.substring(i * 2, i * 2 + 2), 16);

      }
      catch(err) {console.log(err, rgbString); debugger}
    }

    let shortestDist = 1e10;
    let closestColor;

    this.props.nesPalette.forEach((hexColor, nesIndex) => {
      const nesHex = [];
      for (let i = 0; i < 3; i++) {
        nesHex[i] = parseInt(hexColor.substring(i * 2 + 1, i * 2 + 2 + 1), 16);
      }
      let dist = 0;
      for (let i = 0; i < 3; i++) {
        dist += Math.pow(rgb[i] - nesHex[i], 2);
      }
      if (dist < shortestDist) {
        shortestDist = dist;
        closestColor = nesIndex;
      }
    });
    return closestColor;
  }
}

// String instead of bitwise operators, very slow
/*const findInRom3 = (pattern, y, chrSpan, romData) => {
  let matches = [];
  for (let i = chrSpan.first; i < chrSpan.first + chrSpan.len; i += 16) {
    const bits = [];
    for (let o = 0; o < 2; o++) {
      const byte = romData.getUint8(i + o * 8 + y * 16);
      bits[o] = ("00000000" + byte.toString(2)).slice(-8).split("");
    }

    const indexRow = [];
    for (let i2 = 0; i2 < 8; i2++) {
      indexRow[i2] = 1 * bits[0][i2] + 2 * bits[1][i2];
    }
    //   console.log(pattern, indexRow);
    const match = pattern.equals(indexRow);
    if (match) {
        console.log(pattern, i);
        debugger;
      matches.push(i);
    }
  }
  return matches;
};*/

const findInRom = (pattern, y, chrSpan, romData) => {
  let matches = [];
  for (
    let i = chrSpan.first;
    i < chrSpan.first + chrSpan.len - 8 * 2;
    i += 16
  ) {
    const byte = [];
    for (let o = 0; o < 2; o++) {
      try {
        byte[o] = romData.getUint8(i + o * 8 + y * 2);
      } catch (err) {
        console.log("ERRROR", y, o, i, romData.byteLength);
      }
    }
    const indexRow = [];
    let match = true;
    for (let i2 = 0; i2 < 8; i2++) {
      // Bitwise operators, generally discouraged but very much motivated here
      // get the bit on first byte and second byte at the position, count first one as 1 and second as 2 and add togehter
      const nesColorIndex =
        ((byte[0] & (1 << (7 - i2))) > 0 ? 1 : 0) +
        ((byte[1] & (1 << (7 - i2))) > 0 ? 2 : 0);
      if (pattern[i2] !== nesColorIndex) {
        match = false;
        break;
      }
    }
    if (match) {
      matches.push(i);
    }
  }
  return matches;
};

const compareAtIndex = (pattern, index, y, romData) => {
  const bits = [];

  for (let o = 0; o < 2; o++) {
    const byte = romData.getUint8(index + o * 8 + y);
    bits[o] = ("00000000" + byte.toString(2)).slice(-8).split("");
  }

  const indexRow = [];
  for (let i2 = 0; i2 < 8; i2++) {
    indexRow[i2] = 1 * bits[0][i2] + 2 * bits[1][i2];
  }

  if (y > 0) {
    // console.log("WHAT " + y + ",", pattern, "=", indexRow);
  }
  //   console.log(pattern, indexRow);
  return pattern.equals(indexRow);
};

const mapStateToProps = state => {
  return {
    chrSpan: state.nesRomReducer.chrSpan,
    romData: state.nesRomReducer.romData,
    nesPalette: state.drawReducer.nesPalette
  };
};

export default connect(mapStateToProps)(ImportImage);










// Warn if overriding existing method
if (Array.prototype.equals)
  console.warn(
    "Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code."
  );
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function(array) {
  // if the other array is a falsy value, return
  if (!array) return false;

  // compare lengths - can save a lot of time
  if (this.length !== array.length) return false;

  for (var i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) return false;
    } else if (this[i] !== array[i]) {
      // Warning - two different object instances will never be equal: {x:20} !== {x:20}
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {
  enumerable: false
});
