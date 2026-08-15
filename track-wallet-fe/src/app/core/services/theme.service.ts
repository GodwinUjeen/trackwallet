import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'tw_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<ThemeMode>(this.readStored());
  readonly theme = this.themeSignal.asReadonly();

  init(): void {
    this.apply(this.themeSignal());
  }

  setTheme(mode: ThemeMode): void {
    this.themeSignal.set(mode);
    this.apply(mode);
  }

  toggle(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  private apply(mode: ThemeMode): void {
    document.documentElement.dataset['theme'] = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? '#121212' : '#f4f6f8');
    }
  }

  private readStored(): ThemeMode {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === 'light' || raw === 'dark' ? raw : 'dark';
    } catch {
      return 'dark';
    }
  }
}
