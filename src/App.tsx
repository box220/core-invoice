import { useState, useEffect } from 'react';
import { Invoice } from './types/invoice.types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { DEFAULT_INVOICE_TEMPLATE } from './templates/defaultTemplate';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { saveCurrentInvoice, loadCurrentInvoice, generateInvoiceNumber, exportData, importData } from './utils/storage';
import { recalculateInvoice } from './utils/invoiceCalculations';
import { Download, Save, Upload, FileText } from 'lucide-react';

function App() {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const saved = loadCurrentInvoice();
    if (saved) return saved;

    // Create initial invoice from template
    return recalculateInvoice({
      id: Date.now().toString(),
      ...DEFAULT_INVOICE_TEMPLATE,
      details: {
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        servicePeriodStart: new Date().toISOString().split('T')[0],
        servicePeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      subtotal: 0,
      vatAmount: 0,
      total: 0
    } as Invoice);
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    saveCurrentInvoice(invoice);
  }, [invoice]);

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice);
  };

  const handleGeneratePDF = async () => {
    try {
      const fileName = `${invoice.details.invoiceNumber}_Invoice.pdf`;
      await generateInvoicePDF('invoice-preview', fileName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleGenerateNewNumber = () => {
    const newNumber = generateInvoiceNumber();
    setInvoice(prev => ({
      ...prev,
      details: { ...prev.details, invoiceNumber: newNumber }
    }));
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            importData(data);
            const loaded = loadCurrentInvoice();
            if (loaded) setInvoice(loaded);
            alert('Data imported successfully!');
          } catch (error) {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="text-primary" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateNewNumber}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                New Invoice #
              </button>

              <button
                onClick={handleImportData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload size={18} />
                Import
              </button>

              <button
                onClick={handleExportData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Export
              </button>

              <button
                onClick={handleGeneratePDF}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Success message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          PDF generated successfully!
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor - Left side */}
          <div>
            <InvoiceEditor invoice={invoice} onUpdate={handleUpdateInvoice} />
          </div>

          {/* Preview - Right side */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
              </div>
              <div id="invoice-preview" className="overflow-auto" style={{ maxHeight: '85vh' }}>
                <InvoicePreview invoice={invoice} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Summary Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-600">Invoice Number</p>
              <p className="text-lg font-semibold">{invoice.details.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-lg font-semibold">{invoice.payment.currency} {invoice.subtotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">VAT</p>
              <p className="text-lg font-semibold">{invoice.payment.currency} {invoice.vatAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-primary">{invoice.payment.currency} {invoice.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
