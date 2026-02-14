import { useState } from 'react';
import { CreditCard, Building, Smartphone, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentOptionsProps {
  amount?: number;
  currency?: string;
  onPaymentConfirm?: (method: string, transactionId: string) => void;
}

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: Building,
    color: 'bg-blue-500',
    accounts: [
      {
        bank: 'HBL (Habib Bank Limited)',
        accountTitle: 'LoadsPak Pvt Ltd',
        accountNumber: '1234-5678-9012-3456',
        iban: 'PK36HABB0001234567890123',
        branchCode: '0123',
      },
      {
        bank: 'MCB Bank',
        accountTitle: 'LoadsPak Pvt Ltd',
        accountNumber: '0987-6543-2109-8765',
        iban: 'PK36MUCB0009876543210987',
        branchCode: '0456',
      },
    ],
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: Smartphone,
    color: 'bg-green-500',
    accounts: [
      {
        accountTitle: 'LoadsPak',
        accountNumber: '0300-1234567',
        type: 'Mobile Account',
      },
    ],
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: Smartphone,
    color: 'bg-red-500',
    accounts: [
      {
        accountTitle: 'LoadsPak',
        accountNumber: '0301-9876543',
        type: 'Mobile Account',
      },
    ],
  },
  {
    id: 'card',
    name: 'Card Payment',
    icon: CreditCard,
    color: 'bg-purple-500',
    accounts: [],
    comingSoon: true,
  },
];

export default function PaymentOptions({ amount, currency = 'PKR', onPaymentConfirm }: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = () => {
    if (selectedMethod && transactionId.trim()) {
      onPaymentConfirm?.(selectedMethod, transactionId);
      setShowConfirmation(true);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <h3 className="text-lg font-bold">Payment Options</h3>
        {amount && (
          <p className="text-green-100 text-sm mt-1">
            Amount to Pay: <span className="font-bold text-white">{currency} {amount.toLocaleString()}</span>
          </p>
        )}
      </div>

      <div className="p-4 space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isExpanded = expandedMethod === method.id;
          const isSelected = selectedMethod === method.id;

          return (
            <div key={method.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  if (!method.comingSoon) {
                    setExpandedMethod(isExpanded ? null : method.id);
                    setSelectedMethod(method.id);
                  }
                }}
                disabled={method.comingSoon}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  isSelected ? 'bg-green-50 border-green-300' : 'hover:bg-slate-50'
                } ${method.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{method.name}</p>
                    {method.comingSoon && (
                      <span className="text-xs text-amber-600">Coming Soon</span>
                    )}
                  </div>
                </div>
                {!method.comingSoon && (
                  isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isExpanded && !method.comingSoon && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  {method.accounts.map((account, idx) => (
                    <div key={idx} className="mb-4 last:mb-0 p-3 bg-white rounded-lg border border-slate-200">
                      {'bank' in account && (
                        <>
                          <p className="text-sm font-semibold text-slate-900 mb-2">{account.bank}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Account Title:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{account.accountTitle}</span>
                                <button
                                  onClick={() => copyToClipboard(account.accountTitle, `title-${idx}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedField === `title-${idx}` ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Account Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium font-mono">{account.accountNumber}</span>
                                <button
                                  onClick={() => copyToClipboard(account.accountNumber, `acc-${idx}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedField === `acc-${idx}` ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            {'iban' in account && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">IBAN:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium font-mono text-xs">{account.iban}</span>
                                  <button
                                    onClick={() => copyToClipboard(account.iban!, `iban-${idx}`)}
                                    className="p-1 hover:bg-slate-100 rounded"
                                  >
                                    {copiedField === `iban-${idx}` ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-slate-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {'type' in account && (
                        <>
                          <p className="text-sm font-semibold text-slate-900 mb-2">{account.type}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Account Title:</span>
                              <span className="font-medium">{account.accountTitle}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Mobile Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium font-mono text-lg">{account.accountNumber}</span>
                                <button
                                  onClick={() => copyToClipboard(account.accountNumber, `mobile-${idx}`)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  {copiedField === `mobile-${idx}` ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Transaction ID Input */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      After making payment, enter your Transaction ID / Reference Number:
                    </p>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Transaction ID"
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={handleConfirmPayment}
                      disabled={!transactionId.trim()}
                      className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Instructions */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Select your preferred payment method above</li>
          <li>Copy the account details and make the payment</li>
          <li>Enter the Transaction ID / Reference Number</li>
          <li>Click "Confirm Payment" to notify us</li>
          <li>Your payment will be verified within 24 hours</li>
        </ol>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Submitted!</h3>
            <p className="text-slate-600 mb-4">
              Your payment confirmation has been received. We will verify your payment within 24 hours.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Transaction ID: <span className="font-mono font-medium">{transactionId}</span>
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
