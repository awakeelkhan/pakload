import { useState, useRef } from 'react';
import { 
  Package, MapPin, Truck, DollarSign, Send, AlertCircle, Check, Loader2, 
  ChevronRight, ChevronLeft, Calendar, Clock, User, Phone, Box, Scale,
  FileText, Image, Upload, X, File, Camera
} from 'lucide-react';

interface LoadPostingFormProps {
  onSuccess?: (load: any) => void;
  onCancel?: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Gwadar', 'Sialkot', 'Hyderabad', 'Sukkur',
  'Bahawalpur', 'Sargodha', 'Gujranwala', 'Abbottabad', 'Mardan', 'Muzaffarabad'
];

const CHINA_CITIES = [
  'Kashgar', 'Urumqi', 'Khunjerab', 'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'
];

const CARGO_TYPES = [
  'General Freight', 'Electronics', 'Textiles', 'Machinery', 'Food & Perishables',
  'Construction Materials', 'Chemicals', 'Furniture', 'Automotive Parts',
  'Agricultural Products', 'Pharmaceuticals', 'Consumer Goods', 'Raw Materials', 'Other'
];

const EQUIPMENT_TYPES = [
  { value: '20ft', label: '20ft Container', capacity: '33 CBM', weight: '28,000 kg' },
  { value: '40ft', label: '40ft Container', capacity: '67 CBM', weight: '26,000 kg' },
  { value: '40ft_hc', label: '40ft High Cube', capacity: '76 CBM', weight: '26,000 kg' },
  { value: 'flatbed', label: 'Flatbed Truck', capacity: 'Open', weight: '25,000 kg' },
  { value: 'reefer', label: 'Refrigerated', capacity: '28-60 CBM', weight: '25,000 kg' },
  { value: 'tanker', label: 'Tanker', capacity: 'Liquid', weight: '30,000 L' },
  { value: 'lowbed', label: 'Low Bed', capacity: 'Heavy', weight: '50,000 kg' },
];

