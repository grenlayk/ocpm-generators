let colorIds = [0, 1, 0, 1, 0, 1, 0, 1, 0];
let ids = null;
let merged = null;
const N = 28;
let K = 9;
let C_COLORS = [0, 1, 2, 3, 5];

const X_CORNER = 937 - 24;
const Y_CORNER = 1605 - 24;
const DLT = 175.7;
const C_WIDTH = 142.5;//95

// print chosen colors
function printColors() {
    let label = document.getElementById('label');
    label.innerText = `Выбранные цвета: ${names[C_COLORS[0]]}, ${names[C_COLORS[1]]}`;
}

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

    pdfDoc.setTitle('Junior-2');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}

// add 1 / 2 / 3 / 6 cubes of color num to colorIds
function add(num, mx=4) {
    let cnt = getRandomInt(1, mx + 1);
    if (cnt == 4) {
        cnt = 6;
    }
    for (let i = 0; i < cnt; ++i) {
        colorIds.push(num);
    }
    colorIds.shuffle();
}

// choose colors and positions
function chooseIds() {
    add(2);
    add(3);
    let border = Math.min(N - colorIds.length, 6);
    if (border == 4 || border == 5) {
        border = 3;
    }
    add(4, border);
    K = colorIds.length;
    ids = getCnk(N, K);
    C_COLORS.shuffle();
}

async function createField() {
    if (ids == null) {
        colorIds = [0, 0, 0, 0, 0, 1, 1, 1, 1];
        chooseIds();
        printColors();
    }
    merged = await createFieldPdf('field');
}

async function downloadField() {
    if (merged == null) {
        createField();
    }
    download(merged, "junior-2.pdf", "application/pdf");
}

function refreshPage() {
    ids = null;
    merged = null;
    createField();
}
