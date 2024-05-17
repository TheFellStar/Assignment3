class Camera{
    constructor(fov, aspect, near, far){
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,0]);
        this.up=new Vector3([0,1,0]);

        this.viewMatrix = new Matrix4();
        this.updateView();
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(fov, aspect, near, far);
        this.rotationMatrix = new Matrix4().rotate(45,0,1,0);
    }

    moveForward(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(1);
        this.eye.add(f);
        this.at.add(f);
        this.updateView();
        //this.eye.elements[2] -= 0.2;
    }

    moveBackwards(){
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(1);
        this.eye.add(b);
        this.at.add(b);
        this.updateView();
        //this.eye.elements[2] += 0.2;
    }

    moveLeft(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = new Vector3();
        s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(1);
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
        //this.eye.elements[0] -= 0.2;
    }

    moveRight(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = new Vector3();
        s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(1);
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
        //this.eye.elements[0] += 0.2;
    }

    panRight(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        this.rotationMatrix.setRotate(-3, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = this.rotationMatrix.multiplyVector3(f);
        let temp = new Vector3();
        temp.set(this.eye);
        temp.add(f_prime);
        this.at.set(temp);
        this.updateView();
        //this.at.elements[0] += 2;
    }

    panLeft(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        this.rotationMatrix.setRotate(3, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = this.rotationMatrix.multiplyVector3(f);
        let temp = new Vector3();
        temp.set(this.eye);
        temp.add(f_prime);
        this.at.set(temp);
        this.updateView();
        //this.at.elements[0] -= 2;
    }

    updateView(){
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }
}