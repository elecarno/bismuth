require('./entity.js')
let config = require('./config.js')
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
    self.hiddenFloofs = [];

    self.inventory.addItem("iron_pickaxe", 1)
    self.inventory.addItem("bronze_chisel", 1)
    self.inventory.addItem("bronze_sickle", 1)
    self.inventory.addItem("survival_knife", 1)
    self.inventory.addItem("blood_core", 1)
    
    //self.inventory.addItem("compound_round", 1000)
    //self.inventory.addItem("shroom_k", 1)
    //self.inventory.addItem("hunting_rifle", 1)

    let selectedIntTileRecipes = []

    var superUpdate = self.update;
    self.update = function(){
        self.updateSpeed()
        superUpdate()

        for(var i = 0; i < self.hotbar.length; i++)
            if(!self.inventory.hasItem(self.hotbar[i], 1) && self.hotbar[i] !== "Nothing")
                self.hotbar[i] = "Nothing"

        self.mouseCanvasX = self.mouseX + self.x
        self.mouseCanvasY = self.mouseY + self.y

        let currentMouseChunk = world.getChunk(Math.floor((self.mouseCanvasX / tpd) / ctd), Math.floor((self.mouseCanvasY / tpd) / ctd))

        let mouseChunkX = Math.floor((self.mouseCanvasX / tpd) / ctd)
        let mouseChunkY = Math.floor((self.mouseCanvasY / tpd) / ctd)

        let mouseXInChunk = Math.floor(self.mouseCanvasX / tpd - mouseChunkX * ctd)
        let mouseYInChunk = Math.floor(self.mouseCanvasY / tpd - mouseChunkY * ctd)


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

        updateCrafting = function(){
            let recipesToSend = []
            for(var i = 0; i < config.craftingRecipes.length; i++){
                let hasNeededItems = 0
                for(var j = 0; j < config.craftingRecipes[i].length-1; j++){
                    if(self.inventory.hasItem(config.craftingRecipes[i][j], 1)){
                        hasNeededItems += 1
                    }
                }
                if(hasNeededItems == config.craftingRecipes[i].length-1){
                    //console.log(config.craftingRecipes[i][config.craftingRecipes[i].length-1])
                    recipesToSend.push(config.craftingRecipes[i][config.craftingRecipes[i].length-1])
                }
            }
            self.inventory.addRecipes(recipesToSend)

            let workToSend = []
            for(var i = 0; i < selectedIntTileRecipes.length; i++){
                let hasNeededItems = 0
                for(var j = 0; j < selectedIntTileRecipes[i].length-1; j++){
                    if(self.inventory.hasItem(selectedIntTileRecipes[i][j], 1)){
                        hasNeededItems += 1
                    }
                }
                if(hasNeededItems == selectedIntTileRecipes[i].length-1){
                    //console.log(config.craftingRecipes[i][config.craftingRecipes[i].length-1])
                    workToSend.push(selectedIntTileRecipes[i][selectedIntTileRecipes[i].length-1])
                }
            }
            self.inventory.addWorkbenchRecipes(workToSend)
        }

        if(self.currentRightClick > self.lastRightClick){
            if(config.intTiles.includes(getTile(mouseXInChunk, mouseYInChunk))){
                let intTile = getTile(mouseXInChunk, mouseYInChunk)
                socket.emit("workbenchUI", "inline-block")
                if(intTile == 7)
                    selectedIntTileRecipes = config.workbenchRecipes
                else if(intTile == 22)
                    selectedIntTileRecipes = config.furnaceRecipes
                else if(intTile == 23)
                    selectedIntTileRecipes = config.metalworkRecipes
                else if(intTile == 25)
                    selectedIntTileRecipes = config.forgeRecipes
                else if(intTile == 26)
                    selectedIntTileRecipes = config.lysisRecipes
                else if(intTile == 27)
                    selectedIntTileRecipes = config.airRecipes
                else if(intTile == 28)
                    selectedIntTileRecipes = config.smelterRecipes
                else if(intTile == 29)
                    selectedIntTileRecipes = config.alchemyRecipes
                else if(intTile == 30)
                    selectedIntTileRecipes = config.masonryRecipes
                else if(intTile == 31)
                    selectedIntTileRecipes = config.shaperRecipes
                else if(intTile == 32)
                    selectedIntTileRecipes = config.armouryRecipes
                else if(intTile == 33)
                    selectedIntTileRecipes = config.refineryRecipes
                else
                    selectedIntTileRecipes = []  
            } else 
                socket.emit("workbenchUI", "none")
            updateCrafting()    

            let bulletToUse = 0
            for(var i = 0; i < config.bullets.length; i++){
                if(self.inventory.hasItem(config.bullets[i], 1))
                    bulletToUse = config.bullets[i]
            }

            if(self.inventory.hasItem(bulletToUse, 1) && config.singleGuns.includes(self.hotbar[self.activeSlot])){
                self.shootBullet(self.mouseAngle, 50, config.weaponStrengths[self.hotbar[self.activeSlot]] * config.bulletStrengths[bulletToUse])
                self.inventory.removeItem(bulletToUse, 1)
            }
            
            if(config.meleeWeapons.includes(self.hotbar[self.activeSlot])){
                self.meleeAttack(self.mouseAngle, 1, config.weaponStrengths[self.hotbar[self.activeSlot]])
            }

            self.lastRightClick = self.currentRightClick
        }

        if(self.holdingMouseLeft){
            let toolType = "none"
            let selectedTile = getTile(mouseXInChunk, mouseYInChunk)
            if(config.mineTiles.includes(selectedTile))
                toolType = [config.miningToolStrengths, config.miningTools]
            else if(config.harvestTiles.includes(selectedTile))
                toolType = [config.harvestToolStrengths, config.harvestTools]
            else if(config.workTiles.includes(selectedTile))
                toolType = [config.workToolStrengths, config.workTools]

            self.currentTileStrength = config.tileStrengths[selectedTile]

            if(toolType[1].includes(self.hotbar[self.activeSlot]) && selectedTile !== 1){
                self.tileDestroyState += 1 * toolType[0][self.hotbar[self.activeSlot]]
                if(self.tileDestroyState >= config.tileStrengths[selectedTile]){
                    if(inverse(config.placeIds)[selectedTile] !== undefined)
                        self.inventory.addItem(inverse(config.placeIds)[selectedTile], 1)

                    currentMouseChunk.tiles[mouseYInChunk * currentMouseChunk.width + mouseXInChunk] = 1
                    if (config.floor1Tiles.includes(selectedTile))
                        tileToPlace = 1
                    else if (config.floor2Tiles.includes(selectedTile))
                        tileToPlace = 12
                    else if (config.floor3Tiles.includes(selectedTile))
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
            updateCrafting()  
            self.tileDestroyState = 0
            self.lastLeftClick = self.currentLeftClick
        }

        if(self.holdingMouseRight){
            let bulletToUse = 0
            for(var i = 0; i < config.bullets.length; i++){
                if(self.inventory.hasItem(config.bullets[i], 1))
                    bulletToUse = config.bullets[i]
            }

            if(self.inventory.hasItem(bulletToUse, 1) && config.autoGuns.includes(self.hotbar[self.activeSlot])){
                self.shootBullet(self.mouseAngle, 50, config.weaponStrengths[self.hotbar[self.activeSlot]] * config.bulletStrengths[bulletToUse])
                self.inventory.removeItem(bulletToUse, 1)
            }

            if(config.placeableItems.includes(self.hotbar[self.activeSlot]) && !config.priorityTiles.includes(getTile(mouseXInChunk, mouseYInChunk))){
                if(currentMouseChunk.tiles[mouseYInChunk * currentMouseChunk.width + mouseXInChunk] !== config.placeIds[self.hotbar[self.activeSlot]]){
                    self.inventory.removeItem(self.hotbar[self.activeSlot], 1)
                    if(inverse(config.placeIds)[getTile(mouseXInChunk, mouseYInChunk)] !== undefined)
                        self.inventory.addItem(inverse(config.placeIds)[getTile(mouseXInChunk, mouseYInChunk)], 1)
                }

                currentMouseChunk.tiles[mouseYInChunk * currentMouseChunk.width + mouseXInChunk] = config.placeIds[self.hotbar[self.activeSlot]]
                tileToPlace = config.placeIds[self.hotbar[self.activeSlot]]

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
        let collision = self.collision(self.width, self.height)
        
        if(self.pressingRight && !collision[1] && self.x < wpd)
            self.speedX = self.maxSpeed
        else if(self.pressingLeft && !collision[0] && self.x > 0)
            self.speedX = -self.maxSpeed
        else
            self.speedX = 0
        
        if(self.pressingDown && !collision[3] && self.y < wpd)
            self.speedY = self.maxSpeed
        else if(self.pressingUp && !collision[2] && self.y > 0)
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
    console.log(socket.id + " has connected")
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

    let f = Floof.getAllInitPack()
    for(var i = 0; i < f.length; i++){
        if(!Player.list[socket.id].getDistance(f[i]) < renderDistance){
            let idx = f.indexOf(f[i])
            f.splice(idx, 1)
        }
    }

    socket.emit("init",{
        selfId:socket.id,
        player:Player.getAllInitPack(),
        bullet:Bullet.getAllInitPack(),
        floof:f,
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