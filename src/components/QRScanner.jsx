import React, { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { X, Camera } from 'lucide-react'

const QRScanner = ({ isOpen, onScan, onClose }) => {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    const initScanner = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera()
        setHasCamera(hasCamera)

        if (!hasCamera) {
          setError('No camera found on this device')
          setIsLoading(false)
          return
        }

        if (videoRef.current) {
          scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              try {
                // Try to parse the QR code data
                const qrData = JSON.parse(result.data)
                
                // Validate the QR code structure
                if (qrData.type === 'token_mint' && qrData.businessId && qrData.tokenId) {
                  onScan(qrData)
                  onClose()
                } else {
                  setError('Invalid QR code format')
                }
              } catch (parseError) {
                setError('Unable to read QR code data')
              }
            },
            {
              returnDetailedScanResult: true,
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          )

          await scannerRef.current.start()
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error initializing scanner:', err)
        setError('Failed to access camera. Please check permissions.')
        setIsLoading(false)
      }
    }

    initScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }
    }
  }, [isOpen, onScan, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Scan QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Camera className="w-12 h-12 text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-600">Starting camera...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
              <p className="text-red-800 text-center">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        )}

        {!isLoading && !error && hasCamera && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Position the QR code within the frame to scan
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScanner
