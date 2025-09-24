export declare class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    add(v: Vec2): Vec2;
    sub(v: Vec2): Vec2;
    mul(v: Vec2): Vec2;
    div(v: Vec2): Vec2;
    scale(coef: number): Vec2;
    mutableSet(v: Vec2): this;
    mutableAdd(v: Vec2): this;
    mutableSub(v: Vec2): this;
    mutableMul(v: Vec2): this;
    mutableDiv(v: Vec2): this;
    mutableScale(coef: number): this;
    equals(v: Vec2): boolean;
    epsilonEquals(v: Vec2, epsilon: number): boolean;
    length(): number;
    length2(): number;
    dist(v: Vec2): number;
    dist2(v: Vec2): number;
    normal(): Vec2;
    dot(v: Vec2): number;
    angle(v: Vec2): number;
    angle2(vLeft: Vec2, vRight: Vec2): number;
    rotate(origin: Vec2, theta: number): Vec2;
    toString(): string;
}
