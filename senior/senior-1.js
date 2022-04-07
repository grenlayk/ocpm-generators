const INF = 10000;
const START_VERTEX = 14;

let edges = null;
let merged = null;
let fieldBytes = null;

class Edge {
    constructor(v, u, weight) {
        this.v = v;
        this.u = u;
        this.weight = weight;
    }

    logMessage() {
        return this.v.label() + " <-> " + this.u.label() + " : " + this.weight;
    }

    getEdgeData() {
        return [this.v.label(), this.u.label(), this.weight];
    }
}

//  trigger browser to download edges list
function downloadEdges() {
    let edgesData = [];
    for (const edge of edges) {
        edgesData.push(edge.getEdgeData());
    }
    const element = document.getElementById("exportJSON");
    const data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(edgesData));
    element.setAttribute("href", "data:" + data);
    element.setAttribute("download", "data.json");
}


//  check if vertices are neighbors or not
function isNeighbors(v, u) {
    return Math.abs(v.i - u.i) + Math.abs(v.j - u.j) == 1;
}

//  add edges to the graph
function createEdges() {
    let edges = [];
    for (let vId = 0; vId < numberOfCrosses; vId++) {
        const v = new Vertex(vId);
        for (let uId = vId + 1; uId < numberOfCrosses; uId++) {
            const u = new Vertex(uId);
            if (isNeighbors(v, u)) {
                edges.push(new Edge(v, u, getRandomInt(10, 51)));
            }
        }
    }
    return edges;
}

//  convert edges list to table
function createEdgesTable(edges) {
    const edgesTable = new Array(numberOfCrosses);
    for (let i = 0; i < numberOfCrosses; i++) {
        edgesTable[i] = new Array(numberOfCrosses);
        for (let j = 0; j < numberOfCrosses; j++) {
            edgesTable[i][j] = INF;
        }
    }
    for (const edge of edges) {
        edgesTable[edge.v.id][edge.u.id] = edge.weight;
        edgesTable[edge.u.id][edge.v.id] = edge.weight;
    }
    return edgesTable;
}


//  choose destination
function chooseVertex() {
    let vertex = new Vertex(getRandomInt(0, numberOfCrosses));
    while (vertex.i == 2 && vertex.j < 5 || vertex.j == 0) {
        vertex = new Vertex(getRandomInt(0, numberOfCrosses));
    }
    return vertex;
}


// draw weights of edges
function drawEdges(firstPage, font, edges, green = false) {
    for (edge of edges) {
        let x = 0, y = 0;
        if (edge.v.j == edge.u.j) { // vertical edge
            x = vLeftTopX + cellSize * edge.v.j;
            y = vLeftTopY - cellSize * Math.min(edge.v.i, edge.u.i);
        } else { // horizontal edge
            x = hLeftTopX + cellSize * Math.min(edge.v.j, edge.u.j)
            y = hLeftTopY - cellSize * edge.v.i;
        }
        const text = edge.weight;
        draw(firstPage, font, text.toString(), x, y, green);
    }
}

// find shortest path
function getShortestPathEdges(edges, goalVertex) {
    // init
    const startVertex = new Vertex(START_VERTEX);
    const w = createEdgesTable(edges);
    let distance = new Array(numberOfCrosses);
    let isUsed = new Array(numberOfCrosses);
    let parent = new Array(numberOfCrosses);
    for (let i = 0; i < numberOfCrosses; i++) {
        distance[i] = INF;
        isUsed[i] = false;
        parent[i] = null;
    }
    distance[startVertex.id] = 0;

    // dijkstra
    let currentVertex = startVertex;
    for (let i = 0; i < numberOfCrosses; i++) {
        const id = currentVertex.id;
        isUsed[id] = true;
        for (let j = 0; j < numberOfCrosses; j++) {
            const otherVertex = new Vertex(j);
            if (isNeighbors(currentVertex, otherVertex) && distance[j] > distance[id] + w[j][id] && !isUsed[j]) {
                distance[j] = distance[id] + w[j][id];
                parent[j] = currentVertex;
            }
        }
        let minVertexId = 0;
        let minD = INF + 1;
        for (let j = 0; j < numberOfCrosses; ++j) {
            if (!isUsed[j] && distance[j] < minD) {
                minVertexId = j;
                minD = distance[j];
            }
        }
        currentVertex = new Vertex(minVertexId);
    }

    // find path
    let pathVertex = goalVertex;
    let result = new Array();
    while (pathVertex.id != startVertex.id) {
        result.push(new Edge(pathVertex, parent[pathVertex.id], w[pathVertex.id][parent[pathVertex.id].id]));
        pathVertex = parent[pathVertex.id];
    }
    return result;
}

