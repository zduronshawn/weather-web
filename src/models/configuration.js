export default {
  namespace: 'configuration',
  state: {
    date: Date.now(),
    orientation: "-222.73,1.75,275",
    overlaytype: "default",
    params: "wind",
    projection: "Orthographic",
    topology: '/public/data/earth-topo.json'
  },

  effects: {},

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
