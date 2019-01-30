import md5 from "js-md5";

const loadFile = (data, romNames, romInfoIndex) => {
  console.log("DASDSA", romNames, romInfoIndex);
  return dispatch => {
    dispatch({
      type: "ROM_STATUS",
      payload: "loading"
    });
    const reader = new FileReader();
    reader.onload = e => {
      processData(e.target.result, romNames, romInfoIndex, dispatch);
    };
    reader.readAsArrayBuffer(data);
  };
};

const loadLocalStorage = (gameName, romInfo, dispatch) => {
  // 1. Get modified romData
  const romData = localStorage.getItem("romData");

  /*dispatch({
    type: "SET_ROM_DATA",
    payload: base64toArrayBuffer(romData)
  });*/

  // 2. Get original romData and everything that can be found from it
  const origialRomData = localStorage.getItem("untouchedRom");

  // return bytes.buffer;

  processData(
    base64toArrayBuffer(origialRomData),
    gameName,
    romInfo,
    dispatch,
    base64toArrayBuffer(romData)
  );
  /*
  //function str2ab(str) {
  var buf = new ArrayBuffer(romData.length * 2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = romData.length; i < strLen; i++) {
    bufView[i] = romData.charCodeAt(i);
  }

  //}
  console.log("dat", buf, gameName, romInfo, dispatch);
  processData(buf, gameName, romInfo, dispatch);*/
};

/*const loadURL = (fileName, romNames, romInfoIndex) => {
  console.log("DASDSA",romNames, romInfoIndex);
  return (dispatch) => {
      console.log("FETC", romNames, romInfoIndex);
    dispatch({
      type: "ROM_STATUS",
      payload: "loading"
    });
    fetch("../rom/" + fileName + ".nes")
      .then(response => checkStatus(response) && response.arrayBuffer())
      .then(arrayBuffer => {
          console.log("Came here")
        processData(arrayBuffer, romNames, romInfoIndex, dispatch);
      })
      .catch(e => {
          console.log("error", e)
      });
  }
};*/

export { loadFile, loadLocalStorage }; //loadURL

/*
   const itemsIsLoading = (palette) => dispatch => {
        dispatch({
            type: 'WOWWWWW',
            payload: palette
        })
    }
    console.log("KÖR");
  return dispatch => {
    dispatch(itemsIsLoading("BÖRJAR"));
    setTimeout(()=>{dispatch(itemsIsLoading("SLUTAR"))} ,1000);
  };

*/

function processData(
  untouchedRom,
  romNames,
  romInfoIndex,
  dispatch,
  romData = null
) {
  const dataView = new DataView(untouchedRom);
  const romDataDataView = romData ? new DataView(romData) : dataView;
  try {
    const isNes =
      dataView.getUint8(0) + dataView.getUint8(1) + dataView.getUint8(2) ===
      230; // I'm lazy
    if (!isNes) {
      alert("Not a valid nes rom!");
      return;
    }
  } catch {
    alert("Rom in localStorage is corrupted :-(");
    localStorage.removeItem("romData");
    localStorage.removeItem("untouchedRom");
    return;
  }

  const noIntroMD5 = md5(dataView.buffer.slice(16)).toUpperCase();

  const name = romNames.hasOwnProperty(noIntroMD5)
    ? romNames[noIntroMD5]
    : name;

  const prg = [];
  for (let i = 0; i < dataView.getUint8(4); i++) {
    prg.push(16 + i * 16384);
  }

  const chr = [];
  for (let i = 0; i < dataView.getUint8(5); i++) {
    chr.push(16 + 16384 * prg.length + 8192 * i);
  }

  const romInfo = {
    name,
    prg,
    noIntroMD5,
    md5: md5(dataView.buffer).toUpperCase(),
    chr, // dataView.getUint8(5),
    mapper: dataView.getUint8(6),
    mapper2: dataView.getUint8(7),
    ram: dataView.getUint8(8),
    tv: dataView.getUint8(9),
    ramExists: dataView.getUint8(10)
  };

  if (romInfoIndex.md5.hasOwnProperty(noIntroMD5)) {
    fetch("rom-info/games/" + romInfoIndex.md5[noIntroMD5] + ".json")
      .then(response => response.json())
      .then(response => {
        dispatch({
          type: "SET_ROM_SETTINGS",
          payload: response
        });
        dispatch({
          type: "ROM_STATUS",
          payload: "loaded"
        });
      });
  } else {
    dispatch({
      type: "SET_ROM_SETTINGS",
      payload: null
    });
    dispatch({
      type: "ROM_STATUS",
      payload: "loaded"
    });
  }

  dispatch({
    type: "STORE_ROM",
    payload: {
      romData: romDataDataView,
      fromLocalStorage: !!romData,
      untouchedRom: dataView
    }
  });
  dispatch({
    type: "SET_ROM_INFO",
    payload: romInfo
  });
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

function base64toArrayBuffer(data) {
  var binary_string = window.atob(data);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
