export function incVerbatim(html, { idom, uniqueKey }) {
  idom.elementOpen('div', uniqueKey);
  idom.text('Hello world!');
  idom.elementClose('div');
}

export function registerVerbatimHelper(env) {
  env.registerHelper('incVerbatim', incVerbatim);
}

export default registerVerbatimHelper;
