import React, { useState, useEffect } from 'react';
import { User, Order, Booking } from '../types';
import { User as UserIcon, Mail, Lock, History, ChevronLeft, Save, X, Package, Calendar, MapPin, CreditCard, CheckCircle, Clock, Utensils, UtensilsCrossed } from 'lucide-react';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface UserProfileProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onBack, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [historyFilter, setHistoryFilter] = useState<'orders' | 'bookings'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
  });

  // Change Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // Fetch Orders and Bookings
  useEffect(() => {
    // Fetch Food Orders
    const allOrders = JSON.parse(localStorage.getItem('ember_orders_db') || '[]');
    const userOrders = allOrders.filter((o: Order) => o.userEmail === user.email);
    setOrders(userOrders.sort((a: Order, b: Order) => b.timestamp - a.timestamp));

    // Fetch Table Reservations
    const allBookings = JSON.parse(localStorage.getItem('ember_bookings_db') || '[]');
    const userBookings = allBookings.filter((b: Booking) => b.userEmail === user.email);
    setBookings(userBookings.sort((a: Booking, b: Booking) => b.timestamp - a.timestamp));

  }, [user.email]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editForm.name,
      email: editForm.email
    });
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- VERIFY CURRENT PASSWORD ---
    // Fetch latest user data from DB to ensure we check against the actual stored password
    const usersDb = JSON.parse(localStorage.getItem('ember_users_db') || '[]');
    const storedUser = usersDb.find((u: any) => u.email === user.email);

    if (!storedUser || storedUser.password !== passForm.currentPassword) {
      setPassMessage({ type: 'error', text: 'Incorrect current password.' });
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (passForm.newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    // Update user password in parent/local storage
    onUpdateUser({
      ...user,
      password: passForm.newPassword
    });

    setPassMessage({ type: 'success', text: 'Password updated successfully.' });
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    setTimeout(() => {
      setIsChangingPassword(false);
      setPassMessage({ type: '', text: '' });
    }, 1500);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'preparing': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'delivering': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'delivered': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  return (
    <div className="min-h-screen bg-brand-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-brand-200 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <h1 className="text-2xl font-serif font-bold text-white">My Account</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 bg-brand-500 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-brand-950 mb-4 shadow-lg">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-white font-bold text-lg">{user.name}</h2>
              <p className="text-brand-400 text-sm truncate">{user.email}</p>
            </div>

            <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                  activeTab === 'profile' 
                    ? 'bg-brand-800/50 text-white border-brand-500' 
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white border-transparent'
                }`}
              >
                <UserIcon className="w-5 h-5 mr-3" />
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                  activeTab === 'orders' 
                    ? 'bg-brand-800/50 text-white border-brand-500' 
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white border-transparent'
                }`}
              >
                <History className="w-5 h-5 mr-3" />
                History
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-8 lg:col-span-9">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                
                {/* Personal Info Card */}
                <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 sm:p-8 relative">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-brand-500" />
                      Personal Information
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-sm font-medium text-brand-400 hover:text-white transition-colors"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-2">Full Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full bg-brand-950 border border-brand-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-2">Email Address</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full bg-brand-950 border border-brand-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          className="flex items-center px-6 py-2 bg-brand-500 text-brand-950 font-bold rounded-lg hover:bg-brand-400 transition-colors shadow-lg"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fade-in">
                      <div>
                        <p className="text-xs font-medium text-brand-200 uppercase tracking-wider mb-1">Full Name</p>
                        <p className="text-white font-medium text-lg">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-brand-200 uppercase tracking-wider mb-1">Email Address</p>
                        <p className="text-white font-medium text-lg">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Card */}
                <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-brand-500" />
                      Security
                    </h3>
                  </div>

                  {!isChangingPassword ? (
                    <div className="flex items-center justify-between bg-brand-950/50 p-4 rounded-xl border border-brand-800/50">
                      <div className="flex items-center text-brand-200">
                        <span className="text-2xl mr-2">••••••••</span>
                        <span className="text-sm">Password hidden</span>
                      </div>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 bg-brand-800 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors border border-brand-700"
                      >
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in max-w-md">
                      {passMessage.text && (
                        <div className={`p-3 rounded-lg text-sm mb-4 ${
                          passMessage.type === 'error' ? 'bg-red-900/30 text-red-200 border border-red-800' : 'bg-green-900/30 text-green-200 border border-green-800'
                        }`}>
                          {passMessage.text}
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-2">Current Password</label>
                        <input
                          type="password"
                          required
                          value={passForm.currentPassword}
                          onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                          className="w-full bg-brand-950 border border-brand-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-2">New Password</label>
                        <input
                          type="password"
                          required
                          value={passForm.newPassword}
                          onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                          className="w-full bg-brand-950 border border-brand-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={passForm.confirmPassword}
                          onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                          className="w-full bg-brand-950 border border-brand-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-brand-500 text-brand-950 font-bold rounded-lg hover:bg-brand-400 transition-colors shadow-lg text-sm"
                        >
                          Update Password
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsChangingPassword(false); setPassMessage({type:'', text:''}); }}
                          className="px-5 py-2 bg-transparent text-brand-200 font-medium rounded-lg hover:text-white transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* --- ORDERS / HISTORY TAB --- */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                 <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-serif font-bold text-white flex items-center">
                        <History className="w-5 h-5 mr-2 text-brand-500" />
                        My History
                      </h3>
                      <div className="flex bg-brand-950 rounded-lg p-1 border border-brand-800">
                        <button 
                          onClick={() => setHistoryFilter('orders')}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${historyFilter === 'orders' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-400 hover:text-white'}`}
                        >
                          Orders
                        </button>
                        <button 
                          onClick={() => setHistoryFilter('bookings')}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${historyFilter === 'bookings' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-400 hover:text-white'}`}
                        >
                          Reservations
                        </button>
                      </div>
                    </div>

                    {/* === FOOD ORDERS LIST === */}
                    {historyFilter === 'orders' && (
                      <>
                        {orders.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-brand-800 rounded-xl">
                            <Package className="w-12 h-12 text-brand-700 mx-auto mb-3" />
                            <p className="text-brand-200 font-medium">No orders found</p>
                            <p className="text-brand-500/50 text-sm mt-1">Looks like you haven't ordered anything yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {orders.map((order) => (
                              <div key={order.id} className="bg-brand-950 border border-brand-800 rounded-xl p-5 hover:border-brand-700 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-brand-800 pb-4">
                                    <div>
                                      <div className="flex items-center gap-3 mb-1">
                                          <span className="font-mono text-lg font-bold text-white">{order.id}</span>
                                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                          </span>
                                      </div>
                                      <div className="flex items-center text-xs text-brand-400">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {new Date(order.timestamp).toLocaleDateString()} at {new Date(order.timestamp).toLocaleTimeString()}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xl font-bold text-white font-serif">${order.total.toFixed(2)}</p>
                                      <p className="text-xs text-brand-400">{order.items.length} items</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm text-brand-200/80">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                </div>
                                
                                <div className="flex items-center text-xs text-brand-500 font-medium">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Delivered to: <span className="text-brand-200 ml-1">{order.address}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* === TABLE RESERVATIONS LIST === */}
                    {historyFilter === 'bookings' && (
                       <>
                        {bookings.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-brand-800 rounded-xl">
                            <UtensilsCrossed className="w-12 h-12 text-brand-700 mx-auto mb-3" />
                            <p className="text-brand-200 font-medium">No reservations found</p>
                            <p className="text-brand-500/50 text-sm mt-1">You haven't booked any tables yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {bookings.map((booking) => (
                              <div key={booking.id} className="bg-brand-950 border border-brand-800 rounded-xl p-5 hover:border-brand-700 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-brand-800 pb-4">
                                    <div>
                                      <div className="flex items-center gap-3 mb-1">
                                          <span className="font-mono text-lg font-bold text-white">{booking.id}</span>
                                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border text-green-400 bg-green-500/10 border-green-500/20">
                                            {booking.status}
                                          </span>
                                      </div>
                                      <div className="flex items-center text-xs text-brand-400">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Booked on {new Date(booking.timestamp).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2 sm:block">
                                       <span className="px-3 py-1 bg-brand-800 rounded-lg text-white font-serif font-bold text-lg">
                                          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                                       </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center text-brand-200 text-sm">
                                      <Calendar className="w-4 h-4 mr-2 text-brand-500" />
                                      {new Date(booking.date).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                                    </div>
                                    <div className="flex items-center text-brand-200 text-sm">
                                      <Clock className="w-4 h-4 mr-2 text-brand-500" />
                                      {formatTime(booking.time)}
                                    </div>
                                </div>

                                {booking.specialRequests && (
                                   <div className="bg-brand-900/50 p-3 rounded-lg border border-brand-800/50 text-xs italic text-brand-300">
                                      " {booking.specialRequests} "
                                   </div>
                                )}
                                
                                <div className="flex items-center text-xs text-brand-500 font-medium mt-3">
                                    <Utensils className="w-3 h-3 mr-1" />
                                    Reserved under: <span className="text-brand-200 ml-1">{booking.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                       </>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;