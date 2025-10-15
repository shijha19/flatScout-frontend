import React, { useState, useEffect } from 'react';
import { apiMethods } from '../utils/api';

const ReportListing = () => {
  const [formData, setFormData] = useState({
    reportMethod: 'existing', // 'existing' or 'manual'
    existingListingId: '',
    listingUrl: '',
    reportType: 'fraud',
    description: '',
    reporterName: localStorage.getItem('name') || '',
    reporterEmail: localStorage.getItem('userEmail') || '',
    evidence: '',
    priority: 'medium',
    category: 'listing',
    contactAttempted: false,
    screenshots: []
  });

  const [existingFlats, setExistingFlats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [reportHistory, setReportHistory] = useState([]);

  // Fetch existing flats for reporting
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const response = await apiMethods.flats.getAll();
        if (response.data.flats) {
          setExistingFlats(response.data.flats);
        }
      } catch (error) {
        console.error('Error fetching flats:', error);
      }
    };

    fetchFlats();
  }, []);

  // Fetch user's report history
  const fetchReportHistory = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const response = await fetch(`/api/reports/history/${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setReportHistory(data.reports || []);
        }
      }
    } catch (error) {
      console.error('Error fetching report history:', error);
    }
  };

  useEffect(() => {
    fetchReportHistory();
  }, []);

  const reportTypes = [
    { value: 'fraud', label: '🚨 Fraudulent Listing', severity: 'high' },
    { value: 'fake', label: '🏠 Fake Property', severity: 'high' },
    { value: 'scam', label: '💰 Financial Scam', severity: 'high' },
    { value: 'spam', label: '📧 Spam/Duplicate', severity: 'medium' },
    { value: 'inappropriate', label: '⚠️ Inappropriate Content', severity: 'medium' },
    { value: 'pricing', label: '💸 Misleading Pricing', severity: 'medium' },
    { value: 'photos', label: '📸 Fake/Misleading Photos', severity: 'medium' },
    { value: 'contact', label: '📞 Invalid Contact Info', severity: 'low' },
    { value: 'outdated', label: '📅 Outdated Information', severity: 'low' },
    { value: 'other', label: '🔧 Other Issue', severity: 'medium' }
  ];

  const categories = [
    { value: 'listing', label: 'Property Listing' },
    { value: 'user', label: 'User Behavior' },
    { value: 'payment', label: 'Payment Related' },
    { value: 'safety', label: 'Safety Concern' },
    { value: 'technical', label: 'Technical Issue' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (formData.reportMethod === 'existing' && !formData.existingListingId) {
      newErrors.existingListingId = 'Please select a listing to report';
    }

    if (formData.reportMethod === 'manual' && !formData.listingUrl) {
      newErrors.listingUrl = 'Please provide a listing URL';
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.reporterName.trim()) {
      newErrors.reporterName = 'Name is required';
    }

    if (!formData.reporterEmail.trim()) {
      newErrors.reporterEmail = 'Email is required';
    }

    // Check for spam (multiple reports in short time)
    const recentReports = reportHistory.filter(report => {
      const reportTime = new Date(report.createdAt);
      const now = new Date();
      return (now - reportTime) < 24 * 60 * 60 * 1000; // 24 hours
    });

    if (recentReports.length >= 5) {
      newErrors.spam = 'You have reached the daily report limit. Please try again tomorrow.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reportMethod: formData.reportMethod,
        existingListingId: formData.existingListingId,
        listingUrl: formData.listingUrl,
        reportType: formData.reportType,
        description: formData.description,
        reporterName: formData.reporterName,
        reporterEmail: formData.reporterEmail,
        evidence: formData.evidence,
        priority: formData.priority,
        category: formData.category,
        contactAttempted: formData.contactAttempted
      };

      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          reportMethod: 'existing',
          existingListingId: '',
          listingUrl: '',
          reportType: 'fraud',
          description: '',
          reporterName: localStorage.getItem('name') || '',
          reporterEmail: localStorage.getItem('userEmail') || '',
          evidence: '',
          priority: 'medium',
          category: 'listing',
          contactAttempted: false,
          screenshots: []
        });

        // Show success for 3 seconds then hide
        setTimeout(() => setSuccess(false), 5000);
        
        // Refresh report history
        fetchReportHistory();
      } else {
        throw new Error(result.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrors({ submit: error.message || 'Error submitting report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFlats = existingFlats.filter(flat =>
    flat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flat.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // TODO: Implement file upload logic
    console.log('Files selected:', files);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Report Submitted Successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Thank you for helping us maintain quality. We'll review your report within 24-48 hours and take appropriate action.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Report Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🚨 Report a Listing</h1>
              <p className="text-gray-600">Help us maintain a safe and trustworthy platform by reporting suspicious or inappropriate listings</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you like to report?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, reportMethod: 'existing'})}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.reportMethod === 'existing' 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Select from Our Listings</span>
                      </div>
                      <p className="text-sm text-gray-600">Choose from existing listings on our platform</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({...formData, reportMethod: 'manual'})}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.reportMethod === 'manual' 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Provide External URL</span>
                      </div>
                      <p className="text-sm text-gray-600">Report a listing from external sources</p>
                    </button>
                  </div>
                </div>

                {/* Existing Listing Selection */}
                {formData.reportMethod === 'existing' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search and Select Listing *
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Search by title, location, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredFlats.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {searchQuery ? 'No listings found matching your search' : 'No listings available'}
                          </div>
                        ) : (
                          filteredFlats.map((flat) => (
                            <button
                              key={flat._id}
                              type="button"
                              onClick={() => setFormData({...formData, existingListingId: flat._id})}
                              className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                formData.existingListingId === flat._id ? 'bg-red-50 border-red-200' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">{flat.title}</h3>
                                  <p className="text-sm text-gray-600">{flat.location}</p>
                                  <p className="text-sm text-green-600 font-medium">{flat.price}</p>
                                </div>
                                {formData.existingListingId === flat._id && (
                                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    {errors.existingListingId && (
                      <p className="text-red-500 text-sm mt-1">{errors.existingListingId}</p>
                    )}
                  </div>
                )}

                {/* Manual URL Input */}
                {formData.reportMethod === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing URL *
                    </label>
                    <input
                      type="url"
                      value={formData.listingUrl}
                      onChange={(e) => setFormData({...formData, listingUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://example.com/listing/123"
                    />
                    {errors.listingUrl && (
                      <p className="text-red-500 text-sm mt-1">{errors.listingUrl}</p>
                    )}
                  </div>
                )}

                {/* Report Type and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type *
                    </label>
                    <select
                      value={formData.reportType}
                      onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {reportTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex space-x-4">
                    {['low', 'medium', 'high', 'urgent'].map((priority) => (
                      <label key={priority} className="flex items-center">
                        <input
                          type="radio"
                          value={priority}
                          checked={formData.priority === priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="form-radio text-red-600"
                        />
                        <span className={`ml-2 text-sm capitalize ${
                          priority === 'urgent' ? 'text-red-600 font-medium' :
                          priority === 'high' ? 'text-orange-600' :
                          priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {priority}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description * (minimum 20 characters)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Please provide detailed information about the issue. Include specific examples, dates, and any interactions you've had..."
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </div>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Contact Attempted */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.contactAttempted}
                      onChange={(e) => setFormData({...formData, contactAttempted: e.target.checked})}
                      className="form-checkbox text-red-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I have attempted to contact the listing owner about this issue
                    </span>
                  </label>
                </div>

                {/* Reporter Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.reporterName}
                      onChange={(e) => setFormData({...formData, reporterName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {errors.reporterName && (
                      <p className="text-red-500 text-sm mt-1">{errors.reporterName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={formData.reporterEmail}
                      onChange={(e) => setFormData({...formData, reporterEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {errors.reporterEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.reporterEmail}</p>
                    )}
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Evidence (Optional)
                  </label>
                  <textarea
                    value={formData.evidence}
                    onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Any additional evidence, URLs, screenshots descriptions, or supporting information..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Screenshots (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5 files, 10MB each. Supported: JPG, PNG, GIF
                  </p>
                </div>

                {/* Error Messages */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                {errors.spam && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-600 text-sm">{errors.spam}</p>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important Guidelines
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Ensure your report is accurate and provide detailed information</li>
                          <li>False or malicious reports may result in account restrictions</li>
                          <li>We take privacy seriously - your report will be handled confidentially</li>
                          <li>Reports are reviewed within 24-48 hours</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Report...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Report Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Report Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reports Today:</span>
                <span className="text-sm font-medium">{reportHistory.filter(r => {
                  const today = new Date().toDateString();
                  return new Date(r.createdAt).toDateString() === today;
                }).length}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Your Total Reports:</span>
                <span className="text-sm font-medium">{reportHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Resolution Rate:</span>
                <span className="text-sm font-medium text-green-600">94%</span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">💡 Quick Tips</h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Be specific about the issue you're reporting</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Include relevant dates and interactions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Upload screenshots when possible</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Check if others have reported similar issues</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🎧 Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              If you're unsure about reporting or need immediate assistance:
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@flatscout.com"
                className="block text-sm text-blue-600 hover:text-blue-800"
              >
                📧 support@flatscout.com
              </a>
              <a
                href="tel:+919876543210"
                className="block text-sm text-blue-600 hover:text-blue-800"
              >
                📞 +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportListing;
