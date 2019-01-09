export const setPalette = (palette) => dispatch => {
    dispatch({
        type: 'SET_PALETTE',
        payload: palette
    })
}

export const setActiveColor = (colorIndex) => dispatch => {
    dispatch({
        type: 'SET_ACTIVE_COLOR',
        payload: colorIndex
    })
}

export const mapPaletteToColors = (palette) => dispatch => {
    dispatch({
        type: 'MAP_PALETTE_TO_COLORS',
        payload: palette
    })
}

export const pushHEXToColors = (palette) => dispatch => {
    console.log("HEX", palette)
    dispatch({
        type: 'PUSH_HEX_TO_COLORS',
        payload: palette
    })
}

export const setColors = (nesColorIndicies) => dispatch => {
    console.log("AAAA",nesColorIndicies)
    dispatch({
        type: 'SET_COLORS',
        payload: nesColorIndicies
    })
}

export const setMode = (mode) => dispatch => {
    dispatch({
        type: 'SET_MODE',
        payload: mode
    })
}