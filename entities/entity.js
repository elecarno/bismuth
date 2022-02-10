const e = require('express')
const { send, render } = require('express/lib/response')

require('../world')

world = new World()

var tpd = 50 // tile pixel dimension
var ctd = 32 // chunk tile dimension
var renderDistance = 1800
var wpd = 51200 // world pixel dimension

var colTiles = [3, 7, 8, 11, 14, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 
32, 33, 34, 35]
var intTiles = [7, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33]
var autoGuns = ["shroom_k"]
var singleGuns = ["hunting_rifle"]
var meleeWeapons = ["survival_knife"]
var miningTools = ["bronze_pickaxe", "iron_pickaxe", "iron_drill"]
var harvestTools = ["survival_knife", "bronze_sickle", "iron_sickle"]
var workTools = ["bronze_chisel", "iron_chisel"]
var placeableItems = [
"rock", "rocky_floor", "granite", "earth", "beq_rock", 
"stone", "organic_floor", "dirt_floor", "cave_flower", "toad_shroom", 
"pollen_shroom", "bronze_berry", "mound", "oxygen_canister", "shroom_wood", "iron_ore", 
"carbon_dioxide_canister", "old_workbench", "old_furnace", "metalworking_bench", 
"rock_tiles", "forge", "lysis_machine", "air_extractor", "smelter", "alchemy_table",
"masonry_bench", "shaper", "armoury", "refinery", "aluminium_ore", "blood_core",
]
var priorityTiles = [3, 7, 8, 11, 14, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30,
31, 32, 33, 34, 35]
var weaponStrengths = {
    "survival_knife" : 2,
    "shroom_k" : 1,
    "hunting_rifle" : 5
}
var bullets = ["bronze_round", "iron_round", "compound_round"]
var bulletStrengths = {
    "bronze_round" : 1,
    "iron_round" : 1.5,
    "compound_round": 2,
}
var placeIds = {
    "rock" : 3, "rocky_floor" : 2, "granite": 8, "organic_floor": 13, "beq_rock": 14,
    "dirt_floor": 10, "earth": 11, "stone": 15, "cave_flower": 6, "toad_shroom": 4, 
    "pollen_shroom": 5, "bronze_berry": 16, "iron_ore": 17, "mound": 18,
    "oxygen_canister": 19, "shroom_wood": 20, "carbon_dioxide_canister": 21,
    "old_workbench": 7, "old_furnace": 22, "metalworking_bench": 23, "rock_tiles": 24,
    "forge": 25, "lysis_machine": 26, "air_extractor": 27, "smelter": 28, "alchemy_table": 29,
    "masonry_bench": 30, "shaper": 31, "armoury": 32, "refinery": 33, "aluminium_ore": 34,
    "blood_core": 35,
}
var miningToolStrengths = {
    "bronze_pickaxe": 1.5,
    "iron_pickaxe": 2,
    "iron_drill": 7,
}
var harvestToolStrengths = {
    "survival_knife": 0.5,
    "bronze_sickle": 1,
    "iron_sickle": 2,
}
var workToolStrengths = {
    "bronze_chisel": 1,
    "iron_chisel": 2,
}
var tileStrengths = {
    2:20, 3:40, 4:5, 5:5, 6:5, 7:100,
    8:55, 10:20, 11:30, 13:20, 14:50, 15:5,
    16:10, 17:50, 18:55, 19:120, 20:30, 21:120, 22:135, 24:35,
    23:120, 25:140, 26:140, 27:135, 28:140, 29:110, 30:115,
    31:140, 32:140, 33:150, 34:75, 35:250,
}
var mineTiles = [2,3,8,13,14,10,11,17,18,34]
var harvestTiles = [4,5,6,15,16,35]
var workTiles = [7,19,20,21,22,24,25,26,27,28,29,30,31,32,33]

var floor1Tiles = [1,2,3,4,5,6,7,8,17,20]
var floor2Tiles = [12,13,14,16]
var floor3Tiles = [9,10,11,15,18,22,23,24,25,26,27,28,29,30,31,32,33,34,35,19,21]

