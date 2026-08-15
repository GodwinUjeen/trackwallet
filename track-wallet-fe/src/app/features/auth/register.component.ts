import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-register',
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
      <h1>Create account</h1>
      <p class="sub">Start tracking income and expenses</p>
      <form (ngSubmit)="submit()">
        <input class="field" type="text" placeholder="Name" [(ngModel)]="name" name="name" required />
        <input class="field" type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
        <input
          class="field"
          type="password"
          placeholder="Password (min 6)"
          [(ngModel)]="password"
          name="password"
          required
        />
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <button class="btn-primary" type="submit" [disabled]="loading()">
          {{ loading() ? 'Creating…' : 'Register' }}
        </button>
      </form>
      <a routerLink="/login">Already have an account?</a>
    </div>
  `,
})
export class RegisterComponent {
  name = '';
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
    this.auth.register(this.email, this.password, this.name).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Registration failed');
      },
    });
  }
}
