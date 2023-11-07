import { useNavigate } from "react-router-dom";
import { MoveMessage } from "./Messages";

async function svgLoader(url: string) {
    var template = document.createElement('template');
    template.innerHTML = (await (await fetch(url)).text()).trim();
    return template.content.firstElementChild as HTMLElement;
}

type LoadedSvg = Awaited<ReturnType<typeof svgLoader>>;

function place(where: SVGElement, element: LoadedSvg) {
    return document.body.appendChild(element);
}

const svgLoaded = {
    "circle": await svgLoader("./images/circle.svg"),
    "eye": await svgLoader("./images/eye.svg"),
    "cross": await svgLoader("./images/cross.svg"),
    "entangled": await svgLoader("./images/entangled.svg"),
};

interface Comparable<T> { 
    equal(t: T): boolean; 
}

type Maybe<T> = T | null;
type Surely<T> = T extends null ? never : T;
function surely<T>(t: T) {
    return t as Surely<T>;
}

export interface Communicator {
    doMove(x: number, y: number, entangled: boolean): void;
    myTurn(): boolean;
}

export class Offline implements Communicator {
    constructor() { }
    public doMove(x: number, y: number, entangled: boolean) { }
    public myTurn() {
        return true;
    }
};

export class Online implements Communicator {
    constructor(private imPlaying: boolean) {
        console.log(`I am starting the game: ${imPlaying}`);
    }
    public flip() {
        this.imPlaying = !this.imPlaying;
    }
    public doMove(x: number, y: number, entangled: boolean) {
        console.log(`Sending move (${x}, ${y})`);
        if (!this.imPlaying)
            throw new Error("It's not my move to make!");
        this.sender!({ type: "move", x, y, entangled });
        this.imPlaying = false;
    }
    public myTurn() {
        return this.imPlaying;
    }
    public setSender(sender: (message: MoveMessage) => Promise<void>) {
        this.sender = sender;
    }
    private sender: ((message: MoveMessage) => Promise<void>) | null = null;
};

abstract class Grid<T extends Comparable<T>>
{
    private readonly cellSize: number;
    private readonly grid: Maybe<T>[][];
    private readonly gridSvg: (Maybe<LoadedSvg>)[][];
    protected abstract makeSvg(t: T): LoadedSvg;
    protected abstract click(x: number, y: number): Promise<void>;
    protected abstract over(x: number, y: number): void;
    protected abstract out(x: number, y: number): void;
    public clear() {
        this.forAll((x, y) => {
            if (this.gridSvg[x][y] != null)
                document.body.removeChild(this.gridSvg[x][y]!);
        });
    }
    protected colHeight(x: number) {
        for (let y = this.gridSize - 1; y >= 0; y--)
            if (!this.grid[x][y])
                return y;
        return null;
    }
    protected forAll(func: (x: number, y: number) => void) {
        for (let x = 0; x < this.gridSize; x++)
            for (let y = 0; y < this.gridSize; y++)
                func(x, y);
    }
    protected getGridSize() {
        return this.gridSize;
    }
    constructor(private svg: SVGElement, public readonly gridSize: number) {
        this.cellSize = svg.getBoundingClientRect().width / this.gridSize;
        this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
        this.gridSvg = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));

        this.forAll((x, y) => {
            const cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            cell.setAttribute('x', x * this.cellSize + 'px');
            cell.setAttribute('y', y * this.cellSize + 'px');
            cell.setAttribute('width', this.cellSize + 'px');
            cell.setAttribute('height', this.cellSize + 'px');
            cell.classList.add('cell');
            svg.appendChild(cell);
            cell.addEventListener('click', async () => {await this.click(x, y); this.over(x, y); }); 
            cell.addEventListener('mouseover', () => this.over(x, y));
            cell.addEventListener('mouseout', () => this.out(x, y)); 
        });
    }
    public place(x: number, y: number, t: Maybe<T>) {
        if (equal(this.grid[x][y], t))
            return;
        if ( t != null && ((t as any as Preview<Piece, Piece | Eye>)["actual"] == null && (t as any as Preview<Piece, Piece | Eye>)["preview"] == null))
            throw "aefw";
        this.grid[x][y] = t;
        if (this.gridSvg[x][y] !== null) {
            document.body.removeChild(this.gridSvg[x][y]!);
            this.gridSvg[x][y] = null;
        }
        if (t != null) {
            const made = place(this.svg, this.makeSvg(t));
            made.style.position = 'absolute';
            made.style.left = (x * this.cellSize + this.svg.getBoundingClientRect().left) + 'px';
            made.style.top = (y * this.cellSize + this.svg.getBoundingClientRect().top) + 'px';
            made.style.width = this.cellSize + "px";
            made.style.height = this.cellSize + "px";
            made.style.pointerEvents = "none";
            this.gridSvg[x][y] = made;
        }
    }
    public get(x: number, y: number) {
        return this.grid[x][y];
    }
}

function equal<T extends Comparable<T>>(t1: Maybe<T>, t2: Maybe<T>) {
    if (t1 == null) return t2 == null;
    if (t2 == null) return false;
    return t1.equal(t2);
}

