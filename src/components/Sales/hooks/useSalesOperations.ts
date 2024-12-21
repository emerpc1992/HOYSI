import { useState } from 'react';
import { Sale } from '../../../types/sale';
import { Product } from '../../../types/product';
import { Staff } from '../../../types/staff';
import { Client } from '../../../types/client';
import { storage } from '../../../utils/storage';
import { updateProductQuantity } from '../../../utils/inventory';
import { validateAdminPassword } from '../../../utils/passwords';

interface UseSalesOperationsProps {
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  clients: Client[];
  setClients: (clients: Client[]) => void;
  setShowSaleForm: (show: boolean) => void;
}

export const useSalesOperations = ({
  sales,
  setSales,
  products,
  setProducts,
  staff,
  setStaff,
  clients,
  setClients,
  setShowSaleForm
}: UseSalesOperationsProps) => {
  const [filteredSales, setFilteredSales] = useState<Sale[]>(sales);

  const handleAddSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    try {
      const lastInvoiceNumber = sales.reduce((max, sale) => 
        Math.max(max, sale.invoiceNumber || 0), 0);

      const newSale = {
        ...saleData,
        id: Date.now().toString(),
        invoiceNumber: lastInvoiceNumber + 1,
        date: new Date().toISOString(),
        status: 'active' as const
      };

      if (saleData.clientCode) {
        const updatedClients = clients.map(client => {
          if (client.code === saleData.clientCode) {
            const newPurchase = {
              id: newSale.id,
              date: newSale.date,
              total: newSale.total,
              products: newSale.products.map(p => ({
                id: p.id,
                name: p.name,
                quantity: p.quantity,
                price: p.finalPrice
              }))
            };
            return {
              ...client,
              purchases: [...(client.purchases || []), newPurchase]
            };
          }
          return client;
        });

        await storage.clients.save(updatedClients);
        setClients(updatedClients);
      }

      const quantityChanges = saleData.products.map(product => ({
        id: product.id,
        quantity: -product.quantity
      }));

      const updatedProducts = updateProductQuantity(products, quantityChanges);
      setProducts(updatedProducts);

      const updatedSales = [...sales, newSale];
      await storage.sales.save(updatedSales);
      setSales(updatedSales);

      if (newSale.staffId) {
        const updatedStaff = staff.map(s => {
          if (s.id === newSale.staffId) {
            return {
              ...s,
              sales: [...s.sales, {
                id: newSale.id,
                date: newSale.date,
                total: newSale.total,
                commission: newSale.staffCommission || 0,
                commissionPaid: false,
                products: newSale.products.map(p => ({
                  id: p.id,
                  name: p.name,
                  quantity: p.quantity,
                  price: p.finalPrice
                }))
              }]
            };
          }
          return s;
        });
        await storage.staff.save(updatedStaff);
        setStaff(updatedStaff);
      }

      setShowSaleForm(false);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error al guardar la venta');
    }
  };

  const handleCancelSale = (reason: string) => {
    const updatedSales = sales.map(sale => {
      if (sale.id === cancellingSale?.id) {
        return { ...sale, status: 'cancelled', cancellationReason: reason };
      }
      return sale;
    });
    setSales(updatedSales);
    storage.sales.save(updatedSales);
  };

  const handleDeleteSale = (password: string) => {
    if (!validateAdminPassword(password)) {
      return;
    }
    const updatedSales = sales.filter(s => s.id !== deletingSaleId);
    setSales(updatedSales);
    storage.sales.save(updatedSales);
  };

  const handleDeleteAllSales = async (password: string) => {
    if (!validateAdminPassword(password)) {
      return;
    }
    
    try {
      await storage.sales.save([]);
      setSales([]);
      setFilteredSales([]);
    } catch (error) {
      console.error('Error deleting all sales:', error);
      alert('Error al eliminar las ventas');
    }
  };

  return {
    handleAddSale,
    handleCancelSale,
    handleDeleteSale,
    handleDeleteAllSales,
    filteredSales,
    setFilteredSales
  };
};