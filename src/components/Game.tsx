import { useEffect } from "react";
import { FourInARowGrid, Offline, Online } from "../FourInARowGrid";
import { MoveMessage } from "../Messages";

export type Listener = (message: MoveMessage) => void;

export type GameOptions = { randomSeed: number, opponent: string, player: number, registration: { register: (r: Listener) => ((message: MoveMessage) => Promise<void>) }};

export function Game({ options }: {options: GameOptions | null}) {
  console.log("Entering Game!");
    useEffect(() => {
      const entangled = document.getElementById('entangled') as HTMLInputElement;
      if (options !== null) {
        const o = new Online(options.player == 1);
        const fiar = new FourInARowGrid(entangled, o, options.randomSeed);
        o.setSender(options.registration.register((message: MoveMessage) => {
          fiar.receiveMove(message.x, message.y, message.entangled);
          o.flip();
        }));
      } else {
        const o = new Offline();
        const fiar = new FourInARowGrid(entangled, o, Math.random());
      }
    });
    return <>
      <svg width="500" height="500" id="game-board" />
      <input id="entangled" type="checkbox" disabled></input>
      <label htmlFor="entangled">Entangled</label>
    <div>Playing against {options === null ? "each other..." : options.opponent }</div>
    </>;
}