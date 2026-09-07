import { describe, it, expect } from 'vitest';
import { parseFileContent } from '@/lib/parser';

describe('File Content Parser & Converter', () => {
  it('converts markdown file into rich HTML and extracts clean title', async () => {
    const mdContent = `
# Project Roadmap

This is **bold** text and *italic* text.

## Action Items
- Item 1
- Item 2
    `.trim();

    const buffer = Buffer.from(mdContent, 'utf-8');
    const parsed = await parseFileContent('q3_product_roadmap.md', buffer);

    expect(parsed.title).toBe('Q3 product roadmap');
    expect(parsed.contentHtml).toContain('<h1');
    expect(parsed.contentHtml).toContain('<strong>bold</strong>');
    expect(parsed.contentHtml).toContain('<em>italic</em>');
    expect(parsed.contentHtml).toContain('<ul>');
    expect(parsed.contentHtml).toContain('<li>');
    expect(parsed.plainText).toContain('Project Roadmap');
  });

  it('converts plain text files into paragraph-wrapped HTML', async () => {
    const txtContent = 'Paragraph 1 line.\n\nParagraph 2 line.';
    const buffer = Buffer.from(txtContent, 'utf-8');
    const parsed = await parseFileContent('meeting_notes.txt', buffer);

    expect(parsed.title).toBe('Meeting notes');
    expect(parsed.contentHtml).toContain('<p>Paragraph 1 line.</p>');
    expect(parsed.contentHtml).toContain('<p>Paragraph 2 line.</p>');
    expect(parsed.plainText).toBe(txtContent);
  });

  it('handles HTML files directly and sanitizes text', async () => {
    const htmlContent = '<h1>Direct HTML</h1><p>Sample paragraph</p>';
    const buffer = Buffer.from(htmlContent, 'utf-8');
    const parsed = await parseFileContent('guide.html', buffer);

    expect(parsed.title).toBe('Guide');
    expect(parsed.contentHtml).toBe(htmlContent);
    expect(parsed.plainText).toBe('Direct HTML Sample paragraph');
  });

  it('provides safe fallback for empty files', async () => {
    const buffer = Buffer.from('', 'utf-8');
    const parsed = await parseFileContent('empty.txt', buffer);

    expect(parsed.title).toBe('Empty');
    expect(parsed.contentHtml).toBe('<p></p>');
    expect(parsed.plainText).toBe('');
  });
});
