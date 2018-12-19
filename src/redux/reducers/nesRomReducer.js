import md5 from "js-md5";

const defaultState = {
    romData: [], // DataView
    chrData: { start: 0, len: 0 }, // Interesting part of DataView
    chrSpan: {}, // ERSÄTTER OVAN?
    version: 0, // version of data, used to detect changes
    lastAltered: 0, // Index of (first)byte altered, used to render parts of canvas
    romSettings: {}, // External romsettings (Palettes and hacks for current rom)
    romInfoIndex: {} // Index over avaliable hacks
}

export default (state = defaultState, action) => {
    const {
        type,
        payload
    } = action;

    switch (type) {
        case 'SET_ROM_INFO_INDEX':
            return {
                ...state,
                romInfoIndex: payload
            };
        case 'SET_ROM_SETTINGS':
            console.log("SET ROM SETTINGS", payload);
            return {
                ...state,
                romSettings: payload
            };
        case 'STORE_ROM':
            return {
                ...state,
                ...payload,
                md5: "99e97730adbdd09b9ca8d0d6b38dd8bb", //md5(payload.romData.buffer),
                version: 1
            };
        case 'PUT_PIXEL':
            return put_pixel(state, payload);
        case 'DEFINE_CHR_ADDR':
            return {
                result: action.payload
            }
        case 'ALTER_BYTE':
            const {address, value } = payload;
            console.log("LIVE",address, value);
            const romData = state.romData;
            romData.setUint8(address, value);


            return {
                ...state,
                romData,
                version: state.version+1
            };
        default:
            return state;
    }
}

const put_pixel = (state, payload) => {
    console.log(state, payload);
    const { firstByteIndex, x, y, colorIndex } = payload;
    const romData = state.romData;
    // Bits to be set in the bytes to alter
    const setBit = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1]
    ][colorIndex];

    for (let i2 = 0; i2 < 2; i2++) {
        const index = firstByteIndex + i2 * 8 + y;
        let byte = romData.getUint8(index);
        if(setBit[i2] === 1){
            byte |= (1 << (7-x));
        }
        else {
            byte &= ~(1 << (7-x)); 
        }
        romData.setUint8(index, byte);
    }

    // LARSA
    //console.log("MARIO",romData.getUint8(1893));
    //romData.setUint8(1893, "L".charCodeAt(0)-55);
    //romData.setUint8(1896, "S".charCodeAt(0)-55);
    //romData.setUint8(1897, "A".charCodeAt(0)-55);
    //romData.setUint8(0x379e, 0);
//    379e skva vara noll


    state.version++;
    return {...state, romData, lastAltered: firstByteIndex };
}