import runtime from 'serviceworker-webpack-plugin/lib/runtime';

import { h, render } from 'preact';
import App from './App';

// Set up Service worker
if ('serviceWorker' in navigator) {
  runtime.register();
}

render(<App />, document.getElementById('app'));
