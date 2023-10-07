const entangledCheckBox = <HTMLInputElement>document.getElementById('entangled');
function entangle() {
    return (document.getElementById('entangled') as HTMLInputElement).checked;
}

const loopTime = parseInt(getComputedStyle(document.body).getPropertyValue("--loopTime").slice(0, -2));

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

abstract class Grid<T extends Comparable<T>>
{
    private readonly cellSize: number;
    private readonly grid: Maybe<T>[][];
    private readonly gridSvg: (Maybe<LoadedSvg>)[][];
    protected abstract makeSvg(t: T): LoadedSvg;
    protected abstract click(x: number, y: number): void;
    protected abstract over(x: number, y: number): void;
    protected abstract out(x: number, y: number): void;
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
            cell.addEventListener('click', () => {this.click(x, y); this.over(x, y); }); 
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
            made.style.left = (x * this.cellSize) + 'px';
            made.style.top = (y * this.cellSize) + 'px';
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
        t.style.opacity = "0.5";
    }
    protected makeSvg(t: Preview<PreviewT, ActualT>) {
        if (t.preview === null && t.actual === null) 
            throw "Not possible!"; // TODO: fix this
        const ret = this.getSvg(t.preview !== null ? t.preview : t.actual!).cloneNode(true) as LoadedSvg;
        if (t.preview !== null) {
            console.log(`Making preview ${t}`);
            this.makePreview(ret);
        }
        return ret;
    }
    protected colHeight(x: number): number | null {
        for (let y = super.getGridSize() - 1; y >= 0; y--) {
            if (this.get(x, y) === null || this.get(x, y)?.actual === null)
                return y;
        }
        console.log("Too bad");
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
        console.log(`--- Placing actual ${t} at (${x}, ${y})`);
        super.place(x, y, new Preview<PreviewT, ActualT>(null, t));
        console.log("--- Placed actual");
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

class FourInARowGrid extends GridWithPreview<Piece, Piece | Eye> {
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
    constructor() {
        super(<any>document.getElementById('game-board'), 10);
    }
    protected getSvg(t: Piece | Eye) {
        return svgLoaded[t instanceof EntangledPiece ? "entangled" : t == Eye ? "eye" : (t as SimplePiece).type];
    }
    protected placement(x: number) {
        return super.colHeight(x);
    }
    protected click(x: number, y: number) {
        const y2 = this.placement(x);
        if (y2 === null) return;
        console.log(`Setting last move: (${x}, ${y})`);
        const at = super.getActual(x, y);
        if (at instanceof EntangledPiece) {
            const measurement = Math.random() < 0.5 ? "circle" : "cross";
            super.placeActual(x, y, new SimplePiece(measurement));
            super.placeActual(at.that[0], at.that[1], new SimplePiece(measurement));
        } else if (entangle()) {
            if (this.lastMove === null)
                throw new Error("We should not be able to set the entangled checkbox open before a move has been made!"); 
            super.placeActual(x, y2, new EntangledPiece(this.lastMove));
            super.placeActual(this.lastMove[0], this.lastMove[1], new EntangledPiece([x, y2]));
        } else
            super.placeActual(x, y2, new SimplePiece(this.currentPlayer));
        
        this.lastMove = [x, y2];
        this.currentPlayer = this.currentPlayer === 'circle' ? 'cross' : 'circle'; 
        entangledCheckBox.disabled = entangledCheckBox.checked;
        entangledCheckBox.checked = false;

        const winner = this.checkWinner();
        if (winner != null) {
            alert("We have a winner! 🎉");
        }
    }
    protected over(x: number, y: number) {
        const y2 = this.placement(x);
        if (y2 === null) return;
        const at = super.getActual(x, y);
        if (at instanceof EntangledPiece) {
            console.log([x, y]);
            console.log(at.that);
            super.preview(x, y, Eye);
            super.preview(at.that[0], at.that[1], Eye);
        } else if (entangle()) {
            if (this.lastMove === null)
                throw new Error("We should not be able to set the entangled checkbox open before a move has been made!"); 
            super.preview(x, y2, new EntangledPiece(this.lastMove));
            super.preview(this.lastMove[0], this.lastMove[1], new EntangledPiece([x, y2]));
        } else
            super.preview(x, y2, new SimplePiece(this.currentPlayer));
    }
    protected out(x: number, y: number) {
        // clearHovers();
        console.log("Unpreview");
        super.unPreview();
    }
}

new FourInARowGrid();

/*
entangledCheckBox.onchange = () => { 
    if (entangledCheckBox.checked) {
        clearSVG(lastMove[0], lastMove[1]);
        gridSVG[lastMove[0]][lastMove[1]] = createEntangled(lastMove[0], lastMove[1]);
    }
};

function clearSVG(x, y) {
    if (gridSVG[x][y].length>0) {
        console.log(`Clearing ${gridSVG[x][y]} at (${x}, ${y})...`);
    }
    for (const e of gridSVG[x][y])
        svg.removeChild(e);
    gridSVG[x][y] = []; 
}

function createEntangled(x, y) {
    const c1 = createCircle(x, y);
    const c2 = createCross(x, y);
    const cc = [...c1, ...c2];
    for (const c of cc)
        c.classList.add('superposition');
    return cc;
}

function clearHovers() {
    console.log("Clearing hovers");
    for (let x = 0; x < gridSize; x++)
        for (let y = 0; y < gridSize; y++)
            if (!grid[x][y])
                clearSVG(x, y);
            else {
                if (Array.isArray(grid[x][y]) && (gridSVG[x][y][0] == eye1 || gridSVG[x][y][0] == eye2)) {
                    const x2 = grid[x][y][0];
                    const y2 = grid[x][y][1];
                    if (grid[x][y][0] == eye1 || grid[x][y][0] == eye2) {
                        gridSVG[x][y] = [];
                        gridSVG[x2][y2] = [];
                    } else {
                        clearSVG(x, y);
                        clearSVG(x2, y2);
                    }
                    gridSVG[x][y] = createEntangled(x, y);
                    gridSVG[x2][y2] = createEntangled(x2, y2);
                    sync(x, y, x2, y2);
                }
            }
}



function sync(x1, y1, x2, y2) {
    function sameClassList({classList: x},{classList: y}) {
        return [...x].every(z=>y.contains(z)) 
            && [...y].every(z=>x.contains(z));
    }

    function findAnimByName(elem, name) {
        const anims = elem.getAnimations();
        return anims.find((anim) => anim.animationName === name);
    }
    for (const other of gridSVG[x2][y2]) {
        const myAnim = findAnimByName(gridSVG[x1][y1].filter(e => sameClassList(e, other))[0], "clock-animation");
        findAnimByName(other, "clock-animation").startTime = myAnim.startTime;
            //+ (other.classList.contains("circle") ? loopTime / 2 : 0) + "ms";
    }
}

function handleCellHover(column) {
    // clearHovers();
    const cellsInColumn = grid[column].filter(cell => !cell);
    if (cellsInColumn.length > 0) {
        const previewY = cellsInColumn.length - 1;
        const previewX = column;
        clearSVG(previewX, previewY);
        let e;
        if (entangle()) e = createEntangled(previewX, previewY);
        else if (currentPlayer === 'circle') e = createCircle(previewX, previewY);
        else e = createCross(previewX, previewY);
        gridSVG[previewX][previewY] = e;
        if (lastMove) {
            // console.log(`Last move: (${lastMove[0]}, ${lastMove[1]})`);
            // console.log(grid[lastMove[0]][lastMove[1]]);
            // console.log(gridSVG[lastMove[0]][lastMove[1]]);
        }
        if (entangle())
            sync(lastMove[0], lastMove[1], previewX, previewY);
    }
}

drawGrid();

*/
export {};