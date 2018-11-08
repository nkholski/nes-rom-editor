export const storeRom = (romData) => dispatch => {
    dispatch({
        type: 'STORE_ROM',
        payload: romData
    })
}

export const alterByte = (address, value) => dispatch => {
    // data : { byteIndex: number, value: number}[] || { byteIndex: number, value: number}
    dispatch({
        type: 'ALTER_BYTE',
        payload: {address, value}
    })
}

export const putPixel = (firstByteIndex, x, y, colorIndex) => dispatch => {
    // firstByteIndex = index of first byte of 8x8 block
    // x,y = coordinates within the block
    // colorIndex = 0 to 3
    dispatch({
        type: 'PUT_PIXEL',
        payload: {firstByteIndex, x, y, colorIndex}
    })
}

export const download = (filename) => dispatch => {
    dispatch({
        type: "DOWNLOAD",
        payload: filename
    });

}