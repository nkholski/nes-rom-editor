const defaultState = {
  isReady: false, // Shouldnt be here. true when init finishes
  romStatus: null,
  romData: [], // DataView
  untouchedRom: [], // for IPS download
  chrData: {
    start: 0,
    len: 0
  }, // Interesting part of DataView
  history: [],
  chrSpan: {}, // ERSÄTTER OVAN?
  version: 0, // version of data, used to detect changes
  lastAltered: 0, // Index of (first)byte altered, used to render parts of canvas
  romSettings: {}, // TO BE REMOVED External romsettings (Palettes and hacks for current rom)
  romInfoIndex: {}, // Index over avaliable hacks
  romInfo: {} // Info about the rom, mapper and stuff
};

export default (state = defaultState, action) => {
  const { type, payload } = action;

  switch (type) {
    case "ROM_STATUS":
      return {
        ...state,
        romStatus: payload
      };
    case "IS_READY":
      return {
        ...state,
        isReady: true
      };

    case "SET_ROM_DATA":
      return {
        ...state,
        romData: payload
      };
    case "SET_ROM_INFO_INDEX":
      return {
        ...state,
        romInfoIndex: payload
      };
    case "SET_ROM_INFO":
      return {
        ...state,
        romInfo: payload
      };
    case "SET_ROM_NAMES":
      return {
        ...state,
        romNames: payload
      };
    /*case 'SET_ROM_SETTINGS':
                console.log("SET ROM SETTINGS", payload);
                return {
                    ...state,
                    romSettings: payload
                };*/
    case "STORE_ROM":
      // Should be fixed, payload shoud always be === romData
      let payloadObject = payload.hasOwnProperty("romData")
        ? payload
        : {
            romData: payload
          };
      let { fromLocalStorage, ...pl } = payloadObject;

      if (!fromLocalStorage) {
        const base64RomData = btoa(
          String.fromCharCode(...new Uint8Array(pl.romData.buffer))
        );
        localStorage.setItem("romData", base64RomData);
        localStorage.setItem("untouchedRom", base64RomData);
        state.history = [];
        // console.log("a", String.fromCharCode(pl.romData));
      } else {
        // Ladda history from localStorage
      }

      return {
        ...state,
        ...pl,
        version: 1
      };
    case "PUT_PIXEL":
      return put_pixel(state, payload);
    /* case 'DEFINE_CHR_ADDR':
                return {
                    result: action.payload
                } */
    case "ALTER_BYTE":
      const { address, value } = payload;
      console.log("LIVE", address, value);
      const romData = state.romData;
      romData.setUint8(address, value);

      return {
        ...state,
        romData,
        version: state.version + 1
      };
    default:
      return state;
  }
};

const put_pixel = (state, payload) => {
  const hisoryEntry = {
    type: "putPixel",
    data: []
  };
  const { firstByteIndex, x, y, colorIndex } = payload;
  const romData = state.romData;
  // Bits to be set in the bytes to alter
  const setBit = [[0, 0], [1, 0], [0, 1], [1, 1]][colorIndex];

  for (let i2 = 0; i2 < 2; i2++) {
    const index = firstByteIndex + i2 * 8 + y;
    let byte = romData.getUint8(index);
    if (setBit[i2] === 1) {
      byte |= 1 << (7 - x);
    } else {
      byte &= ~(1 << (7 - x));
    }
    hisoryEntry.data.push({ addr: index, byte });
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
  return { ...state, romData, lastAltered: firstByteIndex };
};
