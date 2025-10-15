/*
Copyright 2013 Sub Protocol and other contributors
http://subprotocol.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import type { Particle } from './verlet';
import { Vec2 } from './vec2';
import type { ConstraintStyle } from './types';


/**
 * Constrains two particles to a specific distance from each other.
 */
export class DistanceConstraint {
	type = 'DistanceConstraint';
	/** The first particle. */
	a: Particle;
	/** The second particle. */
	b: Particle;
	/** The required distance between the two particles. */
	distance: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The second particle.
	 * @param stiffness A value from 0.0 to 1.0, where 1.0 is the most stiff.
	 * @param [distance] Optional. The distance to maintain. If not provided, the initial distance between the particles is used.
	 */
	constructor(a: Particle, b: Particle, stiffness: number, distance?: number) {
		this.a = a;
		this.b = b;
		this.distance = typeof distance !== "undefined" ? distance : a.pos.sub(b.pos).length();
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint, attempting to satisfy it by moving the particles.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		const normal = this.a.pos.sub(this.b.pos);
		const m = normal.length();
		if (m === 0) return;

		const im1 = this.a.mass > 0 ? 1 / this.a.mass : 0;
		const im2 = this.b.mass > 0 ? 1 / this.b.mass : 0;
		const im_total = im1 + im2;

		if (im_total === 0) return;

		const diff = (m - this.distance) / m * this.stiffness * stepCoef;
		const correction = normal.scale(diff);

		this.a.pos.mutableSub(correction.scale(im1 / im_total));
		this.b.pos.mutableAdd(correction.scale(im2 / im_total));
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.strokeStyle = this.style?.color || "#d8dde2";
		ctx.lineWidth = this.style?.lineWidth || 1;
		ctx.stroke();
	}
}

/**
 * Constrains two particles to prevent them from overlapping.
 */
export class CollisionConstraint {
	type = 'CollisionConstraint';
	/** The first particle. */
	a: Particle;
	/** The second particle. */
	b: Particle;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The second particle.
	 * @param stiffness A value from 0.0 to 1.0, where 1.0 is the most stiff.
	 */
	constructor(a: Particle, b: Particle, stiffness: number) {
		this.a = a;
		this.b = b;
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint, attempting to satisfy it by moving the particles.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		const normal = this.a.pos.sub(this.b.pos);
		const m = normal.length();
		const r1 = this.a.style?.radius || 1;
		const r2 = this.b.style?.radius || 1;
		const minDistance = r1 + r2;

		if (m < minDistance) {
			const im1 = this.a.mass > 0 ? 1 / this.a.mass : 0;
			const im2 = this.b.mass > 0 ? 1 / this.b.mass : 0;
			const im_total = im1 + im2;

			if (im_total === 0) return;

			const diff = (minDistance - m) / m;
			const correction = normal.scale(diff * this.stiffness * stepCoef);

			this.a.pos.mutableAdd(correction.scale(im1 / im_total));
			this.b.pos.mutableSub(correction.scale(im2 / im_total));
		}
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		// Collisions are not typically drawn, but you could draw a line for debugging.
		/*
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.strokeStyle = this.style?.color || 'red';
		ctx.lineWidth = this.style?.lineWidth || 1;
		ctx.stroke();
		*/
	}
}

/**
 * Constrains a particle to a fixed point in space.
 */
export class PinConstraint {
	type = 'PinConstraint';
	/** The particle to be pinned. */
	a: Particle;
	/** The fixed point in space where the particle is pinned. */
	pos: Vec2;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The particle to be pinned.
	 * @param pos The position to pin the particle to.
	 */
	constructor(a: Particle, pos: Vec2) {
		this.a = a;
		this.pos = new Vec2().mutableSet(pos);
	}

	/**
	 * Relaxes the constraint by forcing the particle to the pinned position.
	 * @param stepCoef A coefficient for the relaxation step (unused for PinConstraint).
	 */
	relax(stepCoef: number) {
		this.a.pos.mutableSet(this.pos);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.style?.radius || 6, 0, 2 * Math.PI);
		ctx.fillStyle = this.style?.color || "rgba(0,153,255,0.1)";
		ctx.fill();
	}
}

