
const fs = require("fs");
let PDFParser = require("pdf2json");

   let pdfParser = new PDFParser(this,1);
   pdfParser.loadPDF("./lib/platinga.pdf");
   pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
   pdfParser.on("pdfParser_dataReady", pdfData => {
       fs.writeFile("lib/platinga.txt", pdfParser.getRawTextContent());
   });