const e = require('express')
const { send, render } = require('express/lib/response')

require('../world')

world = new World()

var tpd = 50 // tile pixel dimension
var ctd = 32 // chunk tile dimension
var renderDistance = 925

var colTiles = [3, 7, 8, 11, 14, 17]
var intTiles = [7]
var autoGuns = ["shroom_k"]
var singleGuns = ["hunting_rifle"]
var meleeWeapons = ["survival_knife"]
var miningTools = ["bronze_pickaxe", "iron_pickaxe", "iron_drill"]
var harvestTools = ["survival_knife", "bronze_sickle"]
var workTools = ["bronze_chisel"]
var placeableItems = [
"rock", "rocky_floor", "granite", "earth", "beq_rock", 
"stone", "organic_floor", "dirt_floor", "cave_flower", "toad_shroom", 
"pollen_shroom", "bronze_berry", "mound"
]
var priorityTiles = [7, 3, 7, 8, 11, 14, 17]
var placeIds = {
    "rock" : 3,
    "rocky_floor" : 2,
    "granite": 8,
    "organic_floor": 13,
    "beq_rock": 14,
    "dirt_floor": 10,
    "earth": 11,
    "stone": 15,
    "cave_flower": 6,
    "toad_shroom": 4,
    "pollen_shroom": 5,
    "bronze_berry": 16,
    "mound":18,
}
var miningToolStrengths = {
    "bronze_pickaxe": 1.5,
    "iron_pickaxe": 2,
    "iron_drill": 7,
}
var harvestToolStrengths = {
    "survival_knife": 0.5,
    "bronze_sickle": 1,
}
var workToolStrengths = {
    "bronze_chisel": 1,
}
var tileStrengths = {
    2: 20, 3: 40, 4: 5, 5: 5, 6: 5, 7: 100,
    8: 55, 10: 20, 11: 30, 13: 20, 14: 50, 15: 5,
    16: 10, 17: 50, 18: 55
}
var mineTiles = [2, 3, 8, 13, 14, 10, 11, 17, 18]
var harvestTiles = [4, 5, 6, 15, 16]
var workTiles = [7]

var floor1Tiles = [1,2,3,4,5,6,7,8,17]
var floor2Tiles = [12,13,14,16]
var floor3Tiles = [9,10,11,15,18]

craftingRecipes = [
    ["toad_shroom", "stone", "shroom_wood"],
    ["pollen_shroom", "cave_flower", "fibres"],
    ["bronze_berry","fibres","shroom_wood","bronze_pickaxe"],
    ["bronze_berry","fibres","shroom_wood","bronze_sickle"],
    ["stone","bronze_berry","fibres","shroom_wood","bronze_chisel"],
]

var initPack = {player:[],bullet:[],floof:[]}
var removePack = {player:[],bullet:[],floof:[]}

function randomRange(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
}  

function inverse(obj){
    var retobj = {};
    for(var key in obj){
      retobj[obj[key]] = key;
    }
    return retobj;
}

// Entity -----------------------------------------------------------------------
Entity = function(){
    var self = {
        // 1 tile = 50px, co-ords = (x * 50, y * 50)
        x:25600, // spawn at (500, 500)
        y:25600,
        speedX:0,
        speedY:0,
        id:"",
    }
    self.update = function(){
        self.updatePosition()
    }
    self.updatePosition = function(){
        self.x += self.speedX
        self.y += self.speedY
    }
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x, 2) + Math.pow(self.y-pt.y, 2))
    }
    return self
}
Entity.getFrameUpdateData = function(){
    var pack = {
        initPack:{
            player:initPack.player,
            bullet:initPack.bullet,
            floof:initPack.floof,
        },
        removePack:{
            player:removePack.player,
            bullet:removePack.bullet,
            floof:removePack.floof,
        },
        updatePack:{
            player:Player.update(),
            bullet:Bullet.update(),
            floof:Floof.update(),
        }
    }

    initPack.player = []
    initPack.bullet = []
    initPack.floof = []

    removePack.player = []
    removePack.bullet = []
    removePack.floof = []
    
    return pack
}

