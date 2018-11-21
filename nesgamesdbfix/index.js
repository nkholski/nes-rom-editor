/* This nodejs takes a xml .dat-file from http://www.no-intro.org and output a json into the public folder 
    "node index.js" does the trick
*/

const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;

fs.readFile('nesgames.dat',  (err, data) => {
    if(err){
        console.log("Error", err);
        return;
    }
    const xml = new DOMParser().parseFromString(data.toString(), "text/xml");
    const output = createObject(xml);
    saveJSON(output);
});

function createObject(xml) {
    const output = {};
    const games = xml.getElementsByTagName("game");
    console.log("Game count: " + games.length);
    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        const name = game.getAttribute("name");
        const md5 = game.getElementsByTagName("rom")[0].getAttribute("md5");
        output[md5] = name;
    }
    return output;
}

function saveJSON(output) {
    fs.writeFile("../public/rom-info/md5-to-game-name.json", JSON.stringify(output), (err) => {
            if (err) {
                console.log("Error", err);
                return;
            }
            else {
                console.log("Done!");
            }
    });
}

