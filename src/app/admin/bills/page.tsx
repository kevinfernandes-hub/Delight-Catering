'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Receipt, 
  Eye, 
  Printer, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  Trash2,
  X,
  Loader2,
  Download,
  Mail
} from 'lucide-react';
import { formatCurrency, formatDate, formatInvoiceId } from '@/lib/utils';
import { useToast } from '@/app/components/admin/Toast';
import ConfirmDialog from '@/app/components/admin/ConfirmDialog';
import { Invoice } from '@/lib/types';

const BILL_TABS = ['All', 'Unpaid', 'Paid'];

const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice, onClose: () => void }) => {
  const subtotal = invoice.subtotal || invoice.total / 1.08;
  const tax = invoice.tax_amount || (invoice.total - subtotal);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal" onClick={e => e.stopPropagation()}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #333' }}>
           <h2 style={{ margin: 0 }}>Invoice Detail</h2>
           <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handlePrint} className="btn-print"><Printer size={18} /> Print Invoice</button>
              <button onClick={onClose} className="btn-close-modal"><X size={20} /></button>
           </div>
        </div>

        <div id="printable-invoice" className="printable-area">
           <div className="invoice-header">
              <div>
                <h1 className="brand-name">Delight Caterers</h1>
                <p className="brand-tagline">Exquisite Culinary Experiences</p>
                <div className="company-info">
                  <p>Flat No 2, Shakun Apartment, Sheela Nagar Colony</p>
                  <p>Katol Road, Nagpur, Maharashtra</p>
                  <p>Phone: 9689330035 | Email: merwynfernandes2015@gmail.com</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#C9A84C' }}>INVOICE</div>
                 <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>#{formatInvoiceId(invoice.id)}</p>
                 <p>Date: {formatDate(invoice.created_at)}</p>
                 <p>Due: {formatDate(new Date(new Date(invoice.created_at).getTime() + 7 * 24 * 60 * 60 * 1000))}</p>
              </div>
           </div>

           <div className="invoice-addresses">
              <div className="billing-to">
                 <h3>BILL TO:</h3>
                 <p className="customer-name">{invoice.order?.customer?.name || 'N/A'}</p>
                 <p>{invoice.order?.customer?.email || 'N/A'}</p>
                 <p>{invoice.order?.customer?.phone || 'N/A'}</p>
                 <p>{invoice.order?.customer?.address || 'N/A'}</p>
              </div>
              <div className="event-details">
                 <h3>EVENT DETAILS:</h3>
                 <p><strong>Type:</strong> {invoice.order?.event_type || 'N/A'}</p>
                 <p><strong>Date:</strong> {invoice.order?.event_date ? formatDate(invoice.order.event_date) : 'N/A'}</p>
                 <p><strong>Guests:</strong> {invoice.order?.guest_count || 'N/A'} persons</p>
                 <p><strong>Venue:</strong> {invoice.order?.venue || 'TBD'}</p>
              </div>
           </div>

           <table className="invoice-table">
              <thead>
                 <tr>
                    <th>DESCRIPTION</th>
                    <th style={{ textAlign: 'center' }}>QTY</th>
                    <th style={{ textAlign: 'right' }}>UNIT PRICE</th>
                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                    <td>
                       <strong>Catering Service - {invoice.order?.event_type || 'N/A'}</strong><br />
                       <span style={{ fontSize: '0.8rem', color: '#666' }}>Complete buffet setup, service staff, and menu execution for {invoice.order?.guest_count || 0} guests.</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(subtotal)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(subtotal)}</td>
                 </tr>
              </tbody>
           </table>

           <div className="invoice-totals">
              <div className="terms-section">
                 <h4>Terms & Conditions</h4>
                 <p>1. 50% advance payment required for confirmation.</p>
                 <p>2. Balance payment due within 7 days of event completion.</p>
                 <p>3. Cancellations within 48 hours are non-refundable.</p>
              </div>
              <div className="amount-breakdown">
                 <div className="total-row"><span>Subtotal:</span> <span>{formatCurrency(subtotal)}</span></div>
                 <div className="total-row"><span>Tax (8%):</span> <span>{formatCurrency(tax)}</span></div>
                 <div className="total-row grand-total"><span>Total:</span> <span>{formatCurrency(invoice.total)}</span></div>
                 
                 <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <span className={`print-badge badge-${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                 </div>
              </div>
           </div>

           <div className="invoice-footer">
              <p>Thank you for choosing Delight Caterers. We look forward to serving you again!</p>
           </div>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 2rem; }
        .modal-content { background: #111; border: 1px solid #333; border-radius: 1rem; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; color: #fff; position: relative; }
        .invoice-modal { padding: 2rem; }
        .btn-print { background: #C9A84C; color: #000; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .btn-close-modal { background: #1a1a1a; border: none; color: #666; cursor: pointer; }
        .printable-area { background: #fff !important; color: #000 !important; padding: 40px; min-height: 297mm; }
        .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 20px; margin-bottom: 30px; }
        .brand-name { font-size: 2.2rem; margin: 0; color: #C9A84C; }
        .brand-tagline { font-size: 1rem; color: #666; font-style: italic; margin-top: 5px; }
        .company-info { margin-top: 15px; font-size: 0.9rem; color: #444; line-height: 1.4; }
        .invoice-addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .billing-to h3, .event-details h3 { font-size: 0.8rem; letter-spacing: 1px; color: #888; border-bottom: 1px solid #EEE; padding-bottom: 5px; margin-bottom: 15px; }
        .customer-name { font-size: 1.2rem; font-weight: bold; margin-bottom: 8px; }
        .billing-to p, .event-details p { margin: 5px 0; color: #333; font-size: 0.95rem; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .invoice-table th { background: #F9F9F9; padding: 12px; border: 1px solid #EEE; color: #444; font-size: 0.85rem; }
        .invoice-table td { padding: 15px 12px; border: 1px solid #EEE; font-size: 0.95rem; }
        .invoice-totals { display: grid; grid-template-columns: 1fr 300px; gap: 40px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 1rem; border-bottom: 1px solid #EEE; }
        .grand-total { font-weight: bold; font-size: 1.25rem; color: #C9A84C; border-bottom: 2px solid #C9A84C; margin-top: 10px; padding-top: 15px; }
        .print-badge { padding: 4px 12px; border-radius: 4px; border: 1px solid; font-weight: bold; }
        .badge-unpaid { border-color: #f59e0b; color: #f59e0b; }
        .badge-paid { border-color: #10b981; color: #10b981; }
        @media print {
          .no-print, nav, aside, header { display: none !important; }
          body, html { background: #fff !important; }
          .modal-overlay { position: static !important; background: none !important; padding: 0 !important; }
          .modal-content { border: none !important; max-width: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
          .printable-area { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default function AdminBills() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchInvoices = useCallback(() => {
    setLoading(true);
    fetch('/api/invoices')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: Invoice[]) => {
        setInvoices(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Invoice list error:', err);
        showToast('Failed to load invoices', 'error');
        setLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Invoice marked as ${newStatus}`, 'success');
        fetchInvoices();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update invoice', 'error');
      }
    } catch (error) {
      console.error('Update status error:', error);
      showToast('Failed to update invoice', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setActionLoading(invoiceId);
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`, { credentials: 'include' });
      
      if (!res.ok) {
        showToast('Failed to download PDF', 'error');
        return;
      }

      // Create blob and download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Invoice downloaded successfully', 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      showToast('Failed to download PDF', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendInvoiceEmail = async (invoiceId: string) => {
    try {
      setActionLoading(invoiceId);
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'invoice', invoiceId })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Invoice email sent successfully', 'success');
      } else {
        showToast(data.error || 'Failed to send email', 'error');
      }
    } catch (error) {
      console.error('Send email error:', error);
      showToast('Failed to send email', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setActionLoading(deleteConfirm);
      const res = await fetch(`/api/invoices/${deleteConfirm}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Invoice deleted', 'success');
        fetchInvoices();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete invoice', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete invoice', 'error');
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const stats = {
    paid: invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.total, 0),
    outstanding: invoices.filter(i => i.status === 'Unpaid').reduce((acc, i) => acc + i.total, 0),
    overdue: invoices.filter(i => i.status === 'Unpaid' && new Date(i.due_date) < new Date()).length,
    total: invoices.length
  };

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'All') return true;
    return inv.status === activeTab;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Bills & Invoicing</h1>
        <p style={{ color: '#A3A3A3' }}>Manage payments, generate receipts, and track financial performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card stat-box">
          <DollarSign color="#10b981" />
          <div><p>Total Paid</p><h3>{formatCurrency(stats.paid)}</h3></div>
        </div>
        <div className="card stat-box">
          <Clock color="#f59e0b" />
          <div><p>Outstanding</p><h3>{formatCurrency(stats.outstanding)}</h3></div>
        </div>
        <div className="card stat-box">
          <AlertCircle color="#ef4444" />
          <div><p>Overdue</p><h3>{stats.overdue}</h3></div>
        </div>
        <div className="card stat-box">
          <FileText color="#3b82f6" />
          <div><p>Total Invoices</p><h3>{stats.total}</h3></div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
          {BILL_TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: activeTab === tab ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                color: activeTab === tab ? '#C9A84C' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Invoice #</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Customer</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Due Date</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Total</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Refreshing records...</td></tr>
              ) : filteredInvoices.map(inv => (
                <tr key={inv.id} className="table-row">
                  <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>{formatInvoiceId(inv.id)}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: '500' }}>{inv.order?.customer?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.order?.event_type || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1.25rem', color: (inv.status === 'Unpaid' && new Date(inv.due_date) < new Date()) ? '#ef4444' : '#A3A3A3' }}>
                    {formatDate(new Date(new Date(inv.created_at).getTime() + 7 * 24 * 60 * 60 * 1000))}
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(inv.total)}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <select 
                      value={inv.status}
                      onChange={(e) => handleUpdateStatus(inv.id, e.target.value)}
                      className={`status-select status-${inv.status.toLowerCase()}`}
                    >
                      {BILL_TABS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <button 
                         onClick={() => setSelectedInvoice(inv)} 
                         className="action-btn"
                         title="View"
                         disabled={actionLoading === inv.id}
                       >
                         <Eye size={16} />
                       </button>
                       <button 
                         onClick={() => handleDownloadPDF(inv.id, inv.invoice_number)} 
                         className="action-btn"
                         title="Download PDF"
                         disabled={actionLoading === inv.id}
                       >
                         {actionLoading === inv.id ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                       </button>
                       <button 
                         onClick={() => handleSendInvoiceEmail(inv.id)} 
                         className="action-btn"
                         title="Send Email"
                         disabled={actionLoading === inv.id}
                       >
                         {actionLoading === inv.id ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
                       </button>
                       <button 
                         onClick={() => setDeleteConfirm(inv.id)} 
                         className="action-btn delete"
                         title="Delete"
                         disabled={actionLoading === inv.id}
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      
      <ConfirmDialog 
        isOpen={deleteConfirm !== null}
        title="Delete Invoice?"
        message="This will remove the financial record. Associated order will remain but marked as unpaid."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmVariant="danger"
        confirmLabel="Confirm Delete"
      />

      <style jsx>{`
        .stat-box { display: flex; align-items: center; gap: 1rem; }
        .stat-box p { color: #A3A3A3; margin: 0; font-size: 0.875rem; }
        .stat-box h3 { color: #fff; margin: 0.25rem 0 0 0; font-size: 1.5rem; }
        
        .table-row:hover { background-color: rgba(255,255,255,0.02); }
        .action-btn { 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          background: #1a1a1a; border: 1px solid #333; color: #64748b; border-radius: 6px; cursor: pointer; transition: 0.2s;
        }
        .action-btn:hover { border-color: #C9A84C; color: #C9A84C; }
        .action-btn.delete:hover { border-color: #ef4444; color: #ef4444; }
        
        .status-select {
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          background-color: #1a1a1a;
          color: #fff;
        }
        .status-unpaid { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-paid { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-overdue { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
