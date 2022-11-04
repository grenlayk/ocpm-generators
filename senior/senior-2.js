let points = null;
let distance = null;
let merged = null;
const N = 24;
const W = 6;

// for target
const DLT = 567;
const Y_TARGET_CORNER = 1725;

// for card
const X_CARD_CORNER = 233;
const Y_CARD_CORNER = 377;
const DX = 85;
const DY = 54;

function isRestrictionCorrect(points) {
    for (c of points) {
        if (c >= 12) {
            continue
        }
        // Reflect point (0 -> 18, 1 -> 19, ..., 6 -> 12, 7->13 ..)
        opposite_point = c + 18  - Math.floor(c / 6) * 12
        for (o_c of points) {
            if (o_c == opposite_point) {
                return false
            }
        }
    }
    return true
}

// choose target's points
function genPoints() {
    points = getCnk(N, 5);
    while (!isRestrictionCorrect(points)) {
        points = getCnk(N, 5);
    }
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
function drawTargets(page, font) {
    for (let p of points) {
        const x = p % W;
        const y = Math.floor(p / W);
        drawCircle(page, 5 + x * DLT + DLT / 2, Y_TARGET_CORNER - y * DLT + DLT / 2, blueColor, DLT / 6);
    }
    for (let i = 0; i < N; ++i) {
        const x = i % W;
        const y = Math.floor(i / W);
        drawText(page, (i + 1).toString(), 15 + x * DLT, Y_TARGET_CORNER - y * DLT, 60, font, blackColor);
    }
}

// Add target pdf to frame
async function createTargetPdf(filename, i=0) {
    const url = '../pdf/laser.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawTargets(pages[0], font);

    pdfDoc.setTitle('Senior-2-target');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}

// draw codes of points on the card
function drawCodes(page) {
    points.shuffle();
    for (let i = 0; i < points.length; ++i) {
        let number = points[i] + 1;
        let deg = 16;
        let y = Y_CARD_CORNER - Math.floor(i / 2) * (DY * 5 + 2);
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

async function createPdf() {
    if (points == null) {
        genPoints();
        distance = getRandomInt(0, 30);
    }
    printDistance();
    printPoints();
    const targetBytes = await createTargetPdf('target');

    // create merged file
    merged = await PDFDocument.create();
    const targetPdf = await PDFDocument.load(targetBytes);

    const copiedTargetPages = await merged.copyPages(targetPdf, targetPdf.getPageIndices());
    copiedTargetPages.forEach((page) => merged.addPage(page));
}

async function downloadField() {
    if (merged == null) {
        createField();
    }
    const bytes = await merged.save();
    download(bytes, "senior-2.pdf", "application/pdf");
}

function refreshPage() {
    points = null;
    merged = null;
    createPdf();
}