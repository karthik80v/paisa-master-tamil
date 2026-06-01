import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { SettingsService, Country } from '../../services/settings.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['../common-styles.css', './profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  // Signal for user data
  user = signal<User | null>(null);

  // Signal for loading state
  isLoading = signal(true);

  // Signal for error state
  error = signal<string | null>(null);

  // Signal for personal details visibility
  showPersonalDetails = signal(false);

  // Settings edit state
  isEditingSettings = signal(false);
  thresholdDraft = signal<number>(0);
  countryDraft = signal<string>('India');
  newStockDaysDraft = signal<number>(7);
  readonly countryOptions: Country[];

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    public settingsService: SettingsService
  ) {
    this.countryOptions = this.settingsService.getCountries();
  }

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  private fetchUserProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileService.getUserProfile().pipe().subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error.set('Failed to load profile data. Please try again later.');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      // Extract date part from ISO string (YYYY-MM-DD) without timezone conversion
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  formatCurrency(value: string | undefined): string {
    if (!value) return 'N/A';
    try {
      const numValue = parseFloat(value);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(numValue);
    } catch {
      return value;
    }
  }

  togglePersonalDetailsVisibility(): void {
    this.showPersonalDetails.set(!this.showPersonalDetails());
  }

  editThreshold(): void {
    this.thresholdDraft.set(this.settingsService.underValueThresholdPercent());
    this.countryDraft.set(this.settingsService.defaultCountry().name);
    this.newStockDaysDraft.set(this.settingsService.newStockDaysThreshold());
    this.isEditingSettings.set(true);
  }

  formatCountryOption(country: Country): string {
    return `${country.name} (${country.currency})`;
  }

  cancelThresholdEdit(): void {
    this.isEditingSettings.set(false);
  }

  saveThreshold(): void {
    const value = Number(this.thresholdDraft());
    if (isNaN(value) || value < 0 || value > 100) {
      return;
    }
    this.settingsService.setUnderValueThresholdPercent(value);
    const selected = this.countryOptions.find(c => c.name === this.countryDraft());
    if (selected) {
      this.settingsService.setDefaultCountry(selected);
    }
    const newStockDays = Number(this.newStockDaysDraft());
    if (!isNaN(newStockDays) && newStockDays > 0) {
      this.settingsService.setNewStockDaysThreshold(newStockDays);
    }
    this.isEditingSettings.set(false);
  }
}
