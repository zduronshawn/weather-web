import moment from 'moment'

export default {
  namespace: 'configuration',
  state: {
    date: moment().subtract(1, 'days').format("YYYYMMDD"),
    orientation: "-222.73,1.75,275",
    overlayType: "temp",
    params: "wind",
    topology: '/public/data/earth-topo.json',
  },

  effects: {},

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
