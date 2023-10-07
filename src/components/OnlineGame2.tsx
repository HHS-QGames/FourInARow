import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { DataConnection, Peer } from "peerjs";
import { MoveMessage, StartMessage } from '../Messages';
import { Game, Listener } from './Game';



export function OnlineGame2() {
    const params = useParams();
    const opponent = params.opponent!;
    const [conn, setConn] = useState<DataConnection | null>(null);
    const listener = useRef<Listener | null>(null);
    const [random, setRandom] = useState(0);

    if (conn === null) {
        const name = uuidv4();
        const peer = new Peer(name);
        peer.on('open', () => {
            console.log('Peer is open');
            const conn = peer.connect(opponent);
            conn.on('open', function() {
                setConn(conn);
                const r = Math.floor(Math.random() * 100000);
                setRandom(r);
                conn.send(JSON.stringify({ type: "starting", name, randomSeed: r } satisfies StartMessage));
                conn.on('data', (data: string) => listener.current!(JSON.parse(data) as MoveMessage));
            });
        });
        return <div>Connecting...</div>
    }
    else
        return <Game options={{
            opponent,
            player: 2,
            registration: {
                register: (l: Listener) => {
                    console.log("Setting listener...");
                    listener.current = l; 
                    return async (message: MoveMessage) => conn.send(JSON.stringify(message));
                },
            },
            randomSeed: random
        }}></Game>;
}