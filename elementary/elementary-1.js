let col_ids = [0, 1, 0, 1, 0, 1, 0, 1, 0];
let idx = null;
const total = 28;
const chosen = 9;
let chosen_colors = null;

const leftCorner = 937;
const yHight = 1605;
const dt = 175.7;
const cubeWidth = 95;

function drawCubes(page) {
    for (let i = 0; i < chosen; ++i) {
        let x = leftCorner + dt * idx[i];
        let y = yHight;
        let cur_color = colors[chosen_colors[col_ids[i]]];
        drawBox(page, x, y, cur_color, cubeWidth);
    }
}

// Add field pdf to frame
async function createFieldPdf(filename) {
    const url = '../pdf/sort.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    drawCubes(pages[0]);

    pdfDoc.setTitle('Field');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

async function createField() {
    if (idx == null) {
        idx = getCnk(total, chosen);
        chosen_colors  = getCnk(4, 2);
        col_ids.sort(() => Math.random() - 0.5);
        console.log(idx, chosen_colors, col_ids);
    }
    await createFieldPdf('field');
}

function refreshPage() {
    idx = null;
    createField();
}
