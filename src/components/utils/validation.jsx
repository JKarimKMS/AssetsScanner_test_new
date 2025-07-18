// Validation patterns
export const VALIDATION_PATTERNS = {
  MODEL_ID: /^\d{2}[A-Z]{3}\d{4}[A-Z](\/\d{2})?$/,
  SERIAL_NUMBER: /^[A-Z0-9]{4}\d{10}$/,
  ASSET_TAG: /^\d{6}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SITE_CODE: /^[A-Z]\d{4}$/
};

// Format input values
export const formatModelId = (value) => {
  return value.replace(/\s/g, '').toUpperCase();
};

export const formatSerialNumber = (value) => {
  return value.replace(/\s/g, '').toUpperCase();
};

export const formatAssetTag = (value) => {
  return value.replace(/\D/g, '');
};

export const formatSiteCode = (value) => {
  return value.replace(/\s/g, '').toUpperCase();
};

// Validation functions
export const validateModelId = (value) => {
  if (!value?.trim()) {
    return "Model ID is required";
  }
  const formatted = formatModelId(value);
  if (!VALIDATION_PATTERNS.MODEL_ID.test(formatted)) {
    return "Invalid format (e.g., 43BDL3650Q/00)";
  }
  return null;
};

export const validateSerialNumber = (value) => {
  if (!value?.trim()) {
    return "Serial Number is required";
  }
  const formatted = formatSerialNumber(value);
  if (!VALIDATION_PATTERNS.SERIAL_NUMBER.test(formatted)) {
    return "Invalid format (e.g., FZ4A2434035142)";
  }
  return null;
};

export const validateAssetTag = (value) => {
  if (!value?.trim()) {
    return "Asset Tag is required";
  }
  const formatted = formatAssetTag(value);
  if (!VALIDATION_PATTERNS.ASSET_TAG.test(formatted)) {
    return "Must be 6 digits";
  }
  return null;
};

export const validateEmail = (value) => {
  if (!value?.trim()) {
    return "Email is required";
  }
  if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
    return "Invalid email format";
  }
  return null;
};

export const validateSiteCode = (value) => {
  if (!value?.trim()) {
    return "Site code is required";
  }
  const formatted = formatSiteCode(value);
  if (!VALIDATION_PATTERNS.SITE_CODE.test(formatted)) {
    return "Invalid format (e.g., L1234)";
  }
  return null;
};

// Validate multiple fields at once
export const validateAllFields = (data, validators) => {
  const errors = {};
  
  Object.entries(validators).forEach(([field, validator]) => {
    const value = data[field];
    const error = validator(value);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Common validation sets
export const EQUIPMENT_VALIDATORS = {
  modelId: validateModelId,
  serialNumber: validateSerialNumber,
  assetTag: validateAssetTag
};

export const SITE_VALIDATORS = {
  name: (value) => !value?.trim() ? "Site name is required" : null,
  code: validateSiteCode,
  brand: (value) => !value?.trim() ? "Brand is required" : null,
  address: (value) => !value?.trim() ? "Address is required" : null
};