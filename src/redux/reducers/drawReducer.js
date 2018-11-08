const defaultState = {
    nesPalette: [], // original colors
    colors: ["#3CBCFC",
        "#F83800",
        "#FCA044",
        "#AC7C00"
    ], // colors to use
    activeColorIndex: 0 //Index (0-3) that is used
}

export default (state = defaultState, action) => {
    const {
        type,
        payload
    } = action;

    switch (type) {
        case "SET_PALETTE":
            const nesPalette = payload;
            return {...state, nesPalette};
        case "SET_ACTIVE_COLOR":
            const activeColorIndex = payload;
            return { ...state,
                activeColorIndex
            };
        default:
            return state;
    }
}