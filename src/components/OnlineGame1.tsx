import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { DataConnection, Peer } from "peerjs";
import { Message, MoveMessage } from '../Messages';
import { Game, Listener } from './Game';

export function OnlineGame1() {
    const [opponent, setOpponent] = useState<string | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);
    const [name] = useState(() =>uuidv4());
    const listener = useRef<Listener | null>(null);
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
            peer.on('connection', function(conn) {
                conn.on('data', (data: string) => {
                    const d: Message = JSON.parse(data);
                    if (d["type"] == "starting") {
                        setOpponent(d["name"]);
                        setRandom(d["randomSeed"]);
                        setConn(conn);
                    } else listener.current!(JSON.parse(data) as MoveMessage);
                });
            });
        }); 
        return <div>
            Let your opponent scan the following QR-code: 
            <br/>
            <canvas id="qrcode"></canvas>
            <br/>
            Or: send the following URL to your opponent. 
            <br/>
            <input type="text" id="url" disabled value={url}></input>
            <br/>
            <button onClick={()=>navigator.clipboard.writeText(url)}>Copy</button>
        </div>
    } else
        // TODO: code duplication below, with OnlineGame2
        return <Game options={{
            opponent: opponent!,
            player: 1,
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