import { getMesh, getWeather } from '../services/app'
export default {
  namespace: 'download',
  state: {
    mesh: null,
    vectorData: null,
    overlayData: null
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
      const { overlayData, vectorData } = yield select(state => state.download)
      console.log(params, overlayType, date)
      let result = []
      if (vectorData && vectorData.date === date) {
        result[0] = vectorData.data
      } else {
        result[0] = yield call(getWeather, { type: params, date })
      }
      if (overlayType === "default") {
        result[1] = void 0
      } else if (overlayData && overlayData.date === date && overlayData.type === overlayType) {
        result[1] = overlayData.data
      } else {
        result[1] = yield call(getWeather, { type: overlayType, date })
      }
      yield put({
        type: "save",
        payload: {
          vectorData: {
            date,
            data: result[0]
          },
          overlayData: {
            date,
            type: overlayType,
            data: result[1],
          }
        }
      })
      return result
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
