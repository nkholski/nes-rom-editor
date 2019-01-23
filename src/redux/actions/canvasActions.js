export const clearComposition = () => dispatch => {
    dispatch({
        type: "CLEAR_COMPOSITION",
        payload: null
    });
}

export const expand = (direction) => dispatch => {
    dispatch({
        type: 'EXPAND',
        payload: direction
    })
}

export const crop = (side) => dispatch => {
    dispatch({
        type: 'CROP',
        payload: side
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

export const addPresetComposition = (composition) => dispatch => {
    dispatch({
        type: "ADD_PRESET_COMPOSITION",
        payload: composition
    });
}

// Render block of byteIndex or all (null)
export const renderBlocks = (romData, colors, excludeByteIndex = null) => dispatch => {
    dispatch({
        type: 'RENDER_BLOCKS',
        payload: {
            romData,
            excludeByteIndex,
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


export const mouseWheelZoom = (event) => dispatch => {
    console.log(event);
    //debugger;
    dispatch({
        type: 'MOUSE_WHEEL_ZOOM',
        payload: (event.wheelDeltaY > 0) ? 1 : -1
    });


}


export const flipBlock = (x, y, dir) => dispatch => {
    dispatch({
        type: 'FLIP_BLOCK',
        payload: {
            x,
            y,
            dir
        }
    })
}