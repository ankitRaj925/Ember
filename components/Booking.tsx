import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, ChevronDown, User as UserIcon, Printer } from 'lucide-react';
import type { BookingRequest, User, Booking } from '../types';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface BookingProps {
  currentUser: User | null;
}

const Booking: React.FC<BookingProps> = ({ currentUser }) => {
  const [formData, setFormData] = useState<BookingRequest>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    specialRequests: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newId = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
    setReservationId(newId);

    // Save Booking to Local Storage for History
    const newBooking: Booking = {
      ...formData,
      id: newId,
      userEmail: currentUser?.email,
      status: 'confirmed',
      timestamp: Date.now()
    };

    const storedBookings = JSON.parse(localStorage.getItem('ember_bookings_db') || '[]');
    localStorage.setItem('ember_bookings_db', JSON.stringify([...storedBookings, newBooking]));

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setReservationId('');
    setFormData(prev => ({ 
      ...prev, 
      date: '', 
      time: '', 
      guests: 2, 
      specialRequests: '' 
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print your reservation.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reservation Confirmation - ${reservationId}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e85d04;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 5px;
          }
          .logo span { color: #e85d04; }
          .subtitle {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .receipt-box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 30px;
            background: #f9f9f9;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            border-bottom: 1px dashed #eee;
            padding-bottom: 15px;
          }
          .row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .value {
            font-weight: bold;
            text-align: right;
          }
          .id-row {
            text-align: center;
            margin-bottom: 30px;
            background: #fff;
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #888;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Ember <span>&</span> Ash</div>
          <div class="subtitle">Reservation Receipt</div>
        </div>
        
        <div class="receipt-box">
          <div class="id-row">
            <div style="font-size: 12px; color: #888; margin-bottom: 5px;">CONFIRMATION CODE</div>
            <div style="font-size: 24px; letter-spacing: 2px;">${reservationId}</div>
          </div>
          
          <div class="row">
            <span class="label">Date</span>
            <span class="value">${formatDate(formData.date)}</span>
          </div>
          <div class="row">
            <span class="label">Time</span>
            <span class="value">${formatTime(formData.time)}</span>
          </div>
          <div class="row">
            <span class="label">Guests</span>
            <span class="value">${formData.guests} ${formData.guests === 1 ? 'Person' : 'People'}</span>
          </div>
          <div class="row">
            <span class="label">Name</span>
            <span class="value">${formData.name}</span>
          </div>
          <div class="row">
            <span class="label">Email</span>
            <span class="value">${formData.email}</span>
          </div>
          ${formData.specialRequests ? `
          <div class="row">
            <span class="label">Requests</span>
            <span class="value" style="max-width: 200px; text-align: right;">${formData.specialRequests}</span>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>123 Culinary Blvd, Food City, FC 90210 • +1 (555) 123-4567</p>
          <p>Please present this receipt upon arrival.</p>
        </div>
        <script>
          // Automatically print when loaded
          window.onload = function() { 
            setTimeout(function() {
              window.print(); 
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isSubmitted) {
    return (
      <div className="bg-brand-900 py-20 sm:py-28" id="booking">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-brand-800 rounded-3xl shadow-2xl border border-brand-700 overflow-hidden animate-fade-in-up relative">
              <div className="h-2 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400"></div>
              
              <div className="p-8 sm:p-12">
                <div className="text-center mb-10">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900/30 border border-green-700/50 mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-brand-50 font-serif">Reservation Confirmed</h2>
                  <p className="mt-4 text-brand-200/80">We look forward to welcoming you to Ember & Ash.</p>
                </div>

                <div className="bg-brand-900/50 rounded-2xl p-6 mb-8 border border-brand-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs uppercase tracking-widest text-brand-400 font-bold mb-1">Reservation ID</p>
                    <p className="text-3xl font-mono text-white font-bold tracking-wider">{reservationId}</p>
                  </div>
                  <div className="px-5 py-2 bg-green-900/40 border border-green-800 rounded-full text-green-400 text-sm font-bold flex items-center uppercase tracking-wide">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2.5"></span>
                    Confirmed
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10 relative">
                   <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-brand-700/50 transform -translate-x-1/2"></div>

                   <div className="space-y-6">
                      <h3 className="text-lg font-serif font-bold text-white border-b border-brand-700/50 pb-2 mb-4">Date & Time</h3>
                      <div className="flex items-start group">
                        <div className="p-2 bg-brand-900 rounded-lg mr-4 group-hover:bg-brand-700 transition-colors">
                          <Calendar className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                           <p className="text-brand-50 font-medium text-lg">{formatDate(formData.date)}</p>
                           <p className="text-sm text-brand-400/60 uppercase tracking-wider font-semibold mt-0.5">Date</p>
                        </div>
                      </div>
                      <div className="flex items-start group">
                        <div className="p-2 bg-brand-900 rounded-lg mr-4 group-hover:bg-brand-700 transition-colors">
                          <Clock className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                           <p className="text-brand-50 font-medium text-lg">{formatTime(formData.time)}</p>
                           <p className="text-sm text-brand-400/60 uppercase tracking-wider font-semibold mt-0.5">Arrival Time</p>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-lg font-serif font-bold text-white border-b border-brand-700/50 pb-2 mb-4">Guest Details</h3>
                      <div className="flex items-start group">
                        <div className="p-2 bg-brand-900 rounded-lg mr-4 group-hover:bg-brand-700 transition-colors">
                          <Users className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                           <p className="text-brand-50 font-medium text-lg">{formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}</p>
                           <p className="text-sm text-brand-400/60 uppercase tracking-wider font-semibold mt-0.5">Table Size</p>
                        </div>
                      </div>
                      <div className="flex items-start group">
                        <div className="p-2 bg-brand-900 rounded-lg mr-4 group-hover:bg-brand-700 transition-colors">
                          <UserIcon className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                           <p className="text-brand-50 font-medium text-lg">{formData.name}</p>
                           <p className="text-sm text-brand-400/60 uppercase tracking-wider font-semibold mt-0.5">Reservation Name</p>
                        </div>
                      </div>
                   </div>
                </div>
                
                {formData.specialRequests && (
                  <div className="bg-brand-900/40 p-5 rounded-2xl border border-brand-700/50 mb-8">
                    <p className="text-xs uppercase tracking-widest text-brand-400 font-bold mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2"></span>
                      Special Requests
                    </p>
                    <p className="text-brand-100 italic pl-3.5 border-l-2 border-brand-700">"{formData.specialRequests}"</p>
                  </div>
                )}

                <div className="text-center text-sm text-brand-200/50 mb-8 font-light">
                  <p>A confirmation email has been sent to <span className="text-brand-100 font-medium">{formData.email}</span></p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={resetForm}
                    className="flex-1 px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-brand-950 bg-brand-500 hover:bg-brand-400 transition-all duration-300 shadow-[0_0_20px_rgba(232,93,4,0.3)] hover:shadow-[0_0_30px_rgba(232,93,4,0.5)] transform hover:-translate-y-0.5"
                  >
                    Make Another Reservation
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex-1 px-8 py-3.5 border border-brand-600 text-base font-bold rounded-xl text-brand-100 hover:bg-brand-800 transition-colors flex items-center justify-center gap-2 group"
                  >
                    <Printer className="w-4 h-4 group-hover:text-brand-400 transition-colors" />
                    Print Details
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-900 py-20 sm:py-28" id="booking">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-3xl font-extrabold text-brand-50 sm:text-5xl font-serif">Reserve Your Table</h2>
          <div className="w-20 h-1 bg-brand-500 mx-auto mt-6 rounded-full"></div>
          <p className="mt-6 max-w-2xl text-xl text-brand-200/70 lg:mx-auto font-light">
            Secure your spot for an unforgettable dining experience at Ember & Ash.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-brand-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-brand-700/50">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
            <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-200 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 placeholder-brand-700 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brand-200 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 placeholder-brand-700 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-brand-200 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 placeholder-brand-700 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-brand-200 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" /> Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors scheme-dark"
                />
              </div>
              
              <div className="relative">
                <label htmlFor="time" className="block text-sm font-medium text-brand-200 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" /> Time
                </label>
                <div className="relative">
                  <select
                    name="time"
                    id="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-brand-900">Select a time</option>
                    <option value="17:00" className="bg-brand-900">5:00 PM</option>
                    <option value="17:30" className="bg-brand-900">5:30 PM</option>
                    <option value="18:00" className="bg-brand-900">6:00 PM</option>
                    <option value="18:30" className="bg-brand-900">6:30 PM</option>
                    <option value="19:00" className="bg-brand-900">7:00 PM</option>
                    <option value="19:30" className="bg-brand-900">7:30 PM</option>
                    <option value="20:00" className="bg-brand-900">8:00 PM</option>
                    <option value="20:30" className="bg-brand-900">8:30 PM</option>
                    <option value="21:00" className="bg-brand-900">9:00 PM</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-500 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="guests" className="block text-sm font-medium text-brand-200 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-500" /> Guests
                </label>
                <div className="relative">
                  <select
                    name="guests"
                    id="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num} className="bg-brand-900">{num} {num === 1 ? 'Person' : 'People'}</option>
                    ))}
                    <option value="11" className="bg-brand-900">10+ (Group)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-brand-200 mb-2">Special Requests</label>
              <textarea
                name="specialRequests"
                id="specialRequests"
                rows={3}
                value={formData.specialRequests}
                onChange={handleChange}
                className="block w-full rounded-lg bg-brand-900/50 border-brand-700 text-brand-100 placeholder-brand-700 focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 border transition-colors"
                placeholder="Allergies, anniversary, booth preference..."
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-[0_0_20px_rgba(232,93,4,0.4)] text-lg font-bold text-brand-950 bg-brand-500 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? (
                   <div className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Confirming Table...
                   </div>
                ) : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;