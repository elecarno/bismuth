// Initialisation or Something --------------------------------------------------
const { timeEnd } = require("console")
var express = require("express")
const { ftruncate } = require("fs")
var app = express()
var serv = require("http").Server(app)

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html")
})
app.use("/client", express.static(__dirname + "/client"))

serv.listen(8080)
console.log("Bismuth started")

var SOCKET_LIST = {}
// Initialisation or Something --------------------------------------------------

// Entity -----------------------------------------------------------------------
var Entity = function(){
    var self = {
        x:250,
        y:250,
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
// Entity -----------------------------------------------------------------------


// Player -----------------------------------------------------------------------
var Player = function(id){
    var self = Entity()
    self.id = id
    self.number = "" + Math.floor(10 * Math.random())
    self.pressingRight = false
    self.pressingLeft = false
    self.pressingUp = false
    self.pressingDown = false
    self.pressingPrimary = false
    self.pressingSecondary = false
    self.mouseAngle = 0
    self.maxSpeed = 5

    var superUpdate = self.update;
    self.update = function(){
        self.updateSpeed()
        superUpdate()

        if(self.pressingPrimary){
            self.shootBullet(self.mouseAngle)
        }
    }

    self.shootBullet = function(angle){
        var b = Bullet(self.id, angle)
            b.x = self.x
            b.y = self.y
    }

    self.updateSpeed = function(){
        if(self.pressingRight)
            self.speedX = self.maxSpeed
        else if(self.pressingLeft)
            self.speedX = -self.maxSpeed
        else
            self.speedX = 0

        if(self.pressingUp)
            self.speedY = -self.maxSpeed
        else if(self.pressingDown)
            self.speedY = self.maxSpeed
        else
            self.speedY = 0
    }
    Player.list[id] = self
    return self
}
Player.list = {}

Player.onConnect = function(socket){
    var player = Player(socket.id)
    socket.on("keyPress", function(data){
        if(data.inputId === 'left')
			player.pressingLeft = data.state
		else if(data.inputId === 'right')
			player.pressingRight = data.state
		else if(data.inputId === 'up')
			player.pressingUp = data.state
		else if(data.inputId === 'down')
			player.pressingDown = data.state
        else if(data.inputId === 'primary')
            player.pressingPrimary = data.state
        else if (data.inputId === "mouseAngle")
            player.mouseAngle = data.state
    })
}

Player.onDisconnect = function(socket){
    delete Player.list[socket.id]
}

Player.update = function(){
    var pack = []
    for (var i in Player.list){
        var player = Player.list[i]
        player.update()
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        })
    }
    return pack
}
// Player -----------------------------------------------------------------------

// Bullet -----------------------------------------------------------------------
var Bullet = function(parent, angle){
    var self = Entity()
    self.id = Math.random()
    self.speedX = Math.cos(angle/180*Math.PI) * 45
    self.speedY = Math.sin(angle/180*Math.PI) * 45
    self.parent = parent
    self.timer = 0
    self.toRemove = false
    var superUpdate = self.update
    self.update = function(){
        if (self.timer++ > 431) // Remove after 432 frames (3 seconds I think)
            self.toRemove = true
        superUpdate()

        // Collision
        for (var i in Player.list){
            var p = Player.list[i]
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                // handle collision, ex: hp--
                self.toRemove = true
            }
        }
    }
    Bullet.list[self.id] = self
    return self
}
Bullet.list = {}

Bullet.update = function(){
    var pack = []
    for (var i in Bullet.list){
        var bullet = Bullet.list[i]
        bullet.update()
        if (bullet.toRemove) 
            delete Bullet.list[i];
        else
            pack.push({
                x:bullet.x,
                y:bullet.y,
                number:bullet.number
            })
    }
    return pack
}
// Bullet -----------------------------------------------------------------------

// Connections & Server Stuff ---------------------------------------------------

//!!!!!!!!!!!!!!!!!!!!!!!!!!!
var DEBUG = false // IMPORTANT
//!!!!!!!!!!!!!!!!!!!!!!!!!!!

var io = require("socket.io") (serv, {})
io.sockets.on("connection", function(socket){
    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket  

    Player.onConnect(socket)

    socket.on("disconnect", function(){
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
    })

    // Chat
    socket.on("sendMsgToServer", function(data){
        var playerName = ("" + socket.id).slice(2,7)
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit("addToChat", playerName + ":" + data)
        }
    })

    socket.on("evalServer", function(data){
        if(!DEBUG)
            return

        var result = eval(data)
        socket.emit("evalAnswer", result)
    })
})

// Game Loop
setInterval(function(){
    var pack = { // Array of Packs
        player:Player.update(),
        bullet:Bullet.update()
    }

    for (var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i]
        socket.emit("newPosition", pack)
    }
}, 1000/144) // 144 updates per second (so people with 144Hz monitors won't complain)
// Connections & Server Stuff ---------------------------------------------------