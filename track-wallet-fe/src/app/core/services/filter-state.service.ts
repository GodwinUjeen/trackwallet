import { Injectable, signal } from '@angular/core';
import { FilterState } from '../models';

const defaultState = (): FilterState => ({
  types: ['income', 'expense', 'transfer'],
  accountIds: [],
  categoryIds: [],
});

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  readonly filters = signal<FilterState>(defaultState());

  set(partial: Partial<FilterState>): void {
    this.filters.update((f) => ({ ...f, ...partial }));
  }

  reset(): void {
    this.filters.set(defaultState());
  }
}
