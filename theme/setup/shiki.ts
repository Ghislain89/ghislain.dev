// No @slidev/types import: the theme lives outside the decks' node_modules
export default () => ({
  themes: {
    dark: 'tokyo-night',
    light: 'tokyo-night',
  },
  // Without this list Slidev bundles all ~200 Shiki languages. Add a language here before using it in a code block.
  langs: ['typescript', 'javascript', 'shellscript', 'yaml', 'json', 'java', 'xml', 'properties', 'markdown', 'html', 'css', 'diff'],
})
