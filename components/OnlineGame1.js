import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { Peer } from "peerjs";
import { Game } from './Game';
export function OnlineGame1() {
    const [opponent, setOpponent] = useState(null);
    const [conn, setConn] = useState(null);
    const [name] = useState(() => uuidv4());
    const listener = useRef(null);
    const [random, setRandom] = useState(0);
    const url = new URL(name, new URL(window.location.href).origin).href;
    useEffect(() => {
        if (!opponent) {
            var canvas = document.getElementById('qrcode');
            QRCode.toCanvas(canvas, url); // not awaited, what if link already has something??? TODO!
        }
    });
    const peer = new Peer(name);
    if (conn === null) {
        peer.on('open', () => {
            console.log('Peer is open, waiting for ');
            peer.on('connection', function (conn) {
                conn.on('data', (data) => {
                    const d = JSON.parse(data);
                    if (d["type"] == "starting") {
                        setOpponent(d["name"]);
                        setRandom(d["randomSeed"]);
                        setConn(conn);
                    }
                    else
                        listener.current(JSON.parse(data));
                });
            });
        });
        return _jsxs("div", { children: ["Let your opponent scan the following QR-code:", _jsx("br", {}), _jsx("canvas", { id: "qrcode" }), _jsx("br", {}), "Or: send the following URL to your opponent.", _jsx("br", {}), _jsx("input", { type: "text", id: "url", disabled: true, value: url }), _jsx("br", {}), _jsx("button", { onClick: () => navigator.clipboard.writeText(url), children: "Copy" })] });
    }
    else
        // TODO: code duplication below, with OnlineGame2
        return _jsx(Game, { options: {
                opponent: opponent,
                player: 1,
                registration: {
                    register: (l) => {
                        console.log("Setting listener...");
                        listener.current = l;
                        return async (message) => conn.send(JSON.stringify(message));
                    },
                },
                randomSeed: random
            } });
}
