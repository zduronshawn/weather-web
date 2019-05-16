import * as Globes from '../lib/Globe'
import { clearCanvas } from '../lib/utils'
import * as d3 from 'd3'
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
    view: defaultView,
    width: defaultView.width,
    height: defaultView.height,
    globe: new Globes["Orthographic"](defaultView),
    showMenu: false
  },
  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      window.onresize = () => {
        clearCanvas(d3.select("#animation").node())
        clearCanvas(d3.select("#overlay").node());
        let view = getView()
        dispatch({
          type: "save",
          payload: {
            view,
            ...getView()
          }
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
