let vs = null;

function printVertices(vs) {
    let dots = document.getElementById('dots');
    dots.innerText = `Выбранные точки: ${vs[0].label()}, ${vs[1].label()}, ${vs[2].label()}`;
}

function getGoalVertices() {
    let vertices = [];
    let ids = [];
    let n = 3;

    for (let i = 0; i < n; i++) {
        ids.sort();
        ids.push(getRandomInt(0, numberOfCrosses - 1 - i));
        for (let j = 0; j < i; ++j) {
            if (ids[i] == ids[j]) {
                ++ids[i];
            }
        }
    }

    for (let i = 0; i < 3; ++i) {
        vertices[i] = new Vertex(ids[i]);
    }
    
    printVertices(vertices)
    return vertices;
}


function drawVertices(vertices, page, font) {
    for (v of vertices) {
        let x = vLeftTopX + cellSize * v.j;
        let y = hLeftTopY - cellSize * v.i;
        const text = "    ";
        drawBox(page, x, y, greenColor);
    }
}

// Add field pdf to frame
async function createFieldPdf(filename, vertices) {
    const url = '../pdf/graph.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawVertices(vertices, pages[0], font);

    pdfDoc.setTitle('Field');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

async function createField() {
    if (vs == null) {
        vs = getGoalVertices();
    }
    await createFieldPdf('field', vs);
}

function refreshPage() {
    vs = null;
    createField();
}
