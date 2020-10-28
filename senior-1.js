// Library from https://github.com/Hopding/pdf-lib
const { PDFDocument, StandardFonts, rgb, degrees} = require('pdf-lib');

// function from https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// random integer number in range [min; max]
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

const xLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ж"];
const yLabels = ["1", "2", "3", "4", "5"];
const numberOfCrosses = xLabels.length * yLabels.length;

const cellSize = 568;
const hLeftTopX = 3020; // for horizontal lines
const hLeftTopY = 2700; // for horizontal lines
const vLeftTopX = 2740; // for vertical lines
const vLeftTopY = 2430; // for vertical lines

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
    const edgesTable = new Array(numberOfCrosses + 1);

    edgesTable[0] = new Array(numberOfCrosses + 1);
    edgesTable[0][0] = "-";
    for (let j = 1; j <= numberOfCrosses; j++) {
        edgesTable[0][j] = new Vertex(j - 1).label();
    }
    for (let i = 1; i <= numberOfCrosses; i++) {
        edgesTable[i] = new Array(numberOfCrosses + 1);
        edgesTable[i][0] = new Vertex(i - 1).label();
        for (let j = 1; j <= numberOfCrosses; j++) {
            edgesTable[i][j] = "-";
        }
    }
    for (const edge of edges) {
        edgesTable[edge.v.id + 1][edge.u.id + 1] = edge.weight;
        edgesTable[edge.u.id + 1][edge.v.id + 1] = edge.weight;
    }
    return edgesTable;
}

function printTable(edgesTable) {
    console.table(edgesTable);
}

function draw(page, font, text, x, y) {
    const textSize = 150;

    const textWidth = font.widthOfTextAtSize(text, textSize)
    const textHeight = font.heightAtSize(textSize)
    // Draw a box around the string of text
    page.drawRectangle({
        x: x - 10,
        y: y - 20,
        width: textWidth + 20,
        height: textHeight + 5,
        color: rgb(1, 1, 1),
        //color: rgb(0.1, 0.9, 0.1),
    })

    page.drawText(text, {
        x: x,
        y: y,
        size: textSize,
        font: font,
        color: rgb(0, 0, 0),
        backgroundColor: rgb(1, 1, 1),
    })
}

async function drawEdges(firstPage, pdfDoc) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const edges = createEdges();
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
      draw(firstPage, helveticaFont, text.toString(), x, y);
  }
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

  // Get the first page of the document
  const pages = pdfDoc.getPages();

  // Modify pdf
  drawEdges(pages[0], pdfDoc);

  // Save pdf
  const pdfResultBytes = await pdfDoc.save();

  // Create result pdf
  fs.writeFile('senior-1.pdf', pdfResultBytes, ()=>{});
}

createPdf();
console.log('File created!');