// Draw code on field
function drawCode(goalVertex, page) {
    const colors = [1, 0, 1];
    let id = (goalVertex.j + 1) * 10 + (goalVertex.i + 1);
    for (let i = 0; i <= 6; i++) {
        colors.push((id >> i) & 1);
    }
    for (let i = 0; i < colors.length; i++) {
        drawRect(page, lineTopX + lineX * i, lineTopY, lineX + EPS, 
            lineY, bwcolor[colors[i]]);
    }
}


// Create field pdf with weights and the shortest path
async function createFieldPdf(divname, edges, drawShortest = false, goalVertex = null) {
    const url = '../pdf/graph.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    pdfDoc.setTitle('Senior-1-edges');
    pdfDoc.setAuthor('mosrobotics');

    // Modify pdf
    drawEdges(pages[0], font, edges);
    if (drawShortest) {
        drawCode(goalVertex, pages[0]);
        pathEdges = getShortestPathEdges(edges, goalVertex);
        drawEdges(pages[0], font, pathEdges, green = true);
        pdfDoc.setTitle('Senior-1-path');
    }

    // Add pdf to frame
    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, divname);
    return pdfResultBytes;
}


// Draw code pdf to print
function drawCodePaper(goalVertex, page) {
    const colors = [1, 0, 1];
    let id = (goalVertex.j + 1) * 10 + (goalVertex.i + 1);
    for (let i = 0; i <= 6; i++) {
        colors.push((id >> i) & 1);
    }
    for (let i = 0; i < colors.length; i++) {
        drawRect(page, codeLineTopX, codeLineTopY - i * codeLineY, 
            codeLineX, codeLineY + 0.3, bwcolor[colors[i]]);
    }
}


// Add code pdf to frame
async function createCodePdf(filename, goalVertex) {
    const url = '../pdf/senior-code-template.pdf';
    const pdfBytes = await fetchBinaryAsset(url);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    drawCodePaper(goalVertex, pages[0]);

    pdfDoc.setTitle('Senior-1-code');
    pdfDoc.setAuthor('mosrobotics');

    const pdfResultBytes = await pdfDoc.save();
    renderInIframe(pdfResultBytes, filename);
    return pdfResultBytes;
}

// create edges list and draw edges on the field
async function createField() {
    edges = createEdges();
    const field = await createFieldPdf('field', edges);
    return field;
}

function findFinish() {
    let bestVertex = null;
    let best_dist = 1000;
    const w = createEdgesTable(edges);
    for (let i = 0; i < numberOfCrosses; i++) {
        const currentVertex = new Vertex(i);
        if (i == 0 || i == 6 || i == 28 || i == 34) {
            continue;
        }
        let dist = 0;
        for (let j = 0; j < numberOfCrosses; j++) {
            const otherVertex = new Vertex(j);
            if (isNeighbors(currentVertex, otherVertex)) {
                dist += w[j][i]
            }
        }
        if (dist < best_dist) {
            bestVertex = currentVertex
            best_dist = dist
            console.log(bestVertex.i, bestVertex.j, best_dist)
        }
    }
    return bestVertex;
}

async function createVertex() {
    if (edges == null) {
        fieldBytes = await createField();
    }
    // choose goal vertex
    const goalVertex = chooseVertex();
    // modify edges
    const diff = (goalVertex.i + 1) + (goalVertex.j + 1) * 10
    for (let e of edges) {
        e.weight = (e.weight + diff) % 51;
    }
    // draw shortest path and code on field then draw code for print
    const pathBytes = await createFieldPdf('path', edges, true, goalVertex);
    const codeBytes = await createCodePdf('code', goalVertex);

    // create merged file
    merged = await PDFDocument.create();
    const fieldPdf = await PDFDocument.load(fieldBytes);
    const pathPdf = await PDFDocument.load(pathBytes);
    const codePdf = await PDFDocument.load(codeBytes);

    const copiedFieldPages = await merged.copyPages(fieldPdf, fieldPdf.getPageIndices());
    copiedFieldPages.forEach((page) => merged.addPage(page));
    const copiedPathPages = await merged.copyPages(pathPdf, pathPdf.getPageIndices());
    copiedPathPages.forEach((page) => merged.addPage(page));
    const copiedCodePages = await merged.copyPages(codePdf, codePdf.getPageIndices());
    copiedCodePages.forEach((page) => merged.addPage(page));
    // find finish 
    const bestVertex = findFinish();
    let label = document.getElementById('label');
    label.innerText = `Финиш: x = ${bestVertex.j + 1}, y = ${bestVertex.i + 1}`;
    console.log(bestVertex.i, bestVertex.j)
    // demodify edges
    for (let e of edges) {
        e.weight = (e.weight - diff + 51) % 51;
    }
    
}

async function downloadField() {
    if (merged == null) {
        createVertex();
    }
    const bytes = await merged.save();
    download(bytes, "senior-1.pdf", "application/pdf");
}

function refreshPage() {
    edges = null;
    merged = null;
    createVertex();
}
