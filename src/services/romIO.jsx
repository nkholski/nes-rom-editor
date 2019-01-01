import md5 from "js-md5";

const loadFile = (data, romNames, romInfoIndex) => {
  console.log("DASDSA", romNames, romInfoIndex);
  return (dispatch) => {
    dispatch({
      type: "ROM_STATUS",
      payload: "loading"
    });
    const reader = new FileReader();
    reader.onload = (e) => {
      processData(e.target.result, romNames, romInfoIndex, dispatch);
      
    }
    reader.readAsArrayBuffer(data);
  }
};

const loadURL = (fileName, romNames, romInfoIndex) => {
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
};

export { loadFile, loadURL };

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

function processData(arrayBuffer, romNames, romInfoIndex, dispatch) {
  const dataView = new DataView(arrayBuffer);
  const isNes =
    dataView.getUint8(0) + dataView.getUint8(1) + dataView.getUint8(2) === 230; // I'm lazy

  if (!isNes) {
    alert("Not a valid nes rom!");
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
    payload: dataView
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