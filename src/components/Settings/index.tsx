// Update the handleSubmit function to also update the admin password
const handleSubmit = (role: 'admin' | 'vendor') => {
  const credentials = role === 'admin' ? adminCredentials : vendorCredentials;
  
  if (credentials.password !== credentials.confirmPassword) {
    setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
    return;
  }

  if (credentials.password.length < 6) {
    setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }

  try {
    updateCredentials(role, {
      username: credentials.username,
      password: credentials.password
    });

    // Update the admin password in the central system if it's an admin update
    if (role === 'admin') {
      setAdminPassword(credentials.password);
    }

    setMessage({ type: 'success', text: 'Credenciales actualizadas correctamente' });
    
    // Reset form
    if (role === 'admin') {
      setAdminCredentials({ username: '', password: '', confirmPassword: '' });
    } else {
      setVendorCredentials({ username: '', password: '', confirmPassword: '' });
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'Error al actualizar las credenciales' });
  }
};