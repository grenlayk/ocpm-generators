const { PDFDocument, StandardFonts, rgb } = PDFLib;

async function createPdf() {

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create()

  const url = 'graph.pdf';
  
  const firstDonorPdfBytes = await fetch(url).then(res => res.arrayBuffer())
  const firstDonorPdfDoc = await PDFDocument.load(firstDonorPdfBytes);

  const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [0]);
  pdfDoc.addPage(firstDonorPage);
  const pdfBytes = await pdfDoc.save();

  // Trigger the browser to download the PDF document
  download(pdfBytes, "test.pdf", "application/pdf");
}