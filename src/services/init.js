import { loadLocalStorage } from "./romIO";

const init = () => {
  return dispatch => {
    // Create temp canvas used by tile renderer
    const canvas = document.createElement("canvas");
    canvas.mozOpaque = true;
    canvas.opaque = true;
    canvas.style.imageRendering = "webkit-crisp-edges";
    canvas.setAttribute("width", 8);
    canvas.setAttribute("height", 8);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    dispatch({
      type: "SET_TMP_CANVAS",
      payload: { canvas, ctx }
    });
    const resolvedValues = {};

    // Load a bunch of stuff
    const palette = fetch("../files/nespalette.json")
      .then(response => response.json())
      .then(data => {
        console.log("PALETTE", data);
        dispatch({
          type: "SET_PALETTE",
          payload: data
        });
      });
    const gameName = fetch("../rom-info/md5-to-game-name.json")
      .then(response => response.json())
      .then(data => {
        resolvedValues.gameName = data;
        dispatch({
          type: "SET_ROM_NAMES",
          payload: data
        });
      });
    const romInfo = fetch("/rom-info/index.json")
      .then(response => response.json())
      .then(data => {
        resolvedValues.romInfo = data;

        dispatch({
          type: "SET_ROM_INFO_INDEX",
          payload: data
        });
      });

    Promise.all([palette, gameName, romInfo]).then(() => {
      if (localStorage.getItem("romData")) {
        loadLocalStorage(
          resolvedValues.gameName,
          resolvedValues.romInfo,
          dispatch
        );
      }
      dispatch({
        type: "IS_READY"
      });
    });
  };
};

export { init };
