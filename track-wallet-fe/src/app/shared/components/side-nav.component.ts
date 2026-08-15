import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="side-nav">
      <div class="brand">
        <span class="material-symbols-outlined logo">account_balance_wallet</span>
        <div>
          <div class="brand-name">TrackWallet</div>
          <div class="brand-sub muted">{{ auth.user()?.name || 'Wallet' }}</div>
        </div>
      </div>

      <nav>
        <a routerLink="/home" routerLinkActive="active">
          <span class="material-symbols-outlined">home</span>
          <span class="label">Home</span>
        </a>
        <a routerLink="/accounts" routerLinkActive="active">
          <span class="material-symbols-outlined">account_balance</span>
          <span class="label">Accounts</span>
        </a>
        <a routerLink="/categories" routerLinkActive="active">
          <span class="material-symbols-outlined">donut_large</span>
          <span class="label">Categories</span>
        </a>
        <a routerLink="/analytics" routerLinkActive="active">
          <span class="material-symbols-outlined">analytics</span>
          <span class="label">Analytics</span>
        </a>
        <a routerLink="/transactions" routerLinkActive="active">
          <span class="material-symbols-outlined">receipt_long</span>
          <span class="label">Transactions</span>
        </a>
      </nav>

      <div class="footer">
        <button type="button" class="theme-btn" (click)="theme.toggle()">
          <span class="material-symbols-outlined">
            {{ theme.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}
          </span>
          <span class="label">{{ theme.theme() === 'dark' ? 'Light' : 'Dark' }}</span>
        </button>
        <button type="button" class="logout" (click)="auth.logout()">
          <span class="material-symbols-outlined">logout</span>
          <span class="label">Sign out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .side-nav {
        position: fixed;
        inset: 0 auto 0 0;
        width: var(--sidebar-width, 240px);
        background: var(--sidebar-bg);
        border-right: 1px solid var(--sidebar-border);
        display: flex;
        flex-direction: column;
        padding: 1.25rem 0.85rem;
        z-index: 100;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.65rem 1.25rem;
      }
      .logo {
        font-size: 1.75rem;
        color: var(--accent);
      }
      .brand-name {
        font-weight: 700;
        font-size: 1.05rem;
      }
      .brand-sub {
        font-size: 0.75rem;
      }
      .muted {
        color: var(--muted);
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }
      a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--muted);
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
      }
      a:hover {
        background: var(--hover);
        color: var(--text);
      }
      a.active {
        background: var(--accent);
        color: #fff;
      }
      .material-symbols-outlined {
        font-size: 1.35rem;
      }
      .footer {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--sidebar-border);
      }
      .theme-btn,
      .logout {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: transparent;
        border: none;
        color: var(--muted);
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
        cursor: pointer;
        font: inherit;
      }
      .theme-btn:hover,
      .logout:hover {
        background: var(--hover);
        color: var(--text);
      }
      @media (max-width: 900px) {
        .brand-name,
        .brand-sub,
        .label {
          display: none;
        }
        nav a,
        .theme-btn,
        .logout {
          justify-content: center;
          padding: 0.75rem;
        }
        .brand {
          justify-content: center;
          padding-left: 0;
          padding-right: 0;
        }
      }
    `,
  ],
})
export class SideNavComponent {
  constructor(
    public auth: AuthService,
    public theme: ThemeService
  ) {}
}
