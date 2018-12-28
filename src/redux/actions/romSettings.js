export const setRomSettings = (data) => dispatch => {
    dispatch({
        type: 'SET_ROM_SETTINGS',
        payload: data
    });
}

export const setTextStrings = (textStrings) => dispatch => {
    dispatch({
        type: 'SET_TEXT_STRINGS',
        payload: textStrings
    })
}