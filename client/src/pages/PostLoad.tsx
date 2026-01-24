import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Upload, ShieldCheck, Zap, Package, MapPin, Loader2, Truck, Calendar, DollarSign, AlertCircle, FileText, X, File } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLocation } from 'wouter';

// CPEC Document types for border crossing and compliance
const DOCUMENT_TYPES = [
  { id: 'commercial_invoice', label: 'Commercial Invoice', required: true, description: 'Required for customs clearance' },
  { id: 'packing_list', label: 'Packing List', required: true, description: 'Detailed list of cargo contents' },
  { id: 'bill_of_lading', label: 'Bill of Lading / Airway Bill', required: false, description: 'Transport document' },
  { id: 'certificate_of_origin', label: 'Certificate of Origin', required: false, description: 'For preferential tariff rates' },
  { id: 'customs_declaration', label: 'Customs Declaration Form', required: false, description: 'Pre-filled customs form' },
  { id: 'phytosanitary', label: 'Phytosanitary Certificate', required: false, description: 'For agricultural products' },
  { id: 'hazmat_declaration', label: 'Hazmat Declaration', required: false, description: 'For hazardous materials' },
  { id: 'insurance_certificate', label: 'Insurance Certificate', required: false, description: 'Cargo insurance proof' },
  { id: 'checkpost_permit', label: 'Checkpost Transit Permit', required: false, description: 'For CPEC route checkpoints' },
  { id: 'other', label: 'Other Documents', required: false, description: 'Any additional documentation' },
];

// Pakistan cities for CPEC routes
const PAKISTAN_CITIES = [
  'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Rawalpindi', 'Faisalabad', 
  'Multan', 'Gwadar', 'Quetta', 'Sialkot', 'Hyderabad', 'Sukkur'
];

// China cities for CPEC routes
const CHINA_CITIES = [
  'Urumqi', 'Kashgar', 'Khunjerab', 'Beijing', 'Shanghai', 'Guangzhou', 
  'Shenzhen', 'Chengdu', 'Xian'
];

// Equipment/Truck types (DAT standard)
const EQUIPMENT_TYPES = [
  { value: 'dry_van', label: 'Dry Van / Container', description: 'Standard enclosed trailer' },
  { value: 'flatbed', label: 'Flatbed', description: 'Open deck for oversized cargo' },
  { value: 'reefer', label: 'Refrigerated', description: 'Temperature controlled' },
  { value: 'tanker', label: 'Tanker', description: 'Liquid cargo' },
  { value: 'lowboy', label: 'Lowboy', description: 'Heavy machinery transport' },
];

// Cargo categories
const CARGO_TYPES = [
  'Electronics', 'Textiles', 'Machinery', 'General Freight', 'Food Products',
  'Construction Materials', 'Chemicals', 'Automotive Parts', 'Pharmaceuticals', 'Raw Materials'
];

