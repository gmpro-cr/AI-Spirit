import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders message text as markdown.
 *
 * Persona replies lean on two things the old `**bold**`-only regex could not do:
 * lists (for anything explanatory) and single-asterisk italics, which is the
 * roleplay convention for actions — *smiles softly*. Those used to render as
 * literal asterisks.
 *
 * react-markdown does not render raw HTML unless rehype-raw is added, so model
 * output cannot inject markup. Keep it that way.
 *
 * `tone` picks the accent treatment: 'light' for the assistant's pale bubble,
 * 'dark' for the user's black one, where a black-tinted code background would
 * disappear.
 */
export default function MessageContent({ content, tone = 'light', className = '' }) {
  const isDark = tone === 'dark'

  const surface = isDark ? 'bg-white/15' : 'bg-black/[0.05]'
  const rule = isDark ? 'border-white/25' : 'border-black/15'

  const components = {
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    // Roleplay actions arrive as italics — render them slightly recessed so they
    // read as stage direction rather than speech.
    em: ({ children }) => <em className="italic opacity-75">{children}</em>,
    ul: ({ children }) => <ul className="mb-3 last:mb-0 list-disc pl-5 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 last:mb-0 list-decimal pl-5 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => <h1 className="mt-4 first:mt-0 mb-2 text-base font-semibold">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-4 first:mt-0 mb-2 text-base font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-3 first:mt-0 mb-1.5 text-sm font-semibold">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className={`my-3 border-l-2 ${rule} pl-3 italic opacity-90`}>{children}</blockquote>
    ),
    code: ({ inline, children }) =>
      inline ? (
        <code className={`rounded ${surface} px-1 py-0.5 font-mono text-[0.9em]`}>{children}</code>
      ) : (
        <code className="font-mono text-[13px]">{children}</code>
      ),
    pre: ({ children }) => (
      <pre className={`my-3 overflow-x-auto rounded-xl ${surface} p-3`}>{children}</pre>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        {children}
      </a>
    ),
    hr: () => <hr className={`my-4 ${rule}`} />,
    // Tables can exceed the bubble — let them scroll inside it rather than
    // stretching the thread.
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className={`border-b ${rule} px-2 py-1.5 font-semibold`}>{children}</th>
    ),
    td: ({ children }) => <td className={`border-b ${rule} px-2 py-1.5 align-top`}>{children}</td>,
  }

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
