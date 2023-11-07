import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { FourInARowGrid, Offline, Online } from "../FourInARowGrid";
export function Game({ options }) {
    console.log("Entering Game!");
    useEffect(() => {
        const entangled = document.getElementById('entangled');
        let fiar;
        if (options !== null) {
            const o = new Online(options.player == 1);
            fiar = new FourInARowGrid(entangled, o, options.randomSeed);
            o.setSender(options.registration.register((message) => {
                fiar.receiveMove(message.x, message.y, message.entangled);
                o.flip();
            }));
        }
        else {
            const o = new Offline();
            fiar = new FourInARowGrid(entangled, o, Math.random());
        }
        return () => {
            fiar.clear();
        };
    });
    return _jsxs(_Fragment, { children: [_jsx("svg", { width: "500", height: "500", id: "game-board" }), _jsx("input", { id: "entangled", type: "checkbox", disabled: true }), _jsx("label", { htmlFor: "entangled", children: "Entangled" }), _jsxs("div", { children: ["Playing against ", options === null ? "each other on one screen" : options.opponent] })] });
}