export function LoadPostingForm({ onSuccess, onCancel }: LoadPostingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdLoad, setCreatedLoad] = useState<any>(null);
  const [step, setStep] = useState(1);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const [formData, setFormData] = useState({
    originCity: '',
    originAddress: '',
    pickupDate: '',
    pickupTimeWindow: '',
    pickupContactName: '',
    pickupContactPhone: '',
    destinationCity: '',
    destinationAddress: '',
    deliveryDate: '',
    deliveryTimeWindow: '',
    deliveryContactName: '',
    deliveryContactPhone: '',
    cargoType: '',
    weight: '',
    description: '',
    equipmentType: '',
    price: '',
    specialRequirements: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: reader.result as string,
          type: 'image'
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError('Document size must be less than 10MB');
        return;
      }
      
      setDocuments(prev => [...prev, {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: 'document'
      }]);
    });
    
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.originCity) { setError('Please select origin city'); return false; }
        if (!formData.pickupDate) { setError('Please select pickup date'); return false; }
        return true;
      case 2:
        if (!formData.destinationCity) { setError('Please select destination city'); return false; }
        if (!formData.deliveryDate) { setError('Please select delivery date'); return false; }
        if (formData.deliveryDate < formData.pickupDate) { setError('Delivery date must be after pickup date'); return false; }
        return true;
      case 3:
        if (!formData.cargoType) { setError('Please select cargo type'); return false; }
        if (!formData.weight) { setError('Please enter weight'); return false; }
        if (!formData.equipmentType) { setError('Please select equipment type'); return false; }
        return true;
      case 4:
        if (!formData.price) { setError('Please enter your rate'); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setError(null);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const loadData = {
        origin: formData.originAddress ? `${formData.originAddress}, ${formData.originCity}` : formData.originCity,
        destination: formData.destinationAddress ? `${formData.destinationAddress}, ${formData.destinationCity}` : formData.destinationCity,
        originCity: formData.originCity,
        destinationCity: formData.destinationCity,
        pickupDate: formData.pickupDate,
        deliveryDate: formData.deliveryDate,
        cargoType: formData.cargoType,
        weight: parseFloat(formData.weight),
        price: formData.price,
        equipmentType: formData.equipmentType,
        description: formData.description,
        specialRequirements: formData.specialRequirements,
        pickupContactName: formData.pickupContactName,
        pickupContactPhone: formData.pickupContactPhone,
        deliveryContactName: formData.deliveryContactName,
        deliveryContactPhone: formData.deliveryContactPhone,
      };

      const response = await fetch('/api/loads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(loadData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create load');
      }

      setCreatedLoad(data);
      setSuccess(true);
      onSuccess?.(data);
    } catch (err: any) {
      setError(err.message || 'Failed to create load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && createdLoad) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Load Posted Successfully!</h2>
        <p className="text-gray-600 mb-2">
          Tracking Number: <span className="font-mono font-bold text-green-600">{createdLoad.trackingNumber}</span>
        </p>
        <p className="text-gray-500 mb-8">
          Carriers can now view and bid on your load.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.href = '/loads'}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            View My Loads
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setCreatedLoad(null);
              setStep(1);
              setImages([]);
              setDocuments([]);
              setFormData({
                originCity: '', originAddress: '', pickupDate: '', pickupTimeWindow: '',
                pickupContactName: '', pickupContactPhone: '',
                destinationCity: '', destinationAddress: '', deliveryDate: '', deliveryTimeWindow: '',
                deliveryContactName: '', deliveryContactPhone: '',
                cargoType: '', weight: '', description: '',
                equipmentType: '', price: '', specialRequirements: '',
              });
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Post Another Load
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
        {[
          { num: 1, label: 'Pickup', icon: MapPin },
          { num: 2, label: 'Delivery', icon: Truck },
          { num: 3, label: 'Cargo', icon: Package },
          { num: 4, label: 'Price & Media', icon: DollarSign },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => step > s.num && setStep(s.num)}
              disabled={step < s.num}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                step === s.num
                  ? 'bg-green-600 text-white shadow-md'
                  : step > s.num
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < 3 && (
              <ChevronRight className={`h-5 w-5 mx-2 ${step > s.num ? 'text-green-500' : 'text-gray-300'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Pickup */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pickup Location</h2>
              <p className="text-sm text-gray-500">Where should the carrier pick up the load?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.originCity}
                onChange={(e) => handleChange('originCity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select city</option>
                <optgroup label="Pakistan">
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
                <optgroup label="China (CPEC)">
                  {CHINA_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address / Area
              </label>
              <input
                type="text"
                value={formData.originAddress}
                onChange={(e) => handleChange('originAddress', e.target.value)}
                placeholder="e.g., SITE Industrial Area, Block 5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Pickup Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.pickupDate}
                onChange={(e) => handleChange('pickupDate', e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Time Window
              </label>
              <select
                value={formData.pickupTimeWindow}
                onChange={(e) => handleChange('pickupTimeWindow', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Flexible</option>
                <option value="morning">Morning (6AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 6PM)</option>
                <option value="evening">Evening (6PM - 10PM)</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Pickup Contact (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.pickupContactName}
                  onChange={(e) => handleChange('pickupContactName', e.target.value)}
                  placeholder="e.g., Ahmad Khan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.pickupContactPhone}
                  onChange={(e) => handleChange('pickupContactPhone', e.target.value)}
                  placeholder="e.g., 0300-1234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Delivery */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Location</h2>
              <p className="text-sm text-gray-500">Where should the load be delivered?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.destinationCity}
                onChange={(e) => handleChange('destinationCity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select city</option>
                <optgroup label="Pakistan">
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
                <optgroup label="China (CPEC)">
                  {CHINA_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address / Area
              </label>
              <input
                type="text"
                value={formData.destinationAddress}
                onChange={(e) => handleChange('destinationAddress', e.target.value)}
                placeholder="e.g., Blue Area, F-6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
                min={formData.pickupDate || today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Time Window
              </label>
              <select
                value={formData.deliveryTimeWindow}
                onChange={(e) => handleChange('deliveryTimeWindow', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Flexible</option>
                <option value="morning">Morning (6AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 6PM)</option>
                <option value="evening">Evening (6PM - 10PM)</option>
              </select>
            </div>
          </div>

          {formData.pickupDate && formData.deliveryDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Transit Time:</strong> {Math.ceil((new Date(formData.deliveryDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Delivery Contact (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Receiver Name
                </label>
                <input
                  type="text"
                  value={formData.deliveryContactName}
                  onChange={(e) => handleChange('deliveryContactName', e.target.value)}
                  placeholder="e.g., Muhammad Ali"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.deliveryContactPhone}
                  onChange={(e) => handleChange('deliveryContactPhone', e.target.value)}
                  placeholder="e.g., 0300-9876543"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Cargo Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cargo Details</h2>
              <p className="text-sm text-gray-500">Describe your cargo and select equipment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-1" />
                Cargo Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cargoType}
                onChange={(e) => handleChange('cargoType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select cargo type</option>
                {CARGO_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Scale className="h-4 w-4 inline mr-1" />
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="e.g., 15000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Cargo Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your cargo (packaging, handling instructions, etc.)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Equipment Type Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Box className="h-4 w-4 inline mr-1" />
              Equipment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EQUIPMENT_TYPES.map(eq => (
                <button
                  key={eq.value}
                  type="button"
                  onClick={() => handleChange('equipmentType', eq.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.equipmentType === eq.value
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{eq.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {eq.capacity} • Max {eq.weight}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Price & Media */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pricing & Media</h2>
              <p className="text-sm text-gray-500">Set your rate and upload images/documents</p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Your Rate (PKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="125,000"
                className="w-full pl-12 pr-4 py-4 text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            {/* Currency Conversion Display */}
            {formData.price && parseFloat(formData.price) > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 font-medium">Currency Conversion</span>
                  <span className="text-xs text-blue-500">Rate: 1 USD = 278 PKR</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-xs text-gray-500">PKR (Pakistani Rupee)</p>
                    <p className="text-lg font-bold text-gray-900">Rs {parseFloat(formData.price).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-xs text-gray-500">USD (US Dollar)</p>
                    <p className="text-lg font-bold text-green-600">${(parseFloat(formData.price) / 278).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              This is the total amount you're willing to pay for this shipment
            </p>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => handleChange('specialRequirements', e.target.value)}
              placeholder="Any special handling, temperature requirements, hazmat, etc."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Image Upload */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Product Images (Optional)
            </h3>
            <p className="text-xs text-gray-500 mb-4">Upload photos of your cargo to help carriers understand what they'll be transporting</p>
            
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="flex flex-wrap gap-4">
              {images.map(img => (
                <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  <Image className="h-6 w-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Max 5 images, 5MB each (JPG, PNG)</p>
          </div>

          {/* Document Upload */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents (Optional)
            </h3>
            <p className="text-xs text-gray-500 mb-4">Upload invoices, packing lists, or other relevant documents</p>
            
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              onChange={handleDocUpload}
              className="hidden"
            />
            
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{doc.file.name}</p>
                      <p className="text-xs text-gray-500">{(doc.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {documents.length < 5 && (
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Max 5 documents, 10MB each (PDF, DOC, XLS)</p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          ) : <div />}
        </div>

        <div>
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Load
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadPostingForm;
