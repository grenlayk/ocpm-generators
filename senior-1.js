// Library from https://github.com/Hopding/pdf-lib
const { min } = require('lodash');
const { PDFDocument, StandardFonts, rgb, degrees} = require('pdf-lib');

const xLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ж"];
const yLabels = ["1", "2", "3", "4", "5"];
const numberOfCrosses = xLabels.length * yLabels.length;
const INF = 10000;

const cellSize = 568;
const hLeftTopX = 3020; // for horizontal lines
const hLeftTopY = 2700; // for horizontal lines
const vLeftTopX = 2740; // for vertical lines
const vLeftTopY = 2430; // for vertical lines

// random integer number in range [min; max]
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

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

function createEdgesTable() {
    const edges = createEdges();
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

function draw(page, font, text, x, y, background, green) {
    const textSize = 150;
    let backgroundColor = rgb(1, 1, 1);
    if (green) {
        backgroundColor = rgb(0.1, 0.9, 0.1);
    }

    if (background) {
        const textWidth = font.widthOfTextAtSize(text, textSize)
        const textHeight = font.heightAtSize(textSize)
        // Draw a box around the string of text
        page.drawRectangle({
            x: x - 10,
            y: y - 20,
            width: textWidth + 20,
            height: textHeight + 5,
            color: backgroundColor,
        })
    }
    
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

async function drawEdges(firstPage, font, edges, green) {
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
      draw(firstPage, font, text.toString(), x, y, true, green);
  }
}

function getShortestPathEdges(edges, goalVertex) {
    const startVertex = new Vertex(14);
    const w = createEdgesTable();
    
    // init
    let distance = new Array(numberOfCrosses);
    let isUsed = new Array(numberOfCrosses);
    let parent = new Array(numberOfCrosses);
    for (let i = 0; i < numberOfCrosses; i++) {
        distance[i] = INF;
        isUsed[i] = false;
        parent[i] = null;
    }
    distance[startVertex.id] = 0;

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

    let pathVertex = goalVertex;
    let result = new Array();
    while (pathVertex.id != startVertex.id) {
        result.push(new Edge(pathVertex, parent[pathVertex.id], w[pathVertex.id][parent[pathVertex.id].id]));
        pathVertex = parent[pathVertex.id];
    }
    return result;
}

async function createPdf() {
  // Field pdf to modify
  const url = 'pdf/graph.pdf';

  // This should be a Uint8Array or ArrayBuffer
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const fs = require('fs');
  const pdfBytes = fs.readFileSync(url);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Modify pdf
  const goalVertex = getGoalVertex();
  console.log(goalVertex.label());

  const edges = createEdges();
  drawEdges(pages[0], font, edges, green=false);
  pathEdges = getShortestPathEdges(edges, goalVertex);
  drawEdges(pages[0], font, pathEdges, green=true);
  
  // Save pdf
  const pdfResultBytes = await pdfDoc.save();

  // Create result pdf
  fs.writeFile('senior-1.pdf', pdfResultBytes, ()=>{});
}

createPdf();
console.log('File created!');
