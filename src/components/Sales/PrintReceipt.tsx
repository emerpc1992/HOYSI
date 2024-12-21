import React from 'react';
import { X } from 'lucide-react';
import { Sale } from '../../types/sale';
import { generateReceiptHTML } from '../../utils/receipt';

interface PrintReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export default function PrintReceipt({ sale, onClose }: PrintReceiptProps) {
  React.useEffect(() => {
    // Auto-print when component mounts
    window.print();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 print:p-0">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full print:shadow-none print:w-auto">
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-lg font-semibold">Vista Previa de Impresión</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div 
          className="p-4 print:p-0"
          dangerouslySetInnerHTML={{ __html: generateReceiptHTML(sale) }}
        />

        <div className="p-4 border-t print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}