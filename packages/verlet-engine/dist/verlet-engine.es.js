class r {
  x;
  y;
  constructor(t, s) {
    this.x = t || 0, this.y = s || 0;
  }
  add(t) {
    return new r(this.x + t.x, this.y + t.y);
  }
  sub(t) {
    return new r(this.x - t.x, this.y - t.y);
  }
  mul(t) {
    return new r(this.x * t.x, this.y * t.y);
  }
  div(t) {
    return new r(this.x / t.x, this.y / t.y);
  }
  scale(t) {
    return new r(this.x * t, this.y * t);
  }
  mutableSet(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  mutableAdd(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  mutableSub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  mutableMul(t) {
    return this.x *= t.x, this.y *= t.y, this;
  }
  mutableDiv(t) {
    return this.x /= t.x, this.y /= t.y, this;
  }
  mutableScale(t) {
    return this.x *= t, this.y *= t, this;
  }
  equals(t) {
    return this.x === t.x && this.y === t.y;
  }
  epsilonEquals(t, s) {
    return Math.abs(this.x - t.x) <= s && Math.abs(this.y - t.y) <= s;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  length2() {
    return this.x * this.x + this.y * this.y;
  }
  dist(t) {
    return Math.sqrt(this.dist2(t));
  }
  dist2(t) {
    const s = t.x - this.x, i = t.y - this.y;
    return s * s + i * i;
  }
  normal() {
    const t = Math.sqrt(this.x * this.x + this.y * this.y);
    return new r(this.x / t, this.y / t);
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  angle(t) {
    return Math.atan2(this.x * t.y - this.y * t.x, this.x * t.x + this.y * t.y);
  }
  angle2(t, s) {
    return t.sub(this).angle(s.sub(this));
  }
  rotate(t, s) {
    const i = this.x - t.x, o = this.y - t.y;
    return new r(i * Math.cos(s) - o * Math.sin(s) + t.x, i * Math.sin(s) + o * Math.cos(s) + t.y);
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}
class p {
  a;
  b;
  distance;
  stiffness;
  constructor(t, s, i, o) {
    this.a = t, this.b = s, this.distance = typeof o < "u" ? o : t.pos.sub(s.pos).length(), this.stiffness = i;
  }
  relax(t) {
    const s = this.a.pos.sub(this.b.pos), i = s.length2();
    s.mutableScale((this.distance * this.distance - i) / i * this.stiffness * t), this.a.pos.mutableAdd(s), this.b.pos.mutableSub(s);
  }
  draw(t) {
    t.beginPath(), t.moveTo(this.a.pos.x, this.a.pos.y), t.lineTo(this.b.pos.x, this.b.pos.y), t.strokeStyle = "#d8dde2", t.stroke();
  }
}
class x {
  a;
  pos;
  constructor(t, s) {
    this.a = t, this.pos = new r().mutableSet(s);
  }
  relax(t) {
    this.a.pos.mutableSet(this.pos);
  }
  draw(t) {
    t.beginPath(), t.arc(this.pos.x, this.pos.y, 6, 0, 2 * Math.PI), t.fillStyle = "rgba(0,153,255,0.1)", t.fill();
  }
}
class m {
  a;
  b;
  c;
  angle;
  stiffness;
  constructor(t, s, i, o) {
    this.a = t, this.b = s, this.c = i, this.angle = this.b.pos.angle2(this.a.pos, this.c.pos), this.stiffness = o;
  }
  relax(t) {
    let i = this.b.pos.angle2(this.a.pos, this.c.pos) - this.angle;
    i <= -Math.PI ? i += 2 * Math.PI : i >= Math.PI && (i -= 2 * Math.PI), i *= t * this.stiffness, this.a.pos = this.a.pos.rotate(this.b.pos, i), this.c.pos = this.c.pos.rotate(this.b.pos, -i), this.b.pos = this.b.pos.rotate(this.a.pos, i), this.b.pos = this.b.pos.rotate(this.c.pos, -i);
  }
  draw(t) {
    t.beginPath(), t.moveTo(this.a.pos.x, this.a.pos.y), t.lineTo(this.b.pos.x, this.b.pos.y), t.lineTo(this.c.pos.x, this.c.pos.y);
    const s = t.lineWidth;
    t.lineWidth = 5, t.strokeStyle = "rgba(255,255,0,0.2)", t.stroke(), t.lineWidth = s;
  }
}
typeof window < "u" && !window.requestAnimationFrame && (window.requestAnimationFrame = function(n) {
  return window.setTimeout(() => n(performance.now()), 1e3 / 60);
});
class y {
  pos;
  lastPos;
  constructor(t) {
    this.pos = new r().mutableSet(t), this.lastPos = new r().mutableSet(t);
  }
  draw(t) {
    t.beginPath(), t.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI), t.fillStyle = "#2dad8f", t.fill();
  }
}
class f {
  particles = [];
  constraints = [];
  drawParticles;
  drawConstraints;
  pin(t, s) {
    s = s || this.particles[t].pos;
    const i = new x(this.particles[t], s);
    return this.constraints.push(i), i;
  }
}
class d {
  width;
  height;
  canvas;
  ctx;
  mouse = new r(0, 0);
  mouseDown = !1;
  draggedEntity = null;
  selectionRadius = 20;
  highlightColor = "#4f545c";
  gravity = new r(0, 0.2);
  friction = 0.99;
  groundFriction = 0.8;
  composites = [];
  constructor(t, s, i) {
    this.width = t, this.height = s, i && (this.canvas = i, this.ctx = i.getContext("2d"), this.initDraggable());
  }
  bounds = (t) => {
    t.pos.y > this.height - 1 && (t.pos.y = this.height - 1), t.pos.x < 0 && (t.pos.x = 0), t.pos.x > this.width - 1 && (t.pos.x = this.width - 1);
  };
  initDraggable() {
    this.canvas && (this.canvas.oncontextmenu = (t) => {
      t.preventDefault();
    }, this.canvas.onmousedown = (t) => {
      this.mouseDown = !0;
      const s = this.nearestEntity();
      s && (this.draggedEntity = s);
    }, this.canvas.onmouseup = (t) => {
      this.mouseDown = !1, this.draggedEntity = null;
    }, this.canvas.onmousemove = (t) => {
      if (!this.canvas) return;
      const s = this.canvas.getBoundingClientRect();
      this.mouse.x = t.clientX - s.left, this.mouse.y = t.clientY - s.top;
    });
  }
  frame(t) {
    for (const i of this.composites)
      for (const o of i.particles) {
        const h = o.pos.sub(o.lastPos).scale(this.friction);
        if (o.pos.y >= this.height - 1 && h.length2() > 1e-6) {
          const e = h.length();
          h.x /= e, h.y /= e, h.mutableScale(e * this.groundFriction);
        }
        o.lastPos.mutableSet(o.pos), o.pos.mutableAdd(this.gravity), o.pos.mutableAdd(h);
      }
    this.draggedEntity && this.draggedEntity.pos.mutableSet(this.mouse);
    const s = 1 / t;
    for (const i of this.composites)
      for (let o = 0; o < t; ++o)
        for (const h of i.constraints)
          h.relax(s);
    for (const i of this.composites)
      for (const o of i.particles)
        this.bounds(o);
  }
  draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const s of this.composites) {
      if (s.drawConstraints)
        s.drawConstraints(this.ctx, s);
      else
        for (const i of s.constraints)
          i.draw(this.ctx);
      if (s.drawParticles)
        s.drawParticles(this.ctx, s);
      else
        for (const i of s.particles)
          i.draw(this.ctx);
    }
    const t = this.draggedEntity || this.nearestEntity();
    t && (this.ctx.beginPath(), this.ctx.arc(t.pos.x, t.pos.y, 8, 0, 2 * Math.PI), this.ctx.strokeStyle = this.highlightColor, this.ctx.stroke());
  }
  nearestEntity() {
    let t = 0, s = null, i = null;
    for (const o of this.composites)
      for (const h of o.particles) {
        const e = h.pos.dist2(this.mouse);
        e <= this.selectionRadius * this.selectionRadius && (s == null || e < t) && (s = h, i = o.constraints, t = e);
      }
    if (i) {
      for (const o of i)
        if (o instanceof x && o.a === s)
          return o;
    }
    return s;
  }
}
d.prototype.point = function(n) {
  const t = new f();
  return t.particles.push(new y(n)), this.composites.push(t), t;
};
d.prototype.lineSegments = function(n, t) {
  const s = new f();
  for (let i = 0; i < n.length; i++)
    s.particles.push(new y(n[i])), i > 0 && s.constraints.push(new p(s.particles[i], s.particles[i - 1], t));
  return this.composites.push(s), s;
};
d.prototype.cloth = function(n, t, s, i, o, h) {
  const e = new f(), u = t / i, c = s / i;
  for (let a = 0; a < i; ++a)
    for (let l = 0; l < i; ++l) {
      const w = n.x + l * u - t / 2 + u / 2, b = n.y + a * c - s / 2 + c / 2;
      e.particles.push(new y(new r(w, b))), l > 0 && e.constraints.push(new p(e.particles[a * i + l], e.particles[a * i + l - 1], h)), a > 0 && e.constraints.push(new p(e.particles[a * i + l], e.particles[(a - 1) * i + l], h));
    }
  for (let a = 0; a < i; ++a)
    a % o === 0 && e.pin(a);
  return this.composites.push(e), e;
};
d.prototype.tire = function(n, t, s, i, o) {
  const h = 2 * Math.PI / s, e = new f();
  for (let c = 0; c < s; ++c) {
    const a = c * h;
    e.particles.push(new y(new r(n.x + Math.cos(a) * t, n.y + Math.sin(a) * t)));
  }
  const u = new y(n);
  e.particles.push(u);
  for (let c = 0; c < s; ++c)
    e.constraints.push(new p(e.particles[c], e.particles[(c + 1) % s], o)), e.constraints.push(new p(e.particles[c], u, i)), e.constraints.push(new p(e.particles[c], e.particles[(c + 5) % s], o));
  return this.composites.push(e), e;
};
export {
  m as AngleConstraint,
  f as Composite,
  p as DistanceConstraint,
  y as Particle,
  x as PinConstraint,
  r as Vec2,
  d as VerletJS
};
