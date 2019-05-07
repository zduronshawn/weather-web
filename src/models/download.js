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
    *getWeather({ payload }, { call, put, select }) {  // eslint-disable-line
      const { params, overlayType, date } = yield select(state => state.configuration)
      console.log(params, overlayType, date)
      let callArr = [call(getWeather, { type: params, date })]
      if (overlayType !== "default") {
        callArr.push(call(getWeather, { type: overlayType, date }))
      }
      const result = yield callArr
      return result
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
