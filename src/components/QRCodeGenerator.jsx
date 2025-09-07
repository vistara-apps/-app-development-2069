import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Copy, RefreshCw } from 'lucide-react'
import CallToActionButton from './CallToActionButton'

const QRCodeGenerator = ({ 
  businessId, 
  tokenId, 
  amount = 1, 
  metadata = {},
  size = 256,
  className = ""
}) => {
  const canvasRef = useRef(null)
  const [qrData, setQrData] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Generate QR code data
  const generateQRData = () => {
    const qrPayload = {
      type: 'token_mint',
      businessId,
      tokenId,
      amount,
      timestamp: Date.now(),
      metadata
    }
    
    // In a real implementation, this would be a secure URL to your backend
    // that validates the request and mints tokens
    const baseUrl = window.location.origin
    const qrUrl = `${baseUrl}/mint-token?data=${encodeURIComponent(JSON.stringify(qrPayload))}`
    
    return qrUrl
  }

  // Generate QR code
  const generateQR = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      const data = generateQRData()
      setQrData(data)
      
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, data, {
          width: size,
          margin: 2,
          color: {
            dark: '#1F2937', // Dark gray
            light: '#FFFFFF' // White
          }
        })
      }
    } catch (err) {
      setError('Failed to generate QR code')
      console.error('QR generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Download QR code as image
  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `token-qr-${businessId}-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  // Copy QR data to clipboard
  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      alert('QR code data copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy QR code data')
    }
  }

  // Generate QR code on mount and when props change
  useEffect(() => {
    if (businessId && tokenId) {
      generateQR()
    }
  }, [businessId, tokenId, amount, size])

  if (!businessId || !tokenId) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <div className="text-center text-gray-400">
          <p>Business ID and Token ID are required to generate QR code</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-4">Token Minting QR Code</h3>
        
        {error ? (
          <div className="text-red-400 mb-4">
            <p>{error}</p>
            <CallToActionButton 
              variant="secondary" 
              onClick={generateQR}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </CallToActionButton>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              {isGenerating ? (
                <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <canvas 
                  ref={canvasRef}
                  className="border border-gray-600 rounded-lg bg-white"
                />
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <p>Amount: {amount} token{amount !== 1 ? 's' : ''}</p>
              <p>Business ID: {businessId}</p>
              <p>Token ID: {tokenId}</p>
            </div>

            <div className="flex justify-center space-x-3">
              <CallToActionButton
                variant="secondary"
                onClick={downloadQR}
                disabled={isGenerating || error}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </CallToActionButton>
              
              <CallToActionButton
                variant="secondary"
                onClick={copyQRData}
                disabled={isGenerating || error || !qrData}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </CallToActionButton>
              
              <CallToActionButton
                variant="secondary"
                onClick={generateQR}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </CallToActionButton>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-2">How it works:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Customers scan this QR code with their phone</li>
          <li>• They'll be directed to claim their tokens</li>
          <li>• Tokens are automatically minted to their wallet</li>
          <li>• Transaction is recorded on the blockchain</li>
        </ul>
      </div>
    </div>
  )
}

export default QRCodeGenerator
