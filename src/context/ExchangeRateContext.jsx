import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ExchangeRateContext = createContext({ exchangeRate: 0 });

export function ExchangeRateProvider({ children }) {
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    async function fetchRate() {
      const { data } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'tasa_bcv')
        .single();
      if (data) {
        setExchangeRate(parseFloat(data.valor) || 0);
      }
    }
    fetchRate();
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  return useContext(ExchangeRateContext);
}
