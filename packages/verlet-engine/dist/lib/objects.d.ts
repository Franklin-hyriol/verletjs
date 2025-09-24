import { Vec2 } from './vec2';
declare module './verlet' {
    interface VerletJS {
        point(pos: Vec2): Composite;
        lineSegments(vertices: Vec2[], stiffness: number): Composite;
        cloth(origin: Vec2, width: number, height: number, segments: number, pinMod: number, stiffness: number): Composite;
        tire(origin: Vec2, radius: number, segments: number, spokeStiffness: number, treadStiffness: number): Composite;
    }
}
