import React, { Component } from "react";
import { connect } from "react-redux";
import { Progress } from "reactstrap";
import CompositionService from "../services/compositionService";

class ImportImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      skipped: 0,
      identified: 0,
      unknown: 0,
      task: 0,
      total: 0,
      progress: 0
    };
    this.task = 0;
  }

  render() {
    return (
      <div>
        <h2>Parsing the image</h2>
        Skipped tiles: {this.state.skipped}
        <br />
        Identified tiles: {this.state.identified}
        <br />
            Unknown tiles: {this.state.total - this.state.skipped - this.state.identified }
        <br />
        <div className="text-center">Progress {this.state.progress}%</div>
        <Progress value={this.state.progress} />
      </div>
    );
  }
  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (this.task === 0) {
      this.task = 1;
      this.loadFromFile("/smb-items.png").then(img =>
        this.tileCollector(img)
      );
    }
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

  loadFromFile(url) {
    return new Promise(resolve => {
      let i = new Image();
      i.onload = () => {
        resolve(i);
      };
      i.src = url;
    });
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
    const composition = this.imageScan({
      composition: [],
      img,
      tmpCtx,
      mappingVariants
    });

    this.setState({
        total: img.width * img.height / 64
    })

    window.composition = composition;
    CompositionService.save(Math.random(), composition);
    return composition;
  }

  imageScan({ composition, img, tmpCtx, mappingVariants }) {
    const { chrSpan, romData } = this.props;
    let identified = 0;
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

        // Skip if tile is one colored:
        let diffExists = false;
        for (let y = 0; y < 8; y++) {
            if(diffExists) {
                break;
            }
            for (let x = 0; x < 8; x++) {
                const i = (x + y * 8) * 4;
                if(tile[i] !== tile[0] || tile[i+1] !== tile[1] || tile[i+2] !== tile[2] ){
                    diffExists = true;
                    break;
                }
            }
        }
        if(!diffExists){
            skipped++;
            this.setState({skipped});
            continue;
        }

        // Each tile need to define its own colorIndex
        let colorToTempIndex = {};
        let colorToIndex = 0;
        // We often start of with multiple matches, and then they drop off for each horizontal line that's analysed
        let matches = [];

        // Scan through the tile from the rom data, compare it to the tile from the bitmap
        for (let y = 0; y < 8; y++) {
          const compareArray = [];
          // Get a slice
          for (let x = 0; x < 8; x++) {
            // Get pixel from tile, c[0] = red, 1 = g, 2 = b
            let color = "";
            for (let c = 0; c < 3; c++) {
              const dec = tile[(x + y * 8) * 4 + c]; // * 4 to skip alpha (rgba)
              color += ("00" + dec.toString(16)).slice(-2);
            }
            // Update index for this bitmap tile
            if (!colorToTempIndex.hasOwnProperty(color)) {
              colorToTempIndex[color] = colorToIndex++;
            }
            // Push the temporary index number of the color to the compareArray
            compareArray.push(colorToTempIndex[color]);
          }
          /*if (matches.equals([
                        [],
                        [],
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                    ])) {
                        console.warn("NO MATCHES!!!");
                    }*/

          // Check slice, we need to do this for all possible indices for the first row,
          // because the indicies we got is just by the order the color appears and has
          // nothing to do with indices to expect in the rom. However, because the tile
          // will use the same indices for all rows this rigous test is just needed for
          // the first row.
          if (y === 0) {
            mappingVariants.forEach((indexMapping, mI) => {
              const testArray = [];
              compareArray.forEach(pixel => {
                //console.log(pixel);
                testArray.push(indexMapping[pixel]);
              });

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

              if (match.length === 0) {
                return;
              }
              const testArray = [];
              compareArray.forEach(pixel => {
                testArray.push(mappingVariants[mI][pixel]);
              });
              match.forEach(index => {
                if (compareAtIndex(testArray, index, y, romData)) {
                  newMatches[mI].push(index);
                }
              });
            });
            matches = newMatches;

            // y === 7 means that the tile is fully scanned!
            if (y === 7) {
              matches.some(match => {
                // If we have a match, push it to the composition. First match is taken,
                // in the future it should notice this somehow.
                if (match.length > 0) {
                  composition[X][Y] = match[0];
                    identified++;

                        this.setState({
                            identified
                        });
                    

                  return true;
                }
              });
            }
          }
        }
      }
    }

    return composition;
  }

  /**/
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
    for (let i = chrSpan.first; i < chrSpan.first + chrSpan.len; i += 16) {
        const byte = [];
        for (let o = 0; o < 2; o++) {
            byte[o] = romData.getUint8(i + o * 8 + y * 16);
        }
        const indexRow = [];
        let match = true;
        for (let i2 = 0; i2 < 8; i2++) {
            // Bitwise operators, generally discouraged but very much motivated here
            // get the bit on first byte and second byte at the position, count first one as 1 and second as 2 and add togehter
            const nesColorIndex = (((byte[0] & (1 << (7 - i2))) > 0) ? 1 : 0) + (((byte[1] & (1 << (7 - i2))) > 0) ? 2 : 0);
            if(pattern[i2] !== nesColorIndex){
                match = false;
                break;
            }
        }
        if (match) {
            matches.push(i);
        }
    }
    return matches;
}

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
    romData: state.nesRomReducer.romData
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
