import { jsx as _jsx } from "react/jsx-runtime";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import { useRef, useState } from 'react';
import { Peer } from "peerjs";
import { Game } from './Game';
export function OnlineGame2() {
    const params = useParams();
    const opponent = params.opponent;
    const [conn, setConn] = useState(null);
    const listener = useRef(null);
    const [random, setRandom] = useState(0);
    if (conn === null) {
        const name = uuidv4();
        const peer = new Peer(name);
        peer.on('open', () => {
            console.log('Peer is open');
            const conn = peer.connect(opponent);
            conn.on('open', function () {
                setConn(conn);
                const r = Math.floor(Math.random() * 100000);
                setRandom(r);
                conn.send(JSON.stringify({ type: "starting", name, randomSeed: r }));
                conn.on('data', (data) => listener.current(JSON.parse(data)));
            });
        });
        return _jsx("div", { children: "Connecting..." });
    }
    else
        return _jsx(Game, { options: {
                opponent,
                player: 2,
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