// Player -----------------------------------------------------------------------
{
Player = function(id, username, socket, progress){
    var self = Entity()
    self.id = id
    self.number = "" + Math.floor(Math.random() * 100)
    self.username = username
    self.inventory = new Inventory(progress.items, socket, true)
    self.width = 1.6 // in tiles
    self.height = 1.8 // in tile
    self.effects = []
    self.pressingRight = false
    self.pressingLeft = false
    self.pressingUp = false
    self.pressingDown = false
    self.holdingMouseLeft = false
    self.holdingMouseRight = false
    self.mouseX = 0
    self.mouseY = 0
    self.mouseCanvasX = 0
    self.mouseCanvasY = 0
    self.mouseAngle = 0
    self.maxSpeed = 10
    self.hp = 100
    self.hpMax = 100
    self.score = 0
    self.activeSlot = 0
    self.hotbar = ["Nothing", "Nothing", "Nothing", "Nothing", "Nothing"]
    self.loadedChunks = []
    self.lookingRight = false
    self.spriteId = [0, 0]
    self.currentRightClick = 0
    self.lastRightClick = 0
    self.currentLeftClick = 0
    self.lastLeftClick = 0
    self.tileDestroyState = 0
    self.currentTileStrength = 100

    self.inventory.addItem("iron_drill", 1)
    self.inventory.addItem("bronze_chisel", 1)
    self.inventory.addItem("bronze_sickle", 1)
    self.inventory.addItem("shroom_k", 1)
    self.inventory.addItem("hunting_rifle", 1)
    self.inventory.addItem("survival_knife", 1)

    var superUpdate = self.update;
    self.update = function(){
        self.updateSpeed()
        superUpdate()

        for(var i = 0; i < self.hotbar.length; i++)
            if(!self.inventory.hasItem(self.hotbar[i], 1) && self.hotbar[i] !== "Nothing")
                self.hotbar[i] = "Nothing"

        self.mouseCanvasX = self.mouseX + self.x - 900 // 900 = 1800/2
        self.mouseCanvasY = self.mouseY + self.y - 480 // 480 = 960/2

        let currentMouseChunk = world.getChunk(Math.floor((self.mouseCanvasX / tpd) / ctd), Math.floor((self.mouseCanvasY / tpd) / ctd))
        let mouseXInChunk = Math.floor(self.mouseCanvasX / tpd - currentMouseChunk.x * ctd)
        let mouseYInChunk = Math.floor(self.mouseCanvasY / tpd - currentMouseChunk.y * ctd)

        let mouseChunkX = Math.floor((self.mouseCanvasX / tpd) / ctd)
        let mouseChunkY = Math.floor((self.mouseCanvasY / tpd) / ctd)

        let tileToPlace = 0

        if(self.hotbar[self.activeSlot] !== "Nothing")
            self.spriteId = self.inventory.getItemSpriteId(self.hotbar[self.activeSlot])
        else
            self.spriteId = [0, 0]

        getTile = function(xic, yic){
            return currentMouseChunk.tiles[yic * currentMouseChunk.width + xic]
        }

        socket.emit("hover-tile",{
            chunkX: mouseChunkX,
            chunkY: mouseChunkY,
            tileX: mouseXInChunk,
            tileY: mouseYInChunk,
        })

        if(self.currentRightClick > self.lastRightClick){
            if(intTiles.includes(getTile(mouseXInChunk, mouseYInChunk))){
                console.log("interactable tile")
            }      

            if(singleGuns.includes(self.hotbar[self.activeSlot])){
                self.shootBullet(self.mouseAngle, 50, 5)
            }

            self.lastRightClick = self.currentRightClick
        }

        if(self.holdingMouseLeft){
            let toolType = "none"
            let selectedTile = getTile(mouseXInChunk, mouseYInChunk)
            if(mineTiles.includes(selectedTile))
                toolType = [miningToolStrengths, miningTools]
            else if(harvestTiles.includes(selectedTile))
                toolType = [harvestToolStrengths, harvestTools]
            else if(workTiles.includes(selectedTile))
                toolType = [workToolStrengths, workTools]

            self.currentTileStrength = tileStrengths[selectedTile]

            if(toolType[1].includes(self.hotbar[self.activeSlot]) && selectedTile !== 1){
                self.tileDestroyState += 1 * toolType[0][self.hotbar[self.activeSlot]]
                if(self.tileDestroyState >= tileStrengths[selectedTile]){
                    if(inverse(placeIds)[selectedTile] !== undefined)
                        self.inventory.addItem(inverse(placeIds)[selectedTile], 1)

                    currentMouseChunk.tiles[mouseYInChunk * currentMouseChunk.width + mouseXInChunk] = 1
                    if (floor1Tiles.includes(selectedTile))
                        tileToPlace = 1
                    else if (floor2Tiles.includes(selectedTile))
                        tileToPlace = 12
                    else if (floor3Tiles.includes(selectedTile))
                        tileToPlace = 9
                    else
                        tileToPlace = 1

                    socket.broadcast.emit('tile-change',{
                        tileToPlace: tileToPlace,
                        mouseChunk: currentMouseChunk,
                        chunkX: mouseChunkX,
                        chunkY: mouseChunkY,
                        tileX: mouseXInChunk,
                        tileY: mouseYInChunk,
                    })
                    self.tileDestroyState = 0
                }
            } 
        }

        if(self.currentLeftClick > self.lastLeftClick){
            let recipesToSend = []
            for(var i = 0; i < craftingRecipes.length; i++){
                let hasNeededItems = 0
                for(var j = 0; j < craftingRecipes[i].length-1; j++){
                    if(self.inventory.hasItem(craftingRecipes[i][j], 1)){
                        hasNeededItems += 1
                    }
                }
                if(hasNeededItems == craftingRecipes[i].length-1){
                    //console.log(craftingRecipes[i][craftingRecipes[i].length-1])
                    recipesToSend.push(craftingRecipes[i][craftingRecipes[i].length-1])
                }
            }

            self.inventory.addRecipes(recipesToSend)

            self.tileDestroyState = 0
            self.lastLeftClick = self.currentLeftClick
        }

        if(self.holdingMouseRight){
            if(autoGuns.includes(self.hotbar[self.activeSlot])){
                self.shootBullet(self.mouseAngle, 8, 1)
            }

            if(meleeWeapons.includes(self.hotbar[self.activeSlot])){
                self.meleeAttack(self.mouseAngle, 1, 2)
            }

            if(placeableItems.includes(self.hotbar[self.activeSlot]) && !priorityTiles.includes(getTile(mouseXInChunk, mouseYInChunk))){
                if(currentMouseChunk.tiles[mouseYInChunk * currentMouseChunk.width + mouseXInChunk] !== placeIds[self.hotbar[self.activeSlot]]){
                    self.inventory.removeItem(self.hotbar[self.activeSlot], 1)
                    if(inverse(placeIds)[getTile(mouseXInChunk, mouseYInChunk)] !== undefined)
                        self.inventory.addItem(inverse(placeIds)[getTile(mouseXInChunk, mouseYInChunk)], 1)
                }

                currentMouseChunk.tiles[mouseYInChunk * currentMouseChunk.width + mouseXInChunk] = placeIds[self.hotbar[self.activeSlot]]
                tileToPlace = placeIds[self.hotbar[self.activeSlot]]

                socket.broadcast.emit('tile-change',{
                    tileToPlace: tileToPlace,
                    mouseChunk: currentMouseChunk,
                    chunkX: mouseChunkX,
                    chunkY: mouseChunkY,
                    tileX: mouseXInChunk,
                    tileY: mouseYInChunk,
                })
            }
        }
    }

    self.shootBullet = function(angle, lifetime, damage){
        var b = Bullet(self.id, angle, lifetime, 32, damage)
        b.x = self.x
        b.y = self.y
    }

    self.meleeAttack = function(angle, damage){
        var b = Bullet(self.id, angle, 1, 32, damage)
        b.x = self.x
        b.y = self.y
    }

    self.updateSpeed = function(){
        let currentChunk = world.getChunk(Math.floor((self.x / tpd) / ctd), Math.floor((self.y / tpd) / ctd))
        let xInChunk = Math.floor(self.x / tpd - currentChunk.x * ctd)
        let yInChunk = Math.floor(self.y / tpd - currentChunk.y * ctd)

        getTile = function(xic, yic){
            return currentChunk.tiles[Math.floor(yic) * currentChunk.width + Math.floor(xic)]
        }

        getDistanceToTile = function(xic, yic, hitbox){
            let x2 = xic * tpd + currentChunk.x * ctd * tpd
            let y2 = yic * tpd + currentChunk.y * ctd * tpd

            let x1 = self.x
            let y1 = self.y

            if(hitbox === "left")
                x1 = self.x - self.width * tpd
            else if(hitbox === "right")
                x1 = self.x + self.width * tpd

            if(hitbox === "top")
                y1 = self.y - self.height * tpd
            else if(hitbox === "bottom")
                y1 = self.y + self.height * tpd

            if(hitbox === "left" || hitbox === "right")
                return Math.sqrt(Math.pow(x2-x1, 2))

            if(hitbox === "top" || hitbox === "bottom")
                return Math.sqrt(Math.pow(y2-y1, 2))
        }

        let leftHit   = colTiles.includes(getTile(xInChunk-self.width/2, yInChunk)) && getDistanceToTile(xInChunk-self.width/2, yInChunk, "left") <= 0
        let rightHit  = colTiles.includes(getTile(xInChunk+self.width, yInChunk)) && getDistanceToTile(xInChunk+self.width, yInChunk, "right") <= 0
        let topHit    = colTiles.includes(getTile(xInChunk, yInChunk-self.height)) && getDistanceToTile(xInChunk, yInChunk-self.height, "top") <= 0
        let bottomHit = colTiles.includes(getTile(xInChunk, yInChunk+self.height)) && getDistanceToTile(xInChunk, yInChunk+self.height, "bottom") <= 0

        if(self.pressingRight && !rightHit)
            self.speedX = self.maxSpeed
        else if(self.pressingLeft && !leftHit)
            self.speedX = -self.maxSpeed
        else
            self.speedX = 0
        
        if(self.pressingDown && !bottomHit)
            self.speedY = self.maxSpeed
        else if(self.pressingUp && !topHit)
            self.speedY = -self.maxSpeed
        else
            self.speedY = 0

    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            number:self.number,
            username:self.username,
            hp:self.hp,
            hpMax:self.hpMax,
            score:self.score,
            effects:self.effects,
            chunk:world.getChunk(Math.floor((self.x / tpd) / ctd), Math.floor((self.y / tpd) / ctd)),
            hotbar:self.hotbar,
            activeSlot:self.activeSlot,
            lookingRight:self.lookingRight,
            spriteId:self.spriteId,
            tileDestroyState:self.tileDestroyState,
            currentTileStrength:self.currentTileStrength,
        }
    }
    self.getUpdatePack = function(){
        let chunkx = Math.floor((self.x / tpd) / ctd)
        let chunky = Math.floor((self.y / tpd) / ctd)
        let chunkToSend = []

        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                const idx = ((chunkx + dx) << 16) | (chunky + dy)
                
                if (!self.loadedChunks.includes(idx)){
                    self.loadedChunks.push(idx)
                    chunkToSend.push(world.getChunk(chunkx + dx, chunky + dy))
                }
            }
        }
        
        if(chunkToSend.length > 0){
            for (let i = self.loadedChunks.length - 1; i >= 0; i--){
                let idx = self.loadedChunks[i]
                let chunkX = idx >> 16
                let chunkY = idx & 0xffff

                if (Math.abs(chunkX - chunkx) > 1 || Math.abs(chunkY - chunky) > 1){
                    self.loadedChunks.splice(i, 1)
                }
            }
        }

        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
            effects:self.effects,
            chunk:chunkToSend,
            hotbar:self.hotbar,
            activeSlot:self.activeSlot,
            lookingRight:self.lookingRight,
            spriteId:self.spriteId,
            tileDestroyState:self.tileDestroyState,
            currentTileStrength:self.currentTileStrength,
        }
    }

    self.die = function(){
        self.hp = self.hpMax
        self.x = 25600
        self.y = 25600

        // a bit buggy:
        //self.effects = []
        //self.maxSpeed = 10
    }

    Player.list[id] = self
    initPack.player.push(self.getInitPack())
    return self
}
Player.list = {}

