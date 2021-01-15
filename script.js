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

const greenColor = rgb(0.196078, 0.80392, 0.196078);


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

function draw(page, font, text, x, y, green = false) {
    const textSize = 150;
    const textWidth = font.widthOfTextAtSize(text, textSize);
    const textHeight = font.heightAtSize(textSize);

    let backgroundColor = rgb(1, 1, 1);
    if (green) { // in case of green highlight
        backgroundColor = rgb(0.196078, 0.80392, 0.196078);
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

function drawBox(page, x, y, color) {
    // Draw a box around the string of text
    page.drawRectangle({
        x: x - 5,
        y: y - 25,
        width: 170,
        height: 170,
        color: color,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1
    })
}
