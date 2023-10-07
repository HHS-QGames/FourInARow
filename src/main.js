const loopTime = parseInt(getComputedStyle(document.body).getPropertyValue("--loopTime").slice(0, -2));
let currentPlayer = 'circle';
let lastMove = null;
async function svgLoader(url) {
    var template = document.createElement('template');
    template.innerHTML = (await (await fetch(url)).text()).trim();
    return template.content.firstChild;
}
document.body.appendChild(await svgLoader("./images/eye.svg"));
/*
const eye1 = document.getElementById("eye1");
eye1.style.width = cellSize + "px";
eye1.style.visibility = "hidden";

const eye2 = document.getElementById("eye2");
eye2.style.width = cellSize + "px";
eye2.style.visibility = "hidden";

class Grid
{
    private readonly cellSize: number;
    private readonly grid: string[][];
    constructor(private svg: SVGElement, private gridSize: number = 10) {
        this.cellSize = svg.width.baseVal.value / gridSize;
        this.grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
        const gridSVG = Array.from({ length: gridSize }, () => Array(gridSize).fill([]));
    }
}

new Grid(<any>document.getElementById('game-board'));

const entangledCheckBox = <HTMLInputElement>document.getElementById('entangled');
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

function createCircle(x, y) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x * cellSize + cellSize / 2);
    circle.setAttribute('cy', y * cellSize + cellSize / 2);
    circle.setAttribute('r', cellSize / 2 - 5);
    circle.classList.add('circle');
    svg.appendChild(circle);

    return [circle];
}

function createEye(x, y, nr) {
    const eye = nr == 1 ? eye1 : eye2;
    eye.style.position = 'absolute';
    eye.style.x = (x * cellSize) + 'px';
    eye.style.y = (y * cellSize) + 'px';
    eye.style.visibility = "visible";
    return [eye];
}

function createCross(x, y) {
    const cross1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    cross1.setAttribute('x1', x * cellSize + 10);
    cross1.setAttribute('y1', y * cellSize + 10);
    cross1.setAttribute('x2', (x + 1) * cellSize - 10);
    cross1.setAttribute('y2', (y + 1) * cellSize - 10);
    cross1.classList.add('cross');
    svg.appendChild(cross1);

    const cross2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    cross2.setAttribute('x1', (x + 1) * cellSize - 10);
    cross2.setAttribute('y1', y * cellSize + 10);
    cross2.setAttribute('x2', x * cellSize + 10);
    cross2.setAttribute('y2', (y + 1) * cellSize - 10);
    cross2.classList.add('cross');
    svg.appendChild(cross2);

    return [cross1, cross2];
}

function createEntangled(x, y) {
    const c1 = createCircle(x, y);
    const c2 = createCross(x, y);
    const cc = [...c1, ...c2];
    for (const c of cc)
        c.classList.add('superposition');
    return cc;
}

function drawGrid() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (grid[x][y]) continue;
            const cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            cell.setAttribute('x', x * cellSize);
            cell.setAttribute('y', y * cellSize);
            cell.setAttribute('width', cellSize);
            cell.setAttribute('height', cellSize);
            cell.classList.add('cell');
            svg.appendChild(cell);
            cell.addEventListener('click', () => placePiece(x));
            cell.addEventListener('mouseover', () => {
                console.log("Mouse over");
                if (Array.isArray(grid[x][y])) {
                    console.log("Clearing first");
                    clearSVG(x, y);
                    console.log("Placing eye1");
                    gridSVG[x][y] = createEye(x, y, 1);
                    console.log("Clearing second");
                    clearSVG(grid[x][y][0], grid[x][y][1]);
                    console.log("Placing eye2");
                    gridSVG[grid[x][y][0]][grid[x][y][1]] = createEye(grid[x][y][0], grid[x][y][1], 2);
                } else
                    handleCellHover(x);
            });
            cell.addEventListener('mouseout', () => {
                console.log("Mouse out!");
                clearHovers();
            });
        }
    }
    svg.appendChild(eye1);
    svg.appendChild(eye2);
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

function entangle() {
    return document.getElementById('entangled').checked;
}

function placePiece(column) {
    for (let y = gridSize - 1; y >= 0; y--) {
        if (!grid[column][y]) {
            handleCellHover(column);
            // console.log(`Setting last move: (${column}, ${y})`);
            if (entangle()) {
                grid[column][y] = lastMove;
                grid[lastMove[0]][lastMove[1]] = [column, y];
            } else
                grid[column][y] = currentPlayer;
            lastMove = [column, y];
            currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
            document.getElementById('entangled').disabled = document.getElementById('entangled').checked;
            document.getElementById('entangled').checked = false;
            handleCellHover(column);
            return;
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
