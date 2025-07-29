import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Shield,
  User,
  Calendar,
  Mail,
  Building,
  Filter
} from 'lucide-react';

const UsersManager = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sortBy, setSortBy] = useState('name');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock users data based on Helpjuice Users screenshot
  const users = [
    {
      id: 'bl',
      name: 'Bryce Lyman',
      email: 'bryce.lyman@covesmart.com',
      role: 'Super Administrator',
      group: 'US Management',
      jobTitle: 'VP of Operations',
      joined: '8 months ago',
      avatar: 'BL',
      isActive: true
    },
    {
      id: 'nr',
      name: 'Naomi Ramirez',
      email: 'naomi.ramirez@covesmart.com',
      role: 'Super Administrator',
      group: 'US Management',
      jobTitle: 'Operations Process Manager',
      joined: '4 months ago',
      avatar: 'NR',
      isActive: true
    },
    {
      id: 'jb',
      name: 'Jessyl Beltran',
      email: 'jessyl.beltran@alert.com',
      role: 'Super Administrator',
      group: 'US Management',
      jobTitle: 'Reputation Manager',
      joined: '3 months ago',
      avatar: 'JB',
      isActive: true
    },
    {
      id: 'jw',
      name: 'Jessica Wood',
      email: 'jessica.wood@alert.com',
      role: 'Super Administrator',
      group: 'US Management',
      jobTitle: 'Director of Customer Service',
      joined: '2 months ago',
      avatar: 'JW',
      isActive: true
    },
    {
      id: 'jd',
      name: 'Jordan Dean',
      email: 'jordan.dean@covesmart.com',
      role: 'Administrator',
      group: 'US Management',
      jobTitle: 'Product Team',
      joined: '8 months ago',
      avatar: 'JD',
      isActive: true
    },
    {
      id: 'bt',
      name: 'Brayden Tanner',
      email: 'brayden@covesmart.com',
      role: 'Administrator',
      group: 'US Management',
      jobTitle: 'Product Team',
      joined: '8 months ago',
      avatar: 'BT',
      isActive: true
    },
    {
      id: 'js',
      name: 'Jessam Sabangan',
      email: 'jessam.sabangan@alert.com',
      role: 'Administrator',
      group: 'Unassigned',
      jobTitle: 'Training Manager',
      joined: '7 months ago',
      avatar: 'JS',
      isActive: false
    },
    {
      id: 'zs',
      name: 'Zachary Scheumann',
      email: 'zachary.scheumann@alert.com',
      role: 'Administrator',
      group: 'US Management',
      jobTitle: 'Billing Manager',
      joined: 'about 1 month ago',
      avatar: 'ZS',
      isActive: true
    },
    {
      id: 'll',
      name: 'leo lubo',
      email: 'leo@alert.com',
      role: 'Administrator',
      group: 'Unassigned',
      jobTitle: '',
      joined: '3 months ago',
      avatar: 'LL',
      isActive: true
    },
    {
      id: 'jo',
      name: 'Joseph O\'Bryant',
      email: 'joseph.obryant@alert.com',
      role: 'Administrator',
      group: 'US Management',
      jobTitle: 'Technical Support',
      joined: '2 months ago',
      avatar: 'JO',
      isActive: true
    }
  ];

  const groups = [
    { id: 'us-management', name: 'US Management', userCount: 8 },
    { id: 'unassigned', name: 'Unassigned', userCount: 2 }
  ];

  const importedUsers = [
    { id: 1, name: 'Sample User 1', email: 'sample1@example.com', status: 'pending' },
    { id: 2, name: 'Sample User 2', email: 'sample2@example.com', status: 'imported' }
  ];

  const getRoleIcon = (role) => {
    if (role === 'Super Administrator') return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role === 'Administrator') return <Shield className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'Super Administrator') return 'bg-yellow-100 text-yellow-800';
    if (role === 'Administrator') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleUserSelect = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'users', name: 'Users', count: users.length },
    { id: 'imported', name: 'Imported Users', count: importedUsers.length },
    { id: 'groups', name: 'Groups', count: groups.length }
  ];

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                Import From CSV
              </button>
              <div className="relative">
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="role">Sort by Role</option>
                <option value="joined">Sort by Date Joined</option>
                <option value="group">Sort by Group</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Table Header */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length}
                    onChange={handleSelectAll}
                    className="mr-4 rounded"
                  />
                  <div className="grid grid-cols-6 gap-4 flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div>Name</div>
                    <div>Role</div>
                    <div>Groups</div>
                    <div>Job Title</div>
                    <div>Joined</div>
                    <div className="text-right">Actions</div>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50 group">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="mr-4 rounded"
                      />
                      <div className="grid grid-cols-6 gap-4 flex-1 items-center">
                        {/* Name */}
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle(user.role)}`}>
                            {user.role}
                          </span>
                        </div>

                        {/* Groups */}
                        <div className="text-sm text-gray-900">{user.group}</div>

                        {/* Job Title */}
                        <div className="text-sm text-gray-900">{user.jobTitle}</div>

                        {/* Joined */}
                        <div className="text-sm text-gray-500">{user.joined}</div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-200 rounded"
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4 text-red-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            )}
                          </button>
                          <button
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'imported' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Imported Users</h3>
              <div className="space-y-3">
                {importedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'imported' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Groups</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </button>
              </div>
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-500">{group.userCount} users</div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={editingUser.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={editingUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    defaultValue={editingUser.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    defaultValue={editingUser.jobTitle}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;