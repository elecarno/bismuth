const SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(Math.random()),

Chunk = function (x, y) {
    var self = {
        tiles:[], // array of "tile idsa"
        width:64,
        height:64,
        x:x,
        y:y
    }

    for(let tiley = 0; tiley < self.height; tiley++){
        for(let tilex = 0; tilex < self.width; tilex++){
            let scale = 35
            value2d = simplex.noise2D((tilex + x*self.width) / scale, (tiley + y*self.height) / scale);
            self.tiles.push(value2d)
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