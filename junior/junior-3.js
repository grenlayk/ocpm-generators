let vs = null;
let lastColor = null;
let merged = null;

const N = 4;
const CM = 28.345;
const CM_DX = 33;

// print seq of vertices
function printVertices(vs) {
    let dots = document.getElementById('dots');
    dots.innerText = `Последовательность: ${vs[0].label()}->${vs[1].label()}->${vs[2].label()}->${vs[3].label()}`;
}

// choose 4 vertices
function genVertices() {
    let vertices = [];
    let ids = [14];

    let add = getCnk(numberOfCrosses - 1, N - 1);
    for (let i = 0; i < add.length; ++i) {
        if (add[i] >= 14) {
            ++add[i];
        }
    }
    add.shuffle();
    ids = ids.concat(add);
    for (let i = 0; i < ids.length; ++i) {
        vertices[i] = new Vertex(ids[i]);
    }
    printVertices(vertices)
    return vertices;
}

// draw cubes according to code
function drawCubes(page, shift, font) {
    const textSize = 150;
    for (let k = shift; k < N; k++) {
        let x = vLeftTopX + cellSize * vs[k].j;
        let y = hLeftTopY - cellSize * vs[k].i;
        let id = vs[(k + 1 - shift) % N].i;
        if (shift == 0 && k == N - 1) {
            id = lastColor;
        }
        const textWidth = font.widthOfTextAtSize(letters[id], textSize);
        const dt = (150 - textWidth) / 2 + 5;
        drawBox(page, x, y, colors[id]);
        drawText(page, letters[id], x + dt, y + 4, textSize, font, rgb(0,0,0));
    }
    if (shift) { // after finish field
        let x = 500;
        let y = 1400;
        drawBox(page, x, y, colors[lastColor]);
        const textWidth = font.widthOfTextAtSize(letters[lastColor], textSize);
        const dt = (150 - textWidth) / 2 + 5;
        drawText(page, letters[lastColor], x + dt, y + 4, textSize, font, rgb(0,0,0));
    }
}

// Draw code on field
function drawCode(page) {
    const code_colors = [0, 1, 0, 1, 0, 1];
    let sum = 0;
    drawRect(page, lineTopX, lineTopY, 841, lineY, bwcolor[0]);
    for (let i = 0; i < code_colors.length; i++) {
        let width = 2;
        if (code_colors[i]) {
            width = vs[1 + Math.floor(i/2)].j + 1;
        }
        drawRect(page, lineTopX + CM_DX * sum, lineTopY, 
            width * CM_DX + EPS, lineY, bwcolor[code_colors[i]]);
        sum += width;
    }
}

// Add field pdf to frame
async function createFieldPdf(filename, shift=0) {
    const url = '../pdf/graph.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawCode(pages[0]);
    drawCubes(pages[0], shift, font);

    pdfDoc.setTitle('Junior-3-start');
    if (shift) {
        pdfDoc.setTitle('Junior-3-finish');
    }
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}


// Draw code pdf to print
function drawCodePaper(page) {
    const code_colors = [0, 1, 0, 1, 0, 1];
    let sum = 0;
    drawRect(page, codeLineTopX, codeLineTopY - 649.5, codeLineX, 715, bwcolor[0]);
    for (let i = 0; i < code_colors.length; i++) {
        let width = 2;
        if (code_colors[i]) {
            width = vs[1 + Math.floor(i/2)].j + 1;
        }
        sum += width;
        drawRect(page, codeLineTopX, codeLineTopY + codeLineY - sum * CM - 0.5,
            codeLineX, width * CM + 0.3, bwcolor[code_colors[i]]);
    }
}

// Add code pdf to frame
async function createCodePdf(filename) {
    const url = '../pdf/senior-code-template.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    drawCodePaper(pages[0]);

    pdfDoc.setTitle('Junior-3-code');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}

async function createField() {
    if (vs == null) {
        vs = genVertices();
    }
    const fieldBytes = await createFieldPdf('field', shift=0);
    const correctFieldBytes = await createFieldPdf('correct', shift=1);
    const codeBytes = await createCodePdf('code');

    // create merged file
    merged = await PDFDocument.create();
    const fieldPdf = await PDFDocument.load(fieldBytes);
    const correctFieldPdf = await PDFDocument.load(correctFieldBytes);
    const codePdf = await PDFDocument.load(codeBytes);

    const copiedFieldPages = await merged.copyPages(fieldPdf, fieldPdf.getPageIndices());
    copiedFieldPages.forEach((page) => merged.addPage(page));
    const copiedCorrectFieldPages = await merged.copyPages(correctFieldPdf, correctFieldPdf.getPageIndices());
    copiedCorrectFieldPages.forEach((page) => merged.addPage(page));
    const codePages = await merged.copyPages(codePdf, codePdf.getPageIndices());
    codePages.forEach((page) => merged.addPage(page));
}

async function downloadField() {
    if (merged == null) {
        createField()
    }
    const bytes = await merged.save();
    download(bytes, "junior-3.pdf", "application/pdf");
}

function refreshPage() {
    vs = null;
    merged = null;
    lastColor = getRandomInt(0, N + 1);
    createField();
}
