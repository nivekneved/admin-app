import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ServicesList = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Airport Transfer',
      description: 'Transportation between airport and hotel',
      price: 45.00,
      duration: '30 mins',
      active: true,
      createdAt: '2023-05-15',
    },
    {
      id: 2,
      name: 'VIP Lounge Access',
      description: 'Access to premium lounge facilities',
      price: 75.00,
      duration: 'Per visit',
      active: true,
      createdAt: '2023-06-20',
    },
    {
      id: 3,
      name: 'Concierge Service',
      description: 'Personal assistance with bookings and arrangements',
      price: 25.00,
      duration: 'Hourly',
      active: true,
      createdAt: '2023-07-10',
    },
    {
      id: 4,
      name: 'Spa Treatment',
      description: 'Relaxing spa treatments during layover',
      price: 85.00,
      duration: '60 mins',
      active: false,
      createdAt: '2023-08-05',
    },
  ]);
  
  const [filteredServices, setFilteredServices] = useState(services);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'

  // Filter services based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredServices(services);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredServices(
        services.filter(service => 
          service.name.toLowerCase().includes(term) || 
          service.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, services]);

  const handleEdit = (service) => {
    setCurrentService({ ...service });
    setFormMode('edit');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(service => service.id !== id));
      toast.success('Service deleted successfully!');
    }
  };

  const handleView = (service) => {
    alert(`Service Details:\n\nName: ${service.name}\nDescription: ${service.description}\nPrice: $${service.price}\nDuration: ${service.duration}\nActive: ${service.active ? 'Yes' : 'No'}\nCreated: ${service.createdAt}`);
  };

  const handleAddNew = () => {
    setCurrentService({
      id: null,
      name: '',
      description: '',
      price: 0,
      duration: '',
      active: true,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setFormMode('add');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!currentService.name || !currentService.description) {
      toast.error('Name and description are required!');
      return;
    }

    if (formMode === 'add') {
      // Add new service
      const newService = {
        ...currentService,
        id: Math.max(...services.map(s => s.id), 0) + 1
      };
      setServices([...services, newService]);
      toast.success('Service added successfully!');
    } else {
      // Update existing service
      setServices(services.map(service => 
        service.id === currentService.id ? currentService : service
      ));
      toast.success('Service updated successfully!');
    }

    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Services Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add New Service
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">Created: {service.createdAt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${service.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.duration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(service)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Service */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {formMode === 'add' ? 'Add New Service' : 'Edit Service'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    name="name"
                    value={currentService.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter service name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentService.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Enter service description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={currentService.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={currentService.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 30 mins"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={currentService.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Active Service</label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {formMode === 'add' ? 'Create Service' : 'Update Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesList;