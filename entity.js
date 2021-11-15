var initPack = {player:[],bullet:[],floof:[]}
var removePack = {player:[],bullet:[],floof:[]}

function randomRange(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
}  

// Entity -----------------------------------------------------------------------
Entity = function(){
    var self = {
        // 1 tile = 50px, co-ords = (x * 50, y * 50)
        x:25000, // spawn at (500, 500)
        y:25000,
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
// Entity -----------------------------------------------------------------------

// Player -----------------------------------------------------------------------
{
Player = function(id, username, socket, progress){
    var self = Entity()
    self.id = id
    self.number = "" + Math.floor(Math.random() * 100)
    self.username = username
    self.inventory = new Inventory(progress.items, socket, true)
    self.effects = []
    self.pressingRight = false
    self.pressingLeft = false
    self.pressingUp = false
    self.pressingDown = false
    self.pressingPrimary = false
    self.pressingSecondary = false
    self.mouseAngle = 0
    self.maxSpeed = 10
    self.hp = 100
    self.hpMax = 100
    self.score = 0

    var superUpdate = self.update;
    self.update = function(){
        self.updateSpeed()
        superUpdate()

        if(self.pressingPrimary){
            self.shootBullet(self.mouseAngle)
        }
    }

    self.shootBullet = function(angle){
        /*
        if(Math.random() < 0.1){
            self.inventory.addItem("medkit", 1)
        }
        */
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
        }
    }
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
            effects:self.effects,
        }
    }

    self.die = function(){
        self.hp = self.hpMax
        self.x = 25000
        self.y = 25000

        // a bit buggy
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
// Player -----------------------------------------------------------------------

// Bullet -----------------------------------------------------------------------
{
Bullet = function(parent, angle){
    var self = Entity()
    self.id = Math.random()
    self.speedX = Math.cos(angle/180*Math.PI) * 45
    self.speedY = Math.sin(angle/180*Math.PI) * 45
    self.parent = parent
    self.timer = 0
    self.toRemove = false
    var superUpdate = self.update
    self.update = function(){
        if (self.timer++ > 8) // Remove after (x) amount of frames/updates
            self.toRemove = true
        superUpdate()

        // Collision
        for (var i in Player.list){
            var p = Player.list[i]
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                p.hp -= 1
                if(p.hp <= 0){
                    var shooter = Player.list[self.parent]
                    if(shooter)
                        shooter.score += 10
                }
                self.toRemove = true
            }
        }
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
// Bullet -----------------------------------------------------------------------

// Floof ------------------------------------------------------------------------
{
Floof = function(){
    var self = Entity()
    self.x = randomRange(300 * 50, 700 * 50)
    self.y = randomRange(300 * 50, 700 * 50)
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
        if (this.speedX > 0.3)
            this.speedX = 0.3
        if (this.speedY > 0.3)
            this.speedY = 0.3

        /*
        if (self.timer++ > 432){ // Remove after 432 frames (3 seconds I think)
            self.toRemove = true
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit("addToChat", "floof " + self.number + " died of old age")
            }
        }       
        */ 

        superUpdate()

        // Collision
        for (var i in Bullet.list){
            var b = Bullet.list[i]
            if(self.getDistance(b) < 32){
                // handle collision
                self.toRemove = true
                Player.list[b.parent].inventory.addItem("medkit", 1)
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit("addToChat", "floof " + self.number + " was killed")
                }      
            }
        }
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            number:self.number
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
    if (Math.random() < 0.05 && floofCount < 250){
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
// Floof ------------------------------------------------------------------------