craftingRecipes = [
    ["toad_shroom", "stone", "shroom_wood"],
    ["pollen_shroom", "cave_flower", "fibres"],
    ["bronze_berry","fibres","shroom_wood","bronze_pickaxe"],
    ["bronze_berry","fibres","shroom_wood","bronze_sickle"],
    ["stone","bronze_berry","fibres","shroom_wood","bronze_chisel"],
    ["bronze_berry", "stone", "bronze_round_kit"],
    ["iron_bar", "stone", "iron_round_kit"],
    ["copper", "bronze_berry", "stone", "compound_round_kit"],
]
workbenchRecipes = [
    ["iron_panel", "bolts", "fibres", "forge"],
    ["iron_panel", "bolts", "stone", "refinery"],
    ["turbine", "precision_blade", "bolts", "iron_panel", "air_extractor"],
    ["electrical_parts", "turbine", "iron_panel", "lysis_machine"],
    ["reinforced_bone", "shroom_wood", "pollen_shroom", "fibres", "alchemy_table"],
    ["stone", "iron_bar", "shroom_wood", "fibres", "masonry_bench"],
    ["iron_panel", "bolts", "turbine", "stone", "smelter"],
    ["precision_blade", "drill_bit", "shroom_wood", "bolts", "shaper"],
    ["precision_blade", "shroom_wood", "bolts", "armoury"],
    ["iron_bar", "stone", "metalworking_bench"]
]
furnaceRecipes = [
    ["iron_ore", "iron_bar"],
]
metalworkRecipes = [
    ["iron_bar", "iron_panel"],
    ["iron_bar", "bolts"],
    ["iron_bar", "weaponry_mould"],
    ["iron_bar", "industrial_mould"],
]
forgeRecipes = [
    ["iron_bar", "aluminium_bar", "industrial_mould", "turbine"],
    ["aluminium_bar", "industrial_mould", "precision_blade"],
    ["radium", "aluminium_bar", "electrical_parts"],
    ["iron_bar", "industrial_mould", "drill_bit"],
    ["aluminium_bar", "weaponry_mould", "blade_kit"],
    ["iron_bar", "weaponry_mould", "rifle_kit"],
    ["iron_bar", "weaponry_mould", "pistol_kit"],
]
smelterRecipes = [
    ["iron_bar", "graphite", "steel_bar"],
]
airRecipes = [
    ["cave_flower", "carbon_dioxide_canister"],
]
lysisRecipes = [
    ["carbon_dioxide_canister", "oxygen_canister"],
    ["carbon_dioxide_canister", "graphite"],
    ["bronze_berry", "bronze_leaf"],
    ["bronze_berry", "copper"],
]
alchemyRecipes = [
    ["blood_bag", "blood_core"],
]
masonryRecipes = [
    ["rock", "rock_tile_kit"],
]
shaperRecipes = [
    ["drill_bit", "electrical_parts", "blood_core", "iron_panel", "iron_drill"],
    //["drill_bit", "electrical_parts", "blood_core", "steel_bar", "steel_drill"],
]
armouryRecipes = [
    ["rifle_kit", "shroom_wood", "shroom_k"],
    ["rifle_kit", "shroom_wood", "hunting_rifle"],
]
refineryRecipes = [
    ["aluminium_ore", "aluminium_bar"],
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

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

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
    self.collision = function(width, height){
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
                x1 = self.x - width * tpd
            else if(hitbox === "right")
                x1 = self.x + width * tpd

            if(hitbox === "top")
                y1 = self.y - height * tpd
            else if(hitbox === "bottom")
                y1 = self.y + height * tpd

            if(hitbox === "left" || hitbox === "right")
                return Math.sqrt(Math.pow(x2-x1, 2))

            if(hitbox === "top" || hitbox === "bottom")
                return Math.sqrt(Math.pow(y2-y1, 2))
        }

        let leftHit = colTiles.includes(getTile(xInChunk-width/2, yInChunk)) && getDistanceToTile(xInChunk-width/2, yInChunk, "left") <= 0
        let rightHit = colTiles.includes(getTile(xInChunk+width, yInChunk)) && getDistanceToTile(xInChunk+width, yInChunk, "right") <= 0
        let topHit = colTiles.includes(getTile(xInChunk, yInChunk-height)) && getDistanceToTile(xInChunk, yInChunk-height, "top") <= 0
        let bottomHit = colTiles.includes(getTile(xInChunk, yInChunk+height)) && getDistanceToTile(xInChunk, yInChunk+height, "bottom") <= 0

        return [leftHit, rightHit, topHit, bottomHit]
    }
    self.getCurrentTile = function(){
        let currentChunk = world.getChunk(Math.floor((self.x / tpd) / ctd), Math.floor((self.y / tpd) / ctd))
        let xInChunk = Math.floor(self.x / tpd - currentChunk.x * ctd)
        let yInChunk = Math.floor(self.y / tpd - currentChunk.y * ctd)
        return currentChunk.tiles[yInChunk * currentChunk.width + xInChunk]
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

    /*
    for (var i in Player.list){
        var player = Player.list[i]
        pack.updatePack.player[0]
    }
    */

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
    self.hiddenFloofs = [];

    self.inventory.addItem("bronze_pickaxe", 1)
    self.inventory.addItem("bronze_chisel", 1)
    self.inventory.addItem("bronze_sickle", 1)

    self.inventory.addItem("old_workbench", 1)
    self.inventory.addItem("old_furnace", 1)
    self.inventory.addItem("blood_core", 1)
    /*
    self.inventory.addItem("shroom_k", 1)
    self.inventory.addItem("hunting_rifle", 1)
    self.inventory.addItem("survival_knife", 1)
    self.inventory.addItem("bronze_round", 1000)
    */
    
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

            let workToSend = []
            for(var i = 0; i < selectedIntTileRecipes.length; i++){
                let hasNeededItems = 0
                for(var j = 0; j < selectedIntTileRecipes[i].length-1; j++){
                    if(self.inventory.hasItem(selectedIntTileRecipes[i][j], 1)){
                        hasNeededItems += 1
                    }
                }
                if(hasNeededItems == selectedIntTileRecipes[i].length-1){
                    //console.log(craftingRecipes[i][craftingRecipes[i].length-1])
                    workToSend.push(selectedIntTileRecipes[i][selectedIntTileRecipes[i].length-1])
                }
            }
            self.inventory.addWorkbenchRecipes(workToSend)
        }

        if(self.currentRightClick > self.lastRightClick){
            if(intTiles.includes(getTile(mouseXInChunk, mouseYInChunk))){
                let intTile = getTile(mouseXInChunk, mouseYInChunk)
                socket.emit("workbenchUI", "inline-block")
                if(intTile == 7)
                    selectedIntTileRecipes = workbenchRecipes
                else if(intTile == 22)
                    selectedIntTileRecipes = furnaceRecipes
                else if(intTile == 23)
                    selectedIntTileRecipes = metalworkRecipes
                else if(intTile == 25)
                    selectedIntTileRecipes = forgeRecipes
                else if(intTile == 26)
                    selectedIntTileRecipes = lysisRecipes
                else if(intTile == 27)
                    selectedIntTileRecipes = airRecipes
                else if(intTile == 28)
                    selectedIntTileRecipes = smelterRecipes
                else if(intTile == 29)
                    selectedIntTileRecipes = alchemyRecipes
                else if(intTile == 30)
                    selectedIntTileRecipes = masonryRecipes
                else if(intTile == 31)
                    selectedIntTileRecipes = shaperRecipes
                else if(intTile == 32)
                    selectedIntTileRecipes = armouryRecipes
                else if(intTile == 33)
                    selectedIntTileRecipes = refineryRecipes
                else
                    selectedIntTileRecipes = []  
            } else 
                socket.emit("workbenchUI", "none")
            updateCrafting()    

            let bulletToUse = 0
            for(var i = 0; i < bullets.length; i++){
                if(self.inventory.hasItem(bullets[i], 1))
                    bulletToUse = bullets[i]
            }

            if(self.inventory.hasItem(bulletToUse, 1) && singleGuns.includes(self.hotbar[self.activeSlot])){
                self.shootBullet(self.mouseAngle, 50, weaponStrengths[self.hotbar[self.activeSlot]] * bulletStrengths[bulletToUse])
                self.inventory.removeItem(bulletToUse, 1)
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
            updateCrafting()  
            self.tileDestroyState = 0
            self.lastLeftClick = self.currentLeftClick
        }

        if(self.holdingMouseRight){
            let bulletToUse = 0
            for(var i = 0; i < bullets.length; i++){
                if(self.inventory.hasItem(bullets[i], 1))
                    bulletToUse = bullets[i]
            }

            if(self.inventory.hasItem(bulletToUse, 1) && autoGuns.includes(self.hotbar[self.activeSlot])){
                self.shootBullet(self.mouseAngle, 50, weaponStrengths[self.hotbar[self.activeSlot]] * bulletStrengths[bulletToUse])
                self.inventory.removeItem(bulletToUse, 1)
            }

            if(meleeWeapons.includes(self.hotbar[self.activeSlot])){
                self.meleeAttack(self.mouseAngle, 1, weaponStrengths[self.hotbar[self.activeSlot]])
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
                        shooter.inventory.addItem("blood_bag", 1) 
                        shooter.inventory.addItem("albino_fur", 10)
                        shooter.inventory.addItem("reinforced_bone", 25)
                        p.score = Math.round(p.score / 2)
                    }
                }
                self.toRemove = true
            }
        }

        if(colTiles.includes(self.getCurrentTile()))
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
                Player.list[b.parent].inventory.addItem("medkit", 1)
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
}
