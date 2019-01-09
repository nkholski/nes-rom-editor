import renderBlock from "../../services/renderBlock";

const defaultState = {
    width: 1,
    height: 1,
    blocks: [
        [null]
    ],
    scale: 16,
    clipByte: 0,
    compositionName: "",
    presetCompositions: []
}

export default (state = defaultState, action) => {
    let {
        type,
        payload
    } = action;
    switch (type) {
        case 'CLEAR_COMPOSITION':
            return {...state,
            blocks: [
                [null]
            ],
            width: 1,
            height: 1,
            scale: 16
        }
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
        case 'SET_PRESET_COMPOSITIONS':
            return { ...state,
                presetCompositions: payload
            };
        case 'ADD_PRESET_COMPOSITION':
        console.log([...state.presetCompositions, payload]);
        debugger;
            return {
                ...state,
                presetCompositions: [...state.presetCompositions, payload]
            }
        case 'SET_ZOOM':
            return { ...state,
                scale: payload
            };
        case 'FLIP_BLOCK':
            return {...state,
            blocks: flipBlock(payload, state.blocks)
            } ;  
        case 'MOUSE_WHEEL_ZOOM':
            console.log("Payload", payload)
            const zoomLevels = [4,6,8,10,12,16];
            let newZoomIndex = zoomLevels.indexOf(state.scale) + payload;
            if(newZoomIndex<0) {
                newZoomIndex = 0;
            } else if(newZoomIndex>zoomLevels.length-1){
                newZoomIndex = zoomLevels.length-1;
            }
            const scale = zoomLevels[newZoomIndex];
            console.log("SCALE", scale, newZoomIndex);

            return {...state,
                scale
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

    scale = setScaleByComposition(blocks);

   




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
    console.log(rect);  
    console.log(canvas.offsetLeft);
    const gridCoordinates = {
        x: Math.floor((globalCoords.x - rect.left) / (state.scale * 8)),
        y: Math.floor((globalCoords.y - rect.top) / (state.scale * 8))
    };
    if (gridCoordinates.x < 0 || gridCoordinates.y < 0 || gridCoordinates.x >= state.width || gridCoordinates.y >= state.height) {
        // Dropped outside canvas, ignore silently
        console.log("MISSED CANVAS", gridCoordinates);
        return state;
    }

    const blocks = [...state.blocks];
    blocks[gridCoordinates.x][gridCoordinates.y] = {byteIndex, flipX: false, flipY: false};
    console.log("SET STATE", { ...state,
        blocks
    });
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
    excludeByteIndex,
    romData,
    colors
}) => {
    const ctx = document.getElementById("draw-canvas").getContext("2d");
    for (let x = 0; x < state.blocks.length; x++) {
        // Vertical line at x
        ctx.beginPath();
        ctx.moveTo(8 * x * state.scale, 0);
        ctx.lineTo(8 * x * state.scale, 8 * state.blocks[0].length * state.scale);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.stroke();
        for (let y = 0; y < state.blocks[x].length; y++) {
            if (!state.blocks[x][y]){
                state.blocks[x][y] = {byteIndex: null, flipX: false, flipY: false}
            }
    
            const {byteIndex, flipX, flipY} = state.blocks[x][y];
            
            if (!excludeByteIndex || excludeByteIndex !== byteIndex) {
                renderBlock(byteIndex, romData, x * 8, y * 8, ctx, state.scale, colors, flipX, flipY);
            }
            // Horizontal line at y, do it once per y (not for every x in this loop) and just for last x or lines will be covered by tile graphics
            if (x === state.blocks.length - 1) {
                ctx.beginPath();
                ctx.moveTo(0, 8 * y * state.scale);
                ctx.lineTo(8 * state.blocks.length * state.scale, 8 * y * state.scale);
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
    let scale = setScaleByComposition(blocks);
    console.log("COMPOSITION! >>> ", blocks, compositionData.name);

    return { ...state,
        blocks,
        width,
        height,
        scale,
        compositionName: compositionData.name
    };
}   


const flipBlock = (action, blocks) => {
    const block = blocks[action.x][action.y];
    block[action.dir] = !block[action.dir];
    blocks[action.x][action.y] = block;
    return blocks;
}

const setScaleByComposition = (blocks) => {
    const scaleX = 870/(8*blocks.length);
    const scaleY=  560/(8*blocks[0].length);
    let scale = scaleX < scaleY ? scaleX : scaleY;
    let normalizedScale = 4;
    [4,6,8,10,12,16].forEach(step => {
        if(scale>step) {
            normalizedScale = step;
        }
    })
   return normalizedScale;
}