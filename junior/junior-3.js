let vs = null;
const n = 4;
let lastColor = null;

const cm = 28.345;
const lineXcm = 33;

function printVertices(vs) {
    let dots = document.getElementById('dots');
    dots.innerText = `${vs[0].label()}->${vs[1].label()}->${vs[2].label()}->${vs[3].label()}`;
}

function getVertices() {
    let vertices = [];
    let ids = [14];

    for (let i = 1; i < n; i++) {
        ids.sort((a, b) => a - b);;
        ids.push(getRandomInt(0, numberOfCrosses - 1 - i));
        for (let j = 0; j < i; ++j) {
            if (ids[i] == ids[j]) {
                ++ids[i];
            }
        }
    }

    ids.sort(() => Math.random() - 0.5);
    for (let i = n - 1; i >= 1; --i) {
        if (ids[i] == 14) {
            ids[i] = ids[i - 1];
            ids[i - 1] = 14;
        }
    }

    for (let i = 0; i < n; ++i) {
        vertices[i] = new Vertex(ids[i]);
    }

    printVertices(vertices)

    return vertices;
}


function drawCubes(page, shift, font) {
    const textSize = 150;
    for (let k = shift; k < n; k++) {
        let x = vLeftTopX + cellSize * vs[k].j;
        let y = hLeftTopY - cellSize * vs[k].i;
        let id = vs[(k + 1 - shift) % n].i;
        if (shift == 0 && k == n - 1) {
            id = lastColor;
        }
        const textWidth = font.widthOfTextAtSize(letters[id], textSize);
        const dt = (150 - textWidth) / 2 + 5;
        drawBox(page, x, y, colors[id]);
        drawText(page, letters[id], x + dt, y, textSize, font, rgb(0,0,0));
    }
    if (shift) {
        let x = 500;
        let y = 1400;
        drawBox(page, x, y, colors[lastColor]);
        const textWidth = font.widthOfTextAtSize(letters[id], textSize);
        const dt = (150 - textWidth) / 2 + 5;
        drawText(page, letters[lastColor], x + dt, y, textSize, font, rgb(0,0,0));
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
        drawRect(page, lineTopX + lineXcm * sum, lineTopY, 
            width * lineXcm + EPS, lineY, bwcolor[code_colors[i]]);
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

    pdfDoc.setTitle('Field');
    if (shift) {
        pdfDoc.setTitle('Correct field');
    }
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
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
        drawRect(page, codeLineTopX, codeLineTopY + codeLineY - sum * cm - 0.5,
            codeLineX, width * cm + 0.3, bwcolor[code_colors[i]]);
    }
}

// Add code pdf to frame
async function createCodePdf(filename) {
    const url = '../pdf/senior-code-template.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    drawCodePaper(pages[0]);

    pdfDoc.setTitle('Code');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

async function createField() {
    if (vs == null) {
        vs = getVertices();
    }
    await createFieldPdf('field', shift=0);
    await createFieldPdf('correct', shift=1);
    await createCodePdf('code');
}

function refreshPage() {
    vs = null;
    lastColor = getRandomInt(0, n);
    createField();
}
