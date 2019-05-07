import * as µ from '../lib/utils'

function bilinearInterpolateScalar(x, y, g00, g10, g01, g11) {
  var rx = (1 - x);
  var ry = (1 - y);
  return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
}

function bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
  var rx = (1 - x);
  var ry = (1 - y);
  var a = rx * ry, b = x * ry, c = rx * y, d = x * y;
  var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
  var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
  return [u, v, Math.sqrt(u * u + v * v)];
}

const Factory = {
  "wind": {
    field: "vector",
    type: "wind",
    description: "风速",
    builder: function (file) {
      var uData = file[0].data, vData = file[1].data;
      return {
        header: file[0].header,
        interpolate: bilinearInterpolateVector,
        data: function (i) {
          return [uData[i], vData[i]];
        }
      }
    },
    units: [
      { label: "km/h", conversion: function (x) { return x * 3.6; }, precision: 0 },
      { label: "m/s", conversion: function (x) { return x; }, precision: 1 },
      { label: "kn", conversion: function (x) { return x * 1.943844; }, precision: 0 },
      { label: "mph", conversion: function (x) { return x * 2.236936; }, precision: 0 }
    ],
    scale: {
      bounds: [0, 100],
      gradient: function (v, a) {
        return µ.extendedSinebowColor(Math.min(v, 100) / 100, a);
      }
    },
    particles: { velocityScale: 1 / 60000, maxIntensity: 17 }
  },
  "temp": {
    field: "scalar",
    type: "temp",
    description: "温度",
    builder: function (file) {
      var record = file[0], data = record.data;
      return {
        header: record.header,
        interpolate: bilinearInterpolateScalar,
        data: function (i) {
          return data[i];
        }
      }
    },
    units: [
      { label: "°C", conversion: function (x) { return x - 273.15; }, precision: 1 },
      { label: "°F", conversion: function (x) { return x * 9 / 5 - 459.67; }, precision: 1 },
      { label: "K", conversion: function (x) { return x; }, precision: 1 }
    ],
    scale: {
      bounds: [193, 328],
      gradient: µ.segmentedColorScale([
        [193, [37, 4, 42]],
        [206, [41, 10, 130]],
        [219, [81, 40, 40]],
        [233.15, [192, 37, 149]],  // -40 C/F
        [255.372, [70, 215, 215]],  // 0 F
        [273.15, [21, 84, 187]],   // 0 C
        [275.15, [24, 132, 14]],   // just above 0 C
        [291, [247, 251, 59]],
        [298, [235, 167, 21]],
        [311, [230, 71, 39]],
        [328, [88, 27, 67]]
      ])
    }
  }
}

function fileToGrid(file, field) {
  let builder = Factory[field].builder(file)
  var header = builder.header;
  var λ0 = header.lo1, φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
  var Δλ = header.dx, Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
  var ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
  var date = new Date(header.refTime);
  date.setHours(date.getHours() + header.forecastTime);

  // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
  // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
  var grid = [], p = 0;
  var isContinuous = Math.floor(ni * Δλ) >= 360;
  for (var j = 0; j < nj; j++) {
    var row = [];
    for (var i = 0; i < ni; i++ , p++) {
      row[i] = builder.data(p);
    }
    if (isContinuous) {
      // For wrapped grids, duplicate first column as last column to simplify interpolation logic
      row.push(row[0]);
    }
    grid[j] = row;
  }

  function interpolate(λ, φ) {
    var i = µ.floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
    var j = (φ0 - φ) / Δφ;                 // calculate latitude index in direction +90 to -90

    //         1      2           After converting λ and φ to fractional grid indexes i and j, we find the
    //        fi  i   ci          four points "G" that enclose point (i, j). These points are at the four
    //         | =1.4 |           corners specified by the floor and ceiling of i and j. For example, given
    //      ---G--|---G--- fj 8   i = 1.4 and j = 8.3, the four surrounding grid points are (1, 8), (2, 8),
    //    j ___|_ .   |           (1, 9) and (2, 9).
    //  =8.3   |      |
    //      ---G------G--- cj 9   Note that for wrapped grids, the first column is duplicated as the last
    //         |      |           column, so the index ci can be used without taking a modulo.

    var fi = Math.floor(i), ci = fi + 1;
    var fj = Math.floor(j), cj = fj + 1;

    var row;
    if ((row = grid[fj])) {
      var g00 = row[fi];
      var g10 = row[ci];
      if (µ.isValue(g00) && µ.isValue(g10) && (row = grid[cj])) {
        var g01 = row[fi];
        var g11 = row[ci];
        if (µ.isValue(g01) && µ.isValue(g11)) {
          // All four points found, so interpolate the value.
          return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
        }
      }
    }
    // console.log("cannot interpolate: " + λ + "," + φ + ": " + fi + " " + ci + " " + fj + " " + cj);
    return null;
  }

  return {
    ...Factory[field],
    date: date,
    interpolate: interpolate,
    forEachPoint: function (cb) {
      for (var j = 0; j < nj; j++) {
        var row = grid[j] || [];
        for (var i = 0; i < ni; i++) {
          cb(µ.floorMod(180 + λ0 + i * Δλ, 360) - 180, φ0 - j * Δφ, row[i]);
        }
      }
    }
  };
}

export {
  fileToGrid
}