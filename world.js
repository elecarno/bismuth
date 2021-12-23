/*
Good seeds (i.e: spawn not in a wall):
0.07089678959081125
*/

const seed = 0.07089678959081125 //Math.random()
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
            let scale = 35
            value2d = simplex.noise2D((tilex + x*self.width) / scale, (tiley + y*self.height) / scale);
            if (Math.random() > 0.98 && value2d < 0){
                if (Math.random() < 0.3)
                    self.tiles.push(4) // toad_shroom
                else
                    self.tiles.push(5) // pollen_shroom
            }
            else if(Math.random() > 0.995 && value2d < 0){
                self.tiles.push(6) // cave_flower
            }
            else if (value2d < 0)
                self.tiles.push(1) // floor
            else if (value2d < 0.2)
                self.tiles.push(2) // rocky_floor
            else if (value2d > 0.2)
                self.tiles.push(3) // rock
        }
    }
 
    return self
}

World = function () {
    var self = {
        map:{}
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

    return self
}