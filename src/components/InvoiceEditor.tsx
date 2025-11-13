import React, { useState } from 'react';
import { Invoice, ServiceItem } from '../types/invoice.types';
import { recalculateInvoice } from '../utils/invoiceCalculations';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onUpdate: (invoice: Invoice) => void;
}

type EditMode = 'company' | 'client' | 'details' | 'services' | 'payment';

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoice, onUpdate }) => {
  const [editMode, setEditMode] = useState<EditMode>('details');

  const handleUpdate = (updates: Partial<Invoice>) => {
    const updatedInvoice = recalculateInvoice({ ...invoice, ...updates });
    onUpdate(updatedInvoice);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg">
      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        <TabButton active={editMode === 'details'} onClick={() => setEditMode('details')}>
          Invoice Details
        </TabButton>
        <TabButton active={editMode === 'company'} onClick={() => setEditMode('company')}>
          Company Info
        </TabButton>
        <TabButton active={editMode === 'client'} onClick={() => setEditMode('client')}>
          Client Info
        </TabButton>
        <TabButton active={editMode === 'services'} onClick={() => setEditMode('services')}>
          Services
        </TabButton>
        <TabButton active={editMode === 'payment'} onClick={() => setEditMode('payment')}>
          Payment Info
        </TabButton>
      </div>

      {/* Content */}
      <div className="p-6">
        {editMode === 'company' && <CompanyInfoForm invoice={invoice} onUpdate={handleUpdate} />}
        {editMode === 'client' && <ClientInfoForm invoice={invoice} onUpdate={handleUpdate} />}
        {editMode === 'details' && <InvoiceDetailsForm invoice={invoice} onUpdate={handleUpdate} />}
        {editMode === 'services' && <ServicesForm invoice={invoice} onUpdate={handleUpdate} />}
        {editMode === 'payment' && <PaymentInfoForm invoice={invoice} onUpdate={handleUpdate} />}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
      active
        ? 'text-primary border-b-2 border-primary'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

// Input Field Component
const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', required = false, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
);

// Company Info Form
const CompanyInfoForm: React.FC<{ invoice: Invoice; onUpdate: (updates: Partial<Invoice>) => void }> = ({
  invoice,
  onUpdate
}) => {
  const updateField = (field: keyof typeof invoice.company, value: string) => {
    onUpdate({
      company: { ...invoice.company, [field]: value }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Company Name"
        value={invoice.company.name}
        onChange={(v) => updateField('name', v)}
        required
      />
      <InputField
        label="Tagline"
        value={invoice.company.tagline}
        onChange={(v) => updateField('tagline', v)}
      />
      <InputField
        label="Address"
        value={invoice.company.address}
        onChange={(v) => updateField('address', v)}
        required
      />
      <InputField
        label="City"
        value={invoice.company.city}
        onChange={(v) => updateField('city', v)}
        required
      />
      <InputField
        label="Postal Code"
        value={invoice.company.postalCode}
        onChange={(v) => updateField('postalCode', v)}
        required
      />
      <InputField
        label="Country"
        value={invoice.company.country}
        onChange={(v) => updateField('country', v)}
        required
      />
      <InputField
        label="Company Code"
        value={invoice.company.companyCode}
        onChange={(v) => updateField('companyCode', v)}
        required
      />
      <InputField
        label="VAT Number"
        value={invoice.company.vatNumber}
        onChange={(v) => updateField('vatNumber', v)}
        required
      />
      <InputField
        label="Email"
        value={invoice.company.email}
        onChange={(v) => updateField('email', v)}
        type="email"
        required
      />
      <InputField
        label="Phone"
        value={invoice.company.phone}
        onChange={(v) => updateField('phone', v)}
        required
      />
    </div>
  );
};

// Client Info Form
const ClientInfoForm: React.FC<{ invoice: Invoice; onUpdate: (updates: Partial<Invoice>) => void }> = ({
  invoice,
  onUpdate
}) => {
  const updateField = (field: keyof typeof invoice.client, value: string) => {
    onUpdate({
      client: { ...invoice.client, [field]: value }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Client Name"
        value={invoice.client.name}
        onChange={(v) => updateField('name', v)}
        required
      />
      <InputField
        label="Address"
        value={invoice.client.address}
        onChange={(v) => updateField('address', v)}
        required
      />
      <InputField
        label="Building"
        value={invoice.client.building || ''}
        onChange={(v) => updateField('building', v)}
      />
      <InputField
        label="Floor"
        value={invoice.client.floor || ''}
        onChange={(v) => updateField('floor', v)}
      />
      <InputField
        label="City"
        value={invoice.client.city}
        onChange={(v) => updateField('city', v)}
        required
      />
      <InputField
        label="Country"
        value={invoice.client.country}
        onChange={(v) => updateField('country', v)}
        required
      />
      <InputField
        label="UIC"
        value={invoice.client.uic}
        onChange={(v) => updateField('uic', v)}
        required
      />
      <InputField
        label="VAT Number"
        value={invoice.client.vatNumber}
        onChange={(v) => updateField('vatNumber', v)}
        required
      />
    </div>
  );
};

// Invoice Details Form
const InvoiceDetailsForm: React.FC<{ invoice: Invoice; onUpdate: (updates: Partial<Invoice>) => void }> = ({
  invoice,
  onUpdate
}) => {
  const updateDetailField = (field: keyof typeof invoice.details, value: string) => {
    onUpdate({
      details: { ...invoice.details, [field]: value }
    });
  };

  const updateReverseChargeField = (field: keyof typeof invoice.reverseCharge, value: string | boolean) => {
    onUpdate({
      reverseCharge: { ...invoice.reverseCharge, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Invoice Number"
          value={invoice.details.invoiceNumber}
          onChange={(v) => updateDetailField('invoiceNumber', v)}
          required
        />
        <InputField
          label="Invoice Date"
          value={invoice.details.invoiceDate}
          onChange={(v) => updateDetailField('invoiceDate', v)}
          type="date"
          required
        />
        <InputField
          label="Service Period Start"
          value={invoice.details.servicePeriodStart}
          onChange={(v) => updateDetailField('servicePeriodStart', v)}
          type="date"
          required
        />
        <InputField
          label="Service Period End"
          value={invoice.details.servicePeriodEnd}
          onChange={(v) => updateDetailField('servicePeriodEnd', v)}
          type="date"
          required
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Reverse Charge Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={invoice.reverseCharge.applicable}
              onChange={(e) => updateReverseChargeField('applicable', e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm font-medium">Apply Reverse Charge (VAT = 0%)</span>
          </label>

          {invoice.reverseCharge.applicable && (
            <div className="grid grid-cols-1 gap-4 pl-6">
              <InputField
                label="Article 44 Text"
                value={invoice.reverseCharge.article44Text}
                onChange={(v) => updateReverseChargeField('article44Text', v)}
              />
              <InputField
                label="Article 13 Text"
                value={invoice.reverseCharge.article13Text}
                onChange={(v) => updateReverseChargeField('article13Text', v)}
              />
              <InputField
                label="Customer VAT Number"
                value={invoice.reverseCharge.customerVAT}
                onChange={(v) => updateReverseChargeField('customerVAT', v)}
              />
            </div>
          )}

          {!invoice.reverseCharge.applicable && (
            <InputField
              label="VAT Rate (%)"
              value={invoice.vatRate}
              onChange={(v) => onUpdate({ vatRate: parseFloat(v) || 0 })}
              type="number"
            />
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <InputField
          label="Footer Note"
          value={invoice.footerNote || ''}
          onChange={(v) => onUpdate({ footerNote: v })}
          placeholder="Thank you for your business"
        />
      </div>
    </div>
  );
};

// Services Form
const ServicesForm: React.FC<{ invoice: Invoice; onUpdate: (updates: Partial<Invoice>) => void }> = ({
  invoice,
  onUpdate
}) => {
  const addService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      description: 'New Service',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };

    onUpdate({
      services: [...invoice.services, newService]
    });
  };

  const updateService = (index: number, updates: Partial<ServiceItem>) => {
    const updatedServices = [...invoice.services];
    updatedServices[index] = { ...updatedServices[index], ...updates };
    onUpdate({ services: updatedServices });
  };

  const removeService = (index: number) => {
    onUpdate({
      services: invoice.services.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      {invoice.services.map((service, index) => (
        <div key={service.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">Service #{index + 1}</h4>
            <button
              onClick={() => removeService(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="Description"
                value={service.description}
                onChange={(v) => updateService(index, { description: v })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Additional Info"
                value={service.additionalInfo || ''}
                onChange={(v) => updateService(index, { additionalInfo: v })}
              />
            </div>
            <InputField
              label="Quantity"
              value={service.quantity}
              onChange={(v) => updateService(index, { quantity: parseFloat(v) || 0 })}
              type="number"
              required
            />
            <InputField
              label="Unit Price"
              value={service.unitPrice}
              onChange={(v) => updateService(index, { unitPrice: parseFloat(v) || 0 })}
              type="number"
              required
            />
          </div>

          <div className="text-right text-lg font-semibold">
            Amount: {invoice.payment.currency} {service.amount.toFixed(2)}
          </div>
        </div>
      ))}

      <button
        onClick={addService}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Service
      </button>
    </div>
  );
};

// Payment Info Form
const PaymentInfoForm: React.FC<{ invoice: Invoice; onUpdate: (updates: Partial<Invoice>) => void }> = ({
  invoice,
  onUpdate
}) => {
  const updateField = (field: keyof typeof invoice.payment, value: string | number) => {
    onUpdate({
      payment: { ...invoice.payment, [field]: value }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Bank Name"
        value={invoice.payment.bankName}
        onChange={(v) => updateField('bankName', v)}
        required
      />
      <InputField
        label="Currency"
        value={invoice.payment.currency}
        onChange={(v) => updateField('currency', v)}
        required
      />
      <InputField
        label="IBAN"
        value={invoice.payment.iban}
        onChange={(v) => updateField('iban', v)}
        required
      />
      <InputField
        label="SWIFT/BIC"
        value={invoice.payment.swift}
        onChange={(v) => updateField('swift', v)}
        required
      />
      <div className="md:col-span-2">
        <InputField
          label="Payment Terms (business days)"
          value={invoice.payment.paymentTermsDays}
          onChange={(v) => updateField('paymentTermsDays', parseInt(v) || 0)}
          type="number"
          required
        />
      </div>
    </div>
  );
};
