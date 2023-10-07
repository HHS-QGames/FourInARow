import { useEffect } from "react";
import { FourInARowGrid } from "./Main";

export function Game() { 
    const a = 3;
  useEffect(() => {
    new FourInARowGrid(document.getElementById('entangled') as HTMLInputElement);
  });
    return <>
    <svg width="500" height="500" id="game-board" />
    <input id="entangled" type="checkbox" disabled></input>
    <label htmlFor="entangled">Entangled</label>
    </>;
}