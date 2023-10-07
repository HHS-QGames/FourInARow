import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Help from './Help';
import Home from './Home';
import { LocalGame } from './LocalGame';

const root = createRoot(document.getElementById('react')!);
root.render(
    <Router>
    <div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/local" element={<LocalGame/>} />
        {/* 
        <Route path="/online" element={Online} /> */}
        <Route path="/help" element={<Help />} />
      </Routes>
    </div>
  </Router>
  );