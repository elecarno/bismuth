const e = require('express')
const { send, render } = require('express/lib/response')

require('../world')
require('./player.js')
require('./bullet.js')
require('./floof.js')
let config = require('./config.js')
const SAVE_NAME = "testsave.json";

world = new World(SAVE_NAME)

tpd = 50 // tile pixel dimension
ctd = 32 // chunk tile dimension
renderDistance = 1800
wpd = 51200 // world pixel dimension

initPack = {player:[],bullet:[],floof:[]}
removePack = {player:[],bullet:[],floof:[]}

randomRange = function(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
}  

inverse = function(obj){
    var retobj = {};
    for(var key in obj){
      retobj[obj[key]] = key;
    }
    return retobj;
}

randomProperty = function (obj) {
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

        let leftHit = config.colTiles.includes(getTile(xInChunk-width/2, yInChunk)) && getDistanceToTile(xInChunk-width/2, yInChunk, "left") <= 0
        let rightHit = config.colTiles.includes(getTile(xInChunk+width, yInChunk)) && getDistanceToTile(xInChunk+width, yInChunk, "right") <= 0
        let topHit = config.colTiles.includes(getTile(xInChunk, yInChunk-height)) && getDistanceToTile(xInChunk, yInChunk-height, "top") <= 0
        let bottomHit = config.colTiles.includes(getTile(xInChunk, yInChunk+height)) && getDistanceToTile(xInChunk, yInChunk+height, "bottom") <= 0

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