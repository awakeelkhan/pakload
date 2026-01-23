import { useAuth } from '../contexts/AuthContext';
import { Truck, MapPin, Calendar, CheckCircle, Plus, Edit2, Trash2, X, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function MyVehicles() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: '',
    registrationNumber: '',
    capacity: '',
    currentLocation: '',
    hasGPS: false,
    hasRefrigeration: false,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trucks');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setFormData({
      type: '',
      registrationNumber: '',
      capacity: '',
      currentLocation: '',
      hasGPS: false,
      hasRefrigeration: false,
    });
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({
      type: vehicle.type || '',
      registrationNumber: vehicle.registrationNumber || '',
      capacity: (vehicle.capacity || '0').toString(),
      currentLocation: vehicle.currentLocation || '',
      hasGPS: vehicle.hasGPS || false,
      hasRefrigeration: vehicle.hasRefrigeration || false,
    });
    setShowModal(true);
  };

  const handleDeleteVehicle = async (id: number) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      try {
        await fetch(`/api/trucks/${id}`, {
          method: 'DELETE'
        });
        setVehicles(vehicles.filter(v => v.id !== id));
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vehicleData = {
        type: formData.type,
        registrationNumber: formData.registrationNumber,
        capacity: formData.capacity,
        currentLocation: formData.currentLocation,
        status: 'active',
      };

      if (editingVehicle) {
        const response = await fetch(`/api/trucks/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
        const updated = await response.json();
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? updated : v));
      } else {
        const response = await fetch('/api/trucks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
        const newVehicle = await response.json();
        setVehicles([...vehicles, newVehicle]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">My Vehicles</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Vehicles</h1>
            <p className="text-slate-600 mt-1">Manage your fleet</p>
          </div>
          <button onClick={handleAddVehicle} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{vehicle.type}</h3>
                    <p className="text-sm text-slate-600">{vehicle.registrationNumber}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                  vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {vehicle.status === 'available' ? 'Available' :
                   vehicle.status === 'in_use' ? 'In Use' : 'Maintenance'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Capacity</span>
                  <span className="font-medium text-slate-900">{(vehicle.capacity || 0).toLocaleString()} kg</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Current Location:</span>
                  <span className="font-medium text-slate-900">{vehicle.currentLocation}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Last Maintenance:</span>
                  <span className="font-medium text-slate-900">{vehicle.lastMaintenance}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {vehicle.hasGPS && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    GPS Tracking
                  </span>
                )}
                {vehicle.hasRefrigeration && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Refrigerated
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEditVehicle(vehicle)} className="flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button onClick={() => handleDeleteVehicle(vehicle.id)} className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Vehicle Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="20ft Container">20ft Container</option>
                      <option value="40ft Container">40ft Container</option>
                      <option value="20ft Refrigerated">20ft Refrigerated</option>
                      <option value="40ft Refrigerated">40ft Refrigerated</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Tanker">Tanker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Registration Number</label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., LHR-1234"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Capacity (kg)</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 23000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Location</label>
                    <input
                      type="text"
                      value={formData.currentLocation}
                      onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Lahore, Pakistan"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasGPS}
                        onChange={(e) => setFormData({ ...formData, hasGPS: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">GPS Tracking</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasRefrigeration}
                        onChange={(e) => setFormData({ ...formData, hasRefrigeration: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">Refrigeration</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
