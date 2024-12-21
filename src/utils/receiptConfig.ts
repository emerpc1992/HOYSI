export interface ReceiptConfig {
  paperSize: {
    width: number;  // in mm
    height: number; // in mm
  };
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
  };
  businessInfo: {
    name: string;
    subtitle: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

// Default configuration
export const defaultConfig: ReceiptConfig = {
  paperSize: {
    width: 70,  // 70mm standard receipt width
    height: 297 // A4 height, will adjust automatically
  },
  fontSize: {
    title: 12,
    subtitle: 10,
    body: 8
  },
  businessInfo: {
    name: 'Alvaro Rugama',
    subtitle: 'Make Up Studio & Beauty Salon'
  }
};

export const saveReceiptConfig = (config: ReceiptConfig) => {
  localStorage.setItem('receiptConfig', JSON.stringify(config));
};

export const loadReceiptConfig = (): ReceiptConfig => {
  try {
    const saved = localStorage.getItem('receiptConfig');
    if (!saved) return defaultConfig;
    
    const config = JSON.parse(saved);
    return {
      ...defaultConfig,
      ...config,
      paperSize: {
        ...defaultConfig.paperSize,
        ...config.paperSize,
        width: 70 // Always force 70mm width
      }
    };
  } catch (error) {
    console.error('Error loading receipt config:', error);
    return defaultConfig;
  }
};