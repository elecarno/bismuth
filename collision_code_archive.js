// 2x2 collision (Player)
let currentChunk = world.getChunk(Math.floor((self.x / 50) / 32), Math.floor((self.y / 50) / 32))
let xInChunk = Math.floor(self.x / 50 - currentChunk.x * 32)
let yInChunk = Math.floor(self.y / 50 - currentChunk.y * 32)

getTile = function(xic, yic){
    return currentChunk.tiles[yic * currentChunk.width + xic]
}

//console.log(getTile(xInChunk, yInChunk)) // debug line

let topRight = colTiles.includes(getTile(xInChunk + 1, yInChunk + 1))
let bottomRight = colTiles.includes(getTile(xInChunk + 1, yInChunk - 1))
let topLeft = colTiles.includes(getTile(xInChunk - 1, yInChunk + 1))
let bottomLeft = colTiles.includes(getTile(xInChunk - 1, yInChunk - 1))
let rightTop = colTiles.includes(getTile(xInChunk + 1, yInChunk - 1))
let leftTop = colTiles.includes(getTile(xInChunk - 1, yInChunk - 1))
let rightBottom = colTiles.includes(getTile(xInChunk + 1, yInChunk + 1))
let leftBottom = colTiles.includes(getTile(xInChunk - 1, yInChunk + 1))

let worldsize = 51200 // width and height of world in pixels
if(self.pressingRight && self.x < worldsize && !topRight && !bottomRight)
    self.speedX = self.maxSpeed
else if(self.pressingLeft && self.x > 0 && !topLeft && !bottomLeft)
    self.speedX = -self.maxSpeed
else if(topRight && bottomRight){
    if(xInChunk >= 30)
        self.speedX = self.maxSpeed
    else
        self.speedX = -1
}
else if(topLeft && bottomLeft){
    if(xInChunk <= 0)
        self.speedX = -self.maxSpeed
    else
        self.speedX = 1
}
else
    self.speedX = 0

if(self.pressingUp && self.y > 0 && !rightTop && !leftTop)
    self.speedY = -self.maxSpeed
else if(self.pressingDown && self.y < worldsize && !rightBottom && !leftBottom)
    self.speedY = self.maxSpeed
else if (rightTop && leftTop){
    if(yInChunk <= 0)
        self.speedY = -self.maxSpeed
    else
        self.speedY = 1
}
else if (rightBottom && leftBottom){
    if(yInChunk >= 30)
        self.speedY = self.maxSpeed
    else
        self.speedY = -1
}
else
    self.speedY = 0
