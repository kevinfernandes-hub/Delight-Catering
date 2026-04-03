'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ToastProvider } from '@/app/components/admin/Toast';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Users, 
  Menu as MenuIcon, 
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok && isMounted) {
          router.replace('/admin/login');
          return;
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          router.replace('/admin/login');
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.replace('/admin/login');
  };

  if (isLoading && pathname !== '/admin/login') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
        <p style={{ color: '#C9A84C' }}>Verifying session...</p>
      </div>
    );
  }

  // Hide sidebar on login page
  if (pathname === '/admin/login') {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Menu Orders', path: '/admin/menu-orders', icon: <ShoppingCart size={20} /> },
    { name: 'Bills', path: '/admin/bills', icon: <Receipt size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Packages', path: '/admin/packages', icon: <MenuIcon size={20} /> },
  ];

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050505', color: '#F5F0E8' }}>
        
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 40 }} 
          />
        )}

        <aside 
          className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          style={{ 
            width: isSidebarCollapsed ? '80px' : '260px', 
            backgroundColor: '#111', 
            borderRight: '1px solid rgba(201, 168, 76, 0.1)', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'width 0.3s ease, transform 0.3s ease',
            zIndex: 50,
            position: 'relative',
            height: '100vh',
          }}
        >
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!isSidebarCollapsed && (
              <Link href="/" style={{ textDecoration: 'none' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9A84C', margin: 0 }}>Delight</h1>
              </Link>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              className="sidebar-toggle-btn"
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          <nav style={{ flex: 1, padding: '1.25rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path} style={{ marginBottom: '0.4rem' }}>
                    <Link 
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        color: isActive ? '#C9A84C' : '#A3A3A3',
                        backgroundColor: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                        fontWeight: isActive ? '600' : '400',
                        transition: '0.3s',
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                      }}
                      title={isSidebarCollapsed ? item.name : ''}
                    >
                      {item.icon}
                      <span className="sidebar-text">{!isSidebarCollapsed && item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Link 
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.9rem',
                borderRadius: '0.5rem',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
              }}
              title={isSidebarCollapsed ? 'View Site' : ''}
            >
              <ExternalLink size={18} />
              {!isSidebarCollapsed && <span>View Public Site</span>}
            </Link>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#ef4444',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                borderRadius: '0.5rem',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                marginTop: '0.5rem'
              }}
              title={isSidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut size={18} />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Header for Mobile */}
          <header style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', backgroundColor: '#111' }} className="mobile-header">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
             >
               <Menu size={24} />
             </button>
             <h2 style={{ fontSize: '1.2rem', color: '#C9A84C', marginLeft: '1rem', flex: 1 }}>Delight Admin</h2>
          </header>

          <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {children}
          </main>
        </div>

        <style jsx global>{`
          @media (max-width: 767px) {
            .admin-sidebar { 
              position: fixed !important;
              transform: translateX(-100%);
              width: 260px !important;
            }
            .admin-sidebar.mobile-open {
              transform: translateX(0);
            }
            .mobile-header { display: flex !important; }
            .sidebar-toggle-btn { display: none !important; }
          }
          @media (min-width: 768px) {
            .mobile-header { display: none !important; }
          }
          /* Tablet Auto-Collapse */
          @media (min-width: 768px) and (max-width: 1024px) {
             .admin-sidebar:not(.mobile-open) {
                width: 80px !important;
             }
             .admin-sidebar:not(.mobile-open) .sidebar-text {
                display: none !important;
             }
             .admin-sidebar:not(.mobile-open) li a {
                justify-content: center !important;
             }
          }
          
          .sidebar-nav-item:hover {
            background-color: rgba(255,255,255,0.05);
            color: #fff;
          }

          /* Generic Admin UI Defaults */
          .card {
             background-color: #111;
             border: 1px solid rgba(255,255,255,0.05);
             border-radius: 0.75rem;
             padding: 1.5rem;
          }
          .btn-gold {
             background-color: #C9A84C;
             color: #000;
             border: none;
             padding: 0.6rem 1.2rem;
             border-radius: 0.4rem;
             font-weight: 600;
             cursor: pointer;
             transition: 0.3s;
          }
          .btn-gold:hover {
             background-color: #D4B96A;
             transform: translateY(-1px);
          }
        `}</style>
      </div>
    </ToastProvider>
  );
}
