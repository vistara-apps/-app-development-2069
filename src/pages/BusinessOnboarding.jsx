import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { Building2, MapPin, Mail, Tag, Coins, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { businessApi } from '../api/businessApi'
import { useTokenFactory } from '../hooks/useTokenContract'
import CallToActionButton from '../components/CallToActionButton'

const BusinessOnboarding = () => {
  const { address } = useAccount()
  const navigate = useNavigate()
  const { createBusinessToken, isLoading: isCreatingToken } = useTokenFactory()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactInfo: '',
    category: '',
    rewardScheme: '',
    tokenName: '',
    tokenSymbol: ''
  })

  const categories = [
    'Coffee & Tea',
    'Restaurant',
    'Books & Media',
    'Grocery',
    'Retail',
    'Services',
    'Entertainment',
    'Health & Wellness',
    'Other'
  ]

  const steps = [
    { number: 1, title: 'Business Info', description: 'Tell us about your business' },
    { number: 2, title: 'Token Setup', description: 'Configure your loyalty token' },
    { number: 3, title: 'Review', description: 'Review and submit' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setIsSubmitting(true)

      // Step 1: Create the business token contract
      const tokenTxHash = await createBusinessToken(formData.tokenName, formData.tokenSymbol)
      
      // Step 2: Create business profile in database
      const businessData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        contactInfo: formData.contactInfo,
        category: formData.category,
        rewardScheme: formData.rewardScheme,
        ownerWallet: address,
        tokenContractAddress: tokenTxHash // This would be the actual contract address after deployment
      }

      const business = await businessApi.createBusiness(businessData)

      alert('Business registration submitted successfully! You will be notified once approved.')
      navigate('/business-dashboard')
    } catch (error) {
      console.error('Error submitting business:', error)
      alert('Error submitting business registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.location && formData.contactInfo && formData.category
      case 2:
        return formData.rewardScheme && formData.tokenName && formData.tokenSymbol
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your business name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your business and what makes it special"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Information *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="contact@yourbusiness.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reward Scheme *
              </label>
              <textarea
                value={formData.rewardScheme}
                onChange={(e) => handleInputChange('rewardScheme', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe how customers earn and redeem tokens (e.g., 'Earn 1 token per $5 spent, redeem 10 tokens for free coffee')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token Name *
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) => handleInputChange('tokenName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Coffee Bean Token"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token Symbol *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
                  maxLength={5}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="CBT"
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">3-5 characters, will be converted to uppercase</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <h4 className="text-white font-medium mb-2">Token Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{formData.tokenName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="text-white">{formData.tokenSymbol || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Business:</span>
                  <span className="text-white">{formData.name || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-4">Review Your Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{formData.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{formData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contact:</span>
                      <span className="text-white">{formData.contactInfo}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Token Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token Name:</span>
                      <span className="text-white">{formData.tokenName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token Symbol:</span>
                      <span className="text-white">{formData.tokenSymbol}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Reward Scheme</h4>
                  <p className="text-sm text-white bg-gray-800 p-3 rounded">{formData.rewardScheme}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Your business will be reviewed by our team</li>
                <li>• A smart contract will be deployed for your loyalty token</li>
                <li>• You'll receive an email when your business is approved</li>
                <li>• You can then start issuing tokens to customers</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!address) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          Please connect your wallet to register your business and create loyalty tokens.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Register Your Business</h1>
        <p className="text-gray-400">
          Join LocalToken Rewards and start building customer loyalty with blockchain-powered tokens
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-gray-600 text-gray-400'
            }`}>
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3 text-left">
              <div className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-white' : 'text-gray-400'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-gray-600 mx-6" />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <CallToActionButton
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </CallToActionButton>

          {currentStep < 3 ? (
            <CallToActionButton
              variant="primary"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </CallToActionButton>
          ) : (
            <CallToActionButton
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || isCreatingToken}
            >
              {isSubmitting || isCreatingToken ? 'Submitting...' : 'Submit Registration'}
            </CallToActionButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessOnboarding
