class Sprite {
    constructor(animation, x, y, xSpeed, ySpeed) {
        this.x = x;
        this.y = y;
        this.animation = animation;
        this.w = this.animation[0].width;
        this.len = this.animation.length;
        this.index = 0;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
    }

    show() {
        let index = floor(this.index) % this.len;
        image(this.animation[index], this.x, this.y);
    }

    animate() {
        this.index += this.x;
        this.x = this.x*0.3;

        if (this.x > width) {
            this.x = -this.w;
        }
    }


    update() {
        this.x = this.x + this.xSpeed;
        this.y = this.y + this.ySpeed;

    }

   dir(x, y) {
        this.xSpeed = x+0.2;
        this.ySpeed = y+0.25;
    }

}
