import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | undefined | null, search: string): SafeHtml | string {
    if (!value) {
      return '';
    }
    if (!search || !search.trim()) {
      return value;
    }

    // Escape special regular expression characters in search query
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');

    const highlighted = value.replace(regex, `<mark class="highlight-text">$1</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
