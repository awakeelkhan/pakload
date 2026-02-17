import { useState } from 'react';
import { X, DollarSign, Calendar, Truck, MessageSquare, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: {
    id: number;
    origin: string;
    destination: string;
    cargoType?: string;
    cargo?: string;
    weight: number;
    distance?: number;
    rateUsd?: number;
    price?: string;
    currency?: string;
    pickupDate: string;
  };
}

export default function BidModal({ isOpen, onClose, load }: BidModalProps) {
  const { isAuthenticated } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [pickupDate, setPickupDate] = useState(load.pickupDate);
  const [deliveryDays, setDeliveryDays] = useState('');
  const [message, setMessage] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  // Block guest users from placing bids
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h3>
          <p className="text-slate-600 mb-6">You need to sign in or create an account to place a bid on this load.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <Link href="/signin" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center">
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Don't have an account? <Link href="/signup" className="text-green-600 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          loadId: load.id,
          quotedPrice: parseFloat(bidAmount),
          pickupDate: pickupDate,
          estimatedDays: parseInt(deliveryDays),
          equipmentType: equipmentType,
          message: message,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        // Reset form and close after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setBidAmount('');
          setMessage('');
          setDeliveryDays('');
          setEquipmentType('');
          onClose();
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateValue = load.rateUsd || (load.price ? parseFloat(load.price) : 0) || 0;
  const suggestedBid = (rateValue || 0) * 0.95; // 5% below asking price
  const weightValue = load.weight || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Place Bid</h2>
            <p className="text-sm text-slate-600 mt-1">Submit your competitive bid for this load</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bid Submitted for Approval!</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm">
                <strong>Pending Admin Approval:</strong> Your bid will be reviewed by our admin team before being sent to the shipper. This usually takes 1-2 hours during business hours.
              </p>
            </div>
            <p className="text-slate-600">You will be notified once your bid is approved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Load Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Load Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Route:</span>
                  <p className="font-medium text-slate-900">{load.origin} → {load.destination}</p>
                </div>
                <div>
                  <span className="text-slate-600">Distance:</span>
                  <p className="font-medium text-slate-900">{load.distance || 'N/A'} km</p>
                </div>
                <div>
                  <span className="text-slate-600">Cargo:</span>
                  <p className="font-medium text-slate-900">{load.cargo || load.cargoType || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-600">Weight:</span>
                  <p className="font-medium text-slate-900">{weightValue.toLocaleString()} kg</p>
                </div>
                <div>
                  <span className="text-slate-600">Asking Rate:</span>
                  <p className="font-medium text-green-600">{load.currency || '$'}{rateValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">Pickup Date:</span>
                  <p className="font-medium text-slate-900">{load.pickupDate}</p>
                </div>
              </div>
            </div>

            {/* Bid Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Your Bid Amount (USD) *
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter your bid amount"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="mt-2 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <span className="text-slate-600">
                  Suggested competitive bid: <span className="font-semibold text-green-600">${suggestedBid.toFixed(0)}</span>
                </span>
              </div>
            </div>

            {/* Equipment Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Truck className="inline w-4 h-4 mr-1" />
                Equipment Type *
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select equipment type</option>
                <option value="20ft">20ft Container</option>
                <option value="40ft">40ft Container</option>
                <option value="40ft-hc">40ft High Cube</option>
                <option value="flatbed">Flatbed</option>
                <option value="refrigerated">Refrigerated</option>
                <option value="lowboy">Lowboy Trailer</option>
              </select>
            </div>

            {/* Pickup Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Pickup Date *
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Delivery Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Estimated Delivery Time (days) *
              </label>
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="e.g., 7"
                required
                min="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Additional Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Additional Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add any special notes, certifications, or value propositions..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Tip: Mention your insurance coverage, GPS tracking, or any special certifications
              </p>
            </div>

            {/* Terms */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Bid Terms & Conditions</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Your bid is binding once accepted by the shipper</li>
                    <li>Payment terms will be negotiated directly with shipper</li>
                    <li>Cancellation may result in penalties</li>
                    <li>All bids are subject to verification</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
