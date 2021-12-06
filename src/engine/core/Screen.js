const planeVerts = [-1, 1, 0, 0, 1, 1, 1, 0, -1, -1, 0, 1, 1, -1, 1, 1];
export class Screen {
    canvas;
    gl;
    textureWidth = 128;
    textureHeight = 128;
    pixelBuffer;
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.textureWidth;
        this.canvas.height = this.textureHeight;
        this.gl = this.canvas.getContext("webgl");
        this.pixelBuffer = new Uint8Array(this.textureWidth * this.textureHeight * 3);
        this.initGL();
        this.updateScreen();
    }
    initGL() {
        let vbuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(planeVerts), this.gl.STATIC_DRAW);
        let vshader = this.gl.createShader(this.gl.VERTEX_SHADER);
        let fshader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(vshader, vs);
        this.gl.shaderSource(fshader, fs);
        this.gl.compileShader(vshader);
        this.gl.compileShader(fshader);
        let sprogram = this.gl.createProgram();
        this.gl.attachShader(sprogram, vshader);
        this.gl.attachShader(sprogram, fshader);
        this.gl.linkProgram(sprogram);
        this.gl.useProgram(sprogram);
        let shaderLocations = {
            vertPos: this.gl.getAttribLocation(sprogram, "aVertexPosition"),
            textPos: this.gl.getAttribLocation(sprogram, "aTextureCoord"),
            sampPos: this.gl.getUniformLocation(sprogram, "uTexture"),
        };
        this.gl.vertexAttribPointer(shaderLocations.vertPos, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.enableVertexAttribArray(shaderLocations.vertPos);
        this.gl.vertexAttribPointer(shaderLocations.textPos, 2, this.gl.FLOAT, false, 16, 8);
        this.gl.enableVertexAttribArray(shaderLocations.textPos);
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(shaderLocations.sampPos, 0);
    }
    updateScreen() {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.textureWidth, this.textureHeight, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.pixelBuffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    clear(r, g, b) {
        for (let i = 0; i < this.pixelBuffer.length; i += 3) {
            this.pixelBuffer[i] = r;
            this.pixelBuffer[i + 1] = g;
            this.pixelBuffer[i + 2] = b;
        }
    }
    setPixel(x, y, r, g, b) {
        if (x >= 0 && x < this.textureWidth && y >= 0 && y < this.textureHeight) {
            let i = (this.textureWidth * y + x) * 3;
            if (i > this.pixelBuffer.length)
                return;
            this.pixelBuffer[i] = r;
            this.pixelBuffer[i + 1] = g;
            this.pixelBuffer[i + 2] = b;
        }
    }
    resize(textureWidth, textureHeight) {
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;
        this.pixelBuffer = new Uint8Array(this.textureWidth * this.textureHeight * 3);

        this.scale = this.scale;
    }
    set scale(value) {
        this.canvas.width = this.textureWidth * value;
        this.canvas.height = this.textureHeight * value;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    get scale() {
        return this.canvas.width / this.textureWidth;
    }
    get maxScale() {
        let canvasRect = this.canvas.getBoundingClientRect();
        let windowsWidth = window.innerWidth - canvasRect.left;
        let windowsHeight = window.innerHeight - canvasRect.top;
        let screenWidth = this.textureWidth;
        let screenHeight = this.textureHeight;
        let scaleWidth = Math.floor((windowsWidth / screenWidth));
        let scaleHeight = Math.floor((windowsHeight / screenHeight));
        return Math.min(scaleWidth, scaleHeight);
    }
}
const vs = `attribute vec2 aVertexPosition;attribute vec2 aTextureCoord;varying vec2 vTextureCoord;void main() {gl_Position = vec4(aVertexPosition, 0, 1);vTextureCoord = aTextureCoord;}`;
const fs = `precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uTexture;void main() {gl_FragColor = texture2D(uTexture, vTextureCoord);}`;