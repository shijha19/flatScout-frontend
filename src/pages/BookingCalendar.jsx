import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import Tooltip from '../components/Tooltip';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [formData, setFormData] = useState({
    flatId: '',
    ownerEmail: '',
    visitorName: localStorage.getItem('name') || '',
    visitorEmail: localStorage.getItem('userEmail') || '',
    visitorPhone: '',
    purpose: 'Flat Visit',
    notes: ''
  });

  // Time slots configuration
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
    '17:00-18:00', '18:00-19:00'
  ];

  const purposeOptions = [
    'Flat Visit',
    'Property Inspection', 
    'Meet & Greet',
    'Document Verification',
    'Other'
  ];

  // Fetch user bookings
  useEffect(() => {
    fetchBookings();
    fetchFlats();
  }, []);

  const fetchBookings = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`/api/booking/user-bookings?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        // Combine visitor and owner bookings and format for calendar
        const allBookings = [...data.visitorBookings, ...data.ownerBookings];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const formattedBookings = allBookings
          .map(booking => {
            const start = new Date(`${booking.date.split('T')[0]}T${booking.timeSlot.split('-')[0]}:00`);
            const end = new Date(`${booking.date.split('T')[0]}T${booking.timeSlot.split('-')[1]}:00`);
            return {
              id: booking._id,
              title: `${booking.timeSlot} - ${booking.flatId?.title || 'Property Visit'}`,
              start,
              end,
              resource: booking,
              allDay: false
            };
          })
          .filter(booking => booking.end >= today); // Only show bookings whose end is today or in the future
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchFlats = async () => {
    try {
      const response = await fetch('/api/flats/');
      const data = await response.json();
      if (data.flats) {
        setFlats(data.flats);
      }
    } catch (error) {
      console.error('Error fetching flats:', error);
    }
  };

  const checkAvailability = async (flatId, date) => {
    setFetchingSlots(true);
    try {
      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(date);
      selectedDateOnly.setHours(0, 0, 0, 0);
      
      if (selectedDateOnly < today) {
        setAvailableSlots([]);
        setFetchingSlots(false);
        return;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      console.log('Checking availability for flatId:', flatId, 'date:', dateStr);
      const response = await fetch(`/api/booking/availability?flatId=${flatId}&date=${dateStr}`);
      
      if (!response.ok) {
        console.log('Availability API not available, showing all slots');
        // If API is not available, show all time slots as available
        setAvailableSlots(timeSlots);
        return;
      }
      
      const data = await response.json();
      console.log('Availability response:', data);
      
      if (data.success) {
        setAvailableSlots(data.availableSlots);
        console.log('Available slots set:', data.availableSlots);
      } else {
        console.log('API returned no success, showing all slots');
        // If API returns error, show all time slots as available
        setAvailableSlots(timeSlots);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      console.log('Error occurred, showing all slots as available');
      // If there's an error, show all time slots as available (fallback)
      setAvailableSlots(timeSlots);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleDateSelect = ({ start }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    const selectedDateOnly = new Date(start);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    // Prevent booking for past dates
    if (selectedDateOnly < today) {
      alert('Cannot book visits for past dates. Please select today or a future date.');
      return;
    }
    
    setSelectedDate(start);
    setShowBookingForm(true);
    setBookingStep(1);
    setSelectedSlot('');
    
    // If a flat is already selected, check availability for the new date
    if (formData.flatId) {
      checkAvailability(formData.flatId, start);
    } else {
      // Show all slots as available by default
      setAvailableSlots(timeSlots);
    }
  };

  const handleEventSelect = (event) => {
    const booking = event.resource;
    setSelectedEvent(booking);
    setShowEventDetails(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Selected slot:', selectedSlot);
    console.log('Selected date:', selectedDate);
    
    // Date validation - prevent booking for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    if (selectedDateOnly < today) {
      alert('Cannot book visits for past dates. Please select today or a future date.');
      return;
    }
    
    // Comprehensive validation
    if (!formData.flatId) {
      alert('Please select a property');
      return;
    }
    
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }
    
    if (!formData.visitorName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!formData.visitorPhone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    
    if (!formData.purpose) {
      alert('Please select a purpose for the visit');  
      return;
    }

    console.log('All validations passed, proceeding with booking...');
    setLoading(true);

    try {
      const selectedFlat = flats.find(f => f._id === formData.flatId);
      const bookingData = {
        ...formData,
        ownerEmail: selectedFlat?.contactEmail || 'demo@example.com',
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedSlot
      };

      console.log('Sending booking data:', bookingData);

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        alert('Booking created successfully!');
        resetBookingModal();
        fetchBookings(); // Refresh bookings
      } else {
        alert(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // For demo purposes, if the API fails, show success message
      if (error.message.includes('fetch')) {
        alert('Demo mode: Booking would be created successfully! (Backend not connected)');
        resetBookingModal();
      } else {
        alert('Error creating booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFlatChange = (e) => {
    const flatId = e.target.value;
    console.log('Flat selected:', flatId);
    
    const selectedFlat = flats.find(f => f._id === flatId);
    setFormData({ 
      ...formData, 
      flatId,
      ownerEmail: selectedFlat?.contactEmail || ''
    });
    setSelectedSlot('');
    
    if (flatId && selectedDate) {
      console.log('Checking availability for:', flatId, selectedDate);
      checkAvailability(flatId, selectedDate);
    } else {
      // If no flat selected or no date, show all slots as available
      setAvailableSlots(flatId ? timeSlots : []);
    }
  };

  const handleNextStep = () => {
    if (bookingStep === 1 && formData.flatId) {
      setBookingStep(2);
    } else if (bookingStep === 2 && selectedSlot) {
      setBookingStep(3);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const resetBookingModal = () => {
    setShowBookingForm(false);
    setBookingStep(1);
    setSelectedSlot('');
    setFormData({
      flatId: '',
      ownerEmail: '',
      visitorName: localStorage.getItem('name') || '',
      visitorEmail: localStorage.getItem('userEmail') || '',
      visitorPhone: '',
      purpose: 'Flat Visit',
      notes: ''
    });
  };

  const eventStyleGetter = (event) => {
    const booking = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (booking.status) {
      case 'pending':
        backgroundColor = '#f59e0b';
        break;
      case 'confirmed':
        backgroundColor = '#10b981';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
      case 'completed':
        backgroundColor = '#6b7280';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Custom day prop getter to disable past dates
  const dayPropGetter = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly < today) {
      return {
        className: 'past-date',
        style: {
          backgroundColor: '#f3f4f6',
          color: '#9ca3af',
          cursor: 'not-allowed',
          opacity: 0.6
        }
      };
    }
    
    return {};
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
            <span className="text-gray-700">Creating booking...</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold">Booking Calendar</h1>
          </div>
          <p className="text-pink-100">Schedule property visits and manage your bookings effortlessly</p>
        </div>

        <div className="p-4 sm:p-6">
          {/* Enhanced Legend */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Booking Status Legend
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Tooltip text="Booking is awaiting confirmation from property owner">
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-help">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
              </Tooltip>
              <Tooltip text="Booking has been confirmed by property owner">
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-help">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Confirmed</span>
                </div>
              </Tooltip>
              <Tooltip text="Booking has been cancelled">
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-help">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                </div>
              </Tooltip>
              <Tooltip text="Visit has been completed">
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-help">
                  <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </div>
              </Tooltip>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">How to use the calendar</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Click on today or any future date to schedule a property visit</li>
                  <li>• Past dates are disabled and cannot be selected for booking</li>
                  <li>• Click on existing bookings to view details or make changes</li>
                  <li>• Use the view buttons to switch between month, week, and day views</li>
                  <li>• Available time slots are from 9:00 AM to 7:00 PM</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
            <div className="h-[500px] sm:h-[600px] p-2 sm:p-4">
              <Calendar
                localizer={localizer}
                events={bookings}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectSlot={handleDateSelect}
                onSelectEvent={handleEventSelect}
                selectable
                eventPropGetter={eventStyleGetter}
                dayPropGetter={dayPropGetter}
                views={['month', 'week', 'day']}
                defaultView="month"
                min={new Date(2024, 0, 1, 9, 0)} // 9 AM
                max={new Date(2024, 0, 1, 19, 0)} // 7 PM
                className="custom-calendar"
                popup
                popupOffset={20}
              />
            </div>
          </div>

          {/* Step-by-Step Booking Form Modal */}
          {showBookingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Modal Header with Progress */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-6 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Book a Visit
                    </h3>
                    <button
                      onClick={resetBookingModal}
                      className="text-pink-200 hover:text-white transition-colors p-1"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${bookingStep >= 1 ? 'bg-white text-pink-600' : 'bg-pink-400 text-white'}`}>
                        1
                      </div>
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Property</span>
                    </div>
                    <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded ${bookingStep > 1 ? 'bg-white' : 'bg-pink-400'}`}></div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${bookingStep >= 2 ? 'bg-white text-pink-600' : 'bg-pink-400 text-white'}`}>
                        2
                      </div>
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Time</span>
                    </div>
                    <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded ${bookingStep > 2 ? 'bg-white' : 'bg-pink-400'}`}></div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${bookingStep >= 3 ? 'bg-white text-pink-600' : 'bg-pink-400 text-white'}`}>
                        3
                      </div>
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Details</span>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto modal-scroll">
                  <form onSubmit={handleFormSubmit}>
                    {/* Step 1: Date & Property Selection */}
                    {bookingStep === 1 && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Selected Date
                          </label>
                          <input
                            type="text"
                            value={selectedDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                            readOnly
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-md font-medium text-blue-800"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd" />
                            </svg>
                            Select Property *
                            <span className="text-xs text-gray-500">(Choose the property you want to visit)</span>
                          </label>
                          <select
                            value={formData.flatId}
                            onChange={handleFlatChange}
                            required
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                          >
                            <option value="">Choose a property...</option>
                            {flats.length > 0 ? (
                              flats.map(flat => (
                                <option key={flat._id} value={flat._id}>
                                  {flat.title} - {flat.location} (₹{flat.rent}/month)
                                </option>
                              ))
                            ) : (
                              <option value="demo-flat-1">Demo Property - Sample Location (₹15000/month)</option>
                            )}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Time Slot Selection */}
                    {bookingStep === 2 && (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Available Time Slots
                          </h4>
                          <p className="text-sm text-green-700">Select your preferred visiting time</p>
                        </div>

                        {fetchingSlots ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-pink-600"></div>
                            <span className="ml-3 text-sm sm:text-base text-gray-600">Checking availability...</span>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {availableSlots.map(slot => (
                              <Tooltip key={slot} text={`Select ${slot} time slot`}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium hover:scale-105 active:scale-95 ${
                                    selectedSlot === slot
                                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25 hover:shadow-sm'
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    {slot}
                                  </div>
                                </button>
                              </Tooltip>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm sm:text-base">No available time slots for this date</p>
                            <p className="text-xs text-gray-400 mt-1">Please try selecting a different date</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Personal Details */}
                    {bookingStep === 3 && (
                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-purple-800 mb-1 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Personal Information
                          </h4>
                          <p className="text-sm text-purple-700">Complete your booking details</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              value={formData.visitorName}
                              onChange={(e) => setFormData({...formData, visitorName: e.target.value})}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your full name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={formData.visitorPhone}
                              onChange={(e) => setFormData({...formData, visitorPhone: e.target.value})}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purpose of Visit *
                          </label>
                          <select
                            value={formData.purpose}
                            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          >
                            {purposeOptions.map(purpose => (
                              <option key={purpose} value={purpose}>{purpose}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes
                            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Any specific requirements or questions..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-6">
                      <div className="flex gap-3">
                        {bookingStep > 1 && (
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={resetBookingModal}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
                        >
                          Cancel
                        </button>
                      </div>

                      {bookingStep < 3 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          disabled={
                            (bookingStep === 1 && !formData.flatId) ||
                            (bookingStep === 2 && !selectedSlot)
                          }
                          className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          <span>{bookingStep === 1 ? 'Select Time' : 'Add Details'}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading || !formData.flatId || !selectedSlot || !formData.visitorName.trim() || !formData.visitorPhone.trim() || !formData.purpose}
                          className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Booking...</span>
                            </>
                          ) : (
                            'Confirm Booking'
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Modal */}
          {showEventDetails && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Booking Details
                    </h3>
                    <button
                      onClick={() => setShowEventDetails(false)}
                      className="text-blue-200 hover:text-white transition-colors p-1"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto modal-scroll">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-500">Property</p>
                          <p className="font-medium text-gray-900 break-words">{selectedEvent.flatId?.title || 'N/A'}</p>
                          {selectedEvent.flatId?.location && (
                            <p className="text-sm text-gray-600">{selectedEvent.flatId.location}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-medium text-gray-900">{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                          <p className="text-sm text-gray-600 font-mono">{selectedEvent.timeSlot}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Visitor</p>
                          <p className="font-medium text-gray-900">{selectedEvent.visitorName}</p>
                          {selectedEvent.visitorEmail && (
                            <p className="text-sm text-gray-600">{selectedEvent.visitorEmail}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Purpose</p>
                          <p className="font-medium text-gray-900">{selectedEvent.purpose}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full mt-0.5 flex-shrink-0 ${
                          selectedEvent.status === 'pending' ? 'bg-yellow-500' :
                          selectedEvent.status === 'confirmed' ? 'bg-green-500' :
                          selectedEvent.status === 'cancelled' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedEvent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            selectedEvent.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            selectedEvent.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {selectedEvent.notes && (
                        <div className="flex gap-3">
                          <svg className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="font-medium text-gray-900 break-words">{selectedEvent.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowEventDetails(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Close
                    </button>
                    {selectedEvent.status === 'pending' && (
                      <Tooltip text="Cancel this booking">
                        <button
                          onClick={() => {
                            // Handle cancel booking
                            alert('Cancel booking functionality would be implemented here');
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Booking
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
