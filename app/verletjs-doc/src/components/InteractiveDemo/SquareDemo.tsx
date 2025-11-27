import React from 'react';
import { VerletCanvas, Point, DistanceConstraint } from 'verlet-react';
import { Vec2 } from 'verlet-engine';

const SquareDemo = () => {
  const x = 350;
  const y = 100;
  const size = 100;

  return (
    <VerletCanvas
      width={800}
      height={400}
      options={{ gravity: new Vec2(0, 0.5) }}
    >
      {/* 1. Define the 4 points of the square with unique IDs */}
      <Point id="a" pos={new Vec2(x, y)} />
      <Point id="b" pos={new Vec2(x + size, y)} />
      <Point id="c" pos={new Vec2(x + size, y + size)} />
      <Point id="d" pos={new Vec2(x, y + size)} />

      {/* 2. Define the 6 constraints to link the points */}
      {/* Edges */}
      <DistanceConstraint from="a" to="b" />
      <DistanceConstraint from="b" to="c" />
      <DistanceConstraint from="c" to="d" />
      <DistanceConstraint from="d" to="a" />
      
      {/* Cross braces for rigidity */}
      <DistanceConstraint from="a" to="c" />
      <DistanceConstraint from="b" to="d" />
    </VerletCanvas>
  );
};

export default SquareDemo;