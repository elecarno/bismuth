var USE_DB = false
var mongojs = USE_DB ? require("mongojs") : null
var db = USE_DB ? mongojs('localhost:27017/Bismuth', ['account','progress']) : null

// account: {username:string, password:string}
// progress: {username:string, items:[{id:string, amount:number}]}

Database = {}

// Sign In
Database.isValidPassword = function(data, cb){
    if(!USE_DB)
        return cb(true)
    
    db.account.find({username:data.username, password:data.password}, function(err, res){
        if(res.length > 0)
            cb(true)
        else
            cb(false)
    })
}

Database.isUsernameTaken = function(data, cb){
    if (!USE_DB)
        return cb(false)
    
    db.account.find({username:data.username}, function(err, res){
        if(res.length > 0)
            cb(true)
        else
            cb(false)
    })
}

Database.addUser = function(data, cb){
    if (!USE_DB)
        return cb()

    db.account.insert({username:data.username, password:data.password}, function(err){
        Database.savePlayerProgress({username:data.username,items:[]},function(){
            cb()
        })
    })
}

// Player Progress
Database.getPlayerProgress = function(username, cb){
    if(!USE_DB)
        return cb({items:[]})
    
    db.progress.findOne({username:username},function(err, res){
        cb({items:res.items})
    })
}

Database.savePlayerProgress = function(data, cb) {
    cb = cb || function(){};
    if(!USE_DB)
        return cb();
    
    db.progres.update({pseudo:data.pseudo}, {$set:data}, {upsert:true});
}