function initShaderProg(gl, vsource, fsource) {
    const vshader = loadShader(gl, gl.VERTEX_SHADER, vsource);
    const fshader = loadShader(gl, gl.FRAGMENT_SHADER, fsource);
    if (vshader === null || fshader === null) return null;

    const shaderProg = gl.createProgram();
    gl.attachShader(shaderProg, vshader);
    gl.attachShader(shaderProg, fshader);
    gl.linkProgram(shaderProg);

    if (!gl.getProgramParameter(shaderProg, gl.LINK_STATUS)) {
        alert("Unable to init shader program: " + gl.getProgramInfoLog(shaderProg));
        return null;
    }

    return shaderProg;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Shader compile error: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
class ShaderProg {

    constructor(gl, vertFile, fragFile, postInit) {
        this.vert_source = null;
        this.frag_source = null;
        this.gl = gl;
        this.prog = null;
        this.postInit = postInit;
        this.readShaderFile(vertFile, 'v');
        this.readShaderFile(fragFile, 'f');
    }

    onReadShader(fileString, shader) {
        if (shader == 'v') { // Vertex shader
            this.vert_source = fileString;
        } else if (shader == 'f') { // Fragment shader
            this.frag_source = fileString;
        }

        // When both are available
        if (this.vert_source && this.frag_source) {
            this.shaderInit();
        }
    }

    shaderInit() {
        console.log("shaderInit ran!");
        this.prog = initShaderProg(this.gl, this.vert_source, this.frag_source);
        this.postInit();
    }

    readShaderFile(fileName, shader) {
        var request = new XMLHttpRequest();
        request.shaderprog = this;
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status !== 404) { 
                this.shaderprog.onReadShader(request.responseText, shader); 
            }
        }
        request.open('GET', fileName, true);
        request.send();
    }

    use() {
        gl.useProgram(this.prog);
    }

}
