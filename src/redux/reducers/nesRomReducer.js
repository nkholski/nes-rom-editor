import md5 from "js-md5";

const defaultState = {
    romData: [], // DataView
    chrData: { start: 0, len: 0 }, // Interesting part of DataView
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
            console.log("STORING");
            return {
                ...state,
                ...payload,
                md5: md5(payload.romData.buffer),
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
        let byte = byteToBinary(romData.getUint8(index));
        byte = byte.slice(0, x) + setBit[i2] + byte.slice(x + 1);
        romData.setUint8(index, parseInt(byte, 2));
    }

    state.version++;
    return {...state, romData, lastAltered: firstByteIndex };
}


const byteToBinary = byte => {
    return byte.toString(2).padStart(8, "0");
};