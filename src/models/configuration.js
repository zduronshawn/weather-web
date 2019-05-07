import moment from 'moment'

export default {
  namespace: 'configuration',
  state: {
    date: moment().subtract(3, 'days').format("YYYYMMDD"),
    orientation: "-222.73,1.75,275",
    overlayType: "temp",
    params: "wind",
    projection: "Orthographic",
    topology: '/public/data/earth-topo.json',
  },

  effects: {},

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
