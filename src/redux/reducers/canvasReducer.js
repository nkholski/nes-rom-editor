import renderBlock from "../../services/renderBlock";

const defaultState = {
    width: 1,
    height: 1,
    blocks: [
        [null]
    ],
    scale: 16,
    clipByte: 0
}

export default (state = defaultState, action) => {
    let {
        type,
        payload
    } = action;
    switch (type) {
        case 'EXPAND':
            return expand(state, payload);
            /* case 'SETCOLORS':
                return setColors(state, payload); */
        case 'DROP_BLOCK':
            return dropBlock(state, payload);
        case 'SET_CLIP_BYTE':
            return setClipByte(state, payload);
        case 'RENDER_BLOCKS':
            return renderBlocks(state, payload);
        case 'SET_COMPOSITION':
            return setComposition(state, payload);
        case 'SET_ZOOM':
            return { ...state,
                scale: payload
            };
        default:
            return state;
    }
}

/* const setColors = (state, {colorIndex, paletteIndex}) => {
    const colors = state.colors;
    colors[colorIndex] = paletteIndex;
    return {
        colors
    };
}*/

const expand = (state, payload) => {
    let {
        blocks,
        width,
        height,
        scale,
        ...stuff
    } = state;
    switch (payload) {
        case 0: // TOP
            height++;
            if (blocks[0].length < height) {
                for (let x = 0; x < blocks.length; x++) {
                    blocks[x] = [null, ...blocks[x]];
                }
            }
            break;
        case 1: // RIGHT
            width++;
            blocks.push(new Array(blocks[0].length));
            break;
        case 2: // BOTTOM
            height++;
            if (blocks[0].length < height) {
                for (let x = 0; x < blocks.length; x++) {
                    blocks[x].push(null);
                }
            }
            break;
        case 3: // LEFT
            width++;
            blocks = [(new Array(blocks[0].length)), ...blocks];
            break;
        default: // Happy Lint
            break;
    }
    return {
        width,
        height,
        blocks,
        scale,
        ...stuff
    }
}

const dropBlock = (state, {
    globalCoords,
    byteIndex,
    romData,
    colors
}) => {
    console.log("DROP BLOCK");
    const canvas = document.getElementById("draw-canvas");
    const rect = canvas.getBoundingClientRect();
    const gridCoordinates = {
        x: Math.floor((globalCoords.x - rect.left) / (state.scale * 8)),
        y: Math.floor((globalCoords.y - rect.top) / (state.scale * 8))
    };
    if (gridCoordinates.x < 0 || gridCoordinates.y < 0 || gridCoordinates.x >= state.width || gridCoordinates.y >= state.height) {
        // Dropped outside canvas, ignore silently
        return state;
    }

    const blocks = [...state.blocks];
    blocks[gridCoordinates.x][gridCoordinates.y] = byteIndex;
    console.log("SET STATE", {...state, blocks});
   // renderBlock(byteIndex, romData, gridCoordinates.x * 8, gridCoordinates.y * 8, canvas.getContext("2d"), state.scale, colors);

    return { ...state,
        blocks
    };
}

const setClipByte = (state, byteIndex) => {
    const newState = { ...state
    };
    newState.clipByte = byteIndex;
    return newState;
}

const renderBlocks = (state, {
    byteIndex,
    romData,
    colors
}) => {
    console.log("RB", colors);
    const ctx = document.getElementById("draw-canvas").getContext("2d");
    for (let x = 0; x < state.blocks.length; x++) {
        // Vertical line at x
             ctx.beginPath();
             ctx.moveTo(8 * x * state.scale, 0);
             ctx.lineTo(8 * x * state.scale, 8 * state.blocks[0].length * state.scale);
             ctx.strokeStyle = 'rgba(0,0,0,0.5)';
             ctx.stroke();
        for (let y = 0; y < state.blocks[x].length; y++) {
            if (state.blocks[x][y] > 0 && (!byteIndex || byteIndex === state.blocks[x][y])) {
                renderBlock(state.blocks[x][y], romData, x * 8, y * 8, ctx, state.scale, colors);
            }
            // Horizontal line at y, do it once per y (not for every x in this loop) and just for last x or lines will be covered by tile graphics
            if(x === state.blocks.length-1){
                   ctx.beginPath();
                   ctx.moveTo(0, 8 * y * state.scale);
                   ctx.lineTo(8 * state.blocks.length * state.scale , 8 * y * state.scale);
                   // ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                   ctx.stroke();
            }
        }

    }


    return state;
}

const setComposition = (state, compositionData) => {
    const blocks = compositionData.blocks;
    const width = blocks.length;
    const height = blocks[0].length;
        console.log("COMPOSITION!", blocks);

    return {...state, blocks, width, height};
}