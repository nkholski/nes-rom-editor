const ImageImporter = (romData, chrSpan, url = "/smb-items.png") => {
    new Promise((resolve) => {
        let i = new Image();
        i.onload = () => {
            resolve(i)
        };
        i.src = url;
    }).then(img => {

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
        document.getElementsByTagName("body")[0].appendChild(tmpCanvas);

        const composition = [];

        for (let X = 0; X < img.width / 8; X++) {
            composition[X] = [];
            for (let Y = 0; Y < img.height / 8; Y++) {
                composition[X][Y] = null;


                const tile = tmpCtx.getImageData(X * 8, Y * 8, 8, 8).data;

                let colorToTempIndex = {};
                let colorToIndex = 0;
                let matches = [];

                for (let y = 0; y < 8; y++) {
                    const compareArray = [];
                    // Get a slice
                    for (let x = 0; x < 8; x++) {
                        // Get pixel
                        let color = "";
                        for (let c = 0; c < 3; c++) {
                            const dec = tile[(x + y * 8) * 4 + c]; // * 4 to skip alpha
                            color += ("00" + (dec).toString(16)).slice(-2);
                        }
                        if (!colorToTempIndex.hasOwnProperty(color)) {
                            colorToTempIndex[color] = colorToIndex++;
                        }
                        compareArray.push(colorToTempIndex[color]);
                        // If not taken, add to colorToTempIndex

                        // Add to array

                    }
                    // Check slice
                    if (matches.equals([
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
                    }

                    if (y === 0) {
                        /*jshint loopfunc: true */
                        mappingVariants.forEach((indexMapping, mI) => {
                            const testArray = [];
                            compareArray.forEach(pixel => {
                                //console.log(pixel);
                                testArray.push(indexMapping[pixel]);
                            });
                            matches[mI] = findInRom(testArray, 0, chrSpan, romData);
                        });
                    } else {
                        let newMatches = [...matches];
                        matches.forEach((match, mI) => {
                            newMatches[mI] = [];

                            if (match.length === 0) {
                                return;
                            }
                            const testArray = [];
                            compareArray.forEach(pixel => {
                                testArray.push(mappingVariants[mI][pixel]);
                            });
                            match.forEach(index => {
                                if (index !== 37232) {
                                  //  return;
                                }
                                if (compareAtIndex(testArray, index, y, romData)) {
                                    //console.log("Found at (" + y + "): " + index);
                                    newMatches[mI].push(index);
                                } else {
                                   // console.log("Lost at (" + y + "): " + index);
                                }
                            });
                        });
                       // console.log("new", newMatches);
                        // debugger;
                        matches = newMatches;

                        if (y === 7) {
                           // console.log("MATCH RESULT", X, Y);
                            
                            matches.forEach(match => {
                                if (match.length > 0) {
                                    composition[X][Y] = match[0];
                                    console.log("byteIndex ("+X+","+Y+"): "+ match[0])
                                }



                            })

                        }
                    }
                    // console.log(matches);

                    //        debugger;

                }

            }
        }
        window.composition = composition;
    })


}

const findInRom = (pattern, y, chrSpan, romData) => {
    let matches = [];
    for (let i = chrSpan.first; i < chrSpan.first + chrSpan.len; i += 16) {
        if (i === 37456 || i === 36816 || i === 37472 || i === 37488 || i === 37504) {
            continue;
        }

        const bits = [];
        for (let o = 0; o < 2; o++) {
            const byte = romData.getUint8(i + o * 8 + y * 16);
            bits[o] = ("00000000" + byte.toString(2)).slice(-8).split("");
        }
        if (y > 0) {
         //   console.log("WHAT >" + y + "<," + i + "=", bits);
        }

        const indexRow = [];
        for (let i2 = 0; i2 < 8; i2++) {
            indexRow[i2] = 1 * bits[0][i2] + 2 * bits[1][i2];
        }
        //   console.log(pattern, indexRow);
        const match = pattern.equals(indexRow)
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
    return pattern.equals(indexRow)

}


// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length !== array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        } else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} !== {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {
    enumerable: false
});

export default ImageImporter;