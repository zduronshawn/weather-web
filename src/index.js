import dva from 'dva';
import { createBrowserHistory } from 'history';
import './index.css';

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
