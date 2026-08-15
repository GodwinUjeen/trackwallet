import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <button
        type="button"
        class="icon-btn theme-fab"
        (click)="theme.toggle()"
        [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
      >
        <span class="material-symbols-outlined">
          {{ theme.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
      <h1>TrackWallet</h1>
      <p class="sub">Sign in to your wallet</p>
      <form (ngSubmit)="submit()">
        <input class="field" type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
        <input
          class="field"
          type="password"
          placeholder="Password"
          [(ngModel)]="password"
          name="password"
          required
        />
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <button class="btn-primary" type="submit" [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <a routerLink="/register">Create an account</a>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService
  ) {}

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Login failed');
      },
    });
  }
}
