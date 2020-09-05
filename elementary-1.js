// Library from https://github.com/Hopding/pdf-lib
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

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

  // Trigger the browser to download the PDF document
  //download(pdfBytes, "test.pdf", "application/pdf");
}

createPdf();