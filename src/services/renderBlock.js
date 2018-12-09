export default function renderBlock(firstByteIndex, dataView, X, Y, ctx, scale = 1, color, flipX=false, flipY=false) {
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