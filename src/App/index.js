import { h } from 'preact';
import Helmet from 'preact-helmet';
import 'normalize.css/normalize.css';

import './style.scss';

export default function App() {
  return (
    <div className='container'>
      <Helmet title='My PWA' />
      <h2>Img sprite</h2>
      <div className='app-icon' />
      <div className='lightning-icon' />
    </div>
  );
}
