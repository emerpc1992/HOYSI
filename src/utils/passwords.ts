// Central password management
let ADMIN_PASSWORD = 'admin';

export const getAdminPassword = () => ADMIN_PASSWORD;

export const setAdminPassword = (newPassword: string) => {
  ADMIN_PASSWORD = newPassword;
};

export const validateAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};