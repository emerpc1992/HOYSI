import { jsPDF } from 'jspdf';
import { Sale } from '../types/sale';
import { formatCurrency } from './format';
import { loadReceiptConfig } from './receiptConfig';

export const generateReceipt = (sale: Sale): jsPDF => {
  const config = loadReceiptConfig();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [config.paperSize.width, config.paperSize.height],
    compress: true
  });

  let y = 10; // Starting y position
  const margin = config.paperSize.width * 0.07; // 7% of width as margin

  // Header
  doc.setFontSize(config.fontSize.title);
  const title = config.businessInfo.name;
  const titleWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(title, (config.paperSize.width - titleWidth) / 2, y);
  
  y += 5;
  doc.setFontSize(config.fontSize.subtitle);
  const subtitle = config.businessInfo.subtitle;
  const subtitleWidth = doc.getStringUnitWidth(subtitle) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(subtitle, (config.paperSize.width - subtitleWidth) / 2, y);

  // Additional business info
  if (config.businessInfo.address) {
    y += 4;
    doc.setFontSize(config.fontSize.body);
    doc.text(config.businessInfo.address, margin, y);
  }

  if (config.businessInfo.phone) {
    y += 4;
    doc.text(`Tel: ${config.businessInfo.phone}`, margin, y);
  }

  if (config.businessInfo.email) {
    y += 4;
    doc.text(config.businessInfo.email, margin, y);
  }

  y += 8;
  doc.setFontSize(config.fontSize.body);
  doc.text(`Factura #${String(sale.invoiceNumber).padStart(6, '0')}`, margin, y);

  y += 4;
  const date = new Date(sale.date).toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${date}`, margin, y);

  y += 4;
  doc.text(`Cliente: ${sale.clientName}`, margin, y);

  if (sale.clientCode) {
    y += 4;
    doc.text(`Código: ${sale.clientCode}`, margin, y);
  }

  // Products table
  y += 8;
  doc.text('Productos:', margin, y);
  y += 4;

  sale.products.forEach(product => {
    doc.text(product.name, margin, y);
    doc.text(String(product.quantity), margin + 30, y);
    doc.text(formatCurrency(product.finalPrice), margin + 45, y);
    doc.text(formatCurrency(product.finalPrice * product.quantity), margin + 65, y);
    y += 4;
  });

  // Totals
  y += 4;
  doc.text('Subtotal:', margin + 45, y);
  doc.text(formatCurrency(sale.subtotal), margin + 65, y);

  if (sale.discount > 0) {
    y += 4;
    doc.text('Descuento:', margin + 45, y);
    doc.text(`-${formatCurrency(sale.discount)}`, margin + 65, y);
  }

  y += 4;
  doc.setFontSize(config.fontSize.subtitle);
  doc.text('Total:', margin + 45, y);
  doc.text(formatCurrency(sale.total), margin + 65, y);

  // Payment method
  y += 8;
  doc.setFontSize(config.fontSize.body);
  const paymentMethods: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia'
  };
  doc.text(`Método de pago: ${paymentMethods[sale.paymentMethod]}`, margin, y);

  if (sale.reference) {
    y += 4;
    doc.text(`Referencia: ${sale.reference}`, margin, y);
  }

  // Thank you message
  y += 8;
  const thankYou = '¡Gracias por su preferencia!';
  const thankYouWidth = doc.getStringUnitWidth(thankYou) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(thankYou, (config.paperSize.width - thankYouWidth) / 2, y);

  return doc;
};

export const generateReceiptHTML = (sale: Sale): string => {
  const config = loadReceiptConfig();
  const date = new Date(sale.date).toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentMethods: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia'
  };

  return `
    <div class="receipt" style="
      font-family: 'Courier New', monospace;
      max-width: ${config.paperSize.width}mm;
      margin: 0 auto;
      padding: 10mm;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    ">
      <div style="text-align: center; margin-bottom: 5mm;">
        <h1 style="
          font-size: ${config.fontSize.title}pt;
          margin: 0;
          margin-bottom: 2mm;
        ">${config.businessInfo.name}</h1>
        <div style="
          font-size: ${config.fontSize.subtitle}pt;
          margin-bottom: 2mm;
        ">${config.businessInfo.subtitle}</div>
        ${config.businessInfo.address ? `
          <div style="font-size: ${config.fontSize.body}pt;">
            ${config.businessInfo.address}
          </div>
        ` : ''}
        ${config.businessInfo.phone ? `
          <div style="font-size: ${config.fontSize.body}pt;">
            Tel: ${config.businessInfo.phone}
          </div>
        ` : ''}
        ${config.businessInfo.email ? `
          <div style="font-size: ${config.fontSize.body}pt;">
            ${config.businessInfo.email}
          </div>
        ` : ''}
      </div>

      <div style="margin-bottom: 5mm; font-size: ${config.fontSize.body}pt;">
        <div>Factura #${String(sale.invoiceNumber).padStart(6, '0')}</div>
        <div>Fecha: ${date}</div>
        <div>Cliente: ${sale.clientName}</div>
        ${sale.clientCode ? `<div>Código: ${sale.clientCode}</div>` : ''}
      </div>

      <table style="
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 5mm;
        font-size: ${config.fontSize.body}pt;
      ">
        <thead>
          <tr style="border-bottom: 1px solid #000;">
            <th style="text-align: left;">Producto</th>
            <th style="text-align: right;">Cant.</th>
            <th style="text-align: right;">Precio</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.products.map(product => `
            <tr>
              <td style="padding: 1mm 0;">${product.name}</td>
              <td style="text-align: right;">${product.quantity}</td>
              <td style="text-align: right;">${formatCurrency(product.finalPrice)}</td>
              <td style="text-align: right;">${formatCurrency(product.finalPrice * product.quantity)}</td>
            </tr>
          `).join('')}
          <tr style="border-top: 1px solid #000;">
            <td colspan="3" style="text-align: right; padding-top: 2mm;">Subtotal:</td>
            <td style="text-align: right; padding-top: 2mm;">${formatCurrency(sale.subtotal)}</td>
          </tr>
          ${sale.discount > 0 ? `
            <tr>
              <td colspan="3" style="text-align: right;">Descuento:</td>
              <td style="text-align: right;">-${formatCurrency(sale.discount)}</td>
            </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(sale.total)}</td>
          </tr>
        </tbody>
      </table>

      <div style="
        margin-bottom: 5mm;
        font-size: ${config.fontSize.body}pt;
      ">
        <div>Método de pago: ${paymentMethods[sale.paymentMethod]}</div>
        ${sale.reference ? `<div>Referencia: ${sale.reference}</div>` : ''}
      </div>

      <div style="
        text-align: center;
        margin-top: 10mm;
        font-size: ${config.fontSize.body}pt;
      ">
        ¡Gracias por su preferencia!
      </div>
    </div>
  `;
};