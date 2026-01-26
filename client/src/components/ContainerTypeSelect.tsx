import { useState } from 'react';
import { Package, ChevronDown, Check, Info } from 'lucide-react';

interface ContainerType {
  value: string;
  label: string;
  capacity: string;
  maxWeight: string;
  description?: string;
  icon?: string;
}

const CONTAINER_TYPES: ContainerType[] = [
  { value: '20ft', label: '20ft Standard Container', capacity: '33 CBM', maxWeight: '28,000 kg', description: 'Ideal for small to medium shipments' },
  { value: '40ft', label: '40ft Standard Container', capacity: '67 CBM', maxWeight: '26,000 kg', description: 'Most common for large shipments' },
  { value: '40ft_hc', label: '40ft High Cube', capacity: '76 CBM', maxWeight: '26,000 kg', description: 'Extra height for voluminous cargo' },
  { value: '45ft_hc', label: '45ft High Cube', capacity: '86 CBM', maxWeight: '25,000 kg', description: 'Maximum volume capacity' },
  { value: 'flatbed', label: 'Flatbed Truck', capacity: 'Open', maxWeight: '25,000 kg', description: 'For oversized or heavy machinery' },
  { value: 'lowbed', label: 'Low Bed Trailer', capacity: 'Open', maxWeight: '50,000 kg', description: 'For very heavy equipment' },
  { value: 'reefer_20ft', label: '20ft Refrigerated', capacity: '28 CBM', maxWeight: '27,000 kg', description: 'Temperature controlled' },
  { value: 'reefer_40ft', label: '40ft Refrigerated', capacity: '60 CBM', maxWeight: '25,000 kg', description: 'Large refrigerated shipments' },
  { value: 'tanker', label: 'Tanker Truck', capacity: 'Liquid', maxWeight: '30,000 L', description: 'For liquids and chemicals' },
  { value: 'open_top', label: 'Open Top Container', capacity: 'Variable', maxWeight: '26,000 kg', description: 'For tall cargo, crane loading' },
  { value: 'bulk', label: 'Bulk Carrier', capacity: 'Bulk', maxWeight: '30,000 kg', description: 'For grains, minerals, loose cargo' },
  { value: 'other', label: 'Other', capacity: 'Variable', maxWeight: 'Variable', description: 'Custom requirements' },
];

interface ContainerTypeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  containerCount?: number;
  onCountChange?: (count: number) => void;
  showCount?: boolean;
  error?: string;
}

export function ContainerTypeSelect({
  value,
  onChange,
  containerCount = 1,
  onCountChange,
  showCount = true,
  error,
}: ContainerTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const selectedType = CONTAINER_TYPES.find(t => t.value === value);

  return (
    <div className="space-y-3">
      {/* Container Type Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Container Type
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-gray-400" />
            {selectedType ? (
              <div>
                <div className="font-medium">{selectedType.label}</div>
                <div className="text-xs text-gray-500">
                  {selectedType.capacity} • Max {selectedType.maxWeight}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Select container type</span>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
            {CONTAINER_TYPES.map((type) => (
              <div
                key={type.value}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                  value === type.value ? 'bg-primary/5' : ''
                }`}
                onClick={() => {
                  onChange(type.value);
                  setIsOpen(false);
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{type.label}</span>
                    {value === type.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {type.capacity} • Max {type.maxWeight}
                  </div>
                  {type.description && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {type.description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(showInfo === type.value ? null : type.value);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Container Count */}
      {showCount && selectedType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Containers
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onCountChange?.(Math.max(1, containerCount - 1))}
              className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-50 text-lg font-medium"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={containerCount}
              onChange={(e) => onCountChange?.(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => onCountChange?.(Math.min(100, containerCount + 1))}
              className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-50 text-lg font-medium"
            >
              +
            </button>
            <span className="text-sm text-gray-500">
              × {selectedType.label}
            </span>
          </div>
        </div>
      )}

      {/* Selected Container Info */}
      {selectedType && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-sm mb-2">Container Specifications</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Capacity:</span>
              <span className="ml-2 font-medium">{selectedType.capacity}</span>
            </div>
            <div>
              <span className="text-gray-500">Max Weight:</span>
              <span className="ml-2 font-medium">{selectedType.maxWeight}</span>
            </div>
            {containerCount > 1 && (
              <div className="col-span-2">
                <span className="text-gray-500">Total Containers:</span>
                <span className="ml-2 font-medium">{containerCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContainerTypeSelect;
