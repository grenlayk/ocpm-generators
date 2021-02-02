const U = 0; // up
const R = 1; // right
const D = 2; // down
const L = 3; // left

const total = 10;

let graph = [];
let seq = null;
let finish = null;
let dir = null;

//const arrows = ["↑", "↱", "↶", "↰"];
const tcolors = [redColor, yellowColor, greenColor, greyColor];
const tletters = ["R", "Y", "G", " "];

//                  0     1     2     3     4     5     6     7     8     9    10    11    12  
const finishx = [2680, 5310, 6295, 5310, 2680, 3752,  345, 1230, 2610, 3752,  345, 3752, 5765];
const finishy = [6200, 4790, 4790, 6320, 4785, 3165, 2790, 2790, 1755, 1755,  700,  370,  370];

const leftCorner = 1080;
const yHight = 5826;
const dt = 133;
const cubeWidth = 125;


const cubex = [5310, 6445, 5765, 3752, 195,  195];
const cubey = [6470, 4790,  220,  220, 700, 2790];

let coords = [[], []];


function choosePositions(i=0) {
    coords[i] = getCnk(6, 3);
    let code = 0;
    for (let id of coords[i]) {
        code += Math.pow(2, id);
    }
    let deg = 27;
    while (deg > 0) {
        seq.push(Math.floor(code / deg));
        code = code % deg;
        deg = Math.floor(deg / 3);
    }
    console.log(coords[i]);
}

function createSeq() {
    seq = [];
    choosePositions(0);
    seq.push(3);
    seq.push(3);
    choosePositions(1);
}


function printSeq() {
    let label = document.getElementById('label');
    let str = " ";
    for (c of seq) {
        str += arrows[c].toString() + " ";
    }
    label.innerText = `Последовательность: ${str}`;
}

function drawCode(page, font) {
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
}

function drawCubes(page, font, i) {
    const textSize = 120;
    for (let id of coords[i]) {
        drawBox(page, cubex[id], cubey[id], greenColor, sz=170);
    }
}

// Add field pdf to frame
async function createFieldPdf(filename, i=0) {
    const url = '../pdf/path.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawCode(pages[0], font);
    drawCubes(pages[0], font, i);

    pdfDoc.setTitle('Field');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}


async function createField() {
    if (seq == null) {
        createSeq();
    }
    await createFieldPdf('field', 0);
    await createFieldPdf('correct', 1);
}


function refreshPage() {
    // buildGraph();
    finish = null;
    dir = null;
    createField();
}

