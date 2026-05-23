import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SettingsService, Country } from '../../services/settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  readonly settingsService = inject(SettingsService);
  readonly countries: Country[] = this.settingsService.getCountries();

  isCountryMenuOpen = signal(false);

  private elementRef = inject(ElementRef<HTMLElement>);

  toggleCountryMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isCountryMenuOpen.update(open => !open);
  }

  selectCountry(country: Country): void {
    this.settingsService.setDefaultCountry(country);
    this.isCountryMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isCountryMenuOpen()) {
      return;
    }
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isCountryMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isCountryMenuOpen()) {
      this.isCountryMenuOpen.set(false);
    }
  }
}