/**
 * Constrains the angle between three particles.
 */
export class AngleConstraint {
	type = 'AngleConstraint';
	/** The first particle of the angle. */
	a: Particle;
	/** The center particle (the vertex of the angle). */
	b: Particle;
	/** The third particle of the angle. */
	c: Particle;
	/** The angle to be maintained (in radians). */
	angle: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The center particle (the vertex of the angle).
	 * @param c The third particle.
	 * @param stiffness A value from 0.0 to 1.0.
	 */
	constructor(a: Particle, b: Particle, c: Particle, stiffness: number) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.angle = this.b.pos.angle2(this.a.pos, this.c.pos);
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint by rotating the particles to satisfy the.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		let angle = this.b.pos.angle2(this.a.pos, this.c.pos);
		let diff = angle - this.angle;

		if (diff <= -Math.PI)
			diff += 2 * Math.PI;
		else if (diff >= Math.PI)
			diff -= 2 * Math.PI;

		diff *= stepCoef * this.stiffness;

		this.a.pos = this.a.pos.rotate(this.b.pos, diff);
		this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
		this.b.pos = this.b.pos.rotate(this.a.pos, diff);
		this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.lineTo(this.c.pos.x, this.c.pos.y);
		const tmp = ctx.lineWidth;
		ctx.lineWidth = this.style?.lineWidth || 5;
		ctx.strokeStyle = this.style?.color || "rgba(255,255,0,0.2)";
		ctx.stroke();
		ctx.lineWidth = tmp;
	}
}

/**
 * Constrains two particles to a specific distance from each other.
 */
export class MinMaxDistanceConstraint {
	type = 'MinMaxDistanceConstraint';
	/** The first particle. */
	a: Particle;
	/** The second particle. */
	b: Particle;
	/** The minimum distance between the two particles. */
	minDistance: number;
	/** The maximum distance between the two particles. */
	maxDistance: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The second particle.
	 * @param stiffness A value from 0.0 to 1.0, where 1.0 is the most stiff.
	 * @param minDistance The minimum distance to maintain.
	 * @param maxDistance The maximum distance to maintain.
	 */
	constructor(a: Particle, b: Particle, minDistance: number, maxDistance: number, stiffness: number) {
		this.a = a;
		this.b = b;
		this.stiffness = stiffness;
		this.minDistance = minDistance;
		this.maxDistance = maxDistance;
	}

	/**
	 * Relaxes the constraint, attempting to satisfy it by moving the particles.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		const normal = this.a.pos.sub(this.b.pos);
		const m = normal.length();
		let diff = 0;

		if (m < this.minDistance) {
			diff = (this.minDistance - m) / m;
		} else if (m > this.maxDistance) {
			diff = (this.maxDistance - m) / m;
		} else {
			return;
		}

		const im1 = this.a.mass > 0 ? 1 / this.a.mass : 0;
		const im2 = this.b.mass > 0 ? 1 / this.b.mass : 0;
		const im_total = im1 + im2;

		if (im_total === 0) return;

		const correction = normal.scale(diff * this.stiffness * stepCoef);

		this.a.pos.mutableAdd(correction.scale(im1 / im_total));
		this.b.pos.mutableSub(correction.scale(im2 / im_total));
	}
}


/**
 * Constrains the angle between three particles to a specific range.
 */
export class MinMaxAngleConstraint {
	type = 'MinMaxAngleConstraint';
	/** The first particle of the angle. */
	a: Particle;
	/** The center particle (the vertex of the angle). */
	b: Particle;
	/** The third particle of the angle. */
	c: Particle;
	/** The minimum angle to be maintained (in radians). */
	minAngle: number;
	/** The maximum angle to be maintained (in radians). */
	maxAngle: number;
	/** The stiffness of the constraint (a value from 0.0 to 1.0). */
	stiffness: number;
	/** Optional style for rendering */
	style?: ConstraintStyle;

