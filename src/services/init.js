export default class Init {
    constructor({setPalette, setRomNames, setRomInfoIndex}) {
        this.setPalette = setPalette;
        this.setRomNames = setRomNames;
        this.setRomInfoIndex = setRomInfoIndex;
/*        this.getPalette(setPalette);
        this.getRomNames(setRomNames);
        this.jobLeft = 2;*/
    }

    init() {
        const getPalette = fetch("../files/nespalette.json")
            .then(response => response.json()).then((data) => {
                this.setPalette(data);
            });

        const getRomNames = fetch("../rom-info/md5-to-game-name.json")
            .then(response => response.json()).then((data) => {
                this.setRomNames(data);
            });

        const getRomInfoIndex =  fetch("/rom-info/index.json")
                .then(response => response.json())
                .then(romInfo => {
                    this.setRomInfoIndex(romInfo);
                });

        return Promise.all([getPalette, getRomNames, getRomInfoIndex]);
    }


    getPalette(setPalette){
    return fetch("../files/nespalette.json")
    .then(response => response.json()).then((data) => {
        setPalette(data);
        this.jobLeft--;
    });
    }

    getRomNames(setRomNames) {



    
    }

 


}