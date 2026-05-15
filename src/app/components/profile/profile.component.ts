import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private profileService: ProfileService, private cdr: ChangeDetectorRef) {}

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
}
