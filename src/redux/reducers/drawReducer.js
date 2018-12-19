const defaultState = {
    nesPalette: [], // original colors
    colors: ["#3CBCFC",
        "#F83800",
        "#FCA044",
        "#AC7C00"
    ], // colors to use
    activeColorIndex: 0, //Index (0-3) that is used
    mode: "draw"
}

export default (state = defaultState, action) => {
    const {
        type,
        payload
    } = action;

    switch (type) {
        case "SET_PALETTE":
            const nesPalette = payload;
            console.log("PALETE");
            return { ...state,
                nesPalette
            };
        case "SET_ACTIVE_COLOR":
            const activeColorIndex = payload;
            return { ...state,
                mode: "draw",
                activeColorIndex
            };
        
        case "MAP_PALETTE_TO_COLORS": // Convert array of palette indicies to array of HEX-colors and proceed to next case
            let colors = payload.map((colorIndex) => {
                return state.nesPalette[colorIndex];
            });
        case "PUSH_HEX_TO_COLORS":
            colors = colors ? colors : payload;
            return { ...state, colors: payload
            };
        case "SET_MODE":
            return { ...state, mode: payload };
        default:
            return state;
    }
}