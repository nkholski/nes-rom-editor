import { combineReducers } from 'redux';
import nesRomReducer from './nesRomReducer';
import canvasReducer from './canvasReducer';
import drawReducer from "./drawReducer";
import romSettingsReducer from "./romSettingsReducer";

export default combineReducers({
    nesRomReducer, canvasReducer, drawReducer, romSettingsReducer
});