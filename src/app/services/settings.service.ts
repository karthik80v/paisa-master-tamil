import { Injectable, signal } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

export interface Country {
  name: string;
  currency: string;
}

const THRESHOLD_KEY = 'app.settings.underValueThresholdPercent';
const COUNTRY_KEY = 'app.settings.defaultCountry';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  // Reactive signal mirroring API_CONFIG.underValueThresholdPercent
  underValueThresholdPercent = signal<number>(API_CONFIG.underValueThresholdPercent);

  // Reactive signal mirroring API_CONFIG.defaultCountry
  defaultCountry = signal<Country>(API_CONFIG.defaultCountry);

  private readonly countries: Country[] = [
    { name: 'India', currency: 'INR' },
    { name: 'United States of America', currency: 'USD' }
  ];

  constructor() {
    // Hydrate threshold from localStorage
    const storedThreshold = localStorage.getItem(THRESHOLD_KEY);
    if (storedThreshold !== null) {
      const parsed = parseFloat(storedThreshold);
      if (!isNaN(parsed)) {
        API_CONFIG.underValueThresholdPercent = parsed;
        this.underValueThresholdPercent.set(parsed);
      }
    }

    // Hydrate country from localStorage (stored by country name)
    const storedCountryName = localStorage.getItem(COUNTRY_KEY);
    if (storedCountryName) {
      const match = this.countries.find(c => c.name === storedCountryName);
      if (match) {
        API_CONFIG.defaultCountry = match;
        this.defaultCountry.set(match);
      }
    }
  }

  getCountries(): Country[] {
    return this.countries;
  }

  setUnderValueThresholdPercent(value: number): void {
    API_CONFIG.underValueThresholdPercent = value;
    this.underValueThresholdPercent.set(value);
    localStorage.setItem(THRESHOLD_KEY, String(value));
  }

  setDefaultCountry(value: Country): void {
    API_CONFIG.defaultCountry = value;
    this.defaultCountry.set(value);
    localStorage.setItem(COUNTRY_KEY, value.name);
  }
}
