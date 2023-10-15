/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-13 01:09:16
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-18 23:46:45
 */
let particles = {
  length: 500,
  duration: 2,
  // velocity: 100,
  effect: -0.75,
  // size: 30,
};


class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Point(this.x, this.y);
  }

  length(length) {
    if (typeof length === 'undefined') {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  }

  normalize() {
    let length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  }
}


class Particle {
  constructor() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  initialize(x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * particles.effect;
    this.acceleration.y = dy * particles.effect;
    this.age = 0;
  }
  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  }
  draw(context, image) {
    function ease(t) {
      return (--t) * t * t + 1;
    }
    let size = image.width * ease(this.age / particles.duration);
    context.globalAlpha = 1 - this.age / particles.duration;
    context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
  }
}




class ParticlePool {
  constructor(length) {
    this.firstActive = 0;
    this.firstFree = 0;
    this.duration = particles.duration;
    this.particles = new Array(length);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i] = new Particle();

    }
  }

  add(x, y, dx, dy) {
    this.particles[this.firstFree].initialize(x, y, dx, dy);

    this.firstFree++;
    if (this.firstFree == this.particles.length) {
      this.firstFree = 0;
    }
    if (this.firstActive == this.firstFree) {
      this.firstActive++;
    }
    if (this.firstActive == this.particles.length) {
      this.firstActive = 0;
    }
  }
  update(deltaTime) {
    let i;

    if (this.firstActive < this.firstFree) {
      for (i = this.firstActive; i < this.firstFree; i++) {
        this.particles[i].update(deltaTime);
      }
    }
    if (this.firstFree < this.firstActive) {
      for (i = this.firstActive; i < this.particles.length; i++) {
        this.particles[i].update(deltaTime);
      }
      for (i = 0; i < this.firstFree; i++) {
        this.particles[i].update(deltaTime);
      }
    }

    while (this.particles[this.firstActive].age >= this.duration && this.firstActive != this.firstFree) {
      this.firstActive++;
      if (this.firstActive == this.particles.length) {
        this.firstActive = 0;
      }
    }


  }
  draw(context, image) {
    let i;

    if (this.firstActive < this.firstFree) {
      for (i = this.firstActive; i < this.firstFree; i++) {
        this.particles[i].draw(context, image);
      }
    }
    if (this.firstFree < this.firstActive) {
      for (i = this.firstActive; i < this.particles.length; i++) {
        this.particles[i].draw(context, image);
      }
      for (i = 0; i < this.firstFree; i++) {
        this.particles[i].draw(context, image);
      }
    }
  }
}



export {
  Point,
  Particle,
  ParticlePool
};
