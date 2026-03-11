'use client';

import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Receipt,
  PlusCircle,
  Menu as MenuIcon,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate, formatOrderId } from '@/lib/utils';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

const SummaryCard = ({ title, value, icon, color, subtitle }: any) => (
  <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
    <div style={{ 
      width: '56px', 
      height: '56px', 
      borderRadius: '12px', 
      backgroundColor: `${color}15`, 
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: '0.875rem', color: '#A3A3A3', marginBottom: '0.25rem', fontWeight: '400' }}>{title}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{subtitle}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <p style={{ color: '#C9A84C' }}>Loading summary data...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
        <p style={{ color: '#A3A3A3' }}>Welcome back! Here&apos;s a summary of Delight Caterers.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2.5rem' 
      }}>
        <SummaryCard 
          title="Today's Orders" 
          value={stats.todayOrdersCount} 
          icon={<ShoppingCart size={24} />} 
          color="#3b82f6"
          subtitle="Orders created today"
        />
        <SummaryCard 
          title="Pending Bills" 
          value={stats.pendingInvoicesCount || 0} 
          icon={<Receipt size={24} />} 
          color="#f59e0b"
          subtitle="Awaiting payment"
        />
        <SummaryCard 
          title="Total Customers" 
          value={stats.customersCount} 
          icon={<Users size={24} />} 
          color="#8b5cf6"
          subtitle="Loyal base"
        />
        <SummaryCard 
          title="Monthly Revenue" 
          value={formatCurrency(stats.revenue)} 
          icon={<DollarSign size={24} />} 
          color="#10b981"
          subtitle="Target: $25k"
        />
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button className="quick-action-btn">
            <PlusCircle size={20} /> Create Order
          </button>
          <button className="quick-action-btn">
            <Receipt size={20} /> Generate Bill
          </button>
          <button className="quick-action-btn">
            <Users size={20} /> Add Customer
          </button>
          <button className="quick-action-btn">
            <MenuIcon size={20} /> Update Menu
          </button>
        </div>
      </section>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ color: '#C9A84C', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            View all orders <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Order ID</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Customer</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Event Date</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Guests</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Amount</th>
                <th style={{ padding: '1.25rem', color: '#A3A3A3', fontWeight: '500', fontSize: '0.875rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="table-row">
                  <td style={{ padding: '1.25rem', fontWeight: '600', color: '#C9A84C' }}>{formatOrderId(order.id)}</td>
                  <td style={{ padding: '1.25rem' }}>{order.customer.name}</td>
                  <td style={{ padding: '1.25rem' }}>{formatDate(order.event_date)}</td>
                  <td style={{ padding: '1.25rem' }}>{order.guest_count}</td>
                  <td style={{ padding: '1.25rem', fontWeight: '500' }}>{formatCurrency(order.total_amount)}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .quick-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background-color: #111;
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 0.75rem;
          color: #F5F0E8;
          font-weight: 500;
          cursor: pointer;
          transition: 0.3s;
        }
        .quick-action-btn:hover {
          background-color: rgba(201, 168, 76, 0.1);
          border-color: #C9A84C;
          transform: translateY(-2px);
        }
        .table-row {
          border-bottom: 1px solid rgba(255,255,255,0.02);
          cursor: pointer;
          transition: 0.2s;
        }
        .table-row:hover {
          background-color: rgba(255,255,255,0.02);
        }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-pending { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .badge-confirmed { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .badge-completed { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
