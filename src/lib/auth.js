import { supabase } from './supabase';

export async function login(cedula, password) {
  
  const cleanCedula = cedula.replace(/[^0-9]/g, '');

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .ilike('cedula', `%${cleanCedula}`)
    .eq('password', password);

  if (error) throw error;
  
  const matchedUser = data.find(user => {
    const userNum = user.cedula.replace(/[^0-9]/g, '');
    return userNum === cleanCedula;
  });

  if (!matchedUser) throw new Error('Credenciales inválidas');

  return matchedUser;
}

export async function register(userData) {
  
  const cleanCedula = userData.cedula.replace(/[^0-9]/g, '');

  // Check if user already exists
  const { data: potentialUsers, error: checkError } = await supabase
    .from('clientes')
    .select('*')
    .ilike('cedula', `%${cleanCedula}`);

  if (checkError) throw checkError;

  const existingUser = potentialUsers?.find(user => {
    const userNum = user.cedula.replace(/[^0-9]/g, '');
    return userNum === cleanCedula;
  });

  if (checkError) throw checkError;

  if (existingUser) {
    // If user exists and has a password, they are already registered (perfil definitivo)
    if (existingUser.password && existingUser.password.trim() !== '') {
      throw new Error('Esta cédula ya posee un perfil definitivo. Por favor, inicia sesión.');
    }

    // If user exists but has no password (e.g. from desktop app), update their record
    const { data, error } = await supabase
      .from('clientes')
      .update({
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        direccion: userData.direccion,
        password: userData.password
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // If user does not exist, create new record
  // Always prefix with V- by default for web registrations if no prefix was provided
  const finalCedula = `V-${cleanCedula}`;

  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      cedula: finalCedula,
      nombre: userData.nombre,
      apellido: userData.apellido,
      telefono: userData.telefono,
      direccion: userData.direccion,
      password: userData.password
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
