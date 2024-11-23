import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Help from './components/Help';
import Home from './components/Home';
import { LocalGame } from './components/LocalGame';
import { OnlineGame1 } from './components/OnlineGame1';
import { OnlineGame2 } from './components/OnlineGame2';
// This is some ugly code to get the basename working in the GitHub pages deployment... sorry
const basename = !process.env.REACT_APP_USE_BASENAME ? 'FourInARow' : undefined;
const root = createRoot(document.getElementById('react'));
root.render(_jsx(Router, { basename: basename, children: _jsx("div", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/local", element: _jsx(LocalGame, {}) }), _jsx(Route, { path: "/online", element: _jsx(OnlineGame1, {}) }), _jsx(Route, { path: "/help", element: _jsx(Help, {}) }), _jsx(Route, { path: "/:opponent", element: _jsx(OnlineGame2, {}) })] }) }) }));
