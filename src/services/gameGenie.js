const GameGenie = (code) => {
    // This takes a GameGenie code and return address, value and for 8-letter codes a compare value
    // The codes are wierd stuff intentionally made to generate uncomprehensive codes by the gamegenie developers.
    // http://tuxnes.sourceforge.net/gamegenie.html
    const letterToInt = ["A", "P", "Z", "L", "G", "I", "T", "Y", "E", "O", "X", "U", "K", "S", "V", "N"];
    const letters = code.toUpperCase().replace(/[^APZLGITYEOXUKSVN]/, "").split("");
    if(letters.length!==6 && letters.length!==8){
        return null;
    }
    const val = letters.map((letter) => {
        return letterToInt.indexOf(letter)
    });
    const address = 0x8000 +
        ((val[3] & 7) << 12) |
        ((val[5] & 7) << 8) | ((val[4] & 8) << 8) |
        ((val[2] & 7) << 4) | ((val[1] & 8) << 4) |
        (val[4] & 7) | (val[3] & 8);

    if (val.length === 6) {
        return {
            address,
            data: ((val[1] & 7) << 4) | ((val[0] & 8) << 4) |
                (val[0] & 7) | (val[5] & 8),
            compare: null
        };
    } else {
        return {
            address,
            data: ((val[1] & 7) << 4) | ((val[0] & 8) << 4) |
                (val[0] & 7) | (val[7] & 8),
            compare: ((val[7] & 7) << 4) | ((val[6] & 8) << 4) |
                (val[6] & 7) | (val[5] & 8)
        };
    }
}

export default GameGenie;