require('./entity.js')
let config = require('./config.js')
Floof = function(){
    var self = Entity()
    self.x = 0
    self.y = 0
    if(randomProperty(Player.list) != undefined){
        self.x = randomProperty(Player.list).x + randomRange(-5 * tpd, 5 * tpd)
        self.y = randomProperty(Player.list).y + randomRange(-5 * tpd, 5 * tpd)
    }
    self.width = 0.9
    self.height = 0.8
    self.id = Math.random()
    self.speedX = 0 
    self.speedY = 0
    self.timer = 0
    self.target = randomProperty(Player.list)
    self.offsetX = Math.random()
    self.offsetY = Math.random()
    self.toRemove = false
    var superUpdate = self.update

    if(Math.random() > 0.5){
        self.speedX = Math.random() * 5
        self.speedY = Math.random() * 5
    } else {
        self.speedX = Math.random() * -5
        self.speedY = Math.random() * -5
    }

    self.update = function(){
        superUpdate()
        /* FOLLOW CODE
        if(self.target !== undefined){
            if (!Player.list.hasOwnProperty(self.target.id)){
                self.target = randomProperty(Player.list)
            }
        }    

        if(self.target !== undefined && !right && !left && !above && !under){
            self.speedX = (self.target.x - self.x)/50 * self.offsetX
            self.speedY = (self.target.y - self.y)/50 * self.offsetY
        }
        */

        // Collision
        for (var i in Bullet.list){
            var b = Bullet.list[i]
            if(self.getDistance(b) < 32){
                // handle collision
                self.toRemove = true
                Player.list[b.parent].inventory.addItem("floof_wool", 1)  
                Floof()
            }
        }

        let currentChunk = world.getChunk(Math.floor((self.x / tpd) / ctd), Math.floor((self.y / tpd) / ctd))
        let xInChunk = Math.floor(self.x / tpd - currentChunk.x * ctd)
        let yInChunk = Math.floor(self.y / tpd - currentChunk.y * ctd)

        getTile = function(xic, yic){
            return currentChunk.tiles[yic * currentChunk.width + xic]
        }

        let right = config.colTiles.includes(getTile(xInChunk + 1, yInChunk))
        let left = config.colTiles.includes(getTile(xInChunk - 1, yInChunk))
        let above = config.colTiles.includes(getTile(xInChunk, yInChunk - 1))
        let under = config.colTiles.includes(getTile(xInChunk, yInChunk + 1))

        if (right)
            self.speedX = -Math.random()
        if (left)
            self.speedX = Math.random()
        if (above)
            self.speedY = Math.random()
        if (under)
            self.speedY = -Math.random()

        if(config.colTiles.includes(getTile(xInChunk, yInChunk)))
            self.toRemove = true
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        }
    }
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        }
    }

    Floof.list[self.id] = self
    initPack.floof.push(self.getInitPack())
    return self
}
Floof.list = {}

Floof.update = function(){
    var floofCount = 0
    for(var i in Floof.list){
        floofCount++
    }
    if (Math.random() > 0.993 && floofCount <= 150){
        Floof()
    }

    var pack = []
    for (var i in Floof.list){
        var floof = Floof.list[i]
        floof.update()
        let farFrom = 0
        for(var j in Player.list){
            if(Player.list[j].getDistance(floof) > renderDistance)
                farFrom++

            if(farFrom < Object.keys(Player.list).length){
                if (floof.toRemove) {
                    delete Floof.list[i];
                    removePack.floof.push(floof.id)
                } else
                    pack.push(floof.getUpdatePack())
            } else {
                floof.toRemove = true
                delete Floof.list[i];
                removePack.floof.push(floof.id)
            }
        }
    }

    return pack
}

Floof.getAllInitPack = function(){
    var floofs = []
    for(var i in Floof.list)
        floofs.push(Floof.list[i].getInitPack())
    return floofs
}