class Preview<PreviewT extends Comparable<PreviewT>, ActualT extends Comparable<ActualT>> implements Comparable<Preview<PreviewT, ActualT>> {
    constructor(public readonly preview: Maybe<PreviewT>, public readonly actual: Maybe<ActualT>) {}
    public equal(t: Preview<PreviewT, ActualT>): boolean {
        return equal(this.actual, t.actual) && equal(this.preview, t.preview);
    }
};

abstract class GridWithPreview<PreviewT extends Comparable<PreviewT>, ActualT extends Comparable<ActualT>> extends Grid<Preview<PreviewT, ActualT>> {
    constructor(svg: SVGElement, gridSize: number) {
        super(svg, gridSize);
    }
    protected abstract getSvg(t: PreviewT | ActualT): LoadedSvg;
    protected makePreview(t: LoadedSvg) {
        t.style.opacity = "0.25";
    }
    protected makeSvg(t: Preview<PreviewT, ActualT>) {
        if (t.preview === null && t.actual === null) 
            throw "Not possible!"; // TODO: fix this
        const ret = this.getSvg(t.preview !== null ? t.preview : t.actual!).cloneNode(true) as LoadedSvg;
        if (t.preview !== null)
            this.makePreview(ret);
        return ret;
    }
    protected colHeight(x: number): number | null {
        for (let y = super.getGridSize() - 1; y >= 0; y--)
            if (this.get(x, y) === null || this.get(x, y)?.actual === null)
                return y;
        return null;
    }
    public preview(x: number, y: number, t: Maybe<PreviewT>) {
        const g = super.get(x, y);
        const actualNull = g === null || g["actual"] == null;
        if (actualNull && t === null)
            super.place(x, y, null);
        else if (actualNull)
            super.place(x, y, new Preview<PreviewT, ActualT>(t, null));
        else
            super.place(x, y, new Preview(t, g["actual"]));
    }
    public placeActual(x: number, y: number, t: ActualT) {
        super.place(x, y, new Preview<PreviewT, ActualT>(null, t));
    }
    public unPreview() {
        super.forAll((x, y) => this.preview(x, y, null));
    }
    public getActual(x: number, y: number) {
        return super.get(x, y)?.actual;
    }
}

class SimplePiece implements Comparable<SimplePiece>
{
    constructor(public readonly type: "circle" | "cross") { }
    public equal(t: SimplePiece) {
        return this.type === t.type;
    }
}

class EntangledPiece implements Comparable<EntangledPiece>
{
    constructor(public readonly that: [number, number]) { }
    public equal(t: EntangledPiece) {
        return this.that === t.that;
    }
}

type Piece = SimplePiece | EntangledPiece;

const Eye = {
    equal: (eye2: typeof Eye) => true
}
type Eye = typeof Eye;

export interface MoveListener {
    receiveMove(x: number, y: number, entangled: boolean): void;
}

async function quantumRandom() {
    async function execute(email, password, code, shots) {
        const URL = 'https://api.quantum-inspire.com/';
        const call = async (url, data) => {
          const response = await fetch(URL + url, {
            headers: {
                Authorization: `Basic ${btoa(`${email}:${password}`)}`,
                ...(data === undefined ? undefined : {
                    "Content-Type": "application/json"
                }),
            },
            ...(data === undefined ? undefined : {
                body: JSON.stringify(data)
            }),
            method: data === undefined ? "GET" : "POST"
          });
          if (response.status==401) throw new Error("Wrong email or password!");
          if (!response.ok) throw new Error();
          return await (response.json());
        }
        const projectCreationResponse = await call("projects/", {
            name: "generatedProject",
            backend_type: "https://api.quantum-inspire.com/backendtypes/1/",
            default_number_of_shots: shots
        });
        const projectUrl = projectCreationResponse.url;
        console.log(`A project was created at: ${projectUrl}`);
        const assetCreationResponse = await call("assets/", {
            name: "generatedAsset",
            project: projectUrl,
            contentType: "text/plain",
            content: code
        });
        const assetUrl = assetCreationResponse.url;
        console.log(`An asset was created at: ${assetUrl}`);
        const jobCreationResponse = await call("jobs/", {
            name: "generatedJob",
            input: assetUrl,
            backend_type: "https://api.quantum-inspire.com/backendtypes/1/",
            number_of_shots: shots
        });
        const jobId = jobCreationResponse.id;
        console.log(`A job was created with id: ${jobId}`);
        console.log(`We now wait for completion...`);
        let status = "WAITING";
        while (status != "COMPLETE") {
            await new Promise(res => setTimeout(res, 1000));
            const jobReadResponse = await call(`jobs/${jobId}/`, undefined);
            status = jobReadResponse.status;
            console.log(`Current status: ${status}`);
        }
        const resultResponse = await call(`jobs/${jobId}/result/`, undefined);
        console.log(`Retrieving data at: ${resultResponse.raw_data_url}`);
        return await call(`${resultResponse.raw_data_url.substring(URL.length)}?format=json`, undefined);
    };
    
    return (await execute(
        'narij17727@submic.com', 
        'https://www.quantum-inspire.com/account/createA', 
        'version 1.0\nqubits 1\nprep_z q[0]\nH q[0]\nmeasure q[0]',
        1
    ))[0];
}

