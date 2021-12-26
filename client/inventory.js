function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
       if (arr[i] === value) {
          arr.splice(i, 1);
       } else {
          ++i;
       }
    }
    return arr;
 }

Inventory = function(items, socket, server){
    var self = {
        items:items, //{id:"itemId",amount:1}
        socket:socket,
        server:server,
    }
    self.addItem = function(id, amount){
        for(var i = 0; i < self.items.length; i++){
            if(self.items[i].id === id){
                self.items[i].amount += amount
                self.refreshRender()
                return
            }
        }
        self.items.push({id:id,amount:amount})
        self.refreshRender()
    }
    self.removeItem = function(id, amount){
        for(var i = 0; i < self.items.length; i++){
            if(self.items[i].id === id){
                self.items[i].amount -= amount
                if(self.items[i].amount <= 0)
                    self.items.splice(i,1)
                self.refreshRender()
                return
            }
        }
    }
    self.hasItem = function(id, amount){
        for(var i = 0; i < self.items.length; i++){
            if(self.items[i].id === id){
                return self.items[i].amount >= amount
            }
        }
        return false
    }
    self.getItemSpriteId = function(id){
        for(var i = 0; i < self.items.length; i++){
            if(self.items[i].id === id){
                //console.log(spriteIds[self.items[i].id])
                return spriteIds[self.items[i].id]
            }
        }
    }
    self.refreshRender = function(){
        // server
        if(self.server){
            self.socket.emit("updateInvetory", self.items)
            return
        }   

        // client only
        var inventory = document.getElementById("inventory")
        inventory.innerHTML = ""
        var addButton = function(data){
            let item = Item.list[data.id]
            let button = document.createElement('button')
            button.onclick = function(){
                self.socket.emit("useItem", item.id)
            }
            button.innerText = item.name + " x" + data.amount
            inventory.appendChild(button)
        }
        
        for(var i = 0; i < self.items.length; i++)
            addButton(self.items[i])  
    }

    // server
    if(self.server){
        self.socket.on("useItem", function(itemId){
            if(!self.hasItem(itemId, 1)){
                console.log("someone tryna cheat possibly")
                return
            }
            let item = Item.list[itemId]
            item.event(Player.list[self.socket.id])
        })
    }

    return self
}

Item = function(id, name, event){
    var self = {
        id:id,
        name:name,
        event:event,
    }
    Item.list[self.id] = self
    return self
}
Item.list = {}

Item("medkit","Medkit", function(player){
    if(player.hp <= 90)
        player.hp += 10
    else
        player.hp = 100
    player.inventory.removeItem("medkit", 1)
    player.inventory.addItem("adrenaline", 1)
})

Item("adrenaline","Adrenaline", function(player){
    for(var i = 0; i < player.effects.length; i++)
        if(player.effects[i] === "Adrenaline")
            return
    
    player.hp -= 50
    player.maxSpeed *= 2
    player.effects.push("Adrenaline")
    player.inventory.removeItem("adrenaline", 1)
    setTimeout(function(){
        player.maxSpeed /= 2
        removeItemAll(player.effects, "Adrenaline")
    }, 5000)
})

Item("almond_water","Almond Water", function(player){
    for(var i = 0; i < player.effects.length; i++)
        if(player.effects[i] === "Almonised")
            return

    player.hp *= 1.5
    if(player.hp > 100)
        player.hp = 100
    player.maxSpeed /= 2
    player.effects.push("Almonised")
    player.inventory.removeItem("almond_water", 1)
    setTimeout(function(){
        player.maxSpeed *= 2
        removeItemAll(player.effects, "Almonised")
    }, 5000)
})

Item("cave_beef","Cave Beef", function(player){
    player.inventory.removeItem("cave_beef", 1)
})

// tools & placeables
let spriteIds = {
    "shroom_k": 1,
    "hunting_rifle": 2,
    "survival_knife": 3,
    "bronze_pickaxe": 5,
    "stone": 4, // all tiles will be 4
    "rocky_floor": 4,
}

Item("stone","Stone", function(player){
    let idx = player.hotbar.indexOf("stone")
    player.hotbar[idx] = "Nothing"
    player.hotbar.splice(player.activeSlot, 1, "stone")
})

Item("rocky_floor","Rocky Floor", function(player){
    let idx = player.hotbar.indexOf("rocky_floor")
    player.hotbar[idx] = "Nothing"
    player.hotbar.splice(player.activeSlot, 1, "rocky_floor")
})

Item("survival_knife","Survival Knife", function(player){
    let idx = player.hotbar.indexOf("survival_knife")
    player.hotbar[idx] = "Nothing"
    player.hotbar.splice(player.activeSlot, 1, "survival_knife")
})

Item("shroom_k","Shroom-K Rifle", function(player){
    let idx = player.hotbar.indexOf("shroom_k")
    player.hotbar[idx] = "Nothing"
    player.hotbar.splice(player.activeSlot, 1, "shroom_k")
})

Item("hunting_rifle","Hunting Rifle", function(player){
    let idx = player.hotbar.indexOf("hunting_rifle")
    player.hotbar[idx] = "Nothing"
    player.hotbar.splice(player.activeSlot, 1, "hunting_rifle")
})

Item("bronze_pickaxe","Bronze Pickaxe", function(player){
    let idx = player.hotbar.indexOf("bronze_pickaxe")
    player.hotbar[idx] = "Nothing"
    player.hotbar.splice(player.activeSlot, 1, "bronze_pickaxe")
})