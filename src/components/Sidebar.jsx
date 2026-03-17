import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Package, 
  // ShoppingCart, 
  Settings, 
  LogOut, 
  Home, 
  Calendar, 
  BarChart2, 
  Layers, 
  X, 
  Layout, 
  MessageSquare, 
  HelpCircle, 
  // FileEdit, 
  Inbox, 
  Mail,
  FileText,
  ChevronDown,
  Briefcase,
  Users as UsersIcon,
  Globe,
  Monitor
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert, showConfirm } from '../utils/swal';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({
    business: true,
    engagement: false,
    content: false,
    system: false
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleLogout = async () => {
    const result = await showConfirm(
      'Sign Out?',
      'Are you sure you want to end your current session?',
      'Yes, Logout'
    );

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showAlert('Signed Out', 'You have been successfully logged out.', 'success');
      navigate('/login');
    } catch (error) {
      showAlert('Error', error.message || 'Error logging out', 'error');
    }
  };

  const menuGroups = [
    {
      id: 'business',
      title: 'Business Operations',
      icon: <Briefcase size={18} />,
      items: [
        { title: 'Services', path: '/services', icon: <Package size={16} /> },
        { title: 'Categories', path: '/categories', icon: <Layers size={16} /> },
        // { title: 'Orders', path: '/orders', icon: <ShoppingCart size={16} /> },
        { title: 'Bookings', path: '/bookings', icon: <Calendar size={16} /> },
        // { title: 'Invoices', path: '/invoices', icon: <FileEdit size={16} /> },
        { title: 'Reports', path: '/reports', icon: <BarChart2 size={16} /> },
      ]
    },
    {
      id: 'engagement',
      title: 'User Engagement',
      icon: <UsersIcon size={18} />,
      items: [
        { title: 'Customers', path: '/customers', icon: <UserCheck size={16} /> },
        { title: 'Inquiries', path: '/inquiries', icon: <Inbox size={16} /> },
        { title: 'Subscribers', path: '/subscribers', icon: <Mail size={16} /> },
        { title: 'Reviews', path: '/reviews', icon: <MessageSquare size={16} /> },
      ]
    },
    {
      id: 'content',
      title: 'Content & CMS',
      icon: <Globe size={18} />,
      items: [
        // { title: 'CMS Pages', path: '/cms', icon: <FileEdit size={16} /> },
        { title: 'News Editor', path: '/news', icon: <FileText size={16} /> },
        { title: 'Hero Slider', path: '/hero-slider', icon: <Layout size={16} /> },
        { title: 'Navigation', path: '/navigation', icon: <Layers size={16} /> },
        { title: 'Popup Ads', path: '/popup-ads', icon: <Monitor size={16} /> },
        { title: 'FAQs', path: '/faqs', icon: <HelpCircle size={16} /> },
      ]
    },
    {
      id: 'system',
      title: 'System Control',
      icon: <Monitor size={18} />,
      items: [
        { title: 'Team & Access', path: '/team', icon: <Users size={16} /> },
        { title: 'Settings', path: '/settings', icon: <Settings size={16} /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-64 bg-brand-charcoal text-white z-30 border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none flex flex-col`}>

        <div className="flex flex-col items-center justify-center py-3 px-4 border-b border-white/5 bg-white/5 relative shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
            title="Collapse Sidebar"
          >
            <X size={18} />
          </button>
          <img 
            src={logo} 
            alt="Travel Lounge" 
            className="h-10 mb-3 object-contain" 
          />
          <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500">Dashboard</h1>
        </div>

        <nav className="mt-2 px-3 flex-1 overflow-y-auto custom-scrollbar pb-20">
          <div className="mb-4">
            <Link
              to="/"
              className={`flex items-center px-3.5 py-2.5 rounded-xl mb-1 transition-all duration-200 ${location.pathname === '/'
                ? 'bg-brand-red text-white shadow-lg shadow-red-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Home size={18} className="mr-3" />
              <span className="font-bold text-xs uppercase tracking-tight">Dashboard</span>
            </Link>
          </div>

          {menuGroups.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-gray-500 hover:text-gray-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 group-hover:text-brand-red transition-colors">{group.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{group.title}</span>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 ${openGroups[group.id] ? 'rotate-180' : ''}`} 
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openGroups[group.id] ? 'max-h-[500px] mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-4 space-y-1">
                  {group.items.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${location.pathname === item.path
                          ? 'bg-white/10 text-brand-red'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <span className="mr-3 shrink-0 opacity-70">{item.icon}</span>
                        <span className="font-bold text-[11px] uppercase tracking-tight">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/5 bg-brand-charcoal/95 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-400 hover:text-brand-red w-full px-3.5 py-2.5 rounded-xl hover:bg-red-500/5 transition-all duration-200 group"
          >
            <LogOut size={18} className="mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;