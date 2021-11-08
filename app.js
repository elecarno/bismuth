
const { timeEnd } = require("console")
var express = require("express")
var app = express()
var serv = require("http").Server(app)

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html")
})
app.use("/client", express.static(__dirname + "/client"))

serv.listen(8080)
console.log("Bismuth started")

var SOCKET_LIST = {}

var Entity = function(){
    var self = {
        x:20,
        y:20,
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
    return self
}

var Player = function(id){
    var self = Entity()
    self.id = id
    self.number = "" + Math.floor(10 * Math.random())
    self.pressingRight = false
    self.pressingLeft = false
    self.pressingUp = false
    self.pressingDown = false
    self.maxSpeed = 10

    var superUpdate = self.update;
    self.update = function(){
        self.updateSpeed()
        superUpdate()
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
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
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

var io = require("socket.io") (serv, {})
io.sockets.on("connection", function(socket){
    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket  

    Player.onConnect(socket)

    socket.on("disconnect", function(){
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
    })

})

setInterval(function(){
    var pack = Player.update()
    for (var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i]
        socket.emit("newPosition", pack)
    }
}, 1000/144)