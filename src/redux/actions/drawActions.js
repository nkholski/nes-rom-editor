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
