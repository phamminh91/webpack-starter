import runtime from 'serviceworker-webpack-plugin/lib/runtime';

// Set up Service worker
if ('serviceWorker' in navigator) {
  runtime.register();
}

import './style.scss';

const a = 1;
const b = 2;
const say = words => {
  // eslint-disable-next-line no-console
  console.log(words);
};

// eslint-disable-next-line no-console
say('hello3' + (a + b));
