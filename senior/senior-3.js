let seq = null;
let merged = null;
const N = 10;

const C_COLORS = [redColor, yellowColor, greenColor, greyColor];
const C_LETTERS = ["R", "Y", "G", " "];

//                 0     1     2     3     4     5     6     7     8     9    10    11    12    13    14  
//              -1/0   0/4   4/5   4/5   1/3   1/2   1/5   1/5   7/4   7/6  10/8   9/5  9/11  9/12   9/8
const START_X = [1800, 2680, 2680, 3752, 5300, 5810, 5300, 4250, 1230,  750, 1050, 3752, 3752, 3152, 4452];
const START_Y = [6200, 5492, 4345, 3605, 5615, 4790, 4290, 3165, 3490, 2790,  730, 2455, 1055, 1755, 1755];
const TYPE = [0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0]; // 0 for horizontal , 1 for vertical
const ARROW = [["⇐", "⇒"], ["⇑", "⇓"]];
const ARR_SHIFT = [0, 35];

const X_CORNER = 1080;
const Y_CORNER = 5826;
const DLT = 133;
const C_WIDTH = 125;
const CUBE_X = [5310, 6445, 5765, 3752, 195,  195];
const CUBE_Y = [6470, 4790,  220,  220, 700, 2790];

let st = 14;
let cCoords = [[], []];

// add code 
function pushCode(code) {
    let deg = 27; // 3^3
    while (deg > 0) {
        seq.push(Math.floor(code / deg));
        code = code % deg;
        deg = Math.floor(deg / 3);
    }
}


// subfunc for first / second half of code
function choosePositions() {
    cCoords[1] = getCnk(6, 3);
    cCoords[0] = [];
    for (let i = 0; i < 6; ++i) {
        let met = false;
        cCoords[1].forEach((item) => {met = (item == i) ? true : met});
        if (!met) {
            cCoords[0].push(i);
        }
    }

    if (getRandomInt(0, 2))  { // are there same positions?
        let i0 = getRandomInt(0, 3); // for cCoords[0]
        let i1 = getRandomInt(0, 3); // for cCoords[1]
        cCoords[0][i0] = cCoords[1][i1];
        cCoords[0].sort((a, b) => a - b);
    }

    let code = [0, 0];
    for (let i = 1; i >= 0; --i) {
        for (let id of cCoords[i]) {
            code[i] += Math.pow(2, id);
        }
    }

    pushCode(code[1]);
    seq.push(3);
    seq.push(3);
    pushCode(code[0]);
}

// define start and finish position of cubes
function genSeq() {
    seq = [];
    choosePositions();
    seq.reverse();
}

// print chosen places for cubes
function printSeq() {
    let label = document.getElementById('label');
    let str = [" ", " "];
    for (let k = 0; k < 2; ++k) {
        for (c of cCoords[k]) {
            str[k] += (c + 1).toString() + " ";
        }
    }
    label.innerText = `Места установки в начале:${str[0]}; в конце:${str[1]}`;
}

// draw code next to the finish
function drawCode(page, font) {
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
}

// draw cubes' position
function drawCubes(page, i) {
    for (let id of cCoords[i]) {
        drawBox(page, CUBE_X[id], CUBE_Y[id], greenColor, 170);
    }
}

// draw robot start place
function drawStart(page, font, i) {
    st = getRandomInt(0, START_Y.length);
    if (i == 1) { // drawing finish field
        drawBox(page, 450, 6130, whiteColor, 300);
        drawText(page, ARROW[0][0], 500, 6200, 200, font, blackColor);
        return;
    }
    let tid = TYPE[st];
    let rnd = getRandomInt(0, 2);
    drawBox(page, START_X[st] - 50, START_Y[st] - 70, whiteColor, 300);
    drawText(page, ARROW[tid][rnd], START_X[st] + ARR_SHIFT[tid], START_Y[st], 200, font, blackColor);
}

// Add field pdf to frame
async function createFieldPdf(filename, i=0) {
    const url = '../pdf/path.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontS = await pdfDoc.embedFont(StandardFonts.Symbol);

    drawCode(pages[0], font);
    drawCubes(pages[0], i);
    drawStart(pages[0], fontS, i);

    if (i == 0) {
        pdfDoc.setTitle('Senior-3-start');
    } else {
        pdfDoc.setTitle('Senior-3-finish');
    }
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}


async function createField() {
    if (seq == null) {
        genSeq();
    }
    printSeq();
    const fieldBytes = await createFieldPdf('field', 0);
    const correctFieldBytes = await createFieldPdf('correct', 1);

    // create merged file
    merged = await PDFDocument.create();
    const fieldPdf = await PDFDocument.load(fieldBytes);
    const correctFieldPdf = await PDFDocument.load(correctFieldBytes);

    const copiedFieldPages = await merged.copyPages(fieldPdf , fieldPdf .getPageIndices());
    copiedFieldPages.forEach((page) => merged.addPage(page));
    const copiedCorrectFieldPages = await merged.copyPages(correctFieldPdf, correctFieldPdf.getPageIndices());
    copiedCorrectFieldPages.forEach((page) => merged.addPage(page));
}

async function downloadField() {
    if (merged == null) {
        createField();
    }
    const bytes = await merged.save();
    download(bytes, "senior-3.pdf", "application/pdf");
}

function refreshPage() {
    seq = null;
    merged = null;
    createField();
}

