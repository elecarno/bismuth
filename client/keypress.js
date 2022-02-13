    // Key-press Detection -----------------------------------------------------
    document.onkeydown = function(event){
        if(event.keyCode === 68) // d
            socket.emit("keyPress", {inputId:"right", state:true})
        else if(event.keyCode === 83) // s
            socket.emit("keyPress", {inputId:"down", state:true})
        else if(event.keyCode === 65)// a
            socket.emit("keyPress", {inputId:"left", state:true})
        else if(event.keyCode === 87) // w
            socket.emit("keyPress", {inputId:"up", state:true})
        else if(event.keyCode === 49) // 1
            socket.emit("keyPress", {inputId:"one", state:true})
        else if(event.keyCode === 50) // 2
            socket.emit("keyPress", {inputId:"two", state:true})
        else if(event.keyCode === 51) // 3
            socket.emit("keyPress", {inputId:"three", state:true})
        else if(event.keyCode === 52) // 4
            socket.emit("keyPress", {inputId:"four", state:true})
        else if(event.keyCode === 53) // 5
            socket.emit("keyPress", {inputId:"five", state:true})
    }

    document.onkeyup = function(event){
        if(event.keyCode === 68) // d
            socket.emit("keyPress", {inputId:"right", state:false})
        else if(event.keyCode === 83) // s
            socket.emit("keyPress", {inputId:"down", state:false})
        else if(event.keyCode === 65) // a
            socket.emit("keyPress", {inputId:"left", state:false})
        else if(event.keyCode === 87) // w
            socket.emit("keyPress", {inputId:"up", state:false})
        else if(event.keyCode === 49) // 1
            socket.emit("keyPress", {inputId:"one", state:false})
        else if(event.keyCode === 50) // 2
            socket.emit("keyPress", {inputId:"two", state:false})
        else if(event.keyCode === 51) // 3
            socket.emit("keyPress", {inputId:"three", state:false})
        else if(event.keyCode === 52) // 4
            socket.emit("keyPress", {inputId:"four", state:false})
        else if(event.keyCode === 53) // 5
            socket.emit("keyPress", {inputId:"five", state:false})
        else if(event.keyCode === 69){ // e
            if(inventoryDiv.style.display === "none"){
                inventoryDiv.style.display = "inline-block"
                craftingDiv.style.display = "inline-block"
            } else {
                inventoryDiv.style.display = "none"
                craftingDiv.style.display = "none"
            }
        }
        else if(event.keyCode === 81){ // q
            if(belowGameDiv.style.display === "none")
                belowGameDiv.style.display = "inline-block"
            else
                belowGameDiv.style.display = "none"
        }
    }

    document.onmousedown = function(event){
        switch (event.which) {
            case 1:
                socket.emit('keyPress',{inputId:'hold_left', state:true})
                break;
            case 2:
                //console.log("mid")
                break;
            case 3:
                socket.emit('keyPress',{inputId:'hold_right', state:true})
                break;
            default:
                console.log("else")
        }
    }

    document.onmouseup = function(event){
        socket.emit('keyPress',{inputId:'hold_left', state:false})
        socket.emit('keyPress',{inputId:'hold_right', state:false})
        switch (event.which) {
            case 1:
                socket.emit('keyPress',{inputId:'left_click', state:true})
                /*
                setTimeout(function(){
                    socket.emit('keyPress',{inputId:'left_click', state:false})
                }, 1)
                */
                break;
            case 2:
                //console.log("mid")
                break;
            case 3:
                socket.emit('keyPress',{inputId:'right_click', state:true})
                /*
                setTimeout(function(){
                    socket.emit('keyPress',{inputId:'right_click', state:false})
                }, 1/2)
                */
                break;
            default:
                console.log("else")
        }
    }

    //DEBUG
    let mouseX = 0;
    let mouseY = 0;
    //DEBUG

    document.onmousemove = function(event){

        let rect2 = ctx.getBoundingClientRect();
       
        mouseX = event.clientX - rect2.left;
        mouseY = event.clientY - rect2.top;

        let x = -ctx.width/2 + mouseX - 8
        let y = -ctx.height/2 + mouseY - 8
        let angle = Math.atan2(y, x) / Math.PI * 180
        //console.log(event.clientX, event.clientY)
        let rect = document.getElementById("ctx")
        socket.emit('keyPress',{inputId:'mouseAngle', state:angle})
        socket.emit('keyPress',{inputId:'clientX', state:(event.clientX - ctx.width / 2)})
        socket.emit('keyPress',{inputId:'clientY', state:(event.clientY - ctx.height / 2)})

    }

    document.oncontextmenu = function(event){
        event.preventDefault()
    }
    // Key-press Detection -----------------------------------------------------