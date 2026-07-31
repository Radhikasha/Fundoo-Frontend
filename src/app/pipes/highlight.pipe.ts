import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(value: string | undefined | null, search: string): string {
    if (!value) {
      return '';
    }
    if (!search || !search.trim()) {
      return value;
    }

    // Escape special regular expression characters in search query
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');

    return value.replace(regex, `<mark class="highlight-text">$1</mark>`);
  }
}
