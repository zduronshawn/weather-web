import request from '../utils/request';
import * as topojson from 'topojson'

export function getWeather(params) {

  return request(`http://localhost:3000/${params.type}/${params.date}`)
    .then(({ data }) => {
      return data
    })
}

export function getMesh() {
  return request("/public/data/earth-topo.json")
    .then(({ data }) => {
      console.time("building meshes");
      var o = data.objects;
      var coastLo = topojson.feature(data, o.coastline_110m);
      var coastHi = topojson.feature(data, o.coastline_50m);
      var lakesLo = topojson.feature(data, o.lakes_110m);
      var lakesHi = topojson.feature(data, o.lakes_50m);
      console.timeEnd("building meshes");
      return {
        coastLo: coastLo,
        coastHi: coastHi,
        lakesLo: lakesLo,
        lakesHi: lakesHi
      };
    })
}