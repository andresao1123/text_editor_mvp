import { marked } from 'marked';
import mammoth from 'mammoth';

export interface ParsedDocument {
  title: string;
  contentHtml: string;
  plainText: string;
}

export async function parseFileContent(
  filename: string,
  buffer: Buffer
): Promise<ParsedDocument> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const baseTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const capitalizedTitle =
    baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1) || 'Untitled Document';

  let contentHtml = '';
  let plainText = '';

  if (ext === 'docx') {
    const result = await mammoth.convertToHtml({ buffer });
    contentHtml = result.value;
    const textResult = await mammoth.extractRawText({ buffer });
    plainText = textResult.value.trim();
  } else if (ext === 'md' || ext === 'markdown') {
    const markdownString = buffer.toString('utf-8');
    contentHtml = (await marked.parse(markdownString)) as string;
    plainText = markdownString.replace(/[#*`_~\[\]]/g, '').trim();
  } else if (ext === 'html' || ext === 'htm') {
    contentHtml = buffer.toString('utf-8');
    plainText = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  } else {
    // Default to plain text (.txt or other text files)
    const rawText = buffer.toString('utf-8');
    plainText = rawText.trim();
    // Wrap paragraphs
    const paragraphs = rawText
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length > 0) {
      contentHtml = paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br/>')}</p>`).join('');
    } else {
      contentHtml = `<p>${escapeHtml(rawText)}</p>`;
    }
  }

  // Ensure contentHtml is not empty
  if (!contentHtml.trim()) {
    contentHtml = '<p></p>';
  }

  return {
    title: capitalizedTitle,
    contentHtml,
    plainText,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
