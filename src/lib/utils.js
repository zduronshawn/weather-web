
export function floorMod(a, n) {
  var f = a - n * Math.floor(a / n);
  // HACK: when a is extremely close to an n transition, f can be equal to n. This is bad because f must be
  //       within range [0, n). Check for this corner case. Example: a:=-1e-16, n:=10. What is the proper fix?
  return f === n ? 0 : f;
}

export function removeChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
export function isValue(x) {
  return x !== null && x !== undefined;
}

export function clamp(x, low, high) {
  return Math.max(low, Math.min(x, high));
}

export function distance(a, b) {
  var Δx = b[0] - a[0];
  var Δy = b[1] - a[1];
  return Math.sqrt(Δx * Δx + Δy * Δy);
}