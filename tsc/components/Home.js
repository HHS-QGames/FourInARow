import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function Home() {
    return _jsxs("div", { className: "button-container", children: [_jsx(Link, { className: "button", to: "/local", children: "Local\u00A0\u00A0game" }), _jsx(Link, { className: "button", to: "/online/", children: "Online game" }), _jsx(Link, { className: "button help", to: "/help", children: "Help" })] });
}
