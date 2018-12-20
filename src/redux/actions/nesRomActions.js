export const storeRom = (romData, chrSpan) => dispatch => {
    console.log("Store", romData, chrSpan);
    dispatch({
        type: 'STORE_ROM',
        payload: {romData, chrSpan}
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

export const setRomSettings = (romSettings) => dispatch => {
    dispatch({
        type: "SET_ROM_SETTINGS",
        payload: romSettings
    });
}

export const setRomInfoIndex = (romInfoIndex) => dispatch => {
    dispatch({
        type: "SET_ROM_INFO_INDEX",
        payload: romInfoIndex
    });
}

export const setRomInfo = (romInfo) => dispatch => {
    dispatch({
        type: "SET_ROM_INFO",
        payload: romInfo
    });
}

export const setRomNames = (romNames) => dispatch => {
    dispatch({
        type: "SET_ROM_NAMES",
        payload: romNames
    });

}