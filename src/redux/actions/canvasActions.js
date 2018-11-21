export const expand = (direction) => dispatch => {
    dispatch({
        type: 'EXPAND',
        payload: direction
    })
}

export const dropBlock = (globalCoords, romData, byteIndex, colors) => dispatch => {
    dispatch({
        type: 'DROP_BLOCK',
        payload: {
            globalCoords,
            byteIndex,
            romData,
            colors
        }
    })
}

export const setClipByte = (byteIndex) => dispatch => {
    dispatch({
        type: 'SET_CLIP_BYTE',
        payload: byteIndex
    })
}

export const setComposition = (compositionObject) => dispatch => {
    dispatch({
        type: "SET_COMPOSITION",
        payload: compositionObject
    })
}

export const setPresetCompositions = (compositions) => dispatch => {
    dispatch({
        type: "SET_PRESET_COMPOSITIONS",
        payload: compositions
    });
}

// Render block of byteIndex or all (null)
export const renderBlocks = (romData, colors, byteIndex = null) => dispatch => {
    dispatch({
        type: 'RENDER_BLOCKS',
        payload: {
            romData,
            byteIndex,
            colors
        }
    })
}

export const setZoom = (zoom) => dispatch => {
    // firstByteIndex = index of first byte of 8x8 block
    // x,y = coordinates within the block
    // colorIndex = 0 to 3
    dispatch({
        type: 'SET_ZOOM',
        payload: zoom
    })
}