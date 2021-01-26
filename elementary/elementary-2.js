let sizes = null;
let pos = [1, 0];
let idxs = null;
const n = 3;

const xCorner = 500;
const yCorner = [2405, 900];
const cubeSize = 145;
const dt = [170, -170];
const textSize = 135;

const resDt = 850;
const resXCorner = 1847;
const resYCorner = [1015, 2287];
const resYDt = [-428, 428];

function drawCubes(page, font) {
    for (let i = 0; i < n; ++i) {
        let x = xCorner;
        let y = yCorner[pos[i]] + idxs[i] * dt[pos[i]];
        let num = sizes[i] * 4 + 4;
        drawBox(page, x, y, colors[sizes[i] + 1], cubeSize);
        drawText(page, num.toString(), x + 30, y + 2, textSize, font, blackColor);
    }
}

function drawCorrectCubes(page, font) {
    for (let i = 0; i < n; ++i) {
        let x = resXCorner + idxs[i] * resDt;
        let y = resYCorner[pos[i]] + (sizes[i]) * resYDt[pos[i]];
        let num = sizes[i] * 4 + 4;
        drawBox(page, x, y, colors[sizes[i] + 1], cubeSize);
        drawText(page, num.toString(), x + 30, y + 2, textSize, font, blackColor);
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
        pdfDoc.setTitle('Correct field');
        drawCorrectCubes(pages[0], font);
    } else {
        pdfDoc.setTitle('Field');
        drawCubes(pages[0], font);
    }

    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

async function createField() {
    if (sizes == null) {
        sizes = [];
        for (let i = 0; i < n; ++i) {
            sizes.push(getRandomInt(0, 2));
        }
        pos.push(getRandomInt(0, 2));
        if (pos[n - 1] == 1) {
            pos.sort((a, b) => a - b);
        }
        idxs = [getRandomInt(0, 6)];
        let arr = getCnk(6, 2);
        console.log(arr);
        idxs = idxs.concat(arr);

        console.log(idxs, sizes, pos);
    }
    await createFieldPdf('field');
    await createFieldPdf('correct', true);
}

function refreshPage() {
    sizes = null;
    pos = [1, 0];
    createField();
}
