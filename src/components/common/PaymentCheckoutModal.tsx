import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, PaymentMethodType } from '../../types';
import { formatINR } from '../../services/financialEngine';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentCheckoutModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { recordPaymentAttempt } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI');
  const [scenario, setScenario] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'PARTIAL'>('SUCCESS');
  const [upiId, setUpiId] = useState('greenmart@oksbi');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 9923');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'FAILED' | 'PENDING';
    message: string;
  }>({ status: 'IDLE', message: '' });

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setResult({ status: 'IDLE', message: '' });

    setTimeout(() => {
      setIsProcessing(false);
      const res = recordPaymentAttempt(
        invoice.id,
        invoice.outstandingBalancePaise,
        selectedMethod,
        scenario
      );

      if (res.success) {
        setResult({
          status: 'SUCCESS',
          message: `Payment of ${formatINR(
            scenario === 'PARTIAL' ? invoice.outstandingBalancePaise / 2 : invoice.outstandingBalancePaise
          )} processed successfully via simulated ${selectedMethod}.`,
        });
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (_) {}
      } else if (scenario === 'PENDING') {
        setResult({
          status: 'PENDING',
          message: 'Payment instruction submitted. Simulated clearing is pending bank reconciliation.',
        });
      } else {
        setResult({
          status: 'FAILED',
          message: res.message || 'Payment attempt was declined by the simulated payment network.',
        });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30">
              SIMULATED CHECKOUT
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Pay Invoice {invoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Payable to: {invoice.supplierOrganizationName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persistent Legal & Simulation Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>DEMO MODE:</strong> No real money is transferred. No real credentials are collected.
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* Financial Breakdown Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Product Base Subtotal:</span>
              <span>{formatINR(invoice.subtotalPaise)}</span>
            </div>
            {invoice.totalDiscountPaise > 0 && (
              <div className="flex justify-between text-emerald-700 text-xs font-medium">
                <span>Cooperative Bulk Discount:</span>
                <span>-{formatINR(invoice.totalDiscountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Allocated Shared Freight:</span>
              <span>{formatINR(invoice.allocatedShippingPaise)}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>
                GST Tax ({invoice.isInterState ? 'IGST' : 'CGST + SGST'}):
              </span>
              <span>{formatINR(invoice.totalTaxPaise)}</span>
            </div>
            {invoice.amountPaidPaise > 0 && (
              <div className="flex justify-between text-blue-700 text-xs">
                <span>Amount Previously Paid:</span>
                <span>-{formatINR(invoice.amountPaidPaise)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-bold">
              <span>Current Amount Due:</span>
              <span className="text-lg text-emerald-700">
                {formatINR(invoice.outstandingBalancePaise)}
              </span>
            </div>
          </div>

          {result.status === 'IDLE' && (
            <>
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Simulated Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'NET_BANKING', label: 'Net Banking', icon: Building },
                    { id: 'BANK_TRANSFER_NEFT', label: 'NEFT / RTGS', icon: Building },
                    { id: 'WALLET', label: 'B2B Wallet', icon: Wallet },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as PaymentMethodType)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-slate-600" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method Mock Input Simulator */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                {selectedMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Simulated Virtual Payment Address (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
                {selectedMethod === 'CREDIT_CARD' && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Simulated Corporate Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>
                )}
                {(selectedMethod === 'NET_BANKING' || selectedMethod === 'BANK_TRANSFER_NEFT') && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Select Corporate Clearing Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                    >
                      <option>State Bank of India (Corporate Banking)</option>
                      <option>HDFC Bank Corporate NetBanking</option>
                      <option>ICICI Bank Corporate Portal</option>
                      <option>Axis Bank Commercial Banking</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Simulation Scenario Controls (Test Scenarios) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Simulation Outcome Scenario
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setScenario('SUCCESS')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      scenario === 'SUCCESS'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Force Success (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScenario('FAILED')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      scenario === 'FAILED'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✕ Force Failure (Bank decline)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScenario('PENDING')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      scenario === 'PENDING'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⏳ Force Pending (Bank clearance)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScenario('PARTIAL')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      scenario === 'PARTIAL'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ½ Partial Payment (50%)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Outcome Receipt Display */}
          {result.status !== 'IDLE' && (
            <div
              className={`p-5 rounded-xl border text-center space-y-3 ${
                result.status === 'SUCCESS'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : result.status === 'PENDING'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex justify-center">
                {result.status === 'SUCCESS' && <CheckCircle2 className="w-12 h-12 text-emerald-600" />}
                {result.status === 'PENDING' && <Clock className="w-12 h-12 text-amber-600" />}
                {result.status === 'FAILED' && <AlertCircle className="w-12 h-12 text-rose-600" />}
              </div>
              <h4 className="text-base font-bold">
                {result.status === 'SUCCESS' && 'Simulated Payment Successful!'}
                {result.status === 'PENDING' && 'Payment Under Settlement Review'}
                {result.status === 'FAILED' && 'Simulated Payment Declined'}
              </h4>
              <p className="text-xs leading-relaxed max-w-md mx-auto">{result.message}</p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result.status === 'IDLE' && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={isProcessing || invoice.outstandingBalancePaise <= 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Mock Settlement...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Simulate Payment ({formatINR(
                      scenario === 'PARTIAL' ? invoice.outstandingBalancePaise / 2 : invoice.outstandingBalancePaise
                    )})
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
