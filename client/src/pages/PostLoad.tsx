import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CheckCircle2, Circle, Upload, ShieldCheck, Zap, Package, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLocation } from 'wouter';

export default function PostLoad() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    cargoType: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    volume: '',
    description: '',
    pickupDate: '',
    deliveryDate: '',
    rateType: 'flat',
    rateUSD: '',
    ratePKR: '',
    insuredValue: '',
    requiredTruckType: '',
    refrigeration: false,
    hazardous: false,
    oversized: false,
    stackable: true,
  });

  const steps = [
    { key: 'route', label: t('postLoad.steps.route'), icon: MapPin },
    { key: 'cargo', label: t('postLoad.steps.cargo'), icon: Package },
    { key: 'schedule', label: t('postLoad.steps.schedule'), icon: Circle },
    { key: 'pricing', label: t('postLoad.steps.pricing'), icon: Circle },
    { key: 'requirements', label: t('postLoad.steps.requirements'), icon: Circle },
    { key: 'photos', label: t('postLoad.steps.photos'), icon: Upload },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
      if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    } else if (step === 1) {
      if (!formData.cargoType.trim()) newErrors.cargoType = 'Cargo type is required';
      if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
    } else if (step === 2) {
      if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
      if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
      if (formData.pickupDate && formData.deliveryDate && new Date(formData.pickupDate) > new Date(formData.deliveryDate)) {
        newErrors.deliveryDate = 'Delivery date must be after pickup date';
      }
    } else if (step === 3) {
      if (!formData.rateUSD && !formData.ratePKR) newErrors.rate = 'Please enter a rate';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      addToast('error', 'Please fill in all required fields');
      return false;
    }
    return true;
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
    // Validate all steps before submitting
    if (!formData.origin || !formData.destination || !formData.cargoType || !formData.weight || !formData.pickupDate) {
      addToast('error', 'Please complete all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const loadData = {
        origin: formData.origin,
        destination: formData.destination,
        cargoType: formData.cargoType,
        weight: parseInt(formData.weight) || 0,
        length: parseInt(formData.length) || 0,
        width: parseInt(formData.width) || 0,
        height: parseInt(formData.height) || 0,
        volume: formData.volume,
        description: formData.description,
        pickupDate: formData.pickupDate,
        deliveryDate: formData.deliveryDate || formData.pickupDate,
        price: formData.rateUSD || formData.ratePKR || '0',
        currency: formData.rateUSD ? 'USD' : 'PKR',
        urgent: false,
        specialRequirements: [
          formData.refrigeration && 'Refrigeration required',
          formData.hazardous && 'Hazardous materials',
          formData.oversized && 'Oversized cargo',
        ].filter(Boolean).join(', '),
      };

      const response = await fetch('http://localhost:5000/api/loads', {
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
        // Reset form
        setFormData({
          origin: '',
          destination: '',
          cargoType: '',
          weight: '',
          length: '',
          width: '',
          height: '',
          volume: '',
          description: '',
          pickupDate: '',
          deliveryDate: '',
          rateType: 'flat',
          rateUSD: '',
          ratePKR: '',
          insuredValue: '',
          requiredTruckType: '',
          refrigeration: false,
          hazardous: false,
          oversized: false,
          stackable: true,
        });
        setCurrentStep(0);
      } else {
        addToast('error', 'Failed to post load. Please try again.');
      }
    } catch (error) {
      console.error('Error posting load:', error);
      addToast('error', 'Failed to post load. Please try again.');
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Origin *
                    </label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      placeholder="Urumqi, China"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Destination *
                    </label>
                    <select 
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select destination city</option>
                      <option value="Islamabad">Islamabad, Pakistan</option>
                      <option value="Lahore">Lahore, Pakistan</option>
                      <option value="Karachi">Karachi, Pakistan</option>
                      <option value="Peshawar">Peshawar, Pakistan</option>
                      <option value="Rawalpindi">Rawalpindi, Pakistan</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Cargo Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Cargo Details</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cargo Type *
                    </label>
                    <select 
                      value={formData.cargoType}
                      onChange={(e) => handleInputChange('cargoType', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select cargo type</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Machinery">Machinery</option>
                      <option value="General Freight">General Freight</option>
                      <option value="Food Products">Food Products</option>
                      <option value="Construction Materials">Construction Materials</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        placeholder="e.g. 1200"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        placeholder="e.g. 240"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="e.g. 240"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Volume (CBM)
                    </label>
                    <input
                      type="number"
                      value={formData.volume}
                      onChange={(e) => handleInputChange('volume', e.target.value)}
                      placeholder="e.g. 67"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Additional details about the cargo..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Schedule</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Delivery Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Pricing */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rate Type *
                    </label>
                    <select 
                      value={formData.rateType}
                      onChange={(e) => handleInputChange('rateType', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="flat">Flat Rate (USD)</option>
                      <option value="per_km">Per Kilometer</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Rate (USD) *
                      </label>
                      <input
                        type="number"
                        value={formData.rateUSD}
                        onChange={(e) => handleInputChange('rateUSD', e.target.value)}
                        placeholder="e.g. 4500"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Rate (PKR)
                      </label>
                      <input
                        type="number"
                        value={formData.ratePKR}
                        onChange={(e) => handleInputChange('ratePKR', e.target.value)}
                        placeholder="PKR 0"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Insured Value (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.insuredValue}
                      onChange={(e) => handleInputChange('insuredValue', e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Truck Requirements */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Truck Requirements</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Required Truck Type *
                    </label>
                    <select 
                      value={formData.requiredTruckType}
                      onChange={(e) => handleInputChange('requiredTruckType', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select truck type</option>
                      <option value="20ft Container">20ft Container</option>
                      <option value="40ft Container">40ft Container</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Refrigerated">Refrigerated Truck</option>
                      <option value="Tanker">Tanker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Special Requirements
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.refrigeration}
                          onChange={(e) => handleInputChange('refrigeration', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Refrigeration Required</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.hazardous}
                          onChange={(e) => handleInputChange('hazardous', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Hazardous Material</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.oversized}
                          onChange={(e) => handleInputChange('oversized', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Oversized Load</span>
                      </label>
                      <label className="flex items-center">
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
                </div>
              )}

              {/* Step 6: Photos & Documents */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Cargo Photos & Documents</h2>
                  <p className="text-sm text-slate-600">
                    Upload photos of your cargo to help carriers understand what they'll be transporting.
                  </p>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 mb-2">
                      Drag and drop files here or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Maximum 5 files, up to 10MB each
                    </p>
                    <input type="file" multiple className="hidden" accept="image/*" />
                  </div>
                  <div className="text-sm text-slate-500">
                    0/5 images uploaded
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-3 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {currentStep === steps.length - 1 ? 'Post Load' : 'Next'}
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
