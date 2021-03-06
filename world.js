/*
Good seeds (i.e: spawn not in a wall):
0.07089678959081125
0.010675218994110391
*/
const fs = require("fs")

const seed = 0.010675218994110391 //Math.random()
//console.log(seed)

const SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(seed),

Chunk = function (x, y) {
    var self = {
        tiles:[], // array of "tile ids"
        width:32,
        height:32,
        x:x,
        y:y
    }

    for(let tiley = 0; tiley < self.height; tiley++){
        for(let tilex = 0; tilex < self.width; tilex++){
            valueBiome = simplex.noise2D((tilex + x*self.width) / 500, (tiley + y*self.height) / 500);
            valueOre = simplex.noise2D((tilex + x*self.width) / 10, (tiley + y*self.height) / 10);
            let scale = 35
            value2d = simplex.noise2D((tilex + x*self.width) / scale, (tiley + y*self.height) / scale);
            if(valueBiome < 0){
                if (Math.random() > 0.97 && value2d < 0){
                    if (Math.random() < 0.3)
                        self.tiles.push(4) // toad_shroom
                    else
                        self.tiles.push(5) // pollen_shroom
                }
                else if(Math.random() > 0.965 && value2d < 0){
                    self.tiles.push(6) // cave_flower
                }
                else if (value2d < 0)
                    self.tiles.push(1) // floor
                else if (value2d < 0.2)
                    self.tiles.push(2) // rocky_floor
                else if (value2d < 0.5){
                    if(valueOre < 0.6)
                        self.tiles.push(3) // rock
                    else
                        self.tiles.push(17) // iron_ore
                }
                else if (value2d > 0.5)
                    self.tiles.push(8) // granite
            }
            else if (valueBiome < 0.2){
                if(Math.random() > 0.98 && value2d < 0){
                    self.tiles.push(16) // bronze_berry
                }
                else if (value2d < 0)
                    self.tiles.push(12) // floor_2
                else if (value2d < 0.2)
                    self.tiles.push(13) // organic_floor
                else if (value2d < 0.5)
                    self.tiles.push(14) // beq_rock
                else if (value2d > 0.5)
                    self.tiles.push(8) // granite
            }
            else if (valueBiome > 0.2){
                if(Math.random() > 0.98 && value2d < 0){
                    self.tiles.push(15) // stone
                }
                else if(Math.random() > 0.9995 && value2d < 0){
                    self.tiles.push(7) // old_workbench
                }
                else if(Math.random() > 0.9995 && value2d < 0){
                    self.tiles.push(22) // old_furnace
                }
                else if (value2d < 0)
                    self.tiles.push(9) // floor_3
                else if (value2d < 0.6)
                    self.tiles.push(10) // dirt_floor
                else if (value2d < 0.8)
                    self.tiles.push(11) // earth
                else if (value2d > 0.8){
                    if(valueOre < 0.6)
                        self.tiles.push(18) // mound
                    else
                        self.tiles.push(34) // aluminium_ore
                }
            }
        }
    }
    
    return self
}

World = function (filename) {
    var self = {
        map:{}
    }

    try {
        if (fs.statSync(filename).isFile()) {
            self.map = JSON.parse(fs.readFileSync(filename, "utf8"));
        } else {
            console.log("Unable to read world file '" + filename + "': not a file");
        }
    } catch (e) {
        console.log("Unable to read world file '" + filename + "': " + e);
    }

    self.getChunk = function(x, y) {
        const idx = (x << 16) | y
        if (idx in self.map)
            return self.map[idx]
        else
            return self.genChunk(x, y)
    }

    self.getChunkOnly = function(x, y) {
        const idx = (x << 16) | y
        if (idx in self.map)
            return self.map[idx]
        else
            return null
    }

    self.genChunk = function(x, y){
        const idx = (x << 16) | y
        const chunk = Chunk(x, y)
        self.map[idx] = chunk
        return chunk
    }

    self.addChunk = function(chunk){
        const idx = (chunk.x << 16) | chunk.y
        self.map[idx] = chunk
    }

    self.save = function(filename) {
        fs.writeFileSync(filename, JSON.stringify(self.map));
    }

    return self
}
