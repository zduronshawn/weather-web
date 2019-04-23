function getView() {
  var w = window;
  var d = document && document.documentElement;
  var b = document && document.getElementsByTagName("body")[0];
  var x = w.innerWidth || d.clientWidth || b.clientWidth;
  var y = w.innerHeight || d.clientHeight || b.clientHeight;
  return {
    width: x,
    height: y
  }
}

const defaultView = getView()

export default {
  namespace: 'app',
  state: {
    width: defaultView.width,
    height: defaultView.height
  },
  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      window.onresize = () => {
        dispatch({
          type: "save",
          payload: getView()
        })
      }
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
