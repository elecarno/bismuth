// Initialisation or Something --------------------------------------------------
const { timeEnd } = require("console")

require('./entities/entity.js')
require('./database.js')
require('./world.js')
require('./client/inventory.js')

let express = require("express")
const { ftruncate } = require("fs")
let app = express()
let serv = require("http").Server(app)

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html")
})
app.use("/client", express.static(__dirname + "/client"))

process.setMaxListeners(0)

serv.listen(8080)
console.log("Bismuth started")

SOCKET_LIST = {}

// Connections & Server Stuff ---------------------------------------------------
//!!!!!!!!!!!!!!!!!!!!!!!!!!!
let DEBUG = false // IMPORTANT
//!!!!!!!!!!!!!!!!!!!!!!!!!!!

let io = require("socket.io") (serv, {})
io.sockets.on("connection", function(socket){
    socket.id = Math.random()
    SOCKET_LIST[socket.id] = socket  

    socket.on("signIn", function(data){
        Database.isValidPassword(data, function(result){
            if(!result)
                return socket.emit("signInResponse",{success: false})
            Database.getPlayerProgress(data.username, function(progress){
                let player = Player.onConnect(socket, data.username, progress)
                socket.emit("signInResponse",{success: true})
                SOCKET_LIST[socket.id].player = player;
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
        console.log(socket.id + " has disconnected")
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
    })

    socket.on("evalServer", function(data){
        if(!DEBUG)
            return

        let result = eval(data)
        socket.emit("evalAnswer", result)
    })
})

const ENTITY_RENDER_DISTANCE = 2 * 32 * 50; //2 chunks
const TIME_BETWEEN_SAVES = 10 * 75; //10 seconds (in ticks)
const SAVE_NAME = "testsave.json";

let save_timer = 0;
// Game Loop
setInterval(function(){
    let packs = Entity.getFrameUpdateData()
    for (let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i]
        let player = socket.player;
        if (player === null || player === undefined) continue;

        let updatePack = {
            floof: [],
            player: structuredClone(packs.updatePack.player),
            bullet: packs.updatePack.bullet
        };

        for (let floof of packs.updatePack.floof) {
            if (Math.abs(floof.x - player.x) < ENTITY_RENDER_DISTANCE &&
                Math.abs(floof.y - player.y) < ENTITY_RENDER_DISTANCE) {
                    updatePack.floof.push(floof);
                    if (player.hiddenFloofs.includes(floof.id)) {
                        packs.initPack.floof.push(floof);
                        player.hiddenFloofs.splice(player.hiddenFloofs.indexOf(floof.id), 1);
                    }
            } else {
                packs.removePack.floof.push(floof.id);
                player.hiddenFloofs.push(floof.id);
            }
        }

        for (let p2 of updatePack.player) {
            if (p2.id != player.id) {
                p2.chunk = [];
            }
        }
        
        socket.emit("init", packs.initPack)
        socket.emit("update", updatePack)
        socket.emit("remove", packs.removePack)
    }
    save_timer += 1;
    if (save_timer >= TIME_BETWEEN_SAVES) {
        save_timer = 0;
        world.save(SAVE_NAME);
    }
}, 1000/75) // 144 updates per second (so people with 144Hz monitors won't complain)