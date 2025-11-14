import { Component, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@/types/interfaces/dashboard/location.interface';
import { Button } from '@/app/shared/components/button/button';

@Component({
  selector: 'app-mapcard',
  imports: [GoogleMapsModule, TranslateModule, Button],
  templateUrl: './mapcard.html',
  styleUrl: './mapcard.scss',
})
export class Mapcard implements OnInit {
  // Center map on Spain
  mapCenter: google.maps.LatLngLiteral = { lat: 40.4168, lng: -3.7038 };
  mapZoom = 6;
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: []
  };

  ngOnInit() {
    this.updateMapStyles();
  }

  /**
   * Get CSS variable value with fallback
   */
  private getCssVariable(variable: string, fallback: string = ''): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }

  private updateMapStyles() {
    const geometryColor = this.getCssVariable('--gray-150', '#f5f5f5');
    const waterColor = this.getCssVariable('--gray-200', '#e9ecef');
    const roadColor = this.getCssVariable('--white', '#ffffff');
    const labelColor = this.getCssVariable('--text-color-medium-alt', '#9ca3af');

    this.mapOptions = {
      ...this.mapOptions,
    styles: [
      {
        featureType: 'all',
        elementType: 'geometry',
          stylers: [{ color: geometryColor }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
          stylers: [{ color: waterColor }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
          stylers: [{ color: roadColor }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
          stylers: [{ color: labelColor }]
      }
    ]
  };
  }

  locations: Location[] = [
    {
      id: 1,
      address: 'Carrer de Villarroel, 163, 08036 Barcelona',
      customerCount: 53,
      pinColor: '#4f7cff',
      lat: 41.3888,
      lng: 2.1590
    },
    {
      id: 2,
      address: 'Calle Gran Vía, 45, 28013 Madrid',
      customerCount: 42,
      pinColor: '#667085',
      lat: 40.4168,
      lng: -3.7038
    },
    {
      id: 3,
      address: 'Avenida de la Constitución, 12, 41004 Sevilla',
      customerCount: 38,
      pinColor: '#f97316',
      lat: 37.3891,
      lng: -5.9845
    },
    {
      id: 4,
      address: 'Calle de Colón, 8, 46004 Valencia',
      customerCount: 31,
      pinColor: '#22c55e',
      lat: 39.4699,
      lng: -0.3763
    },
    {
      id: 5,
      address: 'Calle de San Sebastián, 5, 20001 San Sebastián',
      customerCount: 28,
      pinColor: '#ef4444',
      lat: 43.3183,
      lng: -1.9812
    },
    {
      id: 6,
      address: 'Calle de la Alameda, 22, 41001 Sevilla',
      customerCount: 25,
      pinColor: '#8b5cf6',
      lat: 37.3828,
      lng: -5.9732
    },
    {
      id: 7,
      address: 'Passeig de Gràcia, 92, 08008 Barcelona',
      customerCount: 47,
      pinColor: '#06b6d4',
      lat: 41.3947,
      lng: 2.1644
    },
    {
      id: 8,
      address: 'Calle de Serrano, 47, 28001 Madrid',
      customerCount: 35,
      pinColor: '#f59e0b',
      lat: 40.4268,
      lng: -3.6838
    }
  ];

  getMarkerOptions(location: Location): google.maps.MarkerOptions {
    // Create custom circular marker with colored pin
    const white = this.getCssVariable('--white', '#ffffff');
    return {
      position: { lat: location.lat, lng: location.lng },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 20,
        fillColor: location.pinColor,
        fillOpacity: 1,
        strokeColor: white,
        strokeWeight: 3
      },
      title: location.address,
      animation: google.maps.Animation.DROP
    };
  }

  onDischarge(): void {
    // Handle discharge button click
    console.log('Discharge clicked');
  }
}
