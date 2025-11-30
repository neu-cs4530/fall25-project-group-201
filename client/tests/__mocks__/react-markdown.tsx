const Markdown = ({ children }: { children: string }) => {
  return <div data-testid='markdown-content'>{children}</div>;
};

export default Markdown;
