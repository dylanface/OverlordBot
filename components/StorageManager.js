const { EventEmitter } = require('events');
const fs = require('fs');
/**
 * Collect, manage, and parse StorageItem(s)
 * 
 */
class StorageManager extends EventEmitter {

    constructor(){
        super();
        this.#init()
    }


    #init() {

    }


    async storePNG(buffer, name, options = {
        type: 'buffer',
        link: true
    }) {
        
        fs.writeFile(`images/${name}.png`, buffer, (err, buf) => {
            if (err) console.error(err)
            else console.log('yay')
        });

    }

     //    const image = await fetch(url);
        //    if (!image) continue;
        //    const arrayBuffer = await image.arrayBuffer();
        //    const buffer = Buffer.from(arrayBuffer);


}

class StorageItem {

    #formats = {
        og: {
            ext: 'url',
            value: undefined
        },
        db
    }

    timestamps = {};

    constructor(){

    }

    get og_format(){

    }

    get db_format(){

    }

    dbSafeItem(){

    }



    toJSON() {
        return {
            format: {},

        }
    }

}