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

import { Vec2 } from './vec2';
import { DistanceConstraint, PinConstraint, AngleConstraint, CollisionConstraint, MinMaxDistanceConstraint, PlaneConstraint } from './constraint';
import type { ParticleStyle } from './types';


/**
 * Represents a simple particle in the physics simulation.
 */
export class Particle {
	/** Current position of the particle. @type {Vec2} */
	pos: Vec2;
	/** Position of the particle in the previous frame, used to calculate velocity. @type {Vec2} */
	lastPos: Vec2;
	/** Acceleration of the particle. @type {Vec2} */
	acc: Vec2;
	/** Mass of the particle. @type {number} */
	mass: number;
  /** Optional style for rendering */
  style?: ParticleStyle;

	constructor(pos: Vec2, mass = 1) {
		this.pos = new Vec2().mutableSet(pos);
		this.lastPos = new Vec2().mutableSet(pos);
		this.acc = new Vec2(0, 0);
		this.mass = mass;
	}
}

/**
 * A collection of particles and constraints that form a single entity.
 */
export class Composite {
	particles: Particle[] = [];
	constraints: (DistanceConstraint | PinConstraint | AngleConstraint | CollisionConstraint | MinMaxDistanceConstraint | PlaneConstraint)[] = [];

	/**
	 * Pins a particle in the composite to a specific location.
	 * @param {number} index The index of the particle to pin.
	 * @param {Vec2} [pos] Optional. The position to pin the particle to. If not provided, the particle's current position is used.
	 * @returns {PinConstraint} The created PinConstraint.
	 */
	pin(index: number, pos?: Vec2): PinConstraint {
		pos = pos || this.particles[index].pos;
		const pc = new PinConstraint(this.particles[index], pos);
		this.constraints.push(pc);
		return pc;
	}
}

/**
 * The main class for the headless physics simulation.
 * It manages the simulation state and advances the physics engine.
 */
export class VerletJS {
	/** The width of the simulation world. */
	width: number;
	/** The height of the simulation world. */
	height: number;

	/** Global gravity vector applied to all particles. */
	gravity: Vec2;
	/** Friction factor to apply to particle velocities. A value of 1 means no friction. */
	friction: number;
	/** Friction factor applied when a particle is on the ground. */
	groundFriction: number;
	/** Number of iterations for the constraint solver per frame. */
	solverIterations: number;
	/** Coefficient of restitution (bounciness) for collisions with boundaries. */
	restitution: number;

	/** A list of all composite entities in the simulation. */
	composites: Composite[] = [];

	/**
	 * Creates a new physics simulation world.
	 * @param {number} width The width of the simulation world.
	 * @param {number} height The height of the simulation world.
	 * @param {object} [options] Optional configuration options.
	 * @param {Vec2} [options.gravity=new Vec2(0, 0.2)] Global gravity vector.
	 * @param {number} [options.friction=0.99] Friction factor.
	 * @param {number} [options.groundFriction=0.8] Ground friction factor.
	 * @param {number} [options.solverIterations=8] Number of iterations for the constraint solver.
	 * @param {number} [options.restitution=0.2] Coefficient of restitution for boundary collisions.
	 */
	constructor(
		width: number,
		height: number,
		options?: {
			gravity?: Vec2;
			friction?: number;
			groundFriction?: number;
			solverIterations?: number;
			restitution?: number;
		}
	) {
		this.width = width;
		this.height = height;
		this.gravity = options?.gravity || new Vec2(0, 0.2);
		this.friction = options?.friction || 0.99;
		this.groundFriction = options?.groundFriction || 0.8;
		this.solverIterations = options?.solverIterations || 8;
		this.restitution = options?.restitution || 0.2;
	}

	/**
	 * A function that enforces the simulation boundaries on a particle.
	 * @param {Particle} particle The particle to constrain.
	 */
	bounds = (particle: Particle) => {
		if (particle.pos.y > this.height - 1) {
			particle.pos.y = this.height - 1;
			particle.lastPos.y = particle.pos.y + (particle.pos.y - particle.lastPos.y) * this.restitution;
		}

		if (particle.pos.x < 0) {
			particle.pos.x = 0;
			particle.lastPos.x = particle.pos.x + (particle.pos.x - particle.lastPos.x) * this.restitution;
		}

		if (particle.pos.x > this.width - 1) {
			particle.pos.x = this.width - 1;
			particle.lastPos.x = particle.pos.x + (particle.pos.x - particle.lastPos.x) * this.restitution;
		}
	}

	/**
	 * Advances the simulation by one time step.
	 * @param {number} deltaTime The time elapsed since the last frame, in seconds.
	 */
	frame(deltaTime: number) {
		for (const c of this.composites) {
			for (const p of c.particles) {
				// 1. Accumulate forces
				if (p.mass > 0) {
					p.acc.mutableSet(this.gravity);
				}

				const velocity = p.pos.sub(p.lastPos).scale(this.friction);

				if (p.pos.y >= this.height - 1 && velocity.length2() > 0.000001) {
					const m = velocity.length();
					velocity.x /= m;
					velocity.y /= m;
					velocity.mutableScale(m * this.groundFriction);
				}

				p.lastPos.mutableSet(p.pos);

				// 2. Integration
				p.pos.mutableAdd(p.acc); // Use accumulator
				p.pos.mutableAdd(velocity);

				// 3. Reset accumulator
				p.acc.mutableSet(new Vec2(0, 0));
			}
		}

		const stepCoef = 1 / this.solverIterations;
		for (const c of this.composites) {
			for (let i = 0; i < this.solverIterations; ++i) {
				for (const constraint of c.constraints) {
					constraint.relax(stepCoef);
                }
            }
		}

		for (const c of this.composites) {
			for (const p of c.particles) {
				this.bounds(p);
            }
		}
	}
}