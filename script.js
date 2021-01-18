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

// for edges painting
const cellSize = 568;
const hLeftTopX = 3020; // for horizontal lines
const hLeftTopY = 2700; // for horizontal lines
const vLeftTopX = 2740; // for vertical lines
const vLeftTopY = 2430; // for vertical lines

// for code painting
const lineX = 84;
const lineY = 595;
const bwcolor = [rgb(1, 1, 1), rgb(0, 0, 0)];
const lineTopX = 1120;
const lineTopY = 1325;

// for code pdf
const codeLineTopX = 38;
const codeLineTopY = 740.9;
const codeLineX = 534.5;
const codeLineY = 72.1;

const EPS = 2;
const greenColor = rgb(0.196078, 0.80392, 0.196078);
const redColor = rgb(1, 0, 0);
const yellowColor = rgb(1, 1, 0);
const blueColor = rgb(0, 0, 1);
const whiteColor = rgb(1, 1, 1);
let colors = [redColor, yellowColor, greenColor, blueColor, whiteColor];

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

const fetchBinaryAsset = (asset) =>
    fetch(`${asset}`).then((res) => res.arrayBuffer());


const renderInIframe = (pdfBytes, divName) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    document.getElementById(divName).src = blobUrl;
};

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

function drawRect(page, x, y, width, height, color) {
    page.drawRectangle({x, y, width, height, color});
}

function getCnk(n, k) {
    let ids = [];
    for (let i = 0; i < k; i++) {
        ids.sort((a, b) => a - b);
        ids.push(getRandomInt(0, n - i));
        for (let j = 0; j < i; ++j) {
            if (ids[i] == ids[j]) {
                ++ids[i];
            }
        }
    }
    ids.sort((a, b) => a - b);
    return ids;
}

function draw(page, font, text, x, y, green = false) {
    const textSize = 150;
    const textWidth = font.widthOfTextAtSize(text, textSize);
    const textHeight = font.heightAtSize(textSize);

    let backgroundColor = rgb(1, 1, 1);
    if (green) { // in case of green highlight
        backgroundColor = rgb(0.196078, 0.80392, 0.196078);
    }

    // Draw a box around the string of text
    drawRect(page, x - 10, y - 20, textWidth + 20, textHeight + 5, backgroundColor);

    page.drawText(text, {
        x: x,
        y: y,
        size: textSize,
        font: font,
        color: rgb(0, 0, 0),
    })
}

function drawBox(page, x, y, color, sz=170) {
    // Draw a box around the string of text
    page.drawRectangle({
        x: x - 5,
        y: y - 25,
        width: sz,
        height: sz,
        color: color,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1
    })
}
