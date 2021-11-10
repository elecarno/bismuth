// Initialisation or Something --------------------------------------------------
var mongojs = require("mongojs")
var db = mongojs('localhost:27017/Bismuth', ['account','progress'])
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
        x:Math.random() * 2000,
        y:Math.random() * 1000,
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
    self.number = "" + Math.floor(Math.random() * 100)
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

// Floof ------------------------------------------------------------------------
var Floof = function(){
    var self = Entity()
    self.id = Math.random()
    self.number = "" + Math.floor(Math.random() * 100)
    self.speedX = 0
    self.speedY = 0
    self.timer = 0
    self.toRemove = false
    var superUpdate = self.update
    self.update = function(){
        direction = Math.random()
        axis = Math.random()
        if(direction > 0.5){
            if (axis >= 0.5)
                this.speedX += Math.random()
            else
                this.speedY += Math.random()
        }
        else if (direction < 0.5){
            if (axis > 0.5)
                this.speedX -= Math.random()
            else
                this.speedY -= Math.random()
        }
        if (this.speedX > 1)
            this.speedX = 1
        if (this.speedY > 1)
            this.speedY = 1

        if (self.timer++ > 432){ // Remove after 432 frames (3 seconds I think)
            self.toRemove = true
            /*
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit("addToChat", "floof " + self.number + " died of old age")
            }
            */
        }        

        superUpdate()

        // Collision
        for (var i in Bullet.list){
            var b = Bullet.list[i]
            if(self.getDistance(b) < 32){
                // handle collision
                self.toRemove = true
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit("addToChat", "floof " + self.number + " was killed")
                }
            }
        }
    }
    Floof.list[self.id] = self
    return self
}
Floof.list = {}

Floof.update = function(){
    if (Math.random() < 0.1){
        Floof()
    }

    var pack = []
    for (var i in Floof.list){
        var floof = Floof.list[i]
        floof.update()
        if (floof.toRemove) 
            delete Floof.list[i];
        else
            pack.push({
                x:floof.x,
                y:floof.y,
                number:floof.number
            })
    }
    return pack
}
// Floof ------------------------------------------------------------------------

// Connections & Server Stuff ---------------------------------------------------

//!!!!!!!!!!!!!!!!!!!!!!!!!!!
var DEBUG = false // IMPORTANT
//!!!!!!!!!!!!!!!!!!!!!!!!!!!

var USERS = {
    // username:password
    "bob":"asd",
    "bob2":"bob"
}

var isValidPassword = function(data, cb){
    db.account.find({username:data.username, password:data.password}, function(err, res){
        if(res.length > 0)
            cb(true)
        else
            cb(false)
    })
}

var isUsernameTaken = function(data, cb){
    db.account.find({username:data.username}, function(err, res){
        if(res.length > 0)
            cb(true)
        else
            cb(false)
    })
}

var addUser = function(data, cb){
    db.account.insert({username:data.username, password:data.password}, function(err){
        cb()
    })
}

var io = require("socket.io") (serv, {})
io.sockets.on("connection", function(socket){
    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket  

    socket.on("signIn", function(data){
        isValidPassword(data, function(result){
            if(result){
                Player.onConnect(socket)
                socket.emit("signInResponse",{success: true})
            } else {
                socket.emit("signInResponse",{success: false})
            }
        })  
    })

    socket.on("signUp", function(data){
        isUsernameTaken(data, function(result){
            if(result){
                socket.emit("signUpResponse",{success: false})
            } else {
                addUser(data, function(){
                    socket.emit("signUpResponse",{success: true})
                })
            }
        })
    })

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
        bullet:Bullet.update(),
        floof:Floof.update()
    }

    for (var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i]
        socket.emit("newPosition", pack)
    }
}, 1000/144) // 144 updates per second (so people with 144Hz monitors won't complain)
// Connections & Server Stuff ---------------------------------------------------