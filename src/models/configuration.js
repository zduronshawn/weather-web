export default {
  namespace: 'configuration',
  state: {
    date: Date.now(),
    orentation: "-222.73,1.75,275",
    overlaytype: "default",
    params: "wind",
    projection: "orthographic",
    topology: '/public/data/earth-topo.json'
  },

  effects: {},

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
