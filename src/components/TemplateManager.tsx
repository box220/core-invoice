import React, { useState, useEffect } from 'react';
import { InvoiceTemplate, Invoice } from '../types/invoice.types';
import { saveTemplate, loadTemplates, deleteTemplate, } from '../utils/storage';
import { log, LogCategory } from '../utils/logger';
import { Plus, Trash2, Edit2, Copy, FileText, Calendar, Search } from 'lucide-react';

interface TemplateManagerProps {
  onLoadTemplate: (template: InvoiceTemplate) => void;
  currentInvoice?: Invoice;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onLoadTemplate,
  currentInvoice,
}) => {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const loadAllTemplates = () => {
    log.debug(LogCategory.TEMPLATE, 'Loading all templates');
    const loaded = loadTemplates();
    setTemplates(loaded);
    log.info(LogCategory.TEMPLATE, `Loaded ${loaded.length} templates`);
  };

  const handleSaveTemplate = (template: InvoiceTemplate) => {
    log.userAction('Save Template', LogCategory.TEMPLATE, { templateId: template.id, templateName: template.name });

    try {
      saveTemplate(template);
      loadAllTemplates();
      setShowCreateDialog(false);
      setEditingTemplate(null);
      log.info(LogCategory.TEMPLATE, 'Template saved successfully', { templateId: template.id });
    } catch (error) {
      log.error(LogCategory.TEMPLATE, 'Failed to save template', error, { templateId: template.id });
      alert('Failed to save template');
    }
  };

  const handleDeleteTemplate = (id: string) => {
    log.userAction('Delete Template', LogCategory.TEMPLATE, { templateId: id });

    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      deleteTemplate(id);
      loadAllTemplates();
      log.info(LogCategory.TEMPLATE, 'Template deleted successfully', { templateId: id });
    } catch (error) {
      log.error(LogCategory.TEMPLATE, 'Failed to delete template', error, { templateId: id });
      alert('Failed to delete template');
    }
  };

  const handleLoadTemplate = (template: InvoiceTemplate) => {
    log.userAction('Load Template', LogCategory.TEMPLATE, { templateId: template.id, templateName: template.name });
    onLoadTemplate(template);
  };

  const handleDuplicateTemplate = (template: InvoiceTemplate) => {
    log.userAction('Duplicate Template', LogCategory.TEMPLATE, { templateId: template.id });

    const duplicated: InvoiceTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    handleSaveTemplate(duplicated);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoice Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Save and reuse invoice configurations
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Create Template
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 mb-2">No templates found</p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search' : 'Create your first template to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onLoad={() => handleLoadTemplate(template)}
                onEdit={() => {
                  setEditingTemplate(template);
                  setShowCreateDialog(true);
                }}
                onDelete={() => handleDeleteTemplate(template.id)}
                onDuplicate={() => handleDuplicateTemplate(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <TemplateDialog
          template={editingTemplate}
          currentInvoice={currentInvoice}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

const TemplateCard: React.FC<{
  template: InvoiceTemplate;
  onLoad: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ template, onLoad, onEdit, onDelete, onDuplicate }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        {template.invoice.client?.name && (
          <div className="flex items-center gap-2 text-gray-600">
            <FileText size={14} />
            <span>Client: {template.invoice.client.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={14} />
          <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onLoad}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Use Template
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDuplicate}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Duplicate"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const TemplateDialog: React.FC<{
  template: InvoiceTemplate | null;
  currentInvoice?: Invoice;
  onSave: (template: InvoiceTemplate) => void;
  onClose: () => void;
}> = ({ template, currentInvoice, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate: InvoiceTemplate = {
      id: template?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      invoice: template?.invoice || (currentInvoice ? {
        company: currentInvoice.company,
        client: currentInvoice.client,
        services: currentInvoice.services,
        payment: currentInvoice.payment,
        reverseCharge: currentInvoice.reverseCharge,
        vatRate: currentInvoice.vatRate
      } : {}),
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b p-4">
          <h3 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'Create New Template'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Consulting Invoice"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {!template && currentInvoice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                This template will be created from your current invoice configuration
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              {template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
