
export default function renderBlock(firstByteIndex, dataView, X, Y, ctx, scale = 1, color, flipX = false, flipY = false) {
    /*
        firstByteIndex   Address to first byte in CHR
        X, Y        Coordinates for the block
        ctx         Context to draw on
        scale       Size of pixels
    */
    ctx.save();
    const bufferSize = 8 * 8 * 4;
    const image = ctx.getImageData(X, Y, 8, 8);
    const blockBuffer_8 = new Uint8ClampedArray(bufferSize);
     /*for (var i = 0; i < 64; i++)
         this.framebuffer_u32[i] = 0xff000000 | framebuffer_24[i];
     }*/

    // console.log(firstByteIndex, dataView, X, Y, ctx, scale);
    color = color ? color : [
        "#3CBCFC",
        "#F83800",
        "#FCA044",
        "#AC7C00"
    ];
    // const rgb = [];
    for (let y = 0; y < 8; y++) {
        const c = bytesToColorIndexArray(firstByteIndex, y, dataView);
        
        for (let x = 0; x < 8; x++) {
            const rx = flipX ? 7 - x : x;
            const ry = flipY ? 7 - y : y;
            const hexColor = color[c[x]];            
            const index = (rx + ry * 8) * 4;
            // const rgb = [...rgb, c[x].substring(1, 3), c[x].substring(3, 5), c[x].substring(5, 7)];
            //console.log(c[x]);

            for(let i=0; i<3; i++){
                // rgb.push(hexColor.substring(1 + rgb * 2, 1 + rgb * 2 + 2));
                blockBuffer_8[index + i] = parseInt(hexColor.substring(1 + i * 2, 1 + i * 2 + 2), 16);
            }
            blockBuffer_8[index+3] = 255;
        }
    }

    image.data.set(blockBuffer_8, 0, 0);

    if(scale>1){
        // Should move for reuse
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.mozOpaque = true;
        tmpCanvas.opaque = true;
        tmpCanvas.style.imageRendering = "webkit-crisp-edges";
        tmpCanvas.setAttribute('width', 8);
        tmpCanvas.setAttribute('height', 8);
        const tmpCtx = tmpCanvas.getContext("2d");
        tmpCtx.imageSmoothingEnabled = false;
        // Wrong place for this
        ctx.imageSmoothingEnabled = false;
        // Only part that should be here in this block:
        tmpCtx.putImageData(image, 0, 0);
        ctx.scale(scale, scale);
        ctx.drawImage(tmpCanvas, X, Y);
    }
    else {
        ctx.putImageData(image, X, Y);
    }
    console.log("x");

    ctx.restore();

    //image.data.set(blockBuffer_8);
  //  ctx.putImageData(image, X, Y);

    return;

    for (let y = 0; y < 8; y++) {
        const c = bytesToColorIndexArray(firstByteIndex, y, dataView);
        for (let x = 0; x < 8; x++) {
            const rx = flipX ? 7 - x : x;
            const ry = flipY ? 7 - y : y;
            ctx.fillStyle = color[c[x]];
            ctx.fillRect((X + rx) * scale, (Y + ry) * scale, scale, scale);
        }
    }
}



//  export default 
function renderBlock2(firstByteIndex, dataView, X, Y, ctx, scale = 1, color, flipX=false, flipY=false) {
    /*
        firstByteIndex   Address to first byte in CHR
        X, Y        Coordinates for the block
        ctx         Context to draw on
        scale       Size of pixels
    */

    // console.log(firstByteIndex, dataView, X, Y, ctx, scale);
    color = color ? color : [
        "#3CBCFC",
        "#F83800",
        "#FCA044",
        "#AC7C00"
    ];

    for(let y = 0; y<8; y++){
        const c = bytesToColorIndexArray(firstByteIndex, y, dataView);
        for (let x = 0; x < 8; x++) {
            const rx = flipX ? 7 - x : x;            
            const ry = flipY ? 7 - y : y;
            ctx.fillStyle = color[c[x]];
            ctx.fillRect((X + rx) * scale, (Y + ry) * scale, scale, scale);
        }
    }



}

const bytesToColorIndexArray = (firstByteIndex, y, dataView) => {
    const bytes = [];
    const colorIndexArray = [];
     for (let i = 0; i < 2; i++) {
        bytes[i] = dataView.getUint8(firstByteIndex + y + i * 8)
     }
     for(let x=0; x<8; x++){
        colorIndexArray[x] = (((bytes[0] & (1 << (7 - x))) > 0) ? 1 : 0) + (((bytes[1] & (1 << (7 - x))) > 0) ? 2 : 0);
     }
     return colorIndexArray;
}