let col_ids = [0, 1, 0, 1, 0, 1, 0, 1, 0];
let idx = null;
const total = 28;
let chosen = 9;
let chosen_colors = [0, 1, 2, 3];

const leftCorner = 937 - 24;
const yHight = 1605 - 24;
const dt = 175.7;
const cubeWidth = 142.5;//95

function printColors() {
    let label = document.getElementById('label');
    label.innerText = `Выбранные цвета: ${names[chosen_colors[0]]}, ${names[chosen_colors[1]]}`;
}

function drawCubes(page, font) {
    const textSize = 120;
    for (let i = 0; i < chosen; ++i) {
        let x = leftCorner + dt * idx[i];
        let y = yHight;
        let id = chosen_colors[col_ids[i]];
        const textWidth = font.widthOfTextAtSize(letters[id], textSize);
        const del = (cubeWidth - textWidth) / 2 - 6;
        drawBox(page, x, y, colors[id], cubeWidth);
        drawText(page, letters[id], x + del, y, textSize, font, blackColor);
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

    pdfDoc.setTitle('Field');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

function add(num) {
    let cnt = getRandomInt(2, 4);
    if (cnt >= 4) {
        cnt += 2;
    }
    for (let i = 0; i < cnt; ++i) {
        col_ids.push(num);
    }
}

async function createField() {
    if (idx == null) {
        col_ids = [0, 0, 0, 0, 0, 1, 1, 1, 1];
        chosen_colors = [0, 1, 2, 3];
        add(2);
        add(3);
        chosen = col_ids.length;
        idx = getCnk(total, chosen);
        for (let i = 0; i < 10; ++i) {
            col_ids.sort(() => Math.random() - 0.5);
        }
        chosen_colors.sort(() => Math.random() - 0.5);
        printColors();
    }
    await createFieldPdf('field');
}

function refreshPage() {
    idx = null;
    createField();
}
