let vs = null;
const N = 3;

function printVertices(vs) {
    let dots = document.getElementById('dots');
    dots.innerText = `Выбранные точки: ${vs[0].label()}, ${vs[1].label()}, ${vs[2].label()}`;
}

// choose vertices
function genVertices() {
    let vertices = [];
    let ids = getCnk(numberOfCrosses, N);
    for (let i = 0; i < N; ++i) {
        vertices[i] = new Vertex(ids[i]);
    }
    printVertices(vertices);
    return vertices;
}

// draw chosen vertices
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
        vs = genVertices();
    }
    await createFieldPdf('field', vs);
}

function refreshPage() {
    vs = null;
    createField();
}