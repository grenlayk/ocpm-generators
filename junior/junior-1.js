const U = 0; // up
const R = 1; // right
const D = 2; // down
const L = 3; // left

const total = 10;

let graph = [];
let seq = [];
let finish = null;
let dir = null;

const arrows = ["↑", "↱", "↶", "↰"];
const tcolors = [greyColor, blueColor, redColor, yellowColor];
const tletters = [" ", "B", "R", "Y"];

const finishx = [2680, 5310, 6295, 5310, 2680, 3752, 345, 1230, 2610, 3752, 345, 3752, 5765];
const finishy = [6200, 4790, 4790, 6320, 4785, 3165, 2790, 2790, 1755, 1755, 700, 370, 370];

const leftCorner = 1080;
const yHight = 5826;
const dt = 133;
const cubeWidth = 125;

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

function addEdges(v, to, d1, d2) {
    graph[v].addEdge(new GEdge(to, d1, d2));
    graph[to].addEdge(new GEdge(v, d2, d1));
}

function buildGraph() {
    graph = [];
    let total = 13;
    for (let i = 0; i < total; ++i) {
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

function printSeq() {
    let label = document.getElementById('label');
    let str = " ";
    for (c of seq) {
        str += arrows[c].toString() + " ";
    }
    label.innerText = `Последовательность: ${str}`;
}

function drawCubes(page, font) {
    const textSize = 120;
    for (let i = 0; i < total; ++i) {
        let x = leftCorner + dt * i;
        let y = yHight;
        let id = seq[i];
        const textWidth = font.widthOfTextAtSize(tletters[id], textSize);
        const del = (cubeWidth - textWidth) / 2 - 6;
        drawBox(page, x, y, tcolors[id], cubeWidth);
        drawText(page, tletters[id], x + del, y, textSize, font, blackColor);
    }
    drawBox(page, finishx[finish], finishy[finish], greenColor, sz=170);
}

// Add field pdf to frame
async function createFieldPdf(filename) {
    const url = '../pdf/path.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawCubes(pages[0], font);

    pdfDoc.setTitle('Field');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}


function getSequence() {
    finish = 0;
    dir = 3;
    seq = [];
    for (let i = 0; i < total; ++i) {
        let sz = graph[finish].edges.length;
        let id = getRandomInt(0, sz);
        let e = graph[finish].edges[id];
        seq.push((e.vdir - dir + 6) % 4);
        finish = e.to;
        dir = e.todir;
    }
    printSeq();
    console.log(seq, finish);
}

async function createField() {
    if (finish == null) {
        getSequence();
    }
    await createFieldPdf('field');
}


function refreshPage() {
    buildGraph();
    finish = null;
    dir = null;
    createField();
}