Player.onConnect = function(socket, username, progress){
    var player = Player(socket.id, username, socket, progress)
    player.inventory.refreshRender()
    socket.on("keyPress", function(data){
        if(data.inputId === 'left'){
            player.pressingLeft = data.state
            player.lookingRight = false
        }
		else if(data.inputId === 'right'){
            player.pressingRight = data.state
            player.lookingRight = true
        }
		else if(data.inputId === 'up')
			player.pressingUp = data.state
		else if(data.inputId === 'down')
			player.pressingDown = data.state
        else if(data.inputId === 'hold_left')
            player.holdingMouseLeft = data.state
        else if(data.inputId === 'hold_right')
            player.holdingMouseRight = data.state
        else if (data.inputId === "mouseAngle")
            player.mouseAngle = data.state
        else if (data.inputId === "clientX")
            player.mouseX = data.state
        else if (data.inputId === "clientY")
            player.mouseY = data.state
        else if (data.inputId === "left_click")
            player.currentLeftClick += 1
        else if (data.inputId === "right_click")
            player.currentRightClick += 1
        else if (data.inputId === "one")
            player.activeSlot = 0
        else if (data.inputId === "two")
            player.activeSlot = 1
        else if (data.inputId === "three")
            player.activeSlot = 2
        else if (data.inputId === "four")
            player.activeSlot = 3
        else if (data.inputId === "five")
            player.activeSlot = 4
    })

    socket.on("sendMsgToServer", function(data){
        var playerName = ("" + socket.id).slice(2,7)
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit("addToChat", player.username + " (" + player.number + ")" +": " + data)
        }
    })
    socket.emit("init",{
        selfId:socket.id,
        player:Player.getAllInitPack(),
        bullet:Bullet.getAllInitPack(),
        floof:Floof.getAllInitPack(),
    })

    return player;
}

