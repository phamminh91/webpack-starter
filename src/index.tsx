import './style.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const say = (words: string) => {
  console.log(words);
};

say('hello3');

ReactDOM.render(<h2>Hello</h2>, document.getElementById('app'));
