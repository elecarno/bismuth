require('./entity.js')
let config = require('./config.js')
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

        if(config.colTiles.includes(self.getCurrentTile()))
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
