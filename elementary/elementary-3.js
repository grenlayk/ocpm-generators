function getGoalVertices() {
    let vertices = [];
    while (vertices.length < 3) {
        let vertex = new Vertex(getRandomInt(0, numberOfCrosses - 1));
        let ok;
        do {
            ok = true;
            for (v of vertices) {
                if (v.id == vertex.id) {
                    ok = false;
                }
            }
        } while (!ok);
        vertices.push(vertex);
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


function updateField() {
    let vs = getGoalVertices();
    const div = document.getElementById('dots');
    div.innerHTML = "";
    for (v of vs) {
        console.log(v.label());
        div.innerHTML += v.label() + " ";
    }
    createFieldPdf('field', vs);
}
