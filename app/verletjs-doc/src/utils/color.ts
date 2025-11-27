export const lerp = (a: number, b: number, p: number) => (b - a) * p + a;

export const parseColor = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const lerpColor = (color1: {r:number,g:number,b:number}, color2: {r:number,g:number,b:number}, p: number) => {
  return {
    r: lerp(color1.r, color2.r, p),
    g: lerp(color1.g, color2.g, p),
    b: lerp(color1.b, color2.b, p)
  };
};
