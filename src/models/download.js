import { getMesh } from '../services/app'
export default {
  namespace: 'download',
  state: {
    mesh: null
  },

  effects: {
    *getMesh({ payload }, { call, put }) {  // eslint-disable-line
      const mesh = yield call(getMesh)
      yield put({
        type: "save",
        payload: { mesh }
      })
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
