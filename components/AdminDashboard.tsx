import React, { useEffect, useState } from 'react';
import { ChefHat, Clock, CheckCircle, Truck, Package, RefreshCw, Filter, UtensilsCrossed } from 'lucide-react';
import { Order } from '../types';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);

  const fetchOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem('ember_orders_db') || '[]');
    // Sort by timestamp descending (newest first)
    setOrders(storedOrders.sort((a: Order, b: Order) => b.timestamp - a.timestamp));
  };

  // Initial load and polling
  useEffect(() => {
    fetchOrders();
    let interval: ReturnType<typeof setInterval>;
    if (isAutoRefreshing) {
      interval = setInterval(fetchOrders, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoRefreshing]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('ember_orders_db', JSON.stringify(updatedOrders));
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return ['received', 'preparing', 'delivering'].includes(order.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(order.status);
    return true;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'preparing': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'delivering': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 p-6 md:p-12 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-50 flex items-center gap-3">
             <ChefHat className="w-8 h-8 text-brand-500" />
             Kitchen Display System
          </h1>
          <p className="text-brand-200/60 mt-1">Real-time order management dashboard</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-brand-900 rounded-lg p-1 border border-brand-800">
              <button 
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'active' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-400 hover:text-white'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'completed' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-400 hover:text-white'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-400 hover:text-white'}`}
              >
                All
              </button>
           </div>
           
           <button 
             onClick={onLogout}
             className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg border border-red-900/50 hover:bg-red-900/50 transition-colors text-sm font-bold"
           >
             Exit KDS
           </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOrders.length === 0 ? (
           <div className="col-span-full py-20 text-center bg-brand-900/50 rounded-3xl border border-brand-800 border-dashed">
              <UtensilsCrossed className="w-16 h-16 text-brand-800 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-brand-200">No {filter} orders found</h3>
              <p className="text-brand-500/50 mt-2">Waiting for new tickets...</p>
           </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-brand-900 border border-brand-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full animate-fade-in-up">
              {/* Card Header */}
              <div className="p-5 border-b border-brand-800 bg-brand-900/80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xl font-bold text-white tracking-wider">#{order.id.replace('ORD-', '')}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-brand-200/70">
                   <span>{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   <span>{order.customerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar bg-brand-900/30">
                 <ul className="space-y-3">
                   {order.items.map((item, idx) => (
                     <li key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                           <span className="font-bold text-brand-500 w-5">{item.quantity}x</span>
                           <span className="text-brand-100">{item.name}</span>
                        </div>
                     </li>
                   ))}
                 </ul>
                 {/* Address Info for Delivery */}
                 <div className="mt-6 pt-4 border-t border-brand-800/50">
                    <p className="text-xs text-brand-500 uppercase font-bold tracking-widest mb-1">Delivery To</p>
                    <p className="text-sm text-brand-200 break-words">{order.address}</p>
                 </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-brand-950 border-t border-brand-800">
                <div className="grid grid-cols-2 gap-3">
                   {order.status === 'received' && (
                     <>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="py-3 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 text-xs font-bold uppercase transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="py-3 rounded-lg bg-orange-500 text-brand-950 hover:bg-orange-400 text-xs font-bold uppercase transition-colors shadow-lg"
                        >
                          Start Prep
                        </button>
                     </>
                   )}

                   {order.status === 'preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'delivering')}
                        className="col-span-2 py-3 rounded-lg bg-yellow-500 text-brand-950 hover:bg-yellow-400 text-xs font-bold uppercase transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        <Truck className="w-4 h-4" /> Send for Delivery
                      </button>
                   )}

                   {order.status === 'delivering' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="col-span-2 py-3 rounded-lg bg-green-500 text-brand-950 hover:bg-green-400 text-xs font-bold uppercase transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark Delivered
                      </button>
                   )}
                   
                   {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <div className="col-span-2 text-center text-xs text-brand-200/40 italic py-2">
                        Order Completed
                      </div>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;