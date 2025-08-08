import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [reportedFlats, setReportedFlats] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchDashboardStats();
    fetchSystemMetrics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'activities') {
      fetchActivities();
    } else if (activeTab === 'reportedFlats') {
      fetchReportedFlats();
    }
  }, [activeTab, userPage, activityPage, reportPage, searchTerm, actionFilter, reportStatusFilter]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard-stats?userEmail=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?userEmail=${encodeURIComponent(userEmail)}&page=${userPage}&limit=10&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const url = `/api/admin/activity-logs?userEmail=${encodeURIComponent(userEmail)}&page=${activityPage}&limit=20${actionFilter ? `&action=${actionFilter}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/system-metrics?userEmail=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setSystemMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  const fetchReportedFlats = async () => {
    try {
      const url = `/api/admin/reports?userEmail=${encodeURIComponent(userEmail)}&page=${reportPage}&limit=10${reportStatusFilter ? `&status=${reportStatusFilter}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReportedFlats(data);
      }
    } catch (error) {
      console.error('Error fetching reported flats:', error);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, userEmail }),
      });

      if (response.ok) {
        fetchReportedFlats(); // Refresh reports list
        alert(`Report status updated to ${newStatus} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Error updating report status');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole, userEmail }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh users list
        fetchDashboardStats(); // Refresh stats
        alert(`User role updated to ${newRole} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Error updating user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers(); // Refresh users list
        fetchDashboardStats(); // Refresh stats
        alert('User deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'USER_REGISTERED': 'bg-green-100 text-green-800',
      'USER_LOGIN': 'bg-blue-100 text-blue-800',
      'USER_LOGOUT': 'bg-gray-100 text-gray-800',
      'FLAT_CREATED': 'bg-purple-100 text-purple-800',
      'BOOKING_CREATED': 'bg-yellow-100 text-yellow-800',
      'ADMIN_USER_PROMOTED': 'bg-indigo-100 text-indigo-800',
      'ADMIN_USER_DEMOTED': 'bg-orange-100 text-orange-800',
      'ADMIN_USER_DELETED': 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your FlatScout platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'activities', name: 'Activity Logs', icon: '📋' },
              { id: 'metrics', name: 'System Metrics', icon: '📈' },
              { id: 'reportedFlats', name: 'Reported Flats', icon: '🚩' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalStats.totalUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Flats</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalStats.totalFlats}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalStats.totalBookings}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Admin Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalStats.adminCount}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Monthly Growth</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.monthlyStats.newUsersThisMonth}</div>
                    <div className="text-sm text-gray-500">New Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.monthlyStats.newFlatsThisMonth}</div>
                    <div className="text-sm text-gray-500">New Flats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.monthlyStats.newBookingsThisMonth}</div>
                    <div className="text-sm text-gray-500">New Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.monthlyStats.activitiesThisMonth}</div>
                    <div className="text-sm text-gray-500">Activities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {stats.recentActivity.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(activity.action)}`}>
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-gray-900">{activity.description}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activities</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.users && users.users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => updateUserRole(user._id, 'user')}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserRole(user._id, 'admin')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 ml-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.pagination && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {((users.pagination.page - 1) * users.pagination.limit) + 1} to {Math.min(users.pagination.page * users.pagination.limit, users.pagination.total)} of {users.pagination.total} users
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                      disabled={userPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setUserPage(prev => prev + 1)}
                      disabled={userPage >= users.pagination.pages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Actions</option>
                    <option value="USER_REGISTERED">User Registered</option>
                    <option value="USER_LOGIN">User Login</option>
                    <option value="FLAT_CREATED">Flat Created</option>
                    <option value="BOOKING_CREATED">Booking Created</option>
                    <option value="ADMIN_USER_PROMOTED">User Promoted</option>
                    <option value="ADMIN_USER_DEMOTED">User Demoted</option>
                  </select>
                </div>
              </div>
              <div className="p-6">
                {activities.activities && activities.activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.activities.map((activity) => (
                      <div key={activity._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(activity.action)}`}>
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                          <div>
                            <div className="text-sm text-gray-900">{activity.description}</div>
                            <div className="text-xs text-gray-500">
                              {activity.userId ? `${activity.userId.name} (${activity.userId.email})` : 'Unknown User'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No activities found</p>
                )}
              </div>
              {activities.pagination && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {((activities.pagination.page - 1) * activities.pagination.limit) + 1} to {Math.min(activities.pagination.page * activities.pagination.limit, activities.pagination.total)} of {activities.pagination.total} activities
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setActivityPage(prev => Math.max(prev - 1, 1))}
                      disabled={activityPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setActivityPage(prev => prev + 1)}
                      disabled={activityPage >= activities.pagination.pages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Metrics Tab */}
        {activeTab === 'metrics' && systemMetrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Stats */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Activity Breakdown (Last 30 Days)</h3>
                </div>
                <div className="p-6">
                  {systemMetrics.activityStats.length > 0 ? (
                    <div className="space-y-3">
                      {systemMetrics.activityStats.map((stat) => (
                        <div key={stat._id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{stat._id.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No activity data available</p>
                  )}
                </div>
              </div>

              {/* Most Active Users */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Most Active Users (Last 30 Days)</h3>
                </div>
                <div className="p-6">
                  {systemMetrics.activeUsers.length > 0 ? (
                    <div className="space-y-3">
                      {systemMetrics.activeUsers.map((user, index) => (
                        <div key={user.userId} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{user.activityCount} activities</div>
                            <div className="text-xs text-gray-500">{formatDate(user.lastActivity)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No active users data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Registration Trend (Last 30 Days)</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {systemMetrics.userGrowth.map((day) => (
                    <div key={day.date} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day.date}</span>
                      <span className="text-sm font-medium text-gray-900">{day.count} new users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reported Flats Tab */}
        {activeTab === 'reportedFlats' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Reported Flats</h3>
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <p className="text-gray-500 text-sm mt-1">View and manage flats that have been reported by users.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flat Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportedFlats.reports && reportedFlats.reports.length > 0 ? (
                      reportedFlats.reports.map((report) => (
                        <tr key={report._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report._id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.listingId ? report.listingId.title : 'External URL'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{report.reportedBy?.name || 'Unknown'}</div>
                              <div className="text-gray-500">{report.reportedBy?.email || 'No email'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              report.reason === 'fraud' ? 'bg-red-100 text-red-800' :
                              report.reason === 'fake_listing' ? 'bg-orange-100 text-orange-800' :
                              report.reason === 'spam' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.reason.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(report.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateReportStatus(report._id, 'reviewed')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => updateReportStatus(report._id, 'resolved')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => updateReportStatus(report._id, 'dismissed')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                            {report.status === 'reviewed' && (
                              <>
                                <button
                                  onClick={() => updateReportStatus(report._id, 'resolved')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => updateReportStatus(report._id, 'dismissed')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                            {(report.status === 'resolved' || report.status === 'dismissed') && (
                              <span className="text-gray-400">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {reportedFlats.pagination && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {((reportedFlats.pagination.page - 1) * reportedFlats.pagination.limit) + 1} to {Math.min(reportedFlats.pagination.page * reportedFlats.pagination.limit, reportedFlats.pagination.total)} of {reportedFlats.pagination.total} reports
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setReportPage(prev => Math.max(prev - 1, 1))}
                      disabled={reportPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setReportPage(prev => prev + 1)}
                      disabled={reportPage >= reportedFlats.pagination.pages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}