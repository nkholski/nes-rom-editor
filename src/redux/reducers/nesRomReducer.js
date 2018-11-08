const defaultState = {
    romData: [], // DataView
    chrData: { start: 0, len: 0 }, // Interesting part of DataView
    version: 0, // version of data, used to detect changes
    lastAltered: 0 // Index of (first)byte altered, used to render parts of canvas
}

export default (state = defaultState, action) => {
    const {
        type,
        payload
    } = action;
    const newState = {...state};
    switch (type) {
        case 'STORE_ROM':
            newState.romData = payload;
            return newState;
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