let colorIds = [0, 1, 0, 1, 0, 1, 0, 1, 0];
let ids = null;
const N = 28;
const K = 9;
let C_COLORS = null;
let merged = null;
const X_CORNER = 913;
const Y_CORNER = 1605 - 24;
const DLT = 175.7;
const C_WIDTH = 142.5;

// draw cubes on the field
function drawCubes(page, font) {
    const textSize = 120;
    for (let i = 0; i < K; ++i) {
        let x = X_CORNER + DLT * ids[i];
        let y = Y_CORNER;
        let id = C_COLORS[colorIds[i]];
        const textWidth = font.widthOfTextAtSize(letters[id], textSize);
        const delta = (C_WIDTH - textWidth) / 2 - 6;
        drawBox(page, x, y, colors[id], C_WIDTH);
        drawText(page, letters[id], x + delta, y, textSize, font, blackColor);
    }
}

// Add field pdf to frame
async function createFieldPdf(filename) {
    const url = '../pdf/sort.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawCubes(pages[0], font);

    pdfDoc.setTitle('Elementary-1');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes
}

async function createField() {
    if (ids == null) {
        ids = getCnk(N, K);
        C_COLORS  = getCnk(4, 2);
        colorIds.shuffle();
    }
    merged = await createFieldPdf('field');
}

async function downloadField() {
    if (merged == null) {
        createField()
    }
    download(merged, "elementary-1.pdf", "application/pdf");
}

function refreshPage() {
    ids = null;
    merged = null;
    createField();
}
