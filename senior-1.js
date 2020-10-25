// Library from https://github.com/Hopding/pdf-lib
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// function from https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// random integer number in range [min; max]
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

const xLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ж"];
const yLabels = ["1", "2", "3", "4", "5"];

class Vertex {
    constructor(id) {
      this.i = parseInt(id / xLabels.length);
      this.j = id % xLabels.length;
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
    const numberOfCrosses = xLabels.length * yLabels.length;
    for (let vId = 0; vId < numberOfCrosses; vId++) {
        const v = new Vertex(vId);
        for (let uId = 0; uId < numberOfCrosses; uId++) {
            const u = new Vertex(uId);
            if (isNeighbor(v, u)) {
                edges.push(new Edge(v, u, getRandomInt(10, 50)));
                console.log(edges[edges.length - 1].logMessage());
            }
        }
    }
    return edges;
}

async function createPdf() {

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create()

  const url = 'pdf/graph.pdf';
  const fs = require('fs');
  const firstDonorPdfBytes = fs.readFileSync(url);
  const firstDonorPdfDoc = await PDFDocument.load(firstDonorPdfBytes);

  const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [0]);
  pdfDoc.addPage(firstDonorPage);
  const pdfBytes = await pdfDoc.save();

  fs.writeFile('test.pdf', pdfBytes, ()=>{});

  console.log("File created!")

  // // Trigger the browser to download the PDF document
  // download(pdfBytes, "test.pdf", "application/pdf");
}

//createPdf();
createEdges();