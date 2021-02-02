let points = null;
let distance = null;
const N = 24;
const W = 6;

// for target
const DLT = 567;
const Y_TARGET_CORNER = 1725;

// for card
const X_CARD_CORNER = 213;
const Y_CARD_CORNER = 423;
const DX = 85;
const DY = 49;

// choose target's points
function genPoints() {
    points = getCnk(N, 4);
}

// print distance to the target
function printDistance() {
    let label = document.getElementById('label');
    label.innerText = `Расстояние до мишени: ${distance}`;
}

// print chosen points
function printPoints() {
    let pts = document.getElementById('points');
    let str = "";
    for (c of points) {
        str += (c + 1).toString() + " ";
    }
    pts.innerText = `Выбранные точки: ${str}`;
}

// draw points on the target
function drawTargets(page) {
    for (let p of points) {
        const x = p % W;
        const y = Math.floor(p / W);
        drawBox(page, 5 + x * DLT, Y_TARGET_CORNER - y * DLT, blackColor, DLT);
    }
}

// Add target pdf to frame
async function createTargetPdf(filename, i=0) {
    const url = '../pdf/laser.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    drawTargets(pages[0]);

    pdfDoc.setTitle('Senior-2-targets');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

// draw codes of points on the card
function drawCodes(page) {
    points.shuffle();
    for (let i = 0; i < points.length; ++i) {
        let number = points[i] + 1;
        console.log(number);
        let deg = 16;
        let y = Y_CARD_CORNER - Math.floor(i / 2) * (DY * 5 - 2);
        let x = X_CARD_CORNER + DX * (i % 2);
        while (deg > 0) {
            if (Math.floor(number / deg) != 0) {
                drawRect(page, x, y, DX, DY, blackColor);
            }
            number = number % deg;
            deg = Math.floor(deg / 2);
            y += DY;
        }
    }
}

// Add card pdf to frame
async function createCardPdf(filename) {
    const url = '../pdf/card-template.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    drawCodes(pages[0]);

    pdfDoc.setTitle('Senior-2-card');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

async function createPdf() {
    if (points == null) {
        genPoints();
        distance = getRandomInt(0, 30);
    }
    printDistance();
    printPoints();
    await createTargetPdf('target');
    await createCardPdf('card');
}


function refreshPage() {
    points = null;
    createPdf();
}