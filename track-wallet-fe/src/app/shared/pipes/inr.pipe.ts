import { Pipe, PipeTransform } from '@angular/core';

/** Formats amounts like 1 234.56₹ (screenshot style). */
@Pipe({ name: 'inr', standalone: true })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined, opts?: { signed?: boolean; abs?: boolean }): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '0₹';
    let n = Number(value);
    if (opts?.abs) n = Math.abs(n);
    const sign = opts?.signed ? (n > 0 ? '+' : n < 0 ? '−' : '') : n < 0 ? '−' : '';
    const abs = Math.abs(n);
    const fixed = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2);
    const [intPart, dec] = fixed.split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${sign}${grouped}${dec ? '.' + dec : ''}₹`;
  }
}
