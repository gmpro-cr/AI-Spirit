/**
 * Strip markdown syntax down to speakable / copyable plain text.
 *
 * Used by the copy button and by TTS. Both previously round-tripped through
 * `innerHTML` on a detached div, which only worked because the formatter emitted
 * HTML. Now that messages render as markdown, do it on the string directly —
 * no DOM, so it also works during SSR and in tests.
 */
export function toPlainText(markdown = '') {
  if (markdown === null || markdown === undefined) return ''
  return String(markdown)
    // fenced code blocks — keep the code, drop the fence
    .replace(/```[\w-]*\n?([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // images before links, so alt text survives
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // emphasis
    .replace(/(\*\*\*|___)(.*?)\1/g, '$2')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    // Block syntax at line starts. The indent class is [ \t], not \s: \s
    // matches newlines, so a greedy leading match would swallow the blank line
    // above a list item and glue paragraphs together.
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]{0,3}>[ \t]?/gm, '')
    .replace(/^[ \t]{0,3}([-*+]|\d+\.)[ \t]+/gm, '')
    .replace(/^[ \t]{0,3}([-*_][ \t]*){3,}$/gm, '')
    // table pipes
    .replace(/^\s*\|(.+)\|\s*$/gm, (_, row) => row.split('|').join(' ').trim())
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default toPlainText
