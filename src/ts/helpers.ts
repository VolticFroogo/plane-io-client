export function lerp(a: number, b: number, t: number) {
    return a*(1-t) + b*t;
}

// Angle interpolation was hurting my head, but I found this gem on GitHub Gist.
// Source: https://gist.github.com/shaunlebron/8832585

function shortAngleDist(a: number, b: number): number {
    var max = Math.PI*2;
    var da = (a - b) % max;
    return 2*da % max - da;
}

export function angleLerp(a: number, b: number, t: number): number {
    return a + shortAngleDist(a,b)*t;
}