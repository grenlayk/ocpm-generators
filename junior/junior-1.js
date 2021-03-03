const U = 0; // up
const R = 1; // right
const D = 2; // down
const L = 3; // left
const N = 10;

let graph = [];
let seq = [];
let finish = null;
let dir = null;
let correct = 1;

const ARROW = ["↑", "↱", "↶", "↰"];
const C_COLORS = [greyColor, blueColor, redColor, yellowColor];
const C_LETTERS = [" ", "B", "R", "Y"];
//                   0     1     2     3     4     5     6     7     8     9    10    11    12
const FINISH_X = [2680, 5310, 6295, 5310, 2680, 3752,  345, 1230, 2610, 3752,  345, 3752, 5765];
const FINISH_Y = [6200, 4790, 4790, 6320, 4785, 3165, 2790, 2790, 1755, 1755,  700,  370,  370];

const X_CORNER = 1080;
const Y_CORNER = 5826;
const DLT = 133;
const C_WIDTH = 125;

class GVertex {
    constructor(id) {
        this.id = parseInt(id);
        this.edges = [];
    }

    addEdge(edge) {
        this.edges.push(edge);
    }
}

class GEdge {
    constructor(to, vdir, todir) {
        this.to = parseInt(to);
        this.vdir = parseInt(vdir);
        this.todir = parseInt(todir);
    }

    label() {
        return `${this.to}: ${this.vdir} - ${this.todir}`;
    }
}

// add edge vice versa
function addEdges(v, to, d1, d2) {
    graph[v].addEdge(new GEdge(to, d1, d2));
    graph[to].addEdge(new GEdge(v, d2, d1));
}

// create graph
function buildGraph() {
    graph = [];
    let M = 13;
    for (let i = 0; i < M; ++i) {
        graph.push(new GVertex(i));
    }
    // Edges list
    // Oh God, I just hope I haven't mistaken here
    addEdges(0, 1, R, L);
    addEdges(0, 4, D, U);
    addEdges(1, 3, U, D);
    addEdges(1, 2, R, L);
    addEdges(1, 5, D, R);
    addEdges(4, 5, R, U);
    addEdges(4, 5, D, L);
    addEdges(4, 7, L, U);
    addEdges(5, 9, D, U);
    addEdges(6, 7, R, L);
    addEdges(7, 8, R, U);
    addEdges(7, 8, D, L);
    addEdges(8, 9, R, L);
    addEdges(8, 10, D, R);
    addEdges(9, 11, D, U);
    addEdges(9, 12, R, U);
}

// print turns 
function printSeq() {
    let label = document.getElementById('label');
    let str = " ";
    for (c of seq) {
        str += ARROW[c].toString() + " ";
    }
    label.innerText = `Последовательность: ${str}`;
}

// draw code next to the start
function drawCubes(page, font) {
    const textSize = 120;
    for (let i = 0; i < N; ++i) {
        let x = X_CORNER + DLT * i;
        let y = Y_CORNER;
        let id = seq[i];
        const textWidth = font.widthOfTextAtSize(C_LETTERS[id], textSize);
        const delta = (C_WIDTH - textWidth) / 2 - 6;
        drawBox(page, x, y, C_COLORS[id], C_WIDTH);
        drawText(page, C_LETTERS[id], x + delta, y, textSize, font, blackColor);
    }
    drawBox(page, FINISH_X[finish], FINISH_Y[finish], greenColor, sz=170);
}

// Add field pdf to frame
async function createFieldPdf(filename) {
    const url = '../pdf/path.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawCubes(pages[0], font);

    pdfDoc.setTitle('Junior-1');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

// gen code seq by path 
function genSequence() {
    let colCnt = [0, 0, 0, 0];
    finish = 0;
    dir = 3;
    seq = [];
    correct = 1;
    for (let i = 0; i < N; ++i) {
        let sz = graph[finish].edges.length;
        let id = getRandomInt(0, sz);
        let e = graph[finish].edges[id];
        let res = (e.vdir - dir + 6) % 4;
        colCnt[res] += 1;
        if (colCnt[res] > 4) {
            correct = 0;
            return;
        }
        seq.push(res);
        finish = e.to;
        dir = e.todir;
    }
    printSeq();
}

async function createField() {
    if (finish == null) {
        correct = 0;
        while (!correct) {
            genSequence();
        }
    }
    await createFieldPdf('field');
}


function refreshPage() {
    buildGraph();
    finish = null;
    dir = null;
    createField();
}
