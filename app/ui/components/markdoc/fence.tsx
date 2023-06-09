import { Highlight } from "prism-react-renderer";

// import dracula from "prism-react-renderer/themes/dracula";

export function Fence({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  return (
    <Highlight code={children} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className}`} style={style}>
          {tokens.map((line, i) => (
            <div
              key={i}
              {...getLineProps({ line, key: i })}
              className="table-row"
            >
              <span className="table-cell select-none pr-4 text-right opacity-50">
                {i + 1}
              </span>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} key={key} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
