import dva from 'dva';
import * as Sentry from '@sentry/browser';
import { createBrowserHistory } from 'history';
import './index.css';

Sentry.init({
  dsn: "https://bd63b494eefd4bd6a5425a7a050bf656@sentry.io/1504743",
  beforeSend(event) {
    console.log(event)
    return event
  }
})
// 1. Initialize
const app = dva({
  history: createBrowserHistory()
});

window.__dvaApp = app
// 2. Plugins
// app.use({});

// 3. Model
app.model(require('./models/app').default);
app.model(require('./models/download').default);
app.model(require('./models/configuration').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
