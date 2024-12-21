import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import SalesList from './SalesList';
import SaleForm from './SaleForm';
import DeleteAllSalesModal from './DeleteAllSalesModal';
import CancelSaleModal from './CancelSaleModal';
import DeleteSaleModal from './DeleteSaleModal';
import { Sale } from '../../types/sale';
import { Product } from '../../types/product';
import { Staff } from '../../types/staff';
import { Client } from '../../types/client';
import { storage } from '../../utils/storage';
import DateRangeSelector from '../Reports/DateRangeSelector';
import { updateProductQuantity } from '../../utils/inventory';
import { useSalesOperations } from './hooks/useSalesOperations';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [cancellingSale, setCancellingSale] = useState<Sale | undefined>();
  const [deletingSaleId, setDeletingSaleId] = useState<string | undefined>();
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const {
    handleAddSale,
    handleCancelSale,
    handleDeleteSale,
    handleDeleteAllSales,
    filteredSales,
    setFilteredSales
  } = useSalesOperations({
    sales,
    setSales,
    products,
    setProducts,
    staff,
    setStaff,
    clients,
    setClients,
    setShowSaleForm
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [salesData, productsData, staffData, clientsData] = await Promise.all([
          storage.sales.load(),
          storage.products.load(),
          storage.staff.load(),
          storage.clients.load()
        ]);
        setSales(salesData);
        setProducts(productsData);
        setStaff(staffData);
        setClients(clientsData);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter sales whenever dates or sales change
  useEffect(() => {
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    });
    setFilteredSales(filtered);
  }, [sales, startDate, endDate, setFilteredSales]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-800">Ventas</h2>
          <button
            onClick={() => setShowSaleForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </button>
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar Todo
          </button>
        </div>
        <div className="flex-shrink-0">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSearch={() => {}} // No need for explicit search since we use useEffect
          />
        </div>
      </div>

      {filteredSales.length > 0 ? (
        <SalesList
          sales={filteredSales}
          onCancel={setCancellingSale}
          onDelete={setDeletingSaleId}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {sales.length > 0 
            ? 'No hay ventas en el rango de fechas seleccionado.'
            : 'No hay ventas registradas. Comienza agregando una nueva.'
          }
        </div>
      )}

      {showSaleForm && (
        <SaleForm
          products={products}
          staff={staff}
          clients={clients}
          onSubmit={handleAddSale}
          onClose={() => setShowSaleForm(false)}
        />
      )}

      {cancellingSale && (
        <CancelSaleModal
          onConfirm={handleCancelSale}
          onClose={() => setCancellingSale(undefined)}
        />
      )}

      {deletingSaleId && (
        <DeleteSaleModal
          onConfirm={handleDeleteSale}
          onClose={() => setDeletingSaleId(undefined)}
        />
      )}
      
      {showDeleteAllModal && (
        <DeleteAllSalesModal
          onConfirm={handleDeleteAllSales}
          onClose={() => setShowDeleteAllModal(false)}
        />
      )}
    </div>
  );
}