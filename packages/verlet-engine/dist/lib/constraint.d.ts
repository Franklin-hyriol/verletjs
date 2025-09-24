import { Particle } from './verlet';
import { Vec2 } from './vec2';
export declare class DistanceConstraint {
    a: Particle;
    b: Particle;
    distance: number;
    stiffness: number;
    constructor(a: Particle, b: Particle, stiffness: number, distance?: number);
    relax(stepCoef: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class PinConstraint {
    a: Particle;
    pos: Vec2;
    constructor(a: Particle, pos: Vec2);
    relax(stepCoef: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class AngleConstraint {
    a: Particle;
    b: Particle;
    c: Particle;
    angle: number;
    stiffness: number;
    constructor(a: Particle, b: Particle, c: Particle, stiffness: number);
    relax(stepCoef: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
