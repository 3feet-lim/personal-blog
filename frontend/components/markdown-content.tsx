type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string };

function renderInline(text: string, keyPrefix: string) {
  const parts: React.ReactNode[] = [];
  const tokens = text.split(/(`[^`]+`)/g).filter(Boolean);

  tokens.forEach((token, index) => {
    if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
      parts.push(<code key={`${keyPrefix}-code-${index}`}>{token.slice(1, -1)}</code>);
      return;
    }

    parts.push(token);
  });

  return parts;
}

function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push({ type: "code", code: codeLines.join("\n") });
      continue;
    }

    const headingMatch = raw.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
      index += 1;
      continue;
    }

    if (raw.match(/^\s*-\s+/)) {
      const items: string[] = [];
      while (index < lines.length && lines[index].match(/^\s*-\s+/)) {
        items.push(lines[index].replace(/^\s*-\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index];
      const nextTrimmed = next.trim();
      if (!nextTrimmed || nextTrimmed.startsWith("```") || next.match(/^(#{1,6})\s+/) || next.match(/^\s*-\s+/)) {
        break;
      }
      paragraphLines.push(nextTrimmed);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export function MarkdownContent({ source }: { source: string }) {
  const blocks = parseMarkdown(source);

  return (
    <div className="stack">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return <h1 key={`heading-${index}`}>{block.text}</h1>;
          }
          if (block.level === 2) {
            return <h2 key={`heading-${index}`}>{block.text}</h2>;
          }
          if (block.level === 3) {
            return <h3 key={`heading-${index}`}>{block.text}</h3>;
          }
          if (block.level === 4) {
            return <h4 key={`heading-${index}`}>{block.text}</h4>;
          }
          if (block.level === 5) {
            return <h5 key={`heading-${index}`}>{block.text}</h5>;
          }
          return <h6 key={`heading-${index}`}>{block.text}</h6>;
        }

        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="stack">
              {block.items.map((item, itemIndex) => (
                <li key={`list-item-${index}-${itemIndex}`}>{renderInline(item, `list-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={`code-${index}`}>
              <code>{block.code}</code>
            </pre>
          );
        }

        return <p key={`paragraph-${index}`}>{renderInline(block.text, `paragraph-${index}`)}</p>;
      })}
    </div>
  );
}
