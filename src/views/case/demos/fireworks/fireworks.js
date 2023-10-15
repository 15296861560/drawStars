/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-12-31 10:44:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-01-09 23:35:45
 */

// 随机min和max之间的值
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// 计算两点之间的距离
function distans(sx, sy, tx, ty) {
  let xdistan = sx - tx;
  let ydistan = sy - ty;
  return Math.sqrt(Math.pow(xdistan, 2) + Math.pow(ydistan, 2));
}

// 绽放烟花
function bloom(ctx, particles) {
  let j = particles.length;

  while (j--) {
    particles[j].draw(ctx);
    particles[j].update(j, particles);
  }
}



// 烟花对象
class Firework {
  constructor(sx, sy, tx, ty, hue) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.hue = hue;
    // 计算两点之间的距离
    this.targetDistances = distans(sx, sy, tx, ty);
    // 运行距离
    this.distancesc = 0;
    // 定义变量生成的运动轨迹
    this.guiji = [];
    this.guijicount = 3;
    while (this.guijicount--) {
      this.guiji.push([this.x, this.y]);
    }
    // 计算角度
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.jiasudu = 1.05;
    this.brightness = random(50, 70); // 烟花的明度
    this.targetRad = 5; // 烟花小圈的半径
  }

  // 更新烟花的位置
  update(index, fireworks, particles) {
    this.guiji.pop();
    this.guiji.push([this.x, this.y]);
    // 目标圆运动
    if (this.targetRad < 8) {
      this.targetRad += 0.3;
    } else {
      this.targetRad = 1;
    }
    // 根据加速度计算速度并且计算出烟花运行过程中x轴和y轴的速度
    this.speed *= this.jiasudu;
    let vx = Math.cos(this.angle) * this.speed;
    let vy = Math.sin(this.angle) * this.speed;
    // 重新计算两点之间的距离
    this.distancesc = distans(this.sx, this.sy, this.x + vx, this.y + vy);
    // 如果烟花运行距离大于或等于初始位置到目标位置之间的距离，生成新烟花并移除当前烟花，否则更新烟花位置
    if (this.distancesc >= this.targetDistances) {
      // 生成烟花碎屑
      this.createparticals(this.tx, this.ty, particles, this.hue);
      // 销毁烟花小圈
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  }

  // 运行轨迹
  draw(ctx) {
    ctx.beginPath();
    // 轨迹的起点
    ctx.moveTo(this.guiji[this.guiji.length - 1][0], this.guiji[this.guiji.length - 1][1]);
    // 绘制线条到目标点
    ctx.lineTo(this.x, this.y);
    // 画出不同颜色的烟花
    ctx.strokeStyle = 'hsl(' + this.hue + ',100%,' + this.brightness + '%)';
    ctx.stroke(); // 绘制烟花轨迹
    // 画出目标小圆
    ctx.beginPath();
    ctx.arc(this.tx, this.ty, this.targetRad, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 创建碎屑
  createparticals(x, y, particles, hue) {
    // 设定碎屑数目
    let particalcount = 500;
    while (particalcount--) {
      // 随着碎屑数目的减少为0，又重新调用碎屑方法
      particles.push(new Particle(x, y, hue));
    }
  }


}


// 烟花碎屑方法
class Particle {
  constructor(x, y, hue) {
    this.x = x;
    this.y = y;
    this.guiji = [];
    this.guijicount = 10;
    while (this.guijicount--) {
      this.guiji.push([this.x, this.y]);
    }
    // 生成任意方向的碎屑
    this.angle = random(0, 2 * Math.PI);
    this.speed = random(1, 10); // 随机的速度
    this.mocal = 0.95; // 摩擦力
    this.gravity = 0.98; // 重力
    this.hue = random(hue - 20, hue + 20); // 碎屑颜色变化范围
    this.brightness = random(50, 80);
    this.alpha = 1; // 定义碎屑初始不透明
    this.decay = random(0.015, 0.03); // 碎屑消失的时间
  }

  // 更新碎屑
  update(index, particles) {
    this.guiji.pop();
    this.guiji.unshift([this.x, this.y]);
    // 下面是烟花碎屑的运动
    this.speed *= this.mocal;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay; // 不透明度一直随时间变为0；即烟花碎屑消失
    if (this.alpha <= this.decay) {
      particles.splice(index, 1); // 销毁烟花碎屑
    }
  }

  // 烟花碎屑轨迹
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.guiji[this.guiji.length - 1][0], this.guiji[this.guiji.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    // 画出不同颜色的烟花利用HSL
    ctx.strokeStyle = 'hsl(' + this.hue + ',100%,' + this.brightness + '%)';
    ctx.stroke();
  }
}

export {
  random,
  bloom,
  Firework,
  Particle
};