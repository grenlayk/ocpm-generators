// Library from https://github.com/Hopding/pdf-lib
const {
    PDFDocument,
    StandardFonts,
    rgb,
    degrees
} = PDFLib;

const xLabels = ["А", "Б", "В", "Г", "Д", "Е", "Ж"];
const yLabels = ["1", "2", "3", "4", "5"];
const numberOfCrosses = 35;

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

// colors
const EPS = 2;
const greenColor = rgb(0, 0.801, 0);//rgb(0.196078, 0.80392, 0.196078);
const redColor = rgb(1, 0.199, 0.238);//rgb(1, 0.2, 0.2);
const yellowColor = rgb(1, 1, 0.199); //rgb(1, 1, 0);
const blueColor = rgb(0, 0.5, 1);//rgb(0.3, 0.3, 0.8);
const whiteColor = rgb(1, 1, 1);
const blackColor = rgb(0, 0, 0);
const greyColor = rgb(0.6, 0.6, 0.6);
const colors = [redColor, yellowColor, greenColor, blueColor, whiteColor, blackColor];
const letters = ["R", "Y", "G", "B", "W", "B"];
const names = ["красный", "желтый", "зеленый", "синий", "белый", "черный"];

// class for graph (senior-1)
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

// array random shuffle
Array.prototype.shuffle = function() {
    let m = this.length, i;
    while (m) {
        i = (Math.random() * m--) >>> 0;
        [this[m], this[i]] = [this[i], this[m]]
    }
    return this;
}

// load pdf bytes
const fetchBinaryAsset = (asset) =>
    fetch(`${asset}`).then((res) => res.arrayBuffer());


// pdf bytes -> iframe
const renderInIframe = (pdfBytes, divName) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf', 
        view: 'Fit', 
        scrollbars: '0', 
        toolbar: '0', 
        statusbar: '0', 
        navpanes: '0' 
    });
    const blobUrl = URL.createObjectURL(blob);
    document.getElementById(divName).src = blobUrl;
};

// get random int: [min, max)
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}

function drawRect(page, x, y, width, height, color) {
    page.drawRectangle({x, y, width, height, color});
}

// returns array of random k numbers out of [0; n)
function getCnk(n, k) {
    let ids = [];
    for (let i = 0; i < k; i++) {
        ids.sort((a, b) => a - b);
        ids.push(getRandomInt(0, n - i));
        for (let j = 0; j < i; ++j) {
            if (ids[i] >= ids[j]) {
                ++ids[i];
            }
        }
    }
    ids.sort((a, b) => a - b);
    return ids;
}

function drawText(page, text, x, y, size, font, color) {
    page.drawText(text, {x, y, size, font, color});
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
    drawText(page, text, x, y, textSize, font, rgb(0, 0, 0));
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

function drawFrame(page, x, y, color, width=5, sz=170) {
    // Draw a box around the string of text
    page.drawRectangle({
        x: x - 5,
        y: y - 25,
        width: sz,
        height: sz,
        borderColor: color,
        borderWidth: width,
    })
}


function drawCircle(page, x, y, color, sz=170) {
    // Draw a circle
    page.drawCircle({
        x: x - 5,
        y: y - 25,
        size: sz,
        color: color,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1
    })
}