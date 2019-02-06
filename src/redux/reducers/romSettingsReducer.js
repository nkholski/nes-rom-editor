import { setRomSettings } from "../actions/romSettings";

const defaultState = {
  textTables: [],
  compositions: [],
  hacks: [],
  textStrings: [],
  palettes: []
};

export default (state = defaultState, action) => {
  const { type, payload } = action;

  switch (type) {
    case "SET_TEXT_STRINGS":
      return { ...state, textStrings: payload };
    case "SET_ROM_SETTINGS":
      const settings = { ...payload };
      let compositionIndex = -1;
      let composition = null;
      while (
        (composition = localStorage.getItem("composition" + ++compositionIndex))
      ) {
        alert("FOUND");
        settings.compositions.push(JSON.parse(composition));
      }

      const required = [
        "textTables",
        "compositions",
        "hacks",
        "textStrings",
        "palettes"
      ];
      required.forEach(prop => {
        if (!settings.hasOwnProperty(prop)) {
          settings[prop] = [];
        }
      });
      return settings;
    default:
      return state;
  }
  alert("!!!");
};
