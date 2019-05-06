import { getMesh, getWeather } from '../services/app'
export default {
  namespace: 'download',
  state: {
    mesh: null,

  },

  effects: {
    *getMesh({ payload }, { call, put }) {  // eslint-disable-line
      const mesh = yield call(getMesh)
      yield put({
        type: "save",
        payload: { mesh }
      })
    },
    *getWeather({ payload }, { call, put }) {  // eslint-disable-line
      const result = yield call(getWeather, payload)
      return result
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
