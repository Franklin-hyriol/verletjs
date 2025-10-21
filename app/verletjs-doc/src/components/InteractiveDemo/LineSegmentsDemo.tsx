import React from "react";
import { VerletCanvas, LineSegments, Point } from "verlet-react";
import { Vec2 } from "verlet-engine";

const lineSegments = [];
const numSegments = 5;
const startX = 250;
const endX = 550;
const yPos = 50;

for (let i = 0; i < numSegments; i++) {
  const t = i / (numSegments - 1);
  const x = startX + (endX - startX) * t;
  lineSegments.push(new Vec2(x, yPos));
}

const LineSegmentsDemo = () => {
  return (
    <VerletCanvas width={800} height={400}>
      <LineSegments vertices={lineSegments} stiffness={1} pins={[0]} />
    </VerletCanvas>
  );
};

export default LineSegmentsDemo;
