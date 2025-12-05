import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, CheckCircle, Truck, Utensils, Package, Clock, ChefHat, XCircle, Timer, CreditCard, Banknote, Wallet, MapPin, ArrowLeft, ChevronRight, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { CartItem, Order, User } from '../types';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currentUser?: User | null;
  onLoginRequired: () => void;
}

type OrderStatus = 'idle' | 'checkout' | 'received' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart, currentUser, onLoginRequired }) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [orderId, setOrderId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Checkout State
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: 'card' // 'card' | 'wallet' | 'cash'
  });
  const [tipPercentage, setTipPercentage] = useState(0);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const tipAmount = (subtotal * tipPercentage) / 100;
  const finalTotal = subtotal + deliveryFee + tipAmount;

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Pre-fill name if user is logged in
  useEffect(() => {
    if (currentUser) {
      setCheckoutForm(prev => ({ ...prev, name: currentUser.name }));
    }
  }, [currentUser]);

  // --- POLLING LOGIC FOR STATUS UPDATES & TIMER ---
  useEffect(() => {
    const checkUpdates = () => {
      const storedOrders = JSON.parse(localStorage.getItem('ember_orders_db') || '[]');
      const myOrder = storedOrders.find((o: Order) => o.id === orderId);

      if (myOrder) {
          // Sync Status
          if (myOrder.status !== orderStatus) {
              setOrderStatus(myOrder.status);
              if (myOrder.status === 'preparing') setCurrentStep(1);
              if (myOrder.status === 'delivering') setCurrentStep(2);
              if (myOrder.status === 'delivered') setCurrentStep(3);
              if (myOrder.status === 'cancelled') setCurrentStep(0);
          }

          // Sync Timer based on actual order timestamp
          if (myOrder.status === 'received') {
            const elapsedSeconds = Math.floor((Date.now() - myOrder.timestamp) / 1000);
            const remaining = Math.max(0, 60 - elapsedSeconds);
            setTimeLeft(remaining);
          } else {
            setTimeLeft(0);
          }
      }
    };

    let interval: ReturnType<typeof setInterval>;

    if (orderStatus !== 'idle' && orderStatus !== 'checkout' && orderId) {
      checkUpdates(); // Run immediately to avoid UI flicker
      interval = setInterval(checkUpdates, 1000); // Check every 1 second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderStatus, orderId]);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    setOrderStatus('checkout');
  };

  const handleBackToCart = () => {
    setOrderStatus('idle');
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment processing
    setTimeout(() => {
      const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newOrder: Order = {
        id: newOrderId,
        customerName: checkoutForm.name || 'Guest',
        userEmail: currentUser?.email, // Link order to user
        items: [...items],
        total: finalTotal,
        status: 'received',
        address: `${checkoutForm.address}, ${checkoutForm.city} ${checkoutForm.zip}`,
        timestamp: Date.now()
      };

      // SAVE TO LOCAL STORAGE (MOCK DB)
      const storedOrders = JSON.parse(localStorage.getItem('ember_orders_db') || '[]');
      localStorage.setItem('ember_orders_db', JSON.stringify([...storedOrders, newOrder]));

      setOrderId(newOrderId);
      setOrderStatus('received');
      setCurrentStep(0);
      setTimeLeft(60);
      onClearCart(); // Clear the actual cart items
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCancelOrder = () => {
    const storedOrders = JSON.parse(localStorage.getItem('ember_orders_db') || '[]');
    const currentOrder = storedOrders.find((o: Order) => o.id === orderId);
    
    if (currentOrder) {
        // Double check time constraint
        const elapsed = (Date.now() - currentOrder.timestamp) / 1000;
        if (elapsed > 60) {
            setTimeLeft(0); // Force UI update
            return; // Exit without cancelling
        }

        // Update local storage to cancelled
        const updatedOrders = storedOrders.map((o: Order) => 
          o.id === orderId ? { ...o, status: 'cancelled' } : o
        );
        localStorage.setItem('ember_orders_db', JSON.stringify(updatedOrders));

        setOrderStatus('cancelled');
        setCurrentStep(0);
    }
  };

  const resetOrder = () => {
    setOrderStatus('idle');
    setOrderId('');
    setCurrentStep(0);
    setTimeLeft(60);
    setTipPercentage(0);
    // Reset form
    setCheckoutForm(prev => ({
      ...prev,
      address: '',
      city: '',
      zip: '',
      paymentMethod: 'card'
    }));
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    { label: 'Order Received', icon: CheckCircle, desc: 'We have received your order.', color: 'text-blue-400' },
    { label: 'Preparing', icon: ChefHat, desc: 'Chef is crafting your dish.', color: 'text-orange-400' },
    { label: 'Out for Delivery', icon: Truck, desc: 'Your food is on the way.', color: 'text-yellow-400' },
    { label: 'Delivered', icon: Package, desc: 'Enjoy your meal!', color: 'text-green-400' },
  ];

  return (
    <div className="fixed inset-0 z-[60]" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity backdrop-blur-sm" 
        aria-hidden="true"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10 pointer-events-none">
        <div className="pointer-events-auto w-screen max-w-md">
          {/* Main Container - Flex Column to handle scrolling correctly */}
          <div className="flex flex-col h-[100dvh] bg-brand-900 shadow-2xl border-l border-brand-800">
            
            {/* 1. Header (Fixed) */}
            <div className="flex-none flex items-center justify-between px-4 py-6 bg-brand-950 border-b border-brand-800 text-white sm:px-6">
              <h2 className="text-xl font-medium font-serif flex items-center" id="slide-over-title">
                {orderStatus === 'idle' && (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-3 text-brand-500" />
                    Your Cart
                  </>
                )}
                {orderStatus === 'checkout' && (
                  <>
                    <CreditCard className="w-5 h-5 mr-3 text-brand-500" />
                    Secure Checkout
                  </>
                )}
                {(orderStatus !== 'idle' && orderStatus !== 'checkout') && (
                  <>
                    <Clock className="w-5 h-5 mr-3 text-brand-500" />
                    {orderStatus === 'cancelled' ? 'Order Cancelled' : 'Order Status'}
                  </>
                )}
              </h2>
              <button
                type="button"
                className="-m-2 p-2 text-brand-400 hover:text-white transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* 2. Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 custom-scrollbar">
              
              {/* --- VIEW 1: CHECKOUT FORM --- */}
              {orderStatus === 'checkout' && (
                <form id="checkout-form" onSubmit={handleFinalizeOrder} className="space-y-8 animate-fade-in pb-8">
                  
                  {/* Order Summary Toggle */}
                  <div className="bg-brand-950 rounded-xl border border-brand-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-900 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-white font-medium">
                        <ShoppingBag className="w-4 h-4 text-brand-500" />
                        <span>Order Summary</span>
                        <span className="bg-brand-800 text-brand-200 text-xs px-2 py-0.5 rounded-full ml-2">
                           {items.reduce((s, i) => s + i.quantity, 0)} items
                        </span>
                      </div>
                      {isSummaryOpen ? <ChevronUp className="w-4 h-4 text-brand-400" /> : <ChevronDown className="w-4 h-4 text-brand-400" />}
                    </button>
                    
                    {isSummaryOpen && (
                      <div className="border-t border-brand-800 bg-brand-900/50 p-4 space-y-3">
                         {items.map((item) => (
                           <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-brand-200"><span className="text-brand-500 font-bold">{item.quantity}x</span> {item.name}</span>
                              <span className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                           </div>
                         ))}
                         <div className="border-t border-brand-800 pt-3 flex justify-between font-bold text-white">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery Address Section */}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-brand-500" />
                      Delivery Details
                    </h3>
                    <div className="space-y-4">
                       <div>
                        <label htmlFor="name" className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={checkoutForm.name}
                          onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                          className="block w-full rounded-lg bg-brand-800 border-brand-700 text-brand-50 placeholder-brand-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm p-3 border transition-colors outline-none"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-1.5">Street Address</label>
                        <input
                          type="text"
                          id="address"
                          required
                          value={checkoutForm.address}
                          onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                          className="block w-full rounded-lg bg-brand-800 border-brand-700 text-brand-50 placeholder-brand-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm p-3 border transition-colors outline-none"
                          placeholder="123 Main St, Apt 4B"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-1.5">City</label>
                          <input
                            type="text"
                            id="city"
                            required
                            value={checkoutForm.city}
                            onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                            className="block w-full rounded-lg bg-brand-800 border-brand-700 text-brand-50 placeholder-brand-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm p-3 border transition-colors outline-none"
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label htmlFor="zip" className="block text-xs font-medium text-brand-200 uppercase tracking-wider mb-1.5">Zip Code</label>
                          <input
                            type="text"
                            id="zip"
                            required
                            value={checkoutForm.zip}
                            onChange={(e) => setCheckoutForm({...checkoutForm, zip: e.target.value})}
                            className="block w-full rounded-lg bg-brand-800 border-brand-700 text-brand-50 placeholder-brand-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm p-3 border transition-colors outline-none"
                            placeholder="10001"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tip Selection */}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-brand-500" />
                      Add Gratuity
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                       {[0, 10, 15, 20].map((percent) => (
                         <button
                           key={percent}
                           type="button"
                           onClick={() => setTipPercentage(percent)}
                           className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                             tipPercentage === percent
                               ? 'bg-brand-500 text-brand-950 border-brand-500 shadow-lg'
                               : 'bg-brand-900 border-brand-700 text-brand-300 hover:border-brand-500 hover:text-white'
                           }`}
                         >
                           {percent === 0 ? 'No Tip' : `${percent}%`}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center">
                      <Wallet className="w-5 h-5 mr-2 text-brand-500" />
                      Payment Method
                    </h3>
                    <div className="space-y-3">
                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'card' ? 'bg-brand-800 border-brand-500 ring-1 ring-brand-500' : 'bg-brand-900 border-brand-700 hover:border-brand-600'}`}>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="card"
                            checked={checkoutForm.paymentMethod === 'card'}
                            onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'card'})}
                            className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                             <CreditCard className="w-5 h-5 text-brand-200 mr-3" />
                             <span className="block text-sm font-medium text-brand-50">Credit / Debit Card</span>
                          </div>
                        </div>
                      </label>

                      {checkoutForm.paymentMethod === 'card' && (
                         <div className="p-4 bg-brand-950/50 rounded-lg border border-brand-800 animate-fade-in">
                            <div className="space-y-3">
                              <input type="text" placeholder="Card Number" className="w-full bg-brand-900 border border-brand-700 rounded-md p-3 text-sm text-white outline-none focus:border-brand-500" />
                              <div className="grid grid-cols-2 gap-3">
                                 <input type="text" placeholder="MM/YY" className="w-full bg-brand-900 border border-brand-700 rounded-md p-3 text-sm text-white outline-none focus:border-brand-500" />
                                 <input type="text" placeholder="CVC" className="w-full bg-brand-900 border border-brand-700 rounded-md p-3 text-sm text-white outline-none focus:border-brand-500" />
                              </div>
                            </div>
                         </div>
                      )}

                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'wallet' ? 'bg-brand-800 border-brand-500 ring-1 ring-brand-500' : 'bg-brand-900 border-brand-700 hover:border-brand-600'}`}>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="wallet"
                            checked={checkoutForm.paymentMethod === 'wallet'}
                            onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'wallet'})}
                            className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                             <Wallet className="w-5 h-5 text-brand-200 mr-3" />
                             <span className="block text-sm font-medium text-brand-50">Digital Wallet (Apple/Google Pay)</span>
                          </div>
                        </div>
                      </label>

                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${checkoutForm.paymentMethod === 'cash' ? 'bg-brand-800 border-brand-500 ring-1 ring-brand-500' : 'bg-brand-900 border-brand-700 hover:border-brand-600'}`}>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="cash"
                            checked={checkoutForm.paymentMethod === 'cash'}
                            onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'cash'})}
                            className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                             <Banknote className="w-5 h-5 text-brand-200 mr-3" />
                             <span className="block text-sm font-medium text-brand-50">Cash on Delivery</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Final Totals Breakdown */}
                  <div className="border-t border-brand-800 pt-6 space-y-2">
                    <div className="flex justify-between text-sm font-medium text-brand-200">
                       <p>Subtotal</p>
                       <p>${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-brand-200">
                       <p>Delivery Fee</p>
                       <p>${deliveryFee.toFixed(2)}</p>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-sm font-medium text-brand-300">
                         <p>Tip ({tipPercentage}%)</p>
                         <p>${tipAmount.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-white mt-4 font-serif border-t border-brand-800 pt-4">
                       <p>Total</p>
                       <p className="text-brand-500">${finalTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </form>
              )}
              
              {/* --- VIEW 2: TRACKING --- */}
              {(orderStatus !== 'idle' && orderStatus !== 'checkout') ? (
                <div className="space-y-8 animate-fade-in pb-4">
                  
                  {orderStatus === 'cancelled' ? (
                    <div className="bg-red-900/20 p-8 rounded-2xl text-center mt-8 border border-red-800 animate-fade-in-up">
                       <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/50 mb-4">
                          <XCircle className="h-8 w-8 text-red-400" />
                       </div>
                       <p className="text-red-400 font-bold text-xl font-serif">Order Cancelled</p>
                       <p className="text-sm text-red-200/70 mt-2 mb-6">Your order {orderId} has been cancelled.</p>
                       <button 
                         onClick={resetOrder}
                         className="w-full bg-brand-500 text-white py-4 rounded-xl hover:bg-brand-400 transition-all font-bold shadow-lg transform hover:-translate-y-1"
                       >
                         Return to Menu
                       </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center pb-6 border-b border-brand-800">
                        <p className="text-sm text-brand-400 mb-2 uppercase tracking-widest font-semibold">Order ID</p>
                        <div className="inline-block bg-brand-950 px-6 py-2 rounded-lg border border-brand-800">
                          <p className="text-3xl font-bold text-white tracking-widest font-mono">{orderId}</p>
                        </div>
                      </div>

                      {/* Cancellation Timer (Only in 'received' state) */}
                      {orderStatus === 'received' && (
                        <div className="bg-brand-800/50 rounded-xl p-4 border border-brand-700/50 flex flex-col items-center animate-fade-in">
                          {timeLeft > 0 ? (
                            <>
                              <div className="flex items-center gap-2 text-brand-200 text-sm mb-3">
                                <Timer className="w-4 h-4 text-brand-500 animate-pulse" />
                                <span>Time to modify order: <span className="text-white font-mono font-bold text-base">{timeLeft}s</span></span>
                              </div>
                              <button 
                                onClick={handleCancelOrder}
                                className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                              </button>
                              <p className="text-[10px] text-brand-500/60 mt-2 text-center">
                                Orders cannot be cancelled once preparation begins.
                              </p>
                            </>
                          ) : (
                            <div className="text-center w-full">
                               <div className="flex items-center justify-center gap-2 text-brand-400/60 mb-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-bold uppercase tracking-wider">Order Locked</span>
                               </div>
                               <p className="text-[10px] text-brand-200/40">Kitchen has begun processing. Cancellation unavailable.</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="relative px-2 py-4">
                        {steps.map((step, idx) => {
                          const Icon = step.icon;
                          const isCompleted = idx < currentStep;
                          const isCurrent = idx === currentStep;
                          const isPending = idx > currentStep;

                          return (
                            <div key={idx} className="relative flex gap-6 pb-12 last:pb-0">
                              {/* Vertical Line */}
                              {idx !== steps.length - 1 && (
                                <div 
                                  className={`absolute top-10 left-4 -ml-px h-full w-0.5 transition-colors duration-500 ${
                                    isCompleted ? 'bg-brand-500' : 'bg-brand-800'
                                  }`} 
                                  aria-hidden="true"
                                ></div>
                              )}
                              
                              {/* Icon Circle */}
                              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-brand-900 z-10 transition-all duration-500 ${
                                isCompleted || isCurrent ? 'bg-brand-500 scale-110' : 'bg-brand-800'
                              }`}>
                                <Icon className={`h-4 w-4 transition-colors duration-300 ${
                                  isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                                }`} />
                                
                                {/* Pulse effect for current step */}
                                {isCurrent && orderStatus !== 'delivered' && (
                                  <span className="absolute -inset-1 rounded-full animate-ping bg-brand-500 opacity-25"></span>
                                )}
                              </div>

                              {/* Text Content */}
                              <div className={`flex-1 pt-0.5 transition-opacity duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                                <p className={`text-lg font-bold font-serif ${isCurrent ? 'text-brand-400' : 'text-white'}`}>
                                  {step.label}
                                </p>
                                <p className="text-sm text-brand-200/60 mt-1 leading-snug">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {orderStatus === 'delivered' && (
                        <div className="bg-green-900/20 p-8 rounded-2xl text-center mt-8 border border-green-800 animate-fade-in-up">
                          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/50 mb-4">
                              <Utensils className="h-8 w-8 text-green-400" />
                          </div>
                          <p className="text-green-400 font-bold text-xl font-serif">Bon Appétit!</p>
                          <p className="text-sm text-green-200/70 mt-2 mb-6">Your order has been delivered to {checkoutForm.address}.</p>
                          <button 
                            onClick={resetOrder}
                            className="w-full bg-brand-500 text-white py-4 rounded-xl hover:bg-brand-400 transition-all font-bold shadow-lg transform hover:-translate-y-1"
                          >
                            Start New Order
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : null}
              
              {/* --- VIEW 3: CART LIST --- */}
              {orderStatus === 'idle' && (
                <div className="flow-root">
                  {items.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                      <div className="bg-brand-800/50 p-8 rounded-full mb-6 border border-brand-700/50">
                        <ShoppingBag className="w-12 h-12 text-brand-600" />
                      </div>
                      <p className="text-xl font-medium text-white font-serif">Your cart is empty</p>
                      <p className="text-brand-300/60 mt-2 mb-8 max-w-xs mx-auto">Looks like you haven't added any delicious items yet.</p>
                      <button 
                        onClick={onClose}
                        className="text-brand-500 font-bold hover:text-brand-400 transition-colors uppercase tracking-wide text-sm border-b-2 border-brand-500 pb-1"
                      >
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    <ul role="list" className="-my-6 divide-y divide-brand-800">
                      {items.map((item) => (
                        <li key={item.id} className="flex py-8">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-brand-700 bg-brand-800">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-white">
                                <h3 className="font-serif text-lg leading-tight line-clamp-2">{item.name}</h3>
                                <p className="ml-4 font-bold text-brand-500">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-brand-400/80 capitalize">{item.category}</p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm mt-4">
                              <div className="flex items-center border border-brand-700 rounded-lg bg-brand-800">
                                <button 
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="p-2 hover:bg-brand-700 text-gray-400 hover:text-white rounded-l-lg transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 font-semibold text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="p-2 hover:bg-brand-700 text-gray-400 hover:text-white rounded-r-lg transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="font-medium text-red-400 hover:text-red-300 flex items-center transition-colors text-xs uppercase tracking-wide opacity-80 hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 3. Footer (Fixed) */}
            
            {/* IDLE STATE FOOTER */}
            {orderStatus === 'idle' && items.length > 0 && (
              <div className="flex-none border-t border-brand-800 py-6 px-4 sm:px-6 bg-brand-900/95 backdrop-blur-xl z-20">
                <div className="flex justify-between text-xl font-bold text-white mb-6 font-serif">
                  <p>Subtotal</p>
                  <p className="text-brand-500">${subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <button
                    onClick={handleProceedToCheckout}
                    className="flex w-full items-center justify-center rounded-xl border border-transparent bg-brand-500 px-6 py-4 text-base font-bold text-brand-950 shadow-[0_0_20px_rgba(232,93,4,0.3)] hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(232,93,4,0.5)] transform hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                  <button
                    type="button"
                    className="font-medium text-brand-400 hover:text-brand-300 transition-colors"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

            {/* CHECKOUT STATE FOOTER */}
            {orderStatus === 'checkout' && (
              <div className="flex-none border-t border-brand-800 py-6 px-4 sm:px-6 bg-brand-900/95 backdrop-blur-xl z-20">
                <div className="flex gap-4">
                  <button
                    onClick={handleBackToCart}
                    type="button"
                    className="flex items-center justify-center rounded-xl border border-brand-700 bg-brand-800 px-4 py-4 text-base font-bold text-white hover:bg-brand-700 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center rounded-xl border border-transparent bg-brand-500 px-6 py-4 text-base font-bold text-brand-950 shadow-[0_0_20px_rgba(232,93,4,0.3)] hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(232,93,4,0.5)] transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay $${finalTotal.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;