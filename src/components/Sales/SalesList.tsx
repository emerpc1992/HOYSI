import React, { useState } from 'react';
import { XCircle, Trash2, Printer } from 'lucide-react';
import { Sale } from '../../types/sale';
import { formatCurrency } from '../../utils/format';
import PrintReceipt from './PrintReceipt';

interface SalesListProps {
  sales: Sale[];
  onCancel: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
}

export default function SalesList({ sales, onCancel, onDelete }: SalesListProps) {
  const [printingSale, setPrintingSale] = useState<Sale | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {[...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
          <div key={sale.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{sale.clientName}</h3>
                  <p className="text-sm text-gray-500">
                    Factura #{String(sale.invoiceNumber).padStart(6, '0')} - 
                    {formatDate(sale.date)} - 
                    <span className={`${
                      sale.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                    } font-medium`}>
                      {sale.status === 'cancelled' ? 'Cancelada' : 'Activa'}
                    </span>
                    {sale.clientCode && ` - Código: ${sale.clientCode}`}
                  </p>
                  {sale.status === 'cancelled' && sale.cancellationReason && (
                    <p className="text-sm text-red-500 mt-1">
                      Motivo: {sale.cancellationReason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatCurrency(sale.total)}</div>
                  <p className="text-sm text-gray-500">
                    {getPaymentMethodText(sale.paymentMethod)}
                    {sale.reference && ` - Ref: ${sale.reference}`}
                  </p>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setPrintingSale(sale)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Imprimir factura"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {sale.status === 'active' && (
                      <button
                        onClick={() => onCancel(sale)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Cancelar venta"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {sale.status === 'cancelled' && (
                      <button
                        onClick={() => onDelete(sale.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar venta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {sale.staffName && (
                <div className="mt-2 text-sm text-gray-600">
                  Vendedor: {sale.staffName}
                  <span className="ml-2 text-green-600">
                    (Comisión: {formatCurrency(sale.staffCommission || 0)})
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Código: {product.code} - {product.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{product.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(product.finalPrice)}</td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {formatCurrency(product.finalPrice * product.quantity)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 text-right font-medium">Subtotal:</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(sale.subtotal)}</td>
                  </tr>
                  {sale.discount > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 text-right font-medium text-red-600">Descuento:</td>
                      <td className="px-6 py-4 text-right font-medium text-red-600">
                        -{formatCurrency(sale.discount)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 text-right font-bold">Total:</td>
                    <td className="px-6 py-4 text-right font-bold">{formatCurrency(sale.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {printingSale && (
        <PrintReceipt 
          sale={printingSale}
          onClose={() => setPrintingSale(null)}
        />
      )}
    </>
  );
}