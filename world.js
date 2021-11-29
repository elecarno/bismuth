Chunk = function (x, y) {
    var self = {
        tiles:[],
        width:64,
        height:64,
        x:x,
        y:y
    }

    for(let y = 0; y < self.height; y++){
        for(let x = 0; x < self.width; x++){
            self.tiles.push(Math.random())
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

    self.genChunk = function(x, y){
        const idx = (x << 16) | y
        const chunk = Chunk(x, y)
        self.map[idx] = chunk
        return chunk
    }

    return self
}