
//main();

const vertexSource = `
precision mediump float;
attribute vec4 aVertexPosition;

void main() {
	gl_Position = aVertexPosition;
}
`;

const fragSource = `
precision mediump float;
uniform vec3 colour;

void main() {
	gl_FragColor = vec4(colour.xyz, 1.0);
}
`;

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

function main() {
	const canvas = document.querySelector("#glCanvas");
	const gl = canvas.getContext("webgl");

	if (gl === null) {
		alert("Error initialising webGL");
		return;
	}

	const shaderProgram = initShaderProg(gl, vertexSource, fragSource);

	gl.useProgram(shaderProgram);

	const vertexPos = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	const timePos   = gl.getUniformLocation(shaderProgram, "colour");

	const posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
	const positions = [
		 1.0,  1.0,
		-1.0,  1.0,
		 1.0, -1.0,
		-1.0, -1.0,
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.vertexAttribPointer(
		    vertexPos,
		    numComponents,
		    type,
		    normalize,
		    stride,
		    offset);
		gl.enableVertexAttribArray(vertexPos);

	}

	{
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(shaderProgram);
		gl.uniform3f(timePos, false, 1.0, (Math.sin(Date.now()) + 1) / 2, 1.0);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}

window.onload = main;