Player.getAllInitPack = function(){
    var players = []
    for(var i in Player.list)
        players.push(Player.list[i].getInitPack())
    return players
}

Player.onDisconnect = function(socket){
    let player = Player.list[socket.id]
    if(!player)
        return
    Database.savePlayerProgress({
        username:player.username,
        items:player.inventory.items,
    })
    delete Player.list[socket.id]
    removePack.player.push(socket.id)
}

Player.update = function(){
    var pack = []
    for (var i in Player.list){
        var player = Player.list[i]

        if(player.hp <= 0)
            player.die()

        player.update()
        pack.push(player.getUpdatePack())
    }
    return pack
}
}

// Bullet -----------------------------------------------------------------------
{
Bullet = function(parent, angle, lifetime, size, damage){
    var self = Entity()
    self.id = Math.random()
    self.speedX = Math.cos(angle/180*Math.PI) * 45
    self.speedY = Math.sin(angle/180*Math.PI) * 45
    self.parent = parent
    self.timer = 0
    self.toRemove = false
    self.damage = damage

    var superUpdate = self.update
    self.update = function(){
        if (self.timer++ > lifetime) // Remove after (x) amount of frames/updates
            self.toRemove = true
        superUpdate()

        // Collision
        for (var i in Player.list){
            var p = Player.list[i]
            if(self.getDistance(p) < size && self.parent !== p.id){
                p.hp -= self.damage
                if(p.hp <= 0){
                    var shooter = Player.list[self.parent]
                    if(shooter){
                        shooter.score += Math.round(p.score / 2 + 5)
                        p.score = Math.round(p.score / 2)
                    }
                }
                self.toRemove = true
            }
        }

        let currentChunk = world.getChunk(Math.floor((self.x / tpd) / ctd), Math.floor((self.y / tpd) / ctd))
        let xInChunk = Math.floor(self.x / tpd - currentChunk.x * ctd)
        let yInChunk = Math.floor(self.y / tpd - currentChunk.y * ctd)

        getTile = function(xic, yic){
            return currentChunk.tiles[yic * currentChunk.width + xic]
        }

        let right = colTiles.includes(getTile(xInChunk + 1, yInChunk))
        let left = colTiles.includes(getTile(xInChunk - 1, yInChunk))
        let above = colTiles.includes(getTile(xInChunk, yInChunk - 1))
        let under = colTiles.includes(getTile(xInChunk, yInChunk + 1))

        if (left || right || above || under)
            self.toRemove = true

        if(colTiles.includes(getTile(xInChunk, yInChunk)))
            self.toRemove = true
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            angle:angle,
        }
    }
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            angle:angle,
        }
    }

    Bullet.list[self.id] = self
    initPack.bullet.push(self.getInitPack())
    return self
}
Bullet.list = {}

