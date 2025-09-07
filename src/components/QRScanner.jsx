import React, { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Camera, X, AlertCircle } from 'lucide-react'
import CallToActionButton from './CallToActionButton'

const QRScanner = ({ 
  onScan, 
  onError, 
  onClose,
  isOpen = false,
  className = ""
}) => {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [hasCamera, setHasCamera] = useState(true)

  // Initialize scanner
  const initializeScanner = async () => {
    if (!videoRef.current) return

    try {
      setError(null)
      setIsScanning(true)

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera()
      setHasCamera(hasCamera)

      if (!hasCamera) {
        setError('No camera found on this device')
        return
      }

      // Create scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            // Parse the QR code result
            const url = new URL(result.data)
            const dataParam = url.searchParams.get('data')
            
            if (dataParam) {
              const qrData = JSON.parse(decodeURIComponent(dataParam))
              
              // Validate QR code structure
              if (qrData.type === 'token_mint' && qrData.businessId && qrData.tokenId) {
                onScan(qrData)
                stopScanning()
              } else {
                setError('Invalid token QR code format')
              }
            } else {
              setError('QR code does not contain token data')
            }
          } catch (err) {
            console.error('QR scan error:', err)
            setError('Failed to parse QR code data')
            if (onError) onError(err)
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5,
        }
      )

      // Start scanning
      await scannerRef.current.start()
    } catch (err) {
      console.error('Scanner initialization error:', err)
      setError('Failed to initialize camera')
      if (onError) onError(err)
    }
  }

  // Stop scanning
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current.destroy()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  // Handle close
  const handleClose = () => {
    stopScanning()
    if (onClose) onClose()
  }

  // Initialize scanner when opened
  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanning()
    }

    // Cleanup on unmount
    return () => {
      stopScanning()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Scan Token QR Code</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <div className="space-y-2">
              <CallToActionButton
                variant="primary"
                onClick={initializeScanner}
                disabled={!hasCamera}
              >
                <Camera className="w-4 h-4 mr-2" />
                Try Again
              </CallToActionButton>
              <CallToActionButton
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </CallToActionButton>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                playsInline
                muted
              />
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Initializing camera...</p>
                  </div>
                </div>
              )}

              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-purple-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-400 rounded-br-lg"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Position the QR code within the frame to scan
              </p>
              
              <CallToActionButton
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </CallToActionButton>
            </div>
          </>
        )}

        <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Tips for scanning:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Hold your device steady</li>
            <li>• Ensure good lighting</li>
            <li>• Keep the QR code within the frame</li>
            <li>• Make sure the QR code is not damaged</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