export default function PostLoad() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<{id: string; file: File; type: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('commercial_invoice');
  const [formData, setFormData] = useState({
    // Route
    originCity: '',
    originAddress: '',
    destinationCity: '',
    destinationAddress: '',
    // Cargo
    cargoType: '',
    weight: '',
    weightUnit: 'kg',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'cm',
    pieces: '1',
    description: '',
    // Schedule
    pickupDate: '',
    pickupTimeWindow: 'flexible',
    deliveryDate: '',
    deliveryTimeWindow: 'flexible',
    // Equipment & Pricing
    equipmentType: '',
    price: '',
    rateType: 'flat',
    // Special requirements
    refrigeration: false,
    hazardous: false,
    oversized: false,
    stackable: true,
    liftgateRequired: false,
    teamDriverRequired: false,
  });

  // Auto-calculate volume when dimensions change
  useEffect(() => {
    if (formData.length && formData.width && formData.height) {
      const l = parseFloat(formData.length);
      const w = parseFloat(formData.width);
      const h = parseFloat(formData.height);
      if (!isNaN(l) && !isNaN(w) && !isNaN(h)) {
        // Convert to CBM (cubic meters)
        const volumeCBM = formData.dimensionUnit === 'cm' 
          ? (l * w * h) / 1000000 
          : (l * w * h) * 0.0283168; // ft to CBM
        setFormData(prev => ({ ...prev, calculatedVolume: volumeCBM.toFixed(2) }));
      }
    }
  }, [formData.length, formData.width, formData.height, formData.dimensionUnit]);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  const steps = [
    { key: 'route', label: 'Route', icon: MapPin },
    { key: 'cargo', label: 'Cargo', icon: Package },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'equipment', label: 'Equipment & Rate', icon: Truck },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Real-time field validation
  const validateField = (field: string): string | null => {
    let error: string | null = null;
    
    switch (field) {
      case 'originCity':
        if (!formData.originCity) error = 'Origin city is required';
        break;
      case 'destinationCity':
        if (!formData.destinationCity) error = 'Destination city is required';
        else if (formData.destinationCity === formData.originCity) error = 'Destination must be different from origin';
        break;
      case 'cargoType':
        if (!formData.cargoType) error = 'Cargo type is required';
        break;
      case 'weight':
        if (!formData.weight) error = 'Weight is required';
        else if (parseFloat(formData.weight) <= 0) error = 'Weight must be greater than 0';
        else if (parseFloat(formData.weight) > 50000) error = 'Weight exceeds maximum (50,000 kg)';
        break;
      case 'pickupDate':
        if (!formData.pickupDate) error = 'Pickup date is required';
        else if (new Date(formData.pickupDate) < new Date(today)) error = 'Pickup date cannot be in the past';
        break;
      case 'deliveryDate':
        if (!formData.deliveryDate) error = 'Delivery date is required';
        else if (formData.pickupDate && new Date(formData.deliveryDate) < new Date(formData.pickupDate)) {
          error = 'Delivery date must be after pickup date';
        }
        break;
      case 'equipmentType':
        if (!formData.equipmentType) error = 'Equipment type is required';
        break;
      case 'price':
        if (!formData.price) error = 'Rate is required';
        else if (parseFloat(formData.price) <= 0) error = 'Rate must be greater than 0';
        break;
    }
    
    setErrors(prev => {
      if (error) return { ...prev, [field]: error };
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    
    return error;
  };

  const validateStep = (step: number): boolean => {
    const fieldsToValidate: string[][] = [
      ['originCity', 'destinationCity'], // Step 0: Route
      ['cargoType', 'weight'], // Step 1: Cargo
      ['pickupDate', 'deliveryDate'], // Step 2: Schedule
      ['equipmentType', 'price'], // Step 3: Equipment & Rate
    ];
    
    const fields = fieldsToValidate[step] || [];
    let isValid = true;
    
    fields.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      if (validateField(field)) isValid = false;
    });
    
    if (!isValid) {
      addToast('error', 'Please fill in all required fields correctly');
    }
    return isValid;
  };

  // Document handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File size must be less than 10MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      addToast('error', 'Only PDF and image files (JPG, PNG) are allowed');
      return;
    }
    
    // Add document to list
    const newDoc = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      type: selectedDocType,
    };
    
    setDocuments(prev => [...prev, newDoc]);
    addToast('success', `${DOCUMENT_TYPES.find(d => d.id === selectedDocType)?.label} uploaded`);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter(d => d.type === type);
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Final validation
    if (!validateStep(currentStep)) return;
    
    // Validate all required fields
    const requiredFields = ['originCity', 'destinationCity', 'cargoType', 'weight', 'pickupDate', 'deliveryDate', 'equipmentType', 'price'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      addToast('error', 'Please complete all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Build origin/destination strings
      const origin = formData.originAddress 
        ? `${formData.originAddress}, ${formData.originCity}` 
        : formData.originCity;
      const destination = formData.destinationAddress 
        ? `${formData.destinationAddress}, ${formData.destinationCity}` 
        : formData.destinationCity;
      
      // Convert weight to kg if needed
      const weightKg = formData.weightUnit === 'lbs' 
        ? Math.round(parseFloat(formData.weight) * 0.453592) 
        : parseFloat(formData.weight);
      
      // Build special requirements string
      const specialReqs = [
        formData.refrigeration && 'Refrigeration required',
        formData.hazardous && 'Hazardous materials - special handling',
        formData.oversized && 'Oversized load - permits may be required',
        formData.liftgateRequired && 'Liftgate required',
        formData.teamDriverRequired && 'Team drivers required',
        !formData.stackable && 'Do not stack',
      ].filter(Boolean).join('; ');
      
      const loadData = {
        origin,
        destination,
        cargoType: formData.cargoType,
        weight: weightKg,
        length: formData.length ? parseInt(formData.length) : null,
        width: formData.width ? parseInt(formData.width) : null,
        height: formData.height ? parseInt(formData.height) : null,
        volume: (formData as any).calculatedVolume || null,
        description: formData.description || null,
        pickupDate: formData.pickupDate,
        deliveryDate: formData.deliveryDate,
        price: formData.price,
        equipmentType: formData.equipmentType,
        specialRequirements: specialReqs || null,
      };

      const response = await fetch('/api/loads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(loadData)
      });

      if (response.ok) {
        const newLoad = await response.json();
        addToast('success', `Load posted successfully! Tracking: ${newLoad.trackingNumber || 'N/A'}`);
        // Redirect to loads page after short delay
        setTimeout(() => navigate('/loads'), 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        addToast('error', errorData.error || 'Failed to post load. Please try again.');
      }
    } catch (error) {
      console.error('Error posting load:', error);
      addToast('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('postLoad.title')}</h1>
          <p className="text-slate-600">{t('postLoad.subtitle')}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    index < currentStep ? 'bg-green-600 text-white' :
                    index === currentStep ? 'bg-green-600 text-white ring-4 ring-green-100' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center ${
                    index <= currentStep ? 'text-slate-900' : 'text-slate-500'
                  }`}>{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    index < currentStep ? 'bg-green-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              
              {/* Step 1: Route */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Route Information</h2>
                  
                  {/* Origin */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" /> Origin (Pickup Location)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">City *</label>
                        <select 
                          value={formData.originCity}
                          onChange={(e) => handleInputChange('originCity', e.target.value)}
                          onBlur={() => handleBlur('originCity')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            touched.originCity && errors.originCity ? 'border-red-500' : 'border-slate-300'
                          }`}
                        >
                          <option value="">Select origin city</option>
                          <optgroup label="China">
                            {CHINA_CITIES.map(city => (
                              <option key={city} value={city}>{city}, China</option>
                            ))}
                          </optgroup>
                          <optgroup label="Pakistan">
                            {PAKISTAN_CITIES.map(city => (
                              <option key={city} value={city}>{city}, Pakistan</option>
                            ))}
                          </optgroup>
                        </select>
                        {touched.originCity && errors.originCity && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.originCity}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Address (Optional)</label>
                        <input
                          type="text"
                          value={formData.originAddress}
                          onChange={(e) => handleInputChange('originAddress', e.target.value)}
                          placeholder="Street address, warehouse, etc."
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" /> Destination (Delivery Location)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">City *</label>
                        <select 
                          value={formData.destinationCity}
                          onChange={(e) => handleInputChange('destinationCity', e.target.value)}
                          onBlur={() => handleBlur('destinationCity')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            touched.destinationCity && errors.destinationCity ? 'border-red-500' : 'border-slate-300'
                          }`}
                        >
                          <option value="">Select destination city</option>
                          <optgroup label="Pakistan">
                            {PAKISTAN_CITIES.map(city => (
                              <option key={city} value={city}>{city}, Pakistan</option>
                            ))}
                          </optgroup>
                          <optgroup label="China">
                            {CHINA_CITIES.map(city => (
                              <option key={city} value={city}>{city}, China</option>
                            ))}
                          </optgroup>
                        </select>
                        {touched.destinationCity && errors.destinationCity && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.destinationCity}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Address (Optional)</label>
                        <input
                          type="text"
                          value={formData.destinationAddress}
                          onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                          placeholder="Street address, warehouse, etc."
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Cargo Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Cargo Details</h2>
                  
                  {/* Cargo Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cargo Type *</label>
                    <select 
                      value={formData.cargoType}
                      onChange={(e) => handleInputChange('cargoType', e.target.value)}
                      onBlur={() => handleBlur('cargoType')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                        touched.cargoType && errors.cargoType ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select cargo type</option>
                      {CARGO_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {touched.cargoType && errors.cargoType && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.cargoType}
                      </p>
                    )}
                  </div>

                  {/* Weight with unit selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Weight *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        onBlur={() => handleBlur('weight')}
                        placeholder="e.g. 15000"
                        min="1"
                        max="50000"
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          touched.weight && errors.weight ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                        className="w-24 px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                    {touched.weight && errors.weight && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.weight}
                      </p>
                    )}
                  </div>

                  {/* Dimensions with unit selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dimensions (Optional)
                      <span className="text-slate-500 font-normal ml-2">L × W × H</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        placeholder="Length"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        placeholder="Width"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="Height"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <select
                        value={formData.dimensionUnit}
                        onChange={(e) => handleInputChange('dimensionUnit', e.target.value)}
                        className="w-20 px-2 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="cm">cm</option>
                        <option value="ft">ft</option>
                      </select>
                    </div>
                    {(formData as any).calculatedVolume && (
                      <p className="mt-2 text-sm text-green-600">
                        Calculated Volume: {(formData as any).calculatedVolume} CBM
                      </p>
                    )}
                  </div>

                  {/* Number of pieces */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Pieces</label>
                    <input
                      type="number"
                      value={formData.pieces}
                      onChange={(e) => handleInputChange('pieces', e.target.value)}
                      placeholder="1"
                      min="1"
                      className="w-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description (Optional)
                      <span className="text-slate-500 font-normal ml-2">Help carriers understand your cargo</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your cargo: packaging, handling instructions, special notes..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">{formData.description.length}/500 characters</p>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Schedule</h2>
                  
                  {/* Pickup */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" /> Pickup
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date *</label>
                        <input
                          type="date"
                          value={formData.pickupDate}
                          onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                          onBlur={() => handleBlur('pickupDate')}
                          min={today}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            touched.pickupDate && errors.pickupDate ? 'border-red-500' : 'border-slate-300'
                          }`}
                        />
                        {touched.pickupDate && errors.pickupDate && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.pickupDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Time Window</label>
                        <select
                          value={formData.pickupTimeWindow}
                          onChange={(e) => handleInputChange('pickupTimeWindow', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="flexible">Flexible</option>
                          <option value="morning">Morning (6AM - 12PM)</option>
                          <option value="afternoon">Afternoon (12PM - 6PM)</option>
                          <option value="evening">Evening (6PM - 10PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" /> Delivery
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date *</label>
                        <input
                          type="date"
                          value={formData.deliveryDate}
                          onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                          onBlur={() => handleBlur('deliveryDate')}
                          min={formData.pickupDate || today}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            touched.deliveryDate && errors.deliveryDate ? 'border-red-500' : 'border-slate-300'
                          }`}
                        />
                        {touched.deliveryDate && errors.deliveryDate && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.deliveryDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Time Window</label>
                        <select
                          value={formData.deliveryTimeWindow}
                          onChange={(e) => handleInputChange('deliveryTimeWindow', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="flexible">Flexible</option>
                          <option value="morning">Morning (6AM - 12PM)</option>
                          <option value="afternoon">Afternoon (12PM - 6PM)</option>
                          <option value="evening">Evening (6PM - 10PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Transit time estimate */}
                  {formData.pickupDate && formData.deliveryDate && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      <strong>Transit Time:</strong> {Math.ceil((new Date(formData.deliveryDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Equipment & Rate */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Equipment & Rate</h2>
                  
                  {/* Equipment Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Type *</label>
                    <div className="grid grid-cols-1 gap-3">
                      {EQUIPMENT_TYPES.map(type => (
                        <label 
                          key={type.value}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.equipmentType === type.value 
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="equipmentType"
                            value={type.value}
                            checked={formData.equipmentType === type.value}
                            onChange={(e) => handleInputChange('equipmentType', e.target.value)}
                            className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                          />
                          <div className="ml-3">
                            <span className="font-medium text-slate-900">{type.label}</span>
                            <p className="text-xs text-slate-500">{type.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {touched.equipmentType && errors.equipmentType && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.equipmentType}
                      </p>
                    )}
                  </div>

                  {/* Rate */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" /> Your Rate
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Rate Type</label>
                        <select 
                          value={formData.rateType}
                          onChange={(e) => handleInputChange('rateType', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="flat">Flat Rate</option>
                          <option value="per_km">Per Kilometer</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Amount (USD) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            onBlur={() => handleBlur('price')}
                            placeholder="e.g. 4500"
                            min="1"
                            className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                              touched.price && errors.price ? 'border-red-500' : 'border-slate-300'
                            }`}
                          />
                        </div>
                        {touched.price && errors.price && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Special Requirements</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.refrigeration}
                          onChange={(e) => handleInputChange('refrigeration', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Refrigeration</span>
                      </label>
                      <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hazardous}
                          onChange={(e) => handleInputChange('hazardous', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Hazardous</span>
                      </label>
                      <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.oversized}
                          onChange={(e) => handleInputChange('oversized', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Oversized</span>
                      </label>
                      <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.liftgateRequired}
                          onChange={(e) => handleInputChange('liftgateRequired', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Liftgate</span>
                      </label>
                      <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.teamDriverRequired}
                          onChange={(e) => handleInputChange('teamDriverRequired', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Team Drivers</span>
                      </label>
                      <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.stackable}
                          onChange={(e) => handleInputChange('stackable', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Stackable</span>
                      </label>
                    </div>
                  </div>

                  {/* CPEC Documents Section */}
                  <div className="border-t border-slate-200 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" /> 
                          Border & Compliance Documents
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Upload documents for customs clearance and checkpost transit (Optional)
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">CPEC Ready</span>
                    </div>

                    {/* Document Type Selector */}
                    <div className="flex gap-3 mb-4">
                      <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        {DOCUMENT_TYPES.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.label} {doc.required && '*'}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                    </div>

                    {/* Document Type Description */}
                    <p className="text-xs text-slate-500 mb-4">
                      {DOCUMENT_TYPES.find(d => d.id === selectedDocType)?.description}
                    </p>

                    {/* Uploaded Documents List */}
                    {documents.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-slate-600">Uploaded Documents ({documents.length})</p>
                        {documents.map(doc => {
                          const docType = DOCUMENT_TYPES.find(d => d.id === doc.type);
                          return (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <File className="w-5 h-5 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium text-slate-700">{doc.file.name}</p>
                                  <p className="text-xs text-slate-500">{docType?.label} • {(doc.file.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(doc.id)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Document Checklist */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-amber-800 mb-2">📋 CPEC Document Checklist</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {DOCUMENT_TYPES.slice(0, 6).map(doc => {
                          const uploaded = getDocumentsByType(doc.id).length > 0;
                          return (
                            <div key={doc.id} className={`flex items-center gap-2 ${uploaded ? 'text-green-700' : 'text-amber-700'}`}>
                              {uploaded ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <span className="w-3 h-3 border border-current rounded-full" />
                              )}
                              <span>{doc.label} {doc.required && '*'}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-amber-600 mt-2">* Required for international shipments</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || loading}
                  className="px-6 py-3 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {currentStep === steps.length - 1 ? (loading ? 'Posting...' : 'Post Load') : 'Continue'}
                </button>
              </div>
            </div>
          </div>

          {/* Help Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-green-600 text-white p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <p className="text-sm text-green-100 mb-4">
                Our support team is available 24/7 to help you with your shipment needs.
              </p>
              <div className="space-y-2 text-sm">
                <p>Phone: +92 51 123 4567</p>
                <p>Email: support@loadpak.com</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Why Post on LoadPak?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-900">Access 500+ Verified Carriers</h4>
                    <p className="text-xs text-slate-600 mt-1">Your load will be visible to our network of verified trucking companies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-900">Quick Responses</h4>
                    <p className="text-xs text-slate-600 mt-1">Receive quotes from carriers within hours of posting.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-900">Secure Transactions</h4>
                    <p className="text-xs text-slate-600 mt-1">All carriers are verified and insured for your peace of mind.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-900">Track Everything</h4>
                    <p className="text-xs text-slate-600 mt-1">Real-time tracking from pickup to delivery.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
