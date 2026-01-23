"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Loader2, Clock, AlertCircle, X } from "lucide-react"

interface PaymentStatusModalProps {
  isOpen: boolean
  onClose: () => void
  status: 'pending' | 'approved' | 'cancelled' | 'verifying' | null
  orderId?: number | string
  totalAmount?: number
  requestId?: string
  onCheckStatus?: () => Promise<void>
}

export default function PaymentStatusModal({
  isOpen,
  onClose,
  status,
  orderId,
  totalAmount,
  requestId,
  onCheckStatus
}: PaymentStatusModalProps) {
  // Polling para verificar estado cuando está pendiente
  useEffect(() => {
    if (!isOpen || status !== 'pending' || !onCheckStatus) return

    const interval = setInterval(() => {
      onCheckStatus()
    }, 5000) // Verificar cada 5 segundos

    return () => clearInterval(interval)
  }, [isOpen, status, onCheckStatus])

  // Prevenir que el modal se cierre cuando está pendiente o verificando
  const handleOpenChange = (open: boolean) => {
    // Si intentan cerrar el modal pero el pago está pendiente o verificando, no permitirlo
    if (!open && (status === 'pending' || status === 'verifying')) {
      return
    }
    // Solo permitir cerrar si el pago no está pendiente ni verificando
    onClose()
  }

  const formatPrice = (precio: number | undefined) => {
    if (!precio) return 'N/A'
    return precio.toLocaleString('es-CO')
  }

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return {
          icon: <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />,
          title: 'Verificando Pago',
          description: 'Estamos verificando el estado de tu transacción. Por favor espera...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900'
        }
      case 'pending':
        return {
          icon: <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />,
          title: 'Pago en Proceso',
          description: 'Tu pago está siendo procesado. Por favor espera unos momentos...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900'
        }
      case 'approved':
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
          title: '¡Pago Aprobado!',
          description: `Tu pedido #${orderId || 'N/A'} ha sido confirmado exitosamente.`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900'
        }
      case 'cancelled':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: 'Pago Cancelado',
          description: 'El pago fue cancelado. Tu carrito se mantiene intacto para que puedas intentar nuevamente.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900'
        }
      default:
        return null
    }
  }

  const statusContent = getStatusContent()

  if (!statusContent) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={`sm:max-w-md ${statusContent.bgColor} ${statusContent.borderColor} border-2 ${(status === 'pending' || status === 'verifying') ? '[&>button[data-radix-dialog-close]]:hidden' : ''}`}
        onInteractOutside={(e) => {
          // Prevenir cerrar haciendo clic fuera del modal si está pendiente o verificando
          if (status === 'pending' || status === 'verifying') {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevenir cerrar con ESC si está pendiente o verificando
          if (status === 'pending' || status === 'verifying') {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {statusContent.icon}
          </div>
          <DialogTitle className={`text-2xl font-bold ${statusContent.textColor}`}>
            {statusContent.title}
          </DialogTitle>
          <DialogDescription className={`text-base ${statusContent.textColor} opacity-90`}>
            {statusContent.description}
          </DialogDescription>
        </DialogHeader>

        <div className={`mt-6 p-4 rounded-lg ${status === 'pending' ? 'bg-blue-100' : status === 'approved' ? 'bg-green-100' : 'bg-red-100'} border ${status === 'pending' ? 'border-blue-200' : status === 'approved' ? 'border-green-200' : 'border-red-200'}`}>
          {orderId && (
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Pedido:</span>
              <span className="font-bold text-gray-900">#{orderId}</span>
            </div>
          )}
          {totalAmount && (
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="font-bold text-gray-900">${formatPrice(totalAmount)}</span>
            </div>
          )}
        </div>

        {(status === 'pending' || status === 'verifying') && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 animate-pulse" />
            <span>{status === 'verifying' ? 'Verificando estado del pago...' : 'Verificando estado del pago...'}</span>
          </div>
        )}

        {status === 'approved' && (
          <div className="mt-6 space-y-3">
            <div className="bg-white/60 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700 text-center">
                Te enviaremos un correo de confirmación con los detalles de tu pedido.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="mt-6 space-y-3">
            <div className="bg-white/60 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-700 text-center">
                Si ya realizaste el pago, espera unos momentos y vuelve a verificar. Si el problema persiste, contacta con soporte.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
