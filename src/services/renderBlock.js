import byteToBinary from "./byteToBinary";

export default function renderBlock(firstByteIndex, dataView, X, Y, ctx, scale = 1, color) {
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

    for (let i = 0; i < 8; i++) {
        const bytes = [];
        for (let i2 = 0; i2 < 2; i2++) {
            bytes[i2] = byteToBinary(
                dataView.getUint8(firstByteIndex + i + i2 * 8)
            );
        }
        for (let x = 0; x < 8; x++) {
            let cI = 1 * bytes[0].substr(x, 1) + 2 * bytes[1].substr(x, 1);
            ctx.fillStyle = color[cI];
            ctx.fillRect((X + x) * scale, (Y + i) * scale, scale, scale);
        }
    }
}