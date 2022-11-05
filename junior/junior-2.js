let element_types = [0, 0, 0, 1, 1, 1];
let frame_ids = null;
let merged = null;
let pos = [1, 1, 1, 0, 0, 0];
let ids = [0, 2, 4, 1, 3, 5]
const N = 6;

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
        if (element_types[i] == 0) {
            let label = 'o';
            drawCircle(page, x + C_WIDTH / 2, y + C_WIDTH / 2, colors[element_types[i] + 1], C_WIDTH / 2);
            drawText(page, label.toString(), x + 30, y + 12, TEXT_SIZE, font, blackColor);
        } else {
            let label = 'k';
            drawBox(page, x, y, colors[element_types[i] + 1], C_WIDTH);
            drawText(page, label.toString(), x + 30, y + 2, TEXT_SIZE, font, blackColor);
        }
    }
    for (let i = 0; i < N; ++i) {
        let x_coord = Math.floor((frame_ids[i] % 18) / 3);
        let y_coord = frame_ids[i] % 3;
        let sign = 1 - Math.floor(frame_ids[i] / 18);

        let x = F_X_CORNER + x_coord * F_DLT;
        let y = F_Y_CORNER[sign] + y_coord * F_Y_DLT[sign];
        drawFrame(page, x - C_WIDTH / 2, y - C_WIDTH / 2, redColor, width = 40, sz = C_WIDTH * 2)
    }
}

// draw cubes on the finish field
function drawCorrectCubes(page, font) {
    for (let i = 0; i < N; ++i) {
        let x_coord = Math.floor((frame_ids[i] % 18) / 3);
        let y_coord = frame_ids[i] % 3;
        let sign = 1 - Math.floor(frame_ids[i] / 18);
        let color_id = frame_ids[i] % 2 + 1;

        let x = F_X_CORNER + x_coord * F_DLT;
        let y = F_Y_CORNER[sign] + y_coord * F_Y_DLT[sign];
        
        if (frame_ids[i] % 2 == 0) {
            let label = 'o';
            drawCircle(page, x + C_WIDTH / 2, y + C_WIDTH / 2, colors[color_id], C_WIDTH / 2);
            drawText(page, label.toString(), x + 30, y + 12, TEXT_SIZE, font, blackColor);
        } else {
            let label = 'k';
            drawBox(page, x, y, colors[color_id], C_WIDTH);
            drawText(page, label.toString(), x + 30, y + 2, TEXT_SIZE, font, blackColor);
        }

        drawFrame(page, x - C_WIDTH / 2, y - C_WIDTH / 2, redColor, width = 40, sz = C_WIDTH * 2)
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
        pdfDoc.setTitle('Junior-2-finish');
        drawCorrectCubes(pages[0], font);
    } else {
        pdfDoc.setTitle('Junior-2-start');
        drawCubes(pages[0], font);
    }

    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}

function genFrames() {
    let ball_frame_ids = getCnk(18, 3);
    let cubes_frame_ids = getCnk(18, 3);
    for (i in ball_frame_ids) {
        ball_frame_ids[i] = 2 * ball_frame_ids[i];
        cubes_frame_ids[i] = 2 * cubes_frame_ids[i] + 1;
    }
    let frame_ids = ball_frame_ids.concat(cubes_frame_ids)
    frame_ids.sort((a, b) => a - b);
    return frame_ids;
}

function checkFrames(frame_ids) {
    for (let i = 0; i < N - 1; ++i) {
        if (Math.floor(frame_ids[i] / 3) == Math.floor(frame_ids[i + 1] / 3)) {
            return false;
        }
    }
    return true;
}

function genField() {
    if (getRandomInt(0, 2) == 1) {
        pos = [1, 1, 1, 0, 0, 0];
    } else {
        pos = [0, 0, 0, 1, 1, 1];
    }
    frame_ids = genFrames();
    while (!checkFrames(frame_ids)) {
        frame_ids = genFrames();
    }
}

async function createField() {
    if (merged == null) {
        genField();
    }

    const fieldBytes = await createFieldPdf('field');
    const correctFieldBytes = await createFieldPdf('correct', true);

    // create merged file
    merged = await PDFDocument.create();
    const fieldPdf = await PDFDocument.load(fieldBytes);
    const correctFieldPdf = await PDFDocument.load(correctFieldBytes);

    const copiedFieldPages = await merged.copyPages(fieldPdf, fieldPdf.getPageIndices());
    copiedFieldPages.forEach((page) => merged.addPage(page));
    const copiedCorrectFieldPages = await merged.copyPages(correctFieldPdf, correctFieldPdf.getPageIndices());
    copiedCorrectFieldPages.forEach((page) => merged.addPage(page));
}

async function downloadField() {
    if (merged == null) {
        createField();
    }
    const bytes = await merged.save();
    download(bytes, "junior-2.pdf", "application/pdf");
}

function refreshPage() {
    pos = [1, 1, 1, 0, 0, 0];
    frame_ids = null;
    merged = null;
    createField();
}