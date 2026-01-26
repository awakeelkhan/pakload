import { useState, useRef } from 'react';
import { 
  Package, MapPin, Calendar, DollarSign, Send, AlertCircle, Check, Loader2,
  ChevronRight, ChevronLeft, User, Phone, FileText, Image, Upload, X, File, Camera
} from 'lucide-react';

interface MarketRequestFormProps {
  onSuccess?: (request: any) => void;
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

const GOODS_TYPES = [
  'Electronics', 'Textiles & Garments', 'Machinery & Equipment', 'Food Products',
  'Construction Materials', 'Chemicals', 'Furniture', 'Automotive Parts',
  'Agricultural Products', 'Pharmaceuticals', 'Consumer Goods', 'Raw Materials',
  'Handicrafts', 'Leather Goods', 'Sports Goods', 'Other'
];

export function MarketRequestForm({ onSuccess, onCancel }: MarketRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [step, setStep] = useState(1);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const [formData, setFormData] = useState({
    // What you need
    title: '',
    goodsType: '',
    quantity: '',
    unit: 'kg',
    description: '',
    
    // Origin
    originCity: '',
    originCountry: 'Pakistan',
    
    // Destination
    destinationCity: '',
    destinationCountry: 'Pakistan',
    
    // Timeline & Budget
    requiredByDate: '',
    budgetMin: '',
    budgetMax: '',
    
    // Contact
    contactName: '',
    contactPhone: '',
    additionalNotes: '',
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
        if (!formData.title) { setError('Please enter a title for your request'); return false; }
        if (!formData.goodsType) { setError('Please select goods type'); return false; }
        if (!formData.quantity) { setError('Please enter quantity'); return false; }
        return true;
      case 2:
        if (!formData.originCity) { setError('Please select origin city'); return false; }
        if (!formData.destinationCity) { setError('Please select destination city'); return false; }
        return true;
      case 3:
        if (!formData.requiredByDate) { setError('Please select required by date'); return false; }
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
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const requestData = {
        title: formData.title,
        goodsType: formData.goodsType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        description: formData.description,
        originCity: formData.originCity,
        originCountry: formData.originCountry,
        destinationCity: formData.destinationCity,
        destinationCountry: formData.destinationCountry,
        requiredByDate: formData.requiredByDate,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        additionalNotes: formData.additionalNotes,
      };

      const response = await fetch('/api/market-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setCreatedRequest(data.request || data);
      setSuccess(true);
      onSuccess?.(data.request || data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-600 mb-2">
          Reference: <span className="font-mono font-bold text-blue-600">{createdRequest?.id ? `MR-${createdRequest.id}` : 'Pending'}</span>
        </p>
        <p className="text-gray-500 mb-8">
          Our team will review your request and find the best carriers for you. We'll contact you soon!
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setCreatedRequest(null);
              setStep(1);
              setImages([]);
              setDocuments([]);
              setFormData({
                title: '', goodsType: '', quantity: '', unit: 'kg', description: '',
                originCity: '', originCountry: 'Pakistan',
                destinationCity: '', destinationCountry: 'Pakistan',
                requiredByDate: '', budgetMin: '', budgetMax: '',
                contactName: '', contactPhone: '', additionalNotes: '',
              });
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Submit Another Request
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
          { num: 1, label: 'What You Need', icon: Package },
          { num: 2, label: 'Route', icon: MapPin },
          { num: 3, label: 'Timeline & Budget', icon: Calendar },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => step > s.num && setStep(s.num)}
              disabled={step < s.num}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                step === s.num
                  ? 'bg-blue-600 text-white shadow-md'
                  : step > s.num
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < 2 && (
              <ChevronRight className={`h-5 w-5 mx-2 ${step > s.num ? 'text-blue-500' : 'text-gray-300'}`} />
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

      {/* Step 1: What You Need */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">What Do You Need?</h2>
              <p className="text-sm text-gray-500">Tell us about the goods you want to transport</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Need to transport electronics from Karachi to Lahore"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goods Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.goodsType}
                onChange={(e) => handleChange('goodsType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select goods type</option>
                {GOODS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="e.g., 5000"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="cbm">CBM</option>
                  <option value="units">units</option>
                  <option value="cartons">cartons</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your goods in detail (packaging, special handling requirements, etc.)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Product Images (Optional)
            </h3>
            
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
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Image className="h-6 w-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Route */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Route Details</h2>
              <p className="text-sm text-gray-500">Where do you need the goods transported from and to?</p>
            </div>
          </div>

          {/* Origin */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-4">Origin (From)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.originCity}
                  onChange={(e) => handleChange('originCity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                  Country
                </label>
                <select
                  value={formData.originCountry}
                  onChange={(e) => handleChange('originCountry', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="China">China</option>
                </select>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-4">Destination (To)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.destinationCity}
                  onChange={(e) => handleChange('destinationCity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                  Country
                </label>
                <select
                  value={formData.destinationCountry}
                  onChange={(e) => handleChange('destinationCountry', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="China">China</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Timeline & Budget */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Timeline & Budget</h2>
              <p className="text-sm text-gray-500">When do you need this and what's your budget?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Required By Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.requiredByDate}
                onChange={(e) => handleChange('requiredByDate', e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Budget Range (PKR) - Optional
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => handleChange('budgetMin', e.target.value)}
                    placeholder="50,000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => handleChange('budgetMax', e.target.value)}
                    placeholder="150,000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Providing a budget helps us find the best options for you
            </p>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  placeholder="e.g., Ahmad Khan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="e.g., 0300-1234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              placeholder="Any other information that might help us find the best carrier for you..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Document Upload */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Supporting Documents (Optional)
            </h3>
            
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
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>
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
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MarketRequestForm;
