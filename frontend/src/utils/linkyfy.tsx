const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

export const linkifyText = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  if (!text) return parts;

  text.replace(URL_REGEX, (match, p1, p2, offset) => {
    // Add the text before the URL
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset));
    }

    const url = p1 || (p2.startsWith('www.') ? `https://${p2}` : p2);

    parts.push(
      <a
        className="linkify"
        key={offset}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {match}
      </a>,
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};
