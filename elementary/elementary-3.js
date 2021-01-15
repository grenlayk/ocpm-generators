let vs = null;

function getGoalVertices() {
    let vertices = [];
    let ids = [0, 0];
    ids[0] = getRandomInt(0, numberOfCrosses - 1);
    ids[1] = getRandomInt(0, numberOfCrosses - 2);
    ids.sort();
    if (ids[1] == ids[0]) {
        ++ids[1];
    }
    ids.push(getRandomInt(0, numberOfCrosses - 3));
    
    if (ids[2] == ids[0]) {
        ++ids[2];
    }
    if (ids[2] == ids[1]) {
        ++ids[2];
    }

    for (let i = 0; i < 3; ++i) {
        vertices[i] = new Vertex(ids[i]);
    }
    return vertices;
}


function drawVertices(vertices, page, font) {
    for (v of vertices) {
        let x = vLeftTopX + cellSize * v.j;
        let y = hLeftTopY - cellSize * v.i;
        const text = "    ";
        draw(page, font, text.toString(), x, y, true);
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
    let dots = document.getElementById('dots');
    dots.innerText = vs[0].label() + "_" + vs[1].label() + "_" + vs[2].label();
    await createFieldPdf('field', vs);
}

function refreshPage() {
    vs = null;
    await createField();
}
