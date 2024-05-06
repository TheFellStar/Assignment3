class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.textureNum = 0;
    }

    render(){
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba [0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of cube
        drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]); //correct
        drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]); //correct

        //back of cube
        drawTriangle3DUV([0,0,1,  1,1,1,  1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //top of cube
        drawTriangle3DUV( [0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]); //correct
        drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);

        //bottom of cube
        drawTriangle3D( [0,0,0,  0,0,1,  1,0,1]);
        drawTriangle3D([0,0,0,  1,0,1,  1,0,0]);

        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        //left side of cube
        drawTriangle3DUV( [0,1,0,  0,1,1,  0,0,0], [1,1, 1,0, 0,0]);
        drawTriangle3DUV([0,0,0,  0,1,1,  0,0,1], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        //right side of cube
        drawTriangle3DUV( [1,1,0,  1,1,1,  1,0,0], [1,0, 1,1, 0,0]);
        drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [0,0, 1,1, 0,1]);
    }
    renderfast(){
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts=[];
        //front
        allverts=allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts=allverts.concat([0,0,0, 0,1,0, 1,1,0]);

        //top
        allverts=allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        allverts=allverts.concat([0,1,0, 1,1,1, 1,1,0]);

        //right
        allverts=allverts.concat([1,1,0, 1,1,1, 1,0,0]);
        allverts=allverts.concat([1,0,0, 1,1,1, 1,0,1]);

        //left
        allverts=allverts.concat([0,1,0, 0,1,1, 0,0,0]);
        allverts=allverts.concat([0,0,0, 0,1,1, 0,0,1]);

        //bottom
        allverts=allverts.concat([0,0,0, 0,0,1, 1,0,1]);
        allverts=allverts.concat([0,0,0, 1,0,1, 1,0,0]);

        //back
        allverts=allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        allverts=allverts.concat([0,0,1, 0,1,1, 1,1,1]);
        drawTriangle3D(allverts);
    }
}