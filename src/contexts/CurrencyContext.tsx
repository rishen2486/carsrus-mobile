import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'MUR' | 'ZAR' | 'GBP' | 'EUR' | 'AUD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: Record<Currency, number>;
  convertPrice: (priceInMUR: number) => number;
  formatPrice: (priceInMUR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MUR: 'Rs',
  ZAR: 'R',
  GBP: '£',
  EUR: '€',
  AUD: 'A$',
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('MUR');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({
    MUR: 1,
    ZAR: 0.35,
    GBP: 0.017,
    EUR: 0.020,
    AUD: 0.032,
  });

  // Detect user location and set currency
  useEffect(() => {
    const detectCurrencyFromIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        
        const currencyMap: Record<string, Currency> = {
          'MU': 'MUR',
          'ZA': 'ZAR',
          'GB': 'GBP',
          'FR': 'EUR',
          'AU': 'AUD',
        };
        
        const detectedCurrency = currencyMap[countryCode] || 'EUR';
        setCurrency(detectedCurrency);
      } catch (error) {
        console.log('Could not detect location, using default currency');
        setCurrency('MUR');
      }
    };

    detectCurrencyFromIP();
  }, []);

  // Fetch live exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/MUR');
        const data = await response.json();
        
        setExchangeRates({
          MUR: 1,
          ZAR: data.rates.ZAR || 0.35,
          GBP: data.rates.GBP || 0.017,
          EUR: data.rates.EUR || 0.020,
          AUD: data.rates.AUD || 0.032,
        });
      } catch (error) {
        console.log('Could not fetch exchange rates, using defaults');
      }
    };

    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  const convertPrice = (priceInMUR: number): number => {
    return priceInMUR * exchangeRates[currency];
  };

  const formatPrice = (priceInMUR: number): string => {
    const converted = convertPrice(priceInMUR);
    const symbol = CURRENCY_SYMBOLS[currency];
    const formattedAmount = converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol} ${formattedAmount}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
