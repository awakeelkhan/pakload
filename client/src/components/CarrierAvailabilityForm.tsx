import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Truck, Calendar, DollarSign, CheckCircle } from 'lucide-react';

const TRUCK_TYPES = [
  '20ft Container',
  '40ft Container',
  '40ft HC Container',
  'Flatbed',
  'Refrigerated',
  'Tanker',
  'Box Truck',
  'Lowbed',
  'Car Carrier',
  'Livestock Carrier'
];

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Sukkur', 'Bahawalpur', 'Sargodha', 'Gwadar',
  'Kashgar', 'Tashkurgan', 'Khunjerab', 'Sost', 'Gilgit'
];

interface CarrierAvailabilityFormProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function CarrierAvailabilityForm({ onSuccess, onCancel }: CarrierAvailabilityFormProps) {
  const [formData, setFormData] = useState({
    truckType: '',
    capacity: '',
    availableCity: '',
    availableFrom: '',
    availableTo: '',
    preferredRoutes: '',
    ratePerKm: '',
    currency: 'PKR',
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/carrier-availability', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Truck Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Truck className="w-4 h-4 inline mr-2" />
          Truck Type *
        </label>
        <select
          name="truckType"
          value={formData.truckType}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select truck type</option>
          {TRUCK_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Capacity (tons) *
        </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          required
          min="1"
          placeholder="e.g., 20"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Available City */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Available City *
        </label>
        <select
          name="availableCity"
          value={formData.availableCity}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select city where truck is available</option>
          {CITIES.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Available From *
          </label>
          <input
            type="date"
            name="availableFrom"
            value={formData.availableFrom}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Available Until
          </label>
          <input
            type="date"
            name="availableTo"
            value={formData.availableTo}
            onChange={handleChange}
            min={formData.availableFrom || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Preferred Routes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Preferred Routes
        </label>
        <input
          type="text"
          name="preferredRoutes"
          value={formData.preferredRoutes}
          onChange={handleChange}
          placeholder="e.g., Karachi to Lahore, Islamabad to Peshawar"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Rate per KM
          </label>
          <input
            type="number"
            name="ratePerKm"
            value={formData.ratePerKm}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 50"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="PKR">PKR - Pakistani Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="CNY">CNY - Chinese Yuan</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Any special requirements or information..."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Error Message */}
      {mutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {(mutation.error as any)?.response?.data?.message || 'Failed to post availability. Please try again.'}
        </div>
      )}

      {/* Success Message */}
      {mutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Availability posted successfully! Shippers can now see your truck.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Posting...' : 'Post Availability'}
        </button>
      </div>
    </form>
  );
}
