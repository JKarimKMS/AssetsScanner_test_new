export const BRAND_COLORS = {
  Coral: {
    primary: '#0099cc',
    background: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  Ladbrokes: {
    primary: '#d70f37',
    background: 'bg-red-50',
    badge: 'bg-red-100 text-red-800',
    border: 'border-red-500',
    button: 'bg-red-600 hover:bg-red-700'
  }
};

export const getBrandBackground = (brand) => {
  return BRAND_COLORS[brand]?.background || 'bg-gray-50';
};

export const getBrandBadgeColor = (brand) => {
  return BRAND_COLORS[brand]?.badge || 'bg-gray-100 text-gray-800';
};

export const getBrandBorderColor = (brand) => {
  return BRAND_COLORS[brand]?.border || 'border-gray-200';
};

export const getBrandButtonColor = (brand) => {
  return BRAND_COLORS[brand]?.button || 'bg-gray-600 hover:bg-gray-700';
};

export const getBrandPrimaryColor = (brand) => {
  return BRAND_COLORS[brand]?.primary || '#6b7280';
};

export const getAllBrands = () => {
  return Object.keys(BRAND_COLORS);
};

export const isSupportedBrand = (brand) => {
  return brand && BRAND_COLORS.hasOwnProperty(brand);
};