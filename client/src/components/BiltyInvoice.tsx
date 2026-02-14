import { useRef } from 'react';
import { 
  FileText, Truck, MapPin, Calendar, Package, User, Phone, 
  Mail, Building, Clock, DollarSign, Shield, AlertTriangle,
  Printer, Download, CheckCircle, Hash
} from 'lucide-react';

interface BiltyInvoiceProps {
  booking: {
    id: number;
    trackingNumber: string;
    loadId: number;
    status: string;
    createdAt: string;
    confirmedAt?: string;
    price: number;
    currency: string;
  };
  load: {
    origin: string;
    destination: string;
    cargoType: string;
    weight: string;
    volume?: string;
    pickupDate: string;
    deliveryDate: string;
    description?: string;
    specialRequirements?: string;
  };
  shipper: {
    name: string;
    company?: string;
    phone: string;
    email: string;
  };
  carrier: {
    name: string;
    company?: string;
    phone: string;
    email: string;
    vehicleNumber?: string;
    licenseNumber?: string;
  };
  onClose?: () => void;
}

export default function BiltyInvoice({ booking, load, shipper, carrier, onClose }: BiltyInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bilty - ${booking.trackingNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            .bilty-container { max-width: 800px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { font-size: 12px; opacity: 0.9; }
            .tracking { background: #f0fdf4; padding: 15px; border: 1px solid #bbf7d0; }
            .tracking-number { font-size: 20px; font-weight: bold; color: #059669; font-family: monospace; }
            .section { padding: 15px; border: 1px solid #e5e7eb; border-top: none; }
            .section-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 10px; border-bottom: 2px solid #059669; padding-bottom: 5px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { margin-bottom: 8px; }
            .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
            .info-value { font-size: 14px; color: #111827; font-weight: 500; }
            .route-box { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
            .route-city { font-size: 16px; font-weight: 600; color: #111827; }
            .route-arrow { font-size: 24px; color: #059669; margin: 10px 0; }
            .price-box { background: #059669; color: white; padding: 15px; text-align: center; border-radius: 8px; }
            .price-amount { font-size: 28px; font-weight: bold; }
            .rules { background: #fef3c7; padding: 15px; border: 1px solid #fcd34d; border-radius: 8px; margin-top: 15px; }
            .rules h4 { color: #92400e; margin-bottom: 10px; }
            .rules ul { font-size: 12px; color: #78350f; padding-left: 20px; }
            .rules li { margin-bottom: 5px; }
            .footer { text-align: center; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 11px; color: #6b7280; }
            .signature-box { border: 1px dashed #9ca3af; padding: 30px; text-align: center; margin-top: 10px; }
            .signature-label { font-size: 12px; color: #6b7280; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const biltyDate = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Action Buttons */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Bilty / Consignment Note
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Bilty Content */}
        <div ref={printRef} className="p-6">
          <div className="bilty-container border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Truck className="w-8 h-8" />
                    LoadPak
                  </h1>
                  <p className="text-green-100 text-sm mt-1">Pakistan's Premier Logistics Platform</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-100">BILTY / CONSIGNMENT NOTE</p>
                  <p className="text-lg font-bold">#{booking.trackingNumber}</p>
                  <p className="text-sm text-green-200">{biltyDate}</p>
                </div>
              </div>
            </div>

            {/* Tracking Number Banner */}
            <div className="bg-green-50 border-b border-green-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">TRACKING NUMBER</p>
                  <p className="text-xl font-bold text-green-700 font-mono">{booking.trackingNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">
                  CONFIRMED
                </span>
              </div>
            </div>

            {/* Route Section */}
            <div className="p-6 border-b border-slate-200">
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-1">ORIGIN</p>
                  <p className="text-lg font-bold text-slate-900">{load.origin}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {load.pickupDate}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl text-green-600">→</div>
                  <p className="text-xs text-slate-500 mt-1">TRANSIT</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <MapPin className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-1">DESTINATION</p>
                  <p className="text-lg font-bold text-slate-900">{load.destination}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {load.deliveryDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Cargo Details */}
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b-2 border-green-600 pb-2">
                <Package className="w-4 h-4 text-green-600" />
                CARGO DETAILS
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Cargo Type</p>
                  <p className="font-semibold text-slate-900">{load.cargoType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Weight</p>
                  <p className="font-semibold text-slate-900">{load.weight}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Volume</p>
                  <p className="font-semibold text-slate-900">{load.volume || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Special Requirements</p>
                  <p className="font-semibold text-slate-900">{load.specialRequirements || 'None'}</p>
                </div>
              </div>
              {load.description && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{load.description}</p>
                </div>
              )}
            </div>

            {/* Parties Section */}
            <div className="p-6 border-b border-slate-200">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipper */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    SHIPPER / CONSIGNOR
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{shipper.name}</span>
                    </div>
                    {shipper.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span>{shipper.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{shipper.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>{shipper.email}</span>
                    </div>
                  </div>
                </div>

                {/* Carrier */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2 border-b-2 border-green-600 pb-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    CARRIER / TRANSPORTER
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{carrier.name}</span>
                    </div>
                    {carrier.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-green-600" />
                        <span>{carrier.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>{carrier.phone}</span>
                    </div>
                    {carrier.vehicleNumber && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-600" />
                        <span>Vehicle: {carrier.vehicleNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b-2 border-green-600 pb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                PAYMENT DETAILS
              </h3>
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Agreed Freight Charges</p>
                    <p className="text-3xl font-bold mt-1">{booking.currency} {booking.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Payment Status</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      To Be Collected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules & Regulations */}
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b-2 border-amber-600 pb-2">
                <Shield className="w-4 h-4 text-amber-600" />
                TERMS, CONDITIONS & REGULATIONS
              </h3>
              
              <div className="space-y-4">
                {/* Trucker Responsibilities */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Carrier/Trucker Responsibilities
                  </h4>
                  <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
                    <li>Ensure safe and timely delivery of goods as per agreed schedule</li>
                    <li>Maintain proper documentation throughout the journey</li>
                    <li>Report any delays or issues immediately to the shipper and platform</li>
                    <li>Handle cargo with care and follow special handling instructions</li>
                    <li>Comply with all traffic laws and regulations</li>
                    <li>Maintain valid driving license, vehicle registration, and insurance</li>
                    <li>Do not subcontract without prior written consent</li>
                  </ul>
                </div>

                {/* Shipper Responsibilities */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Shipper/Consignor Responsibilities
                  </h4>
                  <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
                    <li>Provide accurate cargo details including weight and dimensions</li>
                    <li>Ensure proper packaging of goods for transport</li>
                    <li>Provide all necessary documentation for cargo</li>
                    <li>Make payment as per agreed terms</li>
                    <li>Ensure someone is available at pickup and delivery locations</li>
                  </ul>
                </div>

                {/* Liability & Insurance */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Liability & Insurance
                  </h4>
                  <ul className="text-sm text-red-900 space-y-1 list-disc list-inside">
                    <li>Carrier is liable for loss or damage during transit up to declared value</li>
                    <li>Claims must be filed within 7 days of delivery</li>
                    <li>Force majeure events are excluded from liability</li>
                    <li>Shipper must declare hazardous materials in advance</li>
                    <li>Insurance coverage as per platform policy applies</li>
                  </ul>
                </div>

                {/* Platform Rules */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Platform Rules
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                    <li>Both parties agree to LoadPak's Terms of Service</li>
                    <li>Disputes will be resolved through LoadPak's dispute resolution process</li>
                    <li>Ratings and reviews must be honest and fair</li>
                    <li>Contact support at support@loadpak.com for any issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">SIGNATURES</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <p className="text-xs text-slate-500 mb-8">Shipper Signature</p>
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-sm text-slate-600">{shipper.name}</p>
                    <p className="text-xs text-slate-400">Date: _______________</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <p className="text-xs text-slate-500 mb-8">Carrier Signature</p>
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-sm text-slate-600">{carrier.name}</p>
                    <p className="text-xs text-slate-400">Date: _______________</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <p className="text-xs text-slate-500 mb-8">Receiver Signature</p>
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-sm text-slate-600">_______________</p>
                    <p className="text-xs text-slate-400">Date: _______________</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-100 p-4 text-center">
              <p className="text-xs text-slate-600">
                This is a computer-generated document. For queries, contact LoadPak Support.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Email: support@loadpak.com | Phone: +92 300 1234567 | Website: www.loadpak.com
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Generated on {new Date().toLocaleString('en-PK')} | Document ID: {booking.trackingNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
