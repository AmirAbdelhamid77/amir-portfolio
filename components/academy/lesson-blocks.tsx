import type { LessonBlock } from "@/lib/academy/corpus";

// Conservative inline markdown rendering for courseware text: escape first,
// then apply the small inline vocabulary the labs actually use (bold, italic,
// code, links). Everything else stays literal text.
function inline(text: string): string {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return escaped
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-foreground">$1</strong>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="underline underline-offset-4" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-4 text-sm leading-7 text-muted-foreground [&_strong]:text-foreground">
      {blocks.map((block, index) => {
        const key = `${index}-${block.type}`;
        switch (block.type) {
          case "h2":
            return (
              <h2 key={key} className="pt-4 text-xl font-medium tracking-tight text-foreground">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={key} className="pt-3 text-lg font-medium tracking-tight text-foreground">
                {block.text}
              </h3>
            );
          case "h4":
            return (
              <h4 key={key} className="pt-2 font-medium text-foreground">
                {block.text}
              </h4>
            );
          case "p":
            return <p key={key} dangerouslySetInnerHTML={{ __html: inline(block.text) }} />;
          case "note":
            return (
              <blockquote
                key={key}
                className="border-s-2 border-primary/60 bg-card/40 p-3 text-sm leading-7"
                dangerouslySetInnerHTML={{ __html: inline(block.text) }}
              />
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal space-y-2 ps-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} dangerouslySetInnerHTML={{ __html: inline(item) }} />
                ))}
              </ol>
            );
          case "ul":
            return (
              <ul key={key} className="list-disc space-y-2 ps-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} dangerouslySetInnerHTML={{ __html: inline(item) }} />
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-2xl border border-border bg-card/60 p-4 font-mono text-xs leading-6 text-foreground"
              >
                <code>{block.text}</code>
              </pre>
            );
          case "table":
            return (
              <div key={key} className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border-border px-3 py-2 align-top" dangerouslySetInnerHTML={{ __html: inline(cell) }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "image":
            return (
              <p key={key} className="text-xs">
                <a className="underline underline-offset-4" href={block.href} target="_blank" rel="noopener noreferrer">
                  Figure {index + 1}: {block.alt || "see the source"} ↗
                </a>
                <span className="block text-muted-foreground">Images stay at the source repository (MIT); this page links rather than rehosts them.</span>
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
