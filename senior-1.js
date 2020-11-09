// Library from https://github.com/Hopding/pdf-lib
const { 
  PDFDocument, 
  StandardFonts, 
  rgb, 
  degrees 
} = PDFLib;

const xLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ж"];
const yLabels = ["1", "2", "3", "4", "5"];
const numberOfCrosses = xLabels.length * yLabels.length;

const INF = 10000;
const START_VERTEX = 14;
const EPS = 2;

// for edges painting
const cellSize = 568;
const hLeftTopX = 3020; // for horizontal lines
const hLeftTopY = 2700; // for horizontal lines
const vLeftTopX = 2740; // for vertical lines
const vLeftTopY = 2430; // for vertical lines

// for code painting
const lineX = 84;
const lineY = 595;
const color = [rgb(1, 1, 1), rgb(0, 0, 0)];
const lineTopX = 1120;
const lineTopY = 1325;

// for code pdf
const codeLineTopX = 38;
const codeLineTopY = 740.9;
const codeLineX = 534.5;
const codeLineY = 72.1;

let edges = null;

class Vertex {
  constructor(id) {
    this.i = parseInt(id / xLabels.length);
    this.j = id % xLabels.length;
    this.id = id;
  }

  label() {
    return xLabels[this.j] + yLabels[this.i];
  }
}


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
    return [ this.v.label(), this.u.label(), this.weight ];
  }
}


function downloadEdges() {
  let edgesData = [];
  for (const edge of edges) {
    edgesData.push(edge.getEdgeData());
  }
  const element = document.getElementById("exportJSON");
  const data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(edgesData));
  element.setAttribute("href", "data:"+data);
  element.setAttribute("download", "data.json");
}


// random integer number in range [min; max]
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * Math.floor(max - min));
}


function isNeighbor(v, u) {
  return Math.abs(v.i - u.i) + Math.abs(v.j - u.j) == 1;
}


function createEdges() {
  let edges = [];
  for (let vId = 0; vId < numberOfCrosses; vId++) {
    const v = new Vertex(vId);
    for (let uId = vId + 1; uId < numberOfCrosses; uId++) {
      const u = new Vertex(uId);
      if (isNeighbor(v, u)) {
        edges.push(new Edge(v, u, getRandomInt(10, 50)));
      }
    }
  }
  return edges;
}


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


function draw(page, font, text, x, y, green = false) {
  const textSize = 150;
  const textWidth = font.widthOfTextAtSize(text, textSize);
  const textHeight = font.heightAtSize(textSize);

  let backgroundColor = rgb(1, 1, 1);
  if (green) { // let's color shortest path 
    backgroundColor = rgb(0.1, 0.9, 0.1);
  }

  // Draw a box around the string of text
  page.drawRectangle({
    x: x - 10,
    y: y - 20,
    width: textWidth + 20,
    height: textHeight + 5,
    color: backgroundColor,
  })

  page.drawText(text, {
    x: x,
    y: y,
    size: textSize,
    font: font,
    color: rgb(0, 0, 0),
  })
}


function getGoalVertex() {
  let vertex = new Vertex(getRandomInt(0, numberOfCrosses - 1));
  while (vertex.i == 2 && vertex.j < 5 || vertex.j == 0) {
    vertex = new Vertex(getRandomInt(0, numberOfCrosses - 1));
  }
  return vertex;
}


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
      if (isNeighbor(currentVertex, otherVertex) && distance[j] > distance[id] + w[j][id] && !isUsed[j]) {
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


function drawCode(goalVertex, page) {
  const colors = [1, 0, 1];
  let id = (goalVertex.j + 1) * 10 + (goalVertex.i + 1);
  for (let i = 0; i <= 6; i++) {
    colors.push((id >> i) & 1);
  }
  for (let i = 0; i < colors.length; i++) {
    page.drawRectangle({
      x: lineTopX + lineX * i,
      y: lineTopY,
      width: lineX + EPS,
      height: lineY,
      color: color[colors[i]],
    })
  }
}


const fetchBinaryAsset = (asset) =>
  fetch(`${asset}`).then((res) => res.arrayBuffer());


const renderInIframe = (pdfBytes, divName) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  document.getElementById(divName).src = blobUrl;
};


// Create field pdf with weights and the shortest path
async function createFieldPdf(divname, edges, drawShortest = false, goalVertex = null) {
  const url = 'pdf/graph.pdf';
  const pdfBytes = await fetchBinaryAsset(url);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // Modify pdf
  drawEdges(pages[0], font, edges);
  if (drawShortest) {
    drawCode(goalVertex, pages[0]);
    pathEdges = getShortestPathEdges(edges, goalVertex);
    drawEdges(pages[0], font, pathEdges, green = true);
  }
  // Add pdf to frame
  const pdfResultBytes = await pdfDoc.save();
  renderInIframe(pdfResultBytes, divname);
}


// Draw code pdf to print
function drawCodePaper(goalVertex, page) {
  const colors = [1, 0, 1];
  let id = (goalVertex.j + 1) * 10 + (goalVertex.i + 1);
  for (let i = 0; i <= 6; i++) {
    colors.push((id >> i) & 1);
  }
  for (let i = 0; i < colors.length; i++) {
    page.drawRectangle({
      x: codeLineTopX,
      y: codeLineTopY - i * codeLineY,
      width: codeLineX,
      height: codeLineY + 0.3,
      color: color[colors[i]],
    })
  }
}


// Add code pdf to frame
async function createCodePdf(filename, goalVertex) {
  const url = 'pdf/senior-code-template.pdf';
  const pdfBytes = await fetchBinaryAsset(url);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  drawCodePaper(goalVertex, pages[0]);
  const pdfResultBytes = await pdfDoc.save();
  renderInIframe(pdfResultBytes, filename);
}


function refreshPage() {
  edges = null;
  createVertex();
}


// create edges list and draw edges on the field
function createField() {
  edges = createEdges();
  createFieldPdf('field', edges);
}

function createVertex() {
  if (edges == null) {
    createField();
  }
  // create goal vertex
  const goalVertex = getGoalVertex();
  console.log("Chosen vertex is " + goalVertex.label());
  // draw shortest path and code on field then draw code for print
  createFieldPdf('path', edges, true, goalVertex);
  createCodePdf('code', goalVertex);
}
