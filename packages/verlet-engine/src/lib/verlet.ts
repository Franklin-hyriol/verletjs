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
import { DistanceConstraint, PinConstraint, AngleConstraint } from './constraint';

// Polyfill for requestAnimationFrame
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback: FrameRequestCallback): number {
        return window.setTimeout(() => callback(performance.now()), 1000 / 60);
    };
}

export class Particle {
	pos: Vec2;
	lastPos: Vec2;

	constructor(pos: Vec2) {
		this.pos = new Vec2().mutableSet(pos);
		this.lastPos = new Vec2().mutableSet(pos);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI);
		ctx.fillStyle = "#2dad8f";
		ctx.fill();
	}
}

export class Composite {
	particles: Particle[] = [];
	constraints: (DistanceConstraint | PinConstraint | AngleConstraint)[] = [];

	drawParticles?: (ctx: CanvasRenderingContext2D, composite: this) => void;
	drawConstraints?: (ctx: CanvasRenderingContext2D, composite: this) => void;

	pin(index: number, pos?: Vec2): PinConstraint {
		pos = pos || this.particles[index].pos;
		// We need to import PinConstraint dynamically or pass it in to avoid circular dependencies
		// For now, this will be handled by the main VerletJS class logic
        // This is a placeholder and will be properly typed later.
		const pc = new PinConstraint(this.particles[index], pos);
		this.constraints.push(pc);
		return pc;
	}
}

export class VerletJS {
	width: number;
	height: number;
	canvas?: HTMLCanvasElement;
	ctx?: CanvasRenderingContext2D;
	mouse = new Vec2(0, 0);
	mouseDown = false;
	draggedEntity: Particle | PinConstraint | null = null;
	selectionRadius = 20;
	highlightColor = "#4f545c";

	gravity = new Vec2(0, 0.2);
	friction = 0.99;
	groundFriction = 0.8;

	composites: Composite[] = [];

	constructor(width: number, height: number, canvas?: HTMLCanvasElement) {
		this.width = width;
		this.height = height;
		if (canvas) {
			this.canvas = canvas;
			this.ctx = canvas.getContext("2d")!;
			this.initDraggable();
		}
	}

	bounds = (particle: Particle) => {
		if (particle.pos.y > this.height - 1)
			particle.pos.y = this.height - 1;

		if (particle.pos.x < 0)
			particle.pos.x = 0;

		if (particle.pos.x > this.width - 1)
			particle.pos.x = this.width - 1;
	}

	initDraggable() {
		if (!this.canvas) return;
		// prevent context menu
		this.canvas.oncontextmenu = (e) => {
			e.preventDefault();
		};

		this.canvas.onmousedown = (e) => {
			this.mouseDown = true;
			const nearest = this.nearestEntity();
			if (nearest) {
				this.draggedEntity = nearest;
			}
		};

		this.canvas.onmouseup = (e) => {
			this.mouseDown = false;
			this.draggedEntity = null;
		};

		this.canvas.onmousemove = (e) => {
			if (!this.canvas) return;
			const rect = this.canvas.getBoundingClientRect();
			this.mouse.x = e.clientX - rect.left;
			this.mouse.y = e.clientY - rect.top;
		};
	}

	frame(step: number) {
		for (const c of this.composites) {
			for (const p of c.particles) {
				// calculate velocity
				const velocity = p.pos.sub(p.lastPos).scale(this.friction);

				// ground friction
				if (p.pos.y >= this.height - 1 && velocity.length2() > 0.000001) {
					const m = velocity.length();
					velocity.x /= m;
					velocity.y /= m;
					velocity.mutableScale(m * this.groundFriction);
				}

				// save last good state
				p.lastPos.mutableSet(p.pos);

				// gravity
				p.pos.mutableAdd(this.gravity);

				// inertia
				p.pos.mutableAdd(velocity);
			}
		}

		// handle dragging of entities
		if (this.draggedEntity) {
			this.draggedEntity.pos.mutableSet(this.mouse);
        }

		// relax
		const stepCoef = 1 / step;
		for (const c of this.composites) {
			for (let i = 0; i < step; ++i) {
				for (const constraint of c.constraints) {
					constraint.relax(stepCoef);
                }
            }
		}

		// bounds checking
		for (const c of this.composites) {
			for (const p of c.particles) {
				this.bounds(p);
            }
		}
	}

	draw() {
		if (!this.ctx || !this.canvas) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (const c of this.composites) {
			// draw constraints
			if (c.drawConstraints) {
				c.drawConstraints(this.ctx, c);
			} else {
				for (const constraint of c.constraints) {
					constraint.draw(this.ctx);
                }
			}

			// draw particles
			if (c.drawParticles) {
				c.drawParticles(this.ctx, c);
			} else {
				for (const p of c.particles) {
					p.draw(this.ctx);
                }
			}
		}

		// highlight nearest / dragged entity
		const nearest = this.draggedEntity || this.nearestEntity();
		if (nearest) {
			this.ctx.beginPath();
			this.ctx.arc(nearest.pos.x, nearest.pos.y, 8, 0, 2 * Math.PI);
			this.ctx.strokeStyle = this.highlightColor;
			this.ctx.stroke();
		}
	}

	nearestEntity(): Particle | PinConstraint | null {
		let d2Nearest = 0;
		let entity: Particle | null = null;
		let constraintsNearest: (DistanceConstraint | PinConstraint | AngleConstraint)[] | null = null;

		// find nearest point
		for (const c of this.composites) {
			for (const p of c.particles) {
				const d2 = p.pos.dist2(this.mouse);
				if (d2 <= this.selectionRadius * this.selectionRadius && (entity == null || d2 < d2Nearest)) {
					entity = p;
					constraintsNearest = c.constraints;
					d2Nearest = d2;
				}
			}
		}

		// search for pinned constraints for this entity
        if (constraintsNearest) {
		    for (const constraint of constraintsNearest) {
			    if (constraint instanceof PinConstraint && constraint.a === entity) {
				    return constraint as PinConstraint;
                }
            }
        }

		return entity;
	}
}