Bullet.update = function(){
    var pack = []
    for (var i in Bullet.list){
        var bullet = Bullet.list[i]
        bullet.update()
        if (bullet.toRemove) {
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id)
        } else
            pack.push(bullet.getUpdatePack())
    }
    return pack
}

Bullet.getAllInitPack = function(){
    var bullets = []
    for(var i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack())
    return bullets
}
}

// Floof ------------------------------------------------------------------------
{
Floof = function(){
    var self = Entity()
    self.x = randomRange(480 * tpd, 520 * tpd)
    self.y = randomRange(480 * tpd, 520 * tpd)
    self.id = Math.random()
    self.speedX = 0 
    self.speedY = 0
    self.timer = 0
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

        // Collision
        for (var i in Bullet.list){
            var b = Bullet.list[i]
            if(self.getDistance(b) < 32){
                // handle collision
                self.toRemove = true
                Player.list[b.parent].inventory.addItem("medkit", 1)
                Player.list[b.parent].inventory.addItem("floof_wool", 1)  
            }
        }

        let currentChunk = world.getChunk(Math.floor((self.x / tpd) / ctd), Math.floor((self.y / tpd) / ctd))
        let xInChunk = Math.floor(self.x / tpd - currentChunk.x * ctd)
        let yInChunk = Math.floor(self.y / tpd - currentChunk.y * ctd)

        getTile = function(xic, yic){
            return currentChunk.tiles[yic * currentChunk.width + xic]
        }

        let right = colTiles.includes(getTile(xInChunk + 1, yInChunk))
        let left = colTiles.includes(getTile(xInChunk - 1, yInChunk))
        let above = colTiles.includes(getTile(xInChunk, yInChunk - 1))
        let under = colTiles.includes(getTile(xInChunk, yInChunk + 1))

        if (right)
            self.speedX = -Math.random()
        if (left)
            self.speedX = Math.random()
        if (above)
            self.speedY = Math.random()
        if (under)
            self.speedY = -Math.random()

        if(colTiles.includes(getTile(xInChunk, yInChunk)))
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
    if (Math.random() < 0.9 && floofCount < 100){
        Floof()
    }

    var pack = []
    for (var i in Floof.list){
        var floof = Floof.list[i]
        floof.update()
        if (floof.toRemove) {
            delete Floof.list[i];
            removePack.floof.push(floof.id)
        } else
            pack.push(floof.getUpdatePack())
    }

    return pack
}

Floof.getAllInitPack = function(){
    var floofs = []
    for(var i in Floof.list)
        floofs.push(Floof.list[i].getInitPack())
    return floofs
}
}
