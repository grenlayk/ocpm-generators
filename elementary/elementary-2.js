let sizes = null;
let pos = [1, 0];
let ids = null;
const N = 3;

const X_CORNER = 500;
const Y_CORNER = [2405, 900];
const C_WIDTH = 145;
const DLT = [170, -170];
const TEXT_SIZE = 135;

const F_DLT = 850;
const F_X_CORNER = 1847;
const F_Y_CORNER = [1015, 2287];
const F_Y_DLT = [-428, 428];

// draw cubes on the start field
function drawCubes(page, font) {
    for (let i = 0; i < N; ++i) {
        let x = X_CORNER;
        let y = Y_CORNER[pos[i]] + ids[i] * DLT[pos[i]];
        let num = sizes[i] * 4 + 4;
        drawBox(page, x, y, colors[sizes[i] + 1], C_WIDTH);
        drawText(page, num.toString(), x + 30, y + 2, TEXT_SIZE, font, blackColor);
    }
}

// draw cubes on the finish field
function drawCorrectCubes(page, font) {
    for (let i = 0; i < N; ++i) {
        let x = F_X_CORNER + ids[i] * F_DLT;
        let y = F_Y_CORNER[pos[i]] + (1 - sizes[i]) * F_Y_DLT[pos[i]];
        let num = sizes[i] * 4 + 4;
        drawBox(page, x, y, colors[sizes[i] + 1], C_WIDTH);
        drawText(page, num.toString(), x + 30, y + 2, TEXT_SIZE, font, blackColor);
    }
}

// Add field pdf to frame
async function createFieldPdf(filename, correct=false) {
    const url = '../pdf/coords.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    if (correct) {
        pdfDoc.setTitle('Elementary-2-finish');
        drawCorrectCubes(pages[0], font);
    } else {
        pdfDoc.setTitle('Elementary-2-start');
        drawCubes(pages[0], font);
    }

    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

function genField() {
    sizes = [];
    for (let i = 0; i < N; ++i) {
        sizes.push(getRandomInt(0, 2));
    }
    pos.push(getRandomInt(0, 2));
    if (pos[N - 1] == 1) {
        pos.sort((a, b) => a - b);
    }
    ids = [getRandomInt(0, 6)];
    let arr = getCnk(6, 2);
    ids = ids.concat(arr);
}

async function createField() {
    if (sizes == null) {
        genField();
    }
    await createFieldPdf('field');
    await createFieldPdf('correct', true);
}

function refreshPage() {
    sizes = null;
    pos = [1, 0];
    createField();
}