function randomMachine(a: number) {
    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    return async () => {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export class FourInARowGrid extends GridWithPreview<Piece, Piece | Eye> implements MoveListener {
    private currentPlayer: "circle" | "cross" = 'circle';
    private lastMove: [number, number] | null = null;
    private checkWinner() {
        const directions = [
          [0, 1], [1, 0], [1, 1], [1, -1] 
        ];
      
        const rows = super.getGridSize();
        const cols = super.getGridSize();

        const get = (x: number, y: number) => {
            const ret = super.getActual(x, y);
            if (ret instanceof SimplePiece)
                return ret.type;
            return null;
        };
      
        const checkDirection = (row: number, col: number, dr: number, dc: number, token: "circle" | "cross") => {
          for (let i = 0; i < 4; i++) {
            const newRow = row + i * dr;
            const newCol = col + i * dc;
            if (
              newRow >= 0 &&
              newRow < rows &&
              newCol >= 0 &&
              newCol < cols &&
              get(newRow, newCol) === token
            )
              continue;
            return false;
          }
          return true;
        };
      
        for (let row = 0; row < rows; row++)
          for (let col = 0; col < cols; col++)
            if (get(row, col) !== null)
                for (const [dr, dc] of directions)
                if (checkDirection(row, col, dr, dc, get(row, col)!))
                    return get(row, col); 
      
        return null; 
    }      
    private randomMachine: () => Promise<number>;
    constructor(private readonly entangledCheckBox: HTMLInputElement, private readonly communicator: Communicator, randomSeed: number) {
        super(<any>document.getElementById('game-board'), 10);
        if (randomSeed == -1)
            this.randomMachine = quantumRandom;
        else
            this.randomMachine = randomMachine(randomSeed);
    }
    protected getSvg(t: Piece | Eye) {
        return svgLoaded[t instanceof EntangledPiece ? "entangled" : t == Eye ? "eye" : (t as SimplePiece).type];
    }
    protected placement(x: number) {
        return super.colHeight(x);
    }
    protected async click(x: number, y: number) {
        if (!this.communicator.myTurn() && !this.allowOnce) 
            return;
        
        const y2 = this.placement(x);
        if (y2 === null) return;
        const at = super.getActual(x, y);
        if (at instanceof EntangledPiece) {
            const measurement = (await this.randomMachine()) < 0.5 ? "circle" : "cross";
            super.placeActual(x, y, new SimplePiece(measurement));
            super.placeActual(at.that[0], at.that[1], new SimplePiece(measurement));
            this.lastMove = null;
        } else if (this.entangledCheckBox.checked) {
            if (this.lastMove === null)
                throw new Error("We should not be able to set the entangled checkbox open before a move has been made!"); 
            super.placeActual(x, y2, new EntangledPiece(this.lastMove));
            super.placeActual(this.lastMove[0], this.lastMove[1], new EntangledPiece([x, y2]));
            this.lastMove = null;
        } else {
            super.placeActual(x, y2, new SimplePiece(this.currentPlayer));
            this.lastMove = [x, y2];
        }

        if (!this.allowOnce)
            this.communicator.doMove(x, y, this.entangledCheckBox.checked);
        this.allowOnce = false;

        this.currentPlayer = this.currentPlayer === 'circle' ? 'cross' : 'circle'; 
        this.entangledCheckBox.disabled = this.lastMove === null;
        this.entangledCheckBox.checked = false;
        
        const winner = this.checkWinner();
        if (winner != null) {
            alert("We have a winner! 🎉 The player that won: " + winner);
            window.location.assign("/");
        }
    }
    protected over(x: number, y: number) {
        if (!this.communicator.myTurn()) {
            this.unPreview();
            return;
        }
        const y2 = this.placement(x);
        if (y2 === null) return;
        const at = super.getActual(x, y);
        if (at instanceof EntangledPiece) {
            super.preview(x, y, Eye);
            super.preview(at.that[0], at.that[1], Eye);
        } else if (this.entangledCheckBox.checked) {
            if (this.lastMove === null)
                throw new Error("We should not be able to set the entangled checkbox open before a move has been made!"); 
            super.preview(x, y2, new EntangledPiece(this.lastMove));
            super.preview(this.lastMove[0], this.lastMove[1], new EntangledPiece([x, y2]));
        } else
            super.preview(x, y2, new SimplePiece(this.currentPlayer));
    }
    protected out(x: number, y: number) {
        super.unPreview();
    }
    private allowOnce: boolean = false;
    public receiveMove(x: number, y: number, entangled: boolean) {
        console.log(`Receiving move (${x}, ${y})`);
        this.entangledCheckBox.checked = entangled;
        this.allowOnce = true;
        this.click(x, y);
    }
}



export {};