import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Plus, Edit, Trash2, Eye, MoreVertical, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states matching 'admins' table
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error, status } = await supabase
        .from('admins')
        .select('id, username, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        if (status === 500 || error.message.includes('relation "public.admins" does not exist')) {
          showAlert('Database Error', 'Please ensure database migrations are applied correctly.', 'error');
          console.error('Supabase 500 Error: Make sure "admins" table exists and "uuid-ossp" is enabled.');
        } else {
          showAlert('Error', error.message, 'error');
        }
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Error', 'Failed to connect to database', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const deleteUser = async (id) => {
    const result = await showConfirm(
      'Delete Admin?',
      'Are you sure you want to remove this administrator? This action cannot be undone.'
    );

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showAlert('Success', 'Admin deleted successfully');
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      showAlert('Error', 'Error deleting user', 'error');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingUser) {
        // Only update username and role
        const { error } = await supabase
          .from('admins')
          .update({
            username: formData.username,
            role: formData.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        showAlert('Updated', 'Admin updated successfully');
      } else {
        // Create new admin
        const { error } = await supabase
          .from('admins')
          .insert([{
            username: formData.username,
            email: formData.email,
            password: formData.password, // Ideally handled by an Auth trigger, but matching DDL
            role: formData.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        showAlert('Success', 'Admin created successfully');
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      showAlert('Action Failed', error.message || 'Error saving admin', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (user.role?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '', // Don't reload password
      role: user.role || 'staff'
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'staff'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <Link to="/users/create">
          <Button
            className="bg-brand-red hover:opacity-90 text-white flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Admin
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Administrators List</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search admins..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-red mb-4" size={40} />
                <p className="text-gray-500">Connecting to database...</p>
              </div>
            ) : currentUsers.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full bg-gray-100"
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=random`}
                              alt={user.username}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username || 'Unnamed'}</div>
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[100px]" title={user.id}>
                              {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-lg border ${user.role === 'admin' ? 'bg-red-50 text-brand-red border-red-100' :
                          user.role === 'manager' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            user.role === 'sales' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              user.role === 'receptionist' ? 'bg-green-50 text-green-700 border-green-100' :
                                user.role === 'editor' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                  'bg-gray-50 text-gray-600 border-gray-100'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-gray-400 hover:text-brand-red p-1 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-gray-400 hover:text-brand-red p-1 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-brand-red p-1 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Search className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium">No administrators found</p>
                <p className="text-gray-400 text-sm mt-1">Try creating a new admin user</p>
                <Button variant="outline" className="mt-6 border-gray-200" onClick={fetchUsers}>
                  Refresh
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50/50 rounded-b-lg">
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{indexOfFirstUser + 1}</span> to <span className="font-semibold text-gray-700">
                {Math.min(indexOfLastUser, filteredUsers.length)}
              </span> of <span className="font-semibold text-gray-700">{filteredUsers.length}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentPage === page
                    ? 'bg-brand-red text-white shadow-md shadow-red-200'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingUser ? `Edit Admin` : 'Create New Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="e.g. john_doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                disabled={editingUser}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red disabled:bg-gray-100 disabled:text-gray-400 transition-all"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@travellounge.mu"
              />
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Access Role</label>
              <select
                name="role"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="staff">Staff (Limited Access)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-brand-red hover:opacity-90 text-white px-8 py-2.5 rounded-xl flex items-center shadow-lg shadow-red-200"
              >
                {formLoading && <Loader2 className="animate-spin mr-2" size={16} />}
                {editingUser ? 'Update Admin' : 'Create Admin'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;