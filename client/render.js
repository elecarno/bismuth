
const quadCoords = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
];
const quadTexCoords = [
    1.0, 0.0,
    0.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];

const tileSize = 16;
const tileScale = 6.25/2;
const sheetWidth = 10;

const tileHeights = {
    1: 0, 2: 0, 3: 14, 4: 0, 5: 0, 6: 0, 7: 6, 8: 15, 9: 0, 10: 0, 
    11: 8, 12: 0, 13: 0, 14: 12, 15: 0, 16: 0, 17: 14, 18: 13, 19: 0,
    20: 16, 21: 0, 22:7, 23: 7, 24: 0, 25:10, 26:11, 27: 16, 28: 8, 29:6,
    30: 5, 31: 7, 31:7, 32:7, 33:16, 34:13
};

const tileBehind = {
    1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 24, 8: 0, 9: 0, 10: 0,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 9, 16: 12, 17: 0, 18: 0, 19: 1,
    20: 1, 21:1, 22: 9, 23: 24, 24: 0, 25: 24, 26: 24, 27: 24, 28: 24, 29:24,
    30: 24, 31: 24, 32: 24, 33:24, 34:0
}

let using_texture = false;

function loadTexture(gl, url, texunit, callback) {
    while (using_texture) { console.log("texture contention!"); }
    using_texture = true;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + texunit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const pixel = new Uint8Array([255, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    setTexParams(gl);
    using_texture = false;

    const image = new Image();
    image.onload = function() {
        while (using_texture) { console.log("texture contention!"); }
        using_texture = true;
        gl.activeTexture(gl.TEXTURE0 + texunit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        setTexParams(gl);
        using_texture = false;
        callback(image);
    };
    image.src = url;
    texture.imageObject = image;
    return texture;
}

function setTexParams() {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

class Renderer {
    constructor(gl) {
        this.gl = gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        //what
        let test_this = this;

        this.tileShader = new ShaderProg(gl, "client/shaders/tilevert.glsl", "client/shaders/tilefrag.glsl",
            function() { /*oh*/ test_this.postTileShaderInit() });

        this.quadShader = new ShaderProg(gl, "client/shaders/quadvert.glsl", "client/shaders/quadfrag.glsl",
            function() { test_this.postQuadShaderInit() });

        this.rectShader = new ShaderProg(gl, "client/shaders/rectvert.glsl", "client/shaders/rectfrag.glsl",
            function() { test_this.postRectShaderInit() });
    }

    postTileShaderInit() {
        this.tileShader.use();
        const vertexPos   = gl.getAttribLocation(this.tileShader.prog, "position");
        const texCoordPos = gl.getAttribLocation(this.tileShader.prog, "texture");

        const posBuffer = gl.createBuffer();
        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTexCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPos);

        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.vertexAttribPointer(texCoordPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordPos);

        const tilemap = loadTexture(gl, "/client/img/tilemap.png", 0, function(image) {});
        const tilesidemap = loadTexture(gl, "/client/img/tilesidemap.png", 3, function(image) {});

        gl.uniform2f(gl.getUniformLocation(this.tileShader.prog, "inverseSpriteTextureSize"), 1.0/(tileSize * sheetWidth), 1.0/(tileSize * sheetWidth));
        gl.uniform1f(gl.getUniformLocation(this.tileShader.prog, "tileSize"), tileSize);
        gl.uniform1f(gl.getUniformLocation(this.tileShader.prog, "inverseTileSize"), 1.0/tileSize);

        gl.uniform1i(gl.getUniformLocation(this.tileShader.prog, "tiles"), 1);

        this.lx = 0;
        this.ly = 0;
        this.mapwidth = 0;
        this.mapheight = 0;
        
        this.map = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.map);
        console.log("postInit ran!");
    }

    postQuadShaderInit() {
        this.quadShader.use();
        let test_this = this; //weird fucking hacky shit
        const sheet = loadTexture(gl, "/client/img/spritesheet.png", 2, function(image) { test_this.sheetWidth = image.width; test_this.sheetHeight = image.height; });
        this.sheet = sheet;
        gl.uniform1i(gl.getUniformLocation(this.quadShader.prog, "sheet"), 2);
    }

    postRectShaderInit() {
        //this.rectShader.use();
    }

    makeTexture(chunks) {
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.map);
        let hx = -Number.MAX_VALUE;
        let hy = -Number.MAX_VALUE;
        let lx =  Number.MAX_VALUE;
        let ly =  Number.MAX_VALUE;
        for (const chunk of chunks) {
            if (chunk.x <= lx) {
                lx = chunk.x;
            }
            if (chunk.y <= ly) {
                ly = chunk.y;
            }
            if (chunk.x >= hx) {
                hx = chunk.x;
            }
            if (chunk.y >= hy) {
                hy = chunk.y;
            }
        }

        const width  = (hx - lx + 1) * 32;
        const height = (hy - ly + 1) * 32;

        const data = new Array(width * height * 4).fill(0); //TODO maybe not the most efficient
        for (const chunk of chunks) {
            let tileidx = 0;
            for (const val of chunk.tiles) {
                const tilex = tileidx % chunk.width;
                const tiley = Math.floor(tileidx / chunk.width);
                const idx = (tiley + (chunk.y - ly) * chunk.height) * width * 4 + (tilex + (chunk.x - lx) * chunk.width) * 4;

                data[idx] = val;
                data[idx + 1] = 0;
                data[idx + 2] = tileHeights[val];
                data[idx + 3] = tileBehind[val];
                tileidx += 1;
            }
        }

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array(data));
        setTexParams(this.gl);

        this.lx = lx;
        this.ly = ly;
        this.mapwidth = width;
        this.mapheight = height;
    }

    tileChange(chunkX, chunkY, tileX, tileY, tileType) {
        const data = new Uint8Array([tileType, 0, tileHeights[tileType], tileBehind[tileType]]);

        const xoff = (chunkX - this.lx) * 32 + tileX;
        const yoff = (chunkY - this.ly) * 32 + tileY;
        
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.map);
        this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, xoff, yoff, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    }

    renderChunk(dx, dy, top) {
        this.tileShader.use();
        if (top) {
            gl.uniform1i(gl.getUniformLocation(this.tileShader.prog, "sprites"), 3);
        } else {
            gl.uniform1i(gl.getUniformLocation(this.tileShader.prog, "sprites"), 0);
        }
        gl.uniform1i(gl.getUniformLocation(this.tileShader.prog, "isTop"), top);

        this.gl.uniform2f(this.gl.getUniformLocation(this.tileShader.prog, "inverseTileTextureSize"), 1.0/this.mapwidth, 1.0/this.mapheight);
        this.gl.uniform2f(this.gl.getUniformLocation(this.tileShader.prog, "viewportSize"), ctx.width / tileScale, ctx.height / tileScale);
        this.gl.uniform2f(this.gl.getUniformLocation(this.tileShader.prog, "viewOffset"), (dx - this.lx * 32 * 50 - ctx.width / 2) / tileScale,  (dy - this.ly * 32 * 50 - ctx.height / 2) / tileScale);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    renderQuad(quad) {
        this.renderQuadAtInvert(quad, quad.screenPosX, quad.screenPosY, false);
    }

    renderQuadAt(quad, x, y) {
        this.renderQuadAtInvert(quad, x, y, false);
    }

    renderQuadAtInvert(quad, x, y, invert) {
        this.quadShader.use();
        this.gl.uniform2f(this.gl.getUniformLocation(this.quadShader.prog, "screenPos"),  x / ctx.width * 2 - 1, -(y / ctx.height * 2 - 1));
        this.gl.uniform2f(this.gl.getUniformLocation(this.quadShader.prog, "screenSize"), quad.screenSizeX / ctx.width,  quad.screenSizeY / ctx.height);
        this.gl.uniform2f(this.gl.getUniformLocation(this.quadShader.prog, "sheetPos"),   quad.sheetPosX   / this.sheetWidth, quad.sheetPosY  / this.sheetHeight);
        this.gl.uniform2f(this.gl.getUniformLocation(this.quadShader.prog, "sheetSize"),  quad.sheetSizeX  / this.sheetWidth, quad.sheetSizeY / this.sheetHeight);
        this.gl.uniform1i(this.gl.getUniformLocation(this.quadShader.prog, "invert"), invert);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    renderRect(r, g, b, a, x, y, w, h) {
        x = x + w/2;
        y = y + h/2;
        this.rectShader.use();
        this.gl.uniform2f(this.gl.getUniformLocation(this.rectShader.prog, "screenPos"),  x / ctx.width * 2 - 1, -(y / ctx.height * 2 - 1));
        this.gl.uniform2f(this.gl.getUniformLocation(this.rectShader.prog, "screenSize"), w / ctx.width,  h / ctx.height);
        this.gl.uniform4f(this.gl.getUniformLocation(this.rectShader.prog, "colour"), r / 255, g / 255, b / 255, a / 255);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}

class Quad {
    constructor(scpX, scpY, scsX, scsY, shpX, shpY, shsX, shsY) {
        this.screenPosX = scpX;
        this.screenPosY = scpY;

        this.screenSizeX = scsX;
        this.screenSizeY = scsY;

        this.sheetPosX = shpX;
        this.sheetPosY = shpY;

        this.sheetSizeX = shsX;
        this.sheetSizeY = shsY;
    }
}
