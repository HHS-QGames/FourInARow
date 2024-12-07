import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Help from './components/Help';
import Home from './components/Home';
import { LocalGame } from './components/LocalGame';
import { OnlineGame1 } from './components/OnlineGame1';
import { OnlineGame2 } from './components/OnlineGame2';

const root = createRoot(document.getElementById('react')!);
root.render(
    <Router basename={process.env.REACT_APP_BASE_NAME}>
    <div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/local" element={<LocalGame/>} />
        <Route path="/online" element={<OnlineGame1/>} />
        <Route path="/help" element={<Help />} />
        <Route path="/:opponent" element={<OnlineGame2/>} />
      </Routes>
    </div>
  </Router>
  );