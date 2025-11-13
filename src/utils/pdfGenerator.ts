import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const PDF_CONFIG = {
  width: 210, // mm (A4)
  height: 297, // mm (A4)
  pixelRatio: 2, // For high quality

  // Conversion to pixels at 96 DPI
  widthPx: 794, // 210mm * 96 / 25.4
  heightPx: 1123 // 297mm * 96 / 25.4
};

export const generateInvoicePDF = async (
  elementId: string,
  fileName: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Invoice element not found');
  }

  // Temporarily apply styles for PDF rendering
  const originalWidth = element.style.width;
  const originalMinHeight = element.style.minHeight;

  element.style.width = `${PDF_CONFIG.widthPx}px`;
  element.style.minHeight = `${PDF_CONFIG.heightPx}px`;

  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      useCORS: true,
      logging: false,
      windowWidth: PDF_CONFIG.widthPx,
      windowHeight: PDF_CONFIG.heightPx,
      backgroundColor: '#ffffff'
    });

    // A4 dimensions in mm
    const imgWidth = PDF_CONFIG.width;
    const imgHeight = PDF_CONFIG.height;

    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add image to page
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

    // Save
    pdf.save(fileName);
  } finally {
    // Restore original styles
    element.style.width = originalWidth;
    element.style.minHeight = originalMinHeight;
  }
};
