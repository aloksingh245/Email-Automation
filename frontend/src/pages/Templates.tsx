import React, { useEffect, useState } from 'react';
import { templatesApi } from '../services/api';
import { Plus, Trash2, Code } from 'lucide-react';

interface Template {
  id: string;
  template_name: string;
  subject: string;
  body: string;
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    subject: '',
    body: ''
  });

  const fetchTemplates = async () => {
    try {
      const response = await templatesApi.list();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await templatesApi.create(newTemplate);
      setShowModal(false);
      fetchTemplates();
      setNewTemplate({ template_name: '', subject: '', body: '' });
    } catch (error) {
      alert('Failed to create template');
    }
  };

  return (
    <div>
      <div className="flex-between">
        <h1>Email Templates</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Template
        </button>
      </div>

      <div className="grid grid-cols-3" style={{ marginTop: '1.5rem' }}>
        {templates.map((template) => (
          <div key={template.id} className="card">
            <div className="flex-between">
              <h3>{template.template_name}</h3>
              <button className="btn btn-outline" style={{ color: 'var(--error)' }} onClick={() => templatesApi.delete(template.id).then(fetchTemplates)}>
                <Trash2 size={16} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{template.subject}</p>
            <div style={{ marginTop: '1rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '0.5rem', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
              {template.body}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '700px' }}>
            <h2>Create Email Template</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Template Name</label>
                <input type="text" required value={newTemplate.template_name} onChange={e => setNewTemplate({...newTemplate, template_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Subject Line</label>
                <input type="text" required placeholder="Hello {{name}}, I have an opportunity for you" value={newTemplate.subject} onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Body (Jinja2 allowed: name, company, title)</label>
                <textarea 
                  rows={8} 
                  required 
                  placeholder="Hi {{name}},\n\nI noticed you are working at {{company}}..." 
                  value={newTemplate.body} 
                  onChange={e => setNewTemplate({...newTemplate, body: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">Create Template</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
