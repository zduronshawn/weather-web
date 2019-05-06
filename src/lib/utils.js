var τ = 2 * Math.PI;
var H = 0.0000360;  // 0.0000360°φ ~= 4m

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

export function clamp(x, low, high) {
  return Math.max(low, Math.min(x, high));
}

export function proportion(x, low, high) {
  return (clamp(x, low, high) - low) / (high - low);
}

export function distance(a, b) {
  var Δx = b[0] - a[0];
  var Δy = b[1] - a[1];
  return Math.sqrt(Δx * Δx + Δy * Δy);
}

export function isValue(x) {
  return x !== null && x !== undefined;
}

export function clearCanvas(canvas) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

export function colorInterpolator(start, end) {
  var r = start[0], g = start[1], b = start[2];
  var Δr = end[0] - r, Δg = end[1] - g, Δb = end[2] - b;
  return function (i, a) {
    return [Math.floor(r + i * Δr), Math.floor(g + i * Δg), Math.floor(b + i * Δb), a];
  };
}
export function sinebowColor(hue, a) {
  // Map hue [0, 1] to radians [0, 5/6τ]. Don't allow a full rotation because that keeps hue == 0 and
  // hue == 1 from mapping to the same color.
  var rad = hue * τ * 5 / 6;
  rad *= 0.75;  // increase frequency to 2/3 cycle per rad

  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var r = Math.floor(Math.max(0, -c) * 255);
  var g = Math.floor(Math.max(s, 0) * 255);
  var b = Math.floor(Math.max(c, 0, -s) * 255);
  return [r, g, b, a];
}
export function segmentedColorScale(segments) {
  var points = [], interpolators = [], ranges = [];
  for (var i = 0; i < segments.length - 1; i++) {
    points.push(segments[i + 1][0]);
    interpolators.push(colorInterpolator(segments[i][1], segments[i + 1][1]));
    ranges.push([segments[i][0], segments[i + 1][0]]);
  }

  return function (point, alpha) {
    var i;
    for (i = 0; i < points.length - 1; i++) {
      if (point <= points[i]) {
        break;
      }
    }
    var range = ranges[i];
    return interpolators[i](proportion(point, range[0], range[1]), alpha);
  };
}

function asColorStyle(r, g, b, a) {
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

export function windIntensityColorScale(step, maxWind) {
  var result = [];
  for (var j = 85; j <= 255; j += step) {
    result.push(asColorStyle(j, j, j, 1.0));
  }
  result.indexFor = function (m) {  // map wind speed to a style
    return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
  };
  return result;
}

export function distortion(projection, λ, φ, x, y) {
  var hλ = λ < 0 ? H : -H;
  var hφ = φ < 0 ? H : -H;
  var pλ = projection([λ + hλ, φ]);
  var pφ = projection([λ, φ + hφ]);

  // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1° λ
  // changes depending on φ. Without this, there is a pinching effect at the poles.
  var k = Math.cos(φ / 360 * τ);

  return [
      (pλ[0] - x) / hλ / k,
      (pλ[1] - y) / hλ / k,
      (pφ[0] - x) / hφ,
      (pφ[1] - y) / hφ
  ];
}

var BOUNDARY = 0.45;
var fadeToWhite = colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]);

/**
 * Interpolates a sinebow color where 0 <= i <= j, then fades to white where j < i <= 1.
 *
 * @param i number in the range [0, 1]
 * @param a alpha value in range [0, 255]
 * @returns {Array} [r, g, b, a]
 */
export function extendedSinebowColor(i, a) {
  return i <= BOUNDARY ?
    sinebowColor(i / BOUNDARY, a) :
    fadeToWhite((i - BOUNDARY) / (1 - BOUNDARY), a);
}

export function spread(p, low, high) {
  return p * (high - low) + low;
}
