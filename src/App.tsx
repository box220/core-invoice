import { useState, useEffect } from 'react';
import { Invoice, InvoiceTemplate } from './types/invoice.types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { TemplateManager } from './components/TemplateManager';
import { LogViewer } from './components/LogViewer';
import { DEFAULT_INVOICE_TEMPLATE } from './templates/defaultTemplate';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { saveCurrentInvoice, loadCurrentInvoice, generateInvoiceNumber, exportData, importData, saveTemplate } from './utils/storage';
import { recalculateInvoice } from './utils/invoiceCalculations';
import { log, LogCategory } from './utils/logger';
import { Download, Save, Upload, FileText, Layers, Terminal, Edit } from 'lucide-react';

type View = 'editor' | 'templates' | 'logs';

function App() {
  const [view, setView] = useState<View>('editor');
  const [invoice, setInvoice] = useState<Invoice>(() => {
    log.info(LogCategory.APP, 'Application starting, loading invoice');
    const saved = loadCurrentInvoice();
    if (saved) {
      log.info(LogCategory.APP, 'Loaded saved invoice from localStorage', { invoiceId: saved.id });
      return saved;
    }

    // Create initial invoice from template
    log.info(LogCategory.APP, 'Creating new invoice from default template');
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
    log.debug(LogCategory.STORAGE, 'Auto-saving invoice to localStorage', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.details.invoiceNumber
    });
    saveCurrentInvoice(invoice);
  }, [invoice]);

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    log.userAction('Update Invoice', LogCategory.INVOICE, {
      invoiceId: updatedInvoice.id,
      invoiceNumber: updatedInvoice.details.invoiceNumber
    });
    setInvoice(updatedInvoice);
  };

  const handleGeneratePDF = async () => {
    log.userAction('Generate PDF', LogCategory.PDF, {
      invoiceNumber: invoice.details.invoiceNumber
    });

    try {
      const fileName = `${invoice.details.invoiceNumber}_Invoice.pdf`;
      await log.track('PDF Generation', LogCategory.PDF, async () => {
        await generateInvoicePDF('invoice-preview', fileName);
      }, { fileName });

      log.info(LogCategory.PDF, 'PDF generated successfully', { fileName });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      log.error(LogCategory.PDF, 'Failed to generate PDF', error, {
        invoiceNumber: invoice.details.invoiceNumber
      });
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleGenerateNewNumber = () => {
    log.userAction('Generate New Invoice Number', LogCategory.INVOICE);
    const newNumber = generateInvoiceNumber();
    log.info(LogCategory.INVOICE, 'New invoice number generated', { newNumber });
    setInvoice(prev => ({
      ...prev,
      details: { ...prev.details, invoiceNumber: newNumber }
    }));
  };

  const handleExportData = () => {
    log.userAction('Export Data', LogCategory.STORAGE);
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      log.info(LogCategory.STORAGE, 'Data exported successfully');
    } catch (error) {
      log.error(LogCategory.STORAGE, 'Failed to export data', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = () => {
    log.userAction('Import Data', LogCategory.STORAGE);
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
            if (loaded) {
              setInvoice(loaded);
              log.info(LogCategory.STORAGE, 'Data imported successfully', { invoiceId: loaded.id });
              alert('Data imported successfully!');
            }
          } catch (error) {
            log.error(LogCategory.STORAGE, 'Failed to import data', error);
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLoadTemplate = (template: InvoiceTemplate) => {
    log.userAction('Load Template', LogCategory.TEMPLATE, {
      templateId: template.id,
      templateName: template.name
    });

    try {
      const newInvoice = recalculateInvoice({
        id: Date.now().toString(),
        ...template.invoice,
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

      setInvoice(newInvoice);
      setView('editor');
      log.info(LogCategory.TEMPLATE, 'Template loaded and new invoice created', {
        templateId: template.id,
        newInvoiceId: newInvoice.id
      });
    } catch (error) {
      log.error(LogCategory.TEMPLATE, 'Failed to load template', error, { templateId: template.id });
      alert('Failed to load template');
    }
  };

  const handleSaveAsTemplate = () => {
    log.userAction('Save As Template', LogCategory.TEMPLATE);
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    try {
      const template: InvoiceTemplate = {
        id: Date.now().toString(),
        name: templateName,
        invoice: {
          company: invoice.company,
          client: invoice.client,
          services: invoice.services,
          payment: invoice.payment,
          reverseCharge: invoice.reverseCharge,
          vatRate: invoice.vatRate
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveTemplate(template);
      log.info(LogCategory.TEMPLATE, 'Invoice saved as template', {
        templateId: template.id,
        templateName
      });
      alert('Template saved successfully!');
    } catch (error) {
      log.error(LogCategory.TEMPLATE, 'Failed to save template', error);
      alert('Failed to save template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-primary" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">Phase 2</span>
            </div>

            <div className="flex gap-3">
              {view === 'editor' && (
                <>
                  <button
                    onClick={handleSaveAsTemplate}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Layers size={18} />
                    Save as Template
                  </button>

                  <button
                    onClick={handleGenerateNewNumber}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    New Invoice #
                  </button>
                </>
              )}

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

              {view === 'editor' && (
                <button
                  onClick={handleGeneratePDF}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-t pt-3">
            <button
              onClick={() => {
                setView('editor');
                log.userAction('Switch to Editor View', LogCategory.UI);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'editor'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Edit size={18} />
              Invoice Editor
            </button>
            <button
              onClick={() => {
                setView('templates');
                log.userAction('Switch to Templates View', LogCategory.UI);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'templates'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers size={18} />
              Templates
            </button>
            <button
              onClick={() => {
                setView('logs');
                log.userAction('Switch to Logs View', LogCategory.UI);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'logs'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Terminal size={18} />
              System Logs
            </button>
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
        {view === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
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
        )}

        {view === 'templates' && (
          <div className="pb-8">
            <TemplateManager
              currentInvoice={invoice}
              onLoadTemplate={handleLoadTemplate}
            />
          </div>
        )}

        {view === 'logs' && (
          <div className="pb-8" style={{ minHeight: '80vh' }}>
            <LogViewer />
          </div>
        )}
      </div>

      {/* Invoice Summary Footer - Only on editor view */}
      {view === 'editor' && (
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
      )}
    </div>
  );
}

export default App;
