import React from 'react';
import { FiCheck, FiZap, FiCreditCard, FiUsers } from 'react-icons/fi';

const plans = [
  {
    name: 'Free Plan',
    price: '0',
    color: 'border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-600',
    features: [
      { text: 'Up to 50 patients', included: true },
      { text: 'Basic appointment booking', included: true },
      { text: 'Manual prescriptions', included: true },
      { text: 'Basic patient management', included: true },
      { text: 'AI Smart Symptom Checker', included: false },
      { text: 'AI Prescription Explanation', included: false },
      { text: 'Advanced Analytics', included: false },
      { text: 'Risk Flagging System', included: false },
      { text: 'Predictive Analytics', included: false },
      { text: 'Unlimited patients', included: false },
      { text: 'Priority support', included: false }
    ]
  },
  {
    name: 'Pro Plan',
    price: '4,999',
    color: 'border-primary-500 ring-2 ring-primary-100',
    badgeColor: 'bg-primary-600 text-white',
    popular: true,
    features: [
      { text: 'Unlimited patients', included: true },
      { text: 'Advanced appointment booking', included: true },
      { text: 'Digital prescriptions + PDF', included: true },
      { text: 'Complete patient management', included: true },
      { text: 'AI Smart Symptom Checker', included: true },
      { text: 'AI Prescription Explanation', included: true },
      { text: 'Advanced Analytics Dashboard', included: true },
      { text: 'Risk Flagging System', included: true },
      { text: 'Predictive Analytics (AI)', included: true },
      { text: 'Medical History Timeline', included: true },
      { text: 'Priority support', included: true }
    ]
  }
];

function SubscriptionPlans() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plans</h1>
          <p className="page-subtitle">Manage and customize subscription tiers for your SaaS platform</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FiCreditCard className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
        <div>
          <p className="text-sm font-semibold text-blue-800">SaaS Subscription Model (Simulated)</p>
          <p className="text-sm text-blue-600 mt-1">This is a simulation of the subscription system. In production, integrate with a payment gateway like Stripe or JazzCash. Use the "Manage Users" page to assign plans to specific users.</p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <FiZap size={11} /> MOST POPULAR
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.badgeColor}`}>
                {plan.name === 'Free Plan' ? 'Basic' : 'Advanced'}
              </span>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">Rs. {plan.price}</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs ${feature.included ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {feature.included ? '✓' : '✕'}
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>
            <button className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
              {plan.popular ? 'Current Active Plan' : 'Basic Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Access Control Info */}
      <div className="card max-w-3xl mx-auto">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiUsers size={18} className="text-primary-600" /> Feature-Based Access Control
        </h3>
        <p className="text-sm text-gray-600 mb-4">The following AI features are restricted to Pro plan users only:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['AI Symptom Checker', 'AI Prescription Explanation', 'Risk Flagging System', 'Predictive Analytics'].map((f) => (
            <div key={f} className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
              <FiZap className="text-primary-500" size={15} />
              <span className="text-sm text-primary-700 font-medium">{f}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * To assign a plan to a user, go to Manage Users and use the plan dropdown in the table.
        </p>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
