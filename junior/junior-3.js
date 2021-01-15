let vs = null;
let n = 4;
let lastColor = null;

function printVertices(vs) {
    let dots = document.getElementById('dots');
    dots.innerText = `${vs[0].label()}->${vs[1].label()}->${vs[2].label()}->${vs[3].label()}`;
}

function getVertices() {
    let vertices = [];
    let ids = [14];

    for (let i = 1; i < n; i++) {
        ids.sort();
        ids.push(getRandomInt(0, numberOfCrosses - 1 - i));
        for (let j = 0; j < i; ++j) {
            if (ids[i] == ids[j]) {
                ++ids[i];
            }
        }
    }

    ids.sort(() => Math.random() - 0.5);
    for (let i = n - 1; i >= 1; --i) {
        if (ids[i] == 14) {
            ids[i] = ids[i - 1];
            ids[i - 1] = 14;
        }
    }

    for (let i = 0; i < n; ++i) {
        vertices[i] = new Vertex(ids[i]);
    }

    printVertices(vertices)

    return vertices;
}


function drawVertices(page, shift) {
    let colors = [rgb(1, 0, 0), rgb(1, 1, 0), rgb(0.196078, 0.80392, 0.196078), rgb(0, 0, 1), rgb(1, 1, 1)];
    for (let k = shift; k < n; k++) {
        let x = vLeftTopX + cellSize * vs[k].j;
        let y = hLeftTopY - cellSize * vs[k].i;
        let color = colors[vs[(k + 1 - shift) % n].i];
        if (shift == 0 && k == n - 1) {
            color = colors[lastColor];
        }
        drawBox(page, x, y, color);
    }
    if (shift) {
        let x = 500;
        let y = 1400;
        drawBox(page, x, y, colors[lastColor]);
    }
}

// Add field pdf to frame
async function createFieldPdf(filename, shift=0) {
    const url = '../pdf/graph.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    drawVertices(pages[0], shift);

    pdfDoc.setTitle('Field');
    if (shift) {
        pdfDoc.setTitle('Correct field');
    }
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
}

async function createField() {
    if (vs == null) {
        vs = getVertices();
    }
    await createFieldPdf('field', shift=0);
    await createFieldPdf('correct', shift=1);
}

function refreshPage() {
    vs = null;
    lastColor = getRandomInt(0, n);
    createField();
}
