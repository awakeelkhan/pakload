import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Truck, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      const token = localStorage.getItem('access_token');
      const response = await axios.post('/api/trucks', {
        type: data.truckType,
        registrationNumber: `REG-${Date.now()}`, // Auto-generate if not provided
        capacity: data.capacity || '0',
        currentLocation: data.availableCity,
        status: 'active'
      }, {
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
          {t('carrierAvailability.truckType')} *
        </label>
        <select
          name="truckType"
          value={formData.truckType}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">{t('carrierAvailability.selectTruckType')}</option>
          {TRUCK_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('carrierAvailability.capacity')} *
        </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          required
          min="1"
          placeholder={t('carrierAvailability.capacityPlaceholder')}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Available City */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          {t('carrierAvailability.availableCity')} *
        </label>
        <select
          name="availableCity"
          value={formData.availableCity}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">{t('carrierAvailability.selectCityPlaceholder')}</option>
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
            {t('carrierAvailability.availableFrom')} *
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
            {t('carrierAvailability.availableUntil')}
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
          {t('carrierAvailability.preferredRoutes')}
        </label>
        <input
          type="text"
          name="preferredRoutes"
          value={formData.preferredRoutes}
          onChange={handleChange}
          placeholder={t('carrierAvailability.preferredRoutesPlaceholder')}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            {t('carrierAvailability.ratePerKm')}
          </label>
          <input
            type="number"
            name="ratePerKm"
            value={formData.ratePerKm}
            onChange={handleChange}
            min="0"
            placeholder={t('carrierAvailability.ratePlaceholder')}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('carrierAvailability.currency')}
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="PKR">{t('carrierAvailability.currencies.pkr')}</option>
            <option value="USD">{t('carrierAvailability.currencies.usd')}</option>
            <option value="CNY">{t('carrierAvailability.currencies.cny')}</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('carrierAvailability.additionalNotes')}
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder={t('carrierAvailability.notesPlaceholder')}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Error Message */}
      {mutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {(mutation.error as any)?.response?.data?.message || t('carrierAvailability.errorMessage')}
        </div>
      )}

      {/* Success Message */}
      {mutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {t('carrierAvailability.successMessage')}
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
            {t('carrierAvailability.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? t('carrierAvailability.posting') : t('carrierAvailability.postAvailability')}
        </button>
      </div>
    </form>
  );
}
