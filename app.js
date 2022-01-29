// Initialisation or Something --------------------------------------------------
const { timeEnd } = require("console")

require('./entities/entity')
require('./database')
require('./world')
require('./client/inventory')

var express = require("express")
const { ftruncate } = require("fs")
var app = express()
var serv = require("http").Server(app)

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html")
})
app.use("/client", express.static(__dirname + "/client"))

process.setMaxListeners(0)

serv.listen(8080)
console.log("Bismuth started")

SOCKET_LIST = {}
// Initialisation or Something --------------------------------------------------

// Connections & Server Stuff ---------------------------------------------------

//!!!!!!!!!!!!!!!!!!!!!!!!!!!
var DEBUG = false // IMPORTANT
//!!!!!!!!!!!!!!!!!!!!!!!!!!!

var io = require("socket.io") (serv, {})
io.sockets.on("connection", function(socket){
    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket  

    socket.on("signIn", function(data){
        Database.isValidPassword(data, function(result){
            if(!result)
                return socket.emit("signInResponse",{success: false})
            Database.getPlayerProgress(data.username, function(progress){
                let player = Player.onConnect(socket, data.username, progress)
                SOCKET_LIST[socket.id].player = player;
                socket.emit("signInResponse",{success: true})
            })
        })  
    })

    socket.on("signUp", function(data){
        Database.isUsernameTaken(data, function(result){
            if(result){
                socket.emit("signUpResponse",{success: false})
            } else {
                Database.addUser(data, function(){
                    socket.emit("signUpResponse",{success: true})
                })
            }
        })
    })

    socket.on("disconnect", function(){
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
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
    let packs = Entity.getFrameUpdateData()
    for (var i in SOCKET_LIST){
        let socket = SOCKET_LIST[i]
        let player = socket.player;
        if (player === null || player === undefined) continue;

        let updatePack = {
            floof: [],
            player: packs.updatePack.player,
            bullet: packs.updatePack.bullet
        };

        for (let floof of packs.updatePack.floof) {
            if (Math.abs(floof.x - player.x) < 400 &&
                Math.abs(floof.y - player.y) < 400) {
                    updatePack.floof.push(floof);
            }
        }
        
        socket.emit("init", packs.initPack)
        socket.emit("update", updatePack)
        socket.emit("remove", packs.removePack)
    }
}, 1000/75) // 144 updates per second (so people with 144Hz monitors won't complain)
// Connections & Server Stuff ---------------------------------------------------
