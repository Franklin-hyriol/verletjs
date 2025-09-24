import { Vec2 } from './vec2';
import { DistanceConstraint, PinConstraint, AngleConstraint } from './constraint';
export declare class Particle {
    pos: Vec2;
    lastPos: Vec2;
    constructor(pos: Vec2);
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class Composite {
    particles: Particle[];
    constraints: (DistanceConstraint | PinConstraint | AngleConstraint)[];
    drawParticles?: (ctx: CanvasRenderingContext2D, composite: this) => void;
    drawConstraints?: (ctx: CanvasRenderingContext2D, composite: this) => void;
    pin(index: number, pos?: Vec2): PinConstraint;
}
export declare class VerletJS {
    width: number;
    height: number;
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;
    mouse: Vec2;
    mouseDown: boolean;
    draggedEntity: Particle | PinConstraint | null;
    selectionRadius: number;
    highlightColor: string;
    gravity: Vec2;
    friction: number;
    groundFriction: number;
    composites: Composite[];
    constructor(width: number, height: number, canvas?: HTMLCanvasElement);
    bounds: (particle: Particle) => void;
    initDraggable(): void;
    frame(step: number): void;
    draw(): void;
    nearestEntity(): Particle | PinConstraint | null;
}