	/**
	 * @param a The first particle.
	 * @param b The center particle (the vertex of the angle).
	 * @param c The third particle.
	 * @param minAngle The minimum angle in radians.
	 * @param maxAngle The maximum angle in radians.
	 * @param stiffness A value from 0.0 to 1.0.
	 */
	constructor(a: Particle, b: Particle, c: Particle, minAngle: number, maxAngle: number, stiffness: number) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.minAngle = minAngle;
		this.maxAngle = maxAngle;
		this.stiffness = stiffness;
	}

	/**
	 * Relaxes the constraint by rotating the particles to satisfy the angle limits.
	 * @param stepCoef A coefficient for the relaxation step.
	 */
	relax(stepCoef: number) {
		let angle = this.b.pos.angle2(this.a.pos, this.c.pos);
		let diff = 0;

		if (angle < this.minAngle) {
			diff = angle - this.minAngle;
		} else if (angle > this.maxAngle) {
			diff = angle - this.maxAngle;
		} else {
			return; // Angle is within the allowed range
		}

		// Normalize the difference
		if (diff <= -Math.PI)
			diff += 2 * Math.PI;
		else if (diff >= Math.PI)
			diff -= 2 * Math.PI;

		diff *= stepCoef * this.stiffness;

		this.a.pos = this.a.pos.rotate(this.b.pos, diff);
		this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
		this.b.pos = this.b.pos.rotate(this.a.pos, diff);
		this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
	}

	/**
	 * Draws the constraint on a 2D canvas context.
	 * @param ctx The canvas context to draw on.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.lineTo(this.c.pos.x, this.c.pos.y);
		const tmp = ctx.lineWidth;
		ctx.lineWidth = this.style?.lineWidth || 5;
		ctx.strokeStyle = this.style?.color || "rgba(255,165,0,0.2)";
		ctx.stroke();
		ctx.lineWidth = tmp;
	}
}

/**
 * A constraint that forces a particle to stay on one side of a plane (a line in 2D).
 */
export class PlaneConstraint {
  type = 'PlaneConstraint';
  /** The particle to be constrained. */
  a: Particle;
  /** A point on the plane. */
  origin: Vec2;
  /** The normal vector of the plane (points to the allowed side). */
  normal: Vec2;
  /** Optional style for rendering */
  style?: ConstraintStyle;

  /**
   * @param a The particle to be constrained.
   * @param origin A point on the plane.
   * @param normal The normal vector of the plane.
   * @param style Optional style for rendering.
   */
  constructor(a: Particle, origin: Vec2, normal: Vec2, style?: ConstraintStyle) {
    this.a = a;
    this.origin = origin;
    this.normal = normal.normal(); // Ensure it's a unit vector
    this.style = style;
  }

  /**
   * Relaxes the constraint by projecting the particle back onto the plane if it has crossed.
   * @param stepCoef A coefficient for the relaxation step.
   */
  relax(stepCoef: number) {
    const radius = this.a.style?.radius || 0;
    const v = this.a.pos.sub(this.origin);
    const dist = v.dot(this.normal);

    if (dist < radius) {
      const correction = this.normal.scale((radius - dist) * stepCoef);
      this.a.pos.mutableAdd(correction);
    }
  }

  /**
   * Draws the constraint on a 2D canvas context for visualization.
   * @param ctx The canvas context to draw on.
   */
  draw(ctx: CanvasRenderingContext2D) {
    // The normal doesn't need to be drawn, but the plane line itself is useful.
    const p1 = this.origin.add(new Vec2(this.normal.y, -this.normal.x).scale(2000));
    const p2 = this.origin.sub(new Vec2(this.normal.y, -this.normal.x).scale(2000));
    
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = this.style?.color || '#c44dff';
    ctx.lineWidth = this.style?.lineWidth || 2;
    ctx.stroke();
  }
}

