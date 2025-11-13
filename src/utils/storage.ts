import { Invoice, InvoiceTemplate } from '../types/invoice.types';

const STORAGE_KEYS = {
  TEMPLATES: 'invoice_templates',
  CURRENT_INVOICE: 'current_invoice',
  SETTINGS: 'app_settings',
  LAST_INVOICE_NUMBER: 'last_invoice_number'
};

// Templates
export const saveTemplate = (template: InvoiceTemplate): void => {
  const templates = loadTemplates();
  const index = templates.findIndex(t => t.id === template.id);

  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }

  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const loadTemplates = (): InvoiceTemplate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  return data ? JSON.parse(data) : [];
};

export const deleteTemplate = (id: string): void => {
  const templates = loadTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const getTemplate = (id: string): InvoiceTemplate | null => {
  const templates = loadTemplates();
  return templates.find(t => t.id === id) || null;
};

// Current Invoice
export const saveCurrentInvoice = (invoice: Invoice): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_INVOICE, JSON.stringify(invoice));
};

export const loadCurrentInvoice = (): Invoice | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_INVOICE);
  return data ? JSON.parse(data) : null;
};

// Invoice Number Management
export const saveLastInvoiceNumber = (number: number): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, number.toString());
};

export const getLastInvoiceNumber = (): number => {
  const data = localStorage.getItem(STORAGE_KEYS.LAST_INVOICE_NUMBER);
  return data ? parseInt(data, 10) : 0;
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const lastNumber = getLastInvoiceNumber();
  const newNumber = lastNumber + 1;

  saveLastInvoiceNumber(newNumber);

  return `CORE-${year}-${month}-${day}-${String(newNumber).padStart(2, '0')}`;
};

// Export/Import
export const exportData = (): string => {
  return JSON.stringify({
    templates: loadTemplates(),
    currentInvoice: loadCurrentInvoice(),
    lastInvoiceNumber: getLastInvoiceNumber(),
    version: '1.0'
  }, null, 2);
};

export const importData = (jsonString: string): void => {
  try {
    const data = JSON.parse(jsonString);

    if (data.templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
    }

    if (data.currentInvoice) {
      saveCurrentInvoice(data.currentInvoice);
    }

    if (data.lastInvoiceNumber !== undefined) {
      saveLastInvoiceNumber(data.lastInvoiceNumber);
    }
  } catch (error) {
    throw new Error('Invalid JSON data');
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
