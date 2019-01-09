// import update from 'react-addons-update';

const defaultState = {
    nesPalette: [], // original colors
    nesColorIndicies: [0x21,0x16,0x27,0x18], // Mario palette as default
    colors: [], // colors to use
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
            const currentColors = [nesPalette[state.nesColorIndicies[0]], nesPalette[state.nesColorIndicies[1]], nesPalette[state.nesColorIndicies[2]], nesPalette[state.nesColorIndicies[3]]];
            console.log("PALETE");
            return { ...state,
                colors: currentColors,
                nesPalette
            };
        case "SET_ACTIVE_COLOR":
            const activeColorIndex = payload;
            return { ...state,
                mode: "draw",
                activeColorIndex
            };
        case "SET_COLORS": 
            const newColors = mapColors(state, payload); 
            console.log("nwqxoloea",newColors, payload);
            

            /*return  update(state, { 
                colors: {$set: newColors}, nesColorIndicies: {$set: payload}
                });*/
            return {...state, colors: newColors, nesColorIndicies: payload};       
        case "MAP_PALETTE_TO_COLORS": // Convert array of palette indicies to array of HEX-colors and proceed to next case
            alert("MAP_PALL REMOVE");
            let colors = payload.map((colorIndex) => {
                return state.nesPalette[colorIndex];
            });
        case "PUSH_HEX_TO_COLORS":
           console.log(state);
           debugger;
            colors = colors ? colors : payload;
            return { ...state, colors: payload
            };
        case "SET_MODE":
            return { ...state, mode: payload };
        default:
            return state;
    }
}

const mapColors = (state, nesColorIndicies) => {
    return nesColorIndicies.map((colorIndex) => {
        return state.nesPalette[colorIndex];
    });
}