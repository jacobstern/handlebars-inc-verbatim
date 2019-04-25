import handlebarsInc from 'handlebars-inc';
import registerVerbatimHelper from '../lib';

const basicTemplate = `<div class="content">
    {{ incVerbatim html }}
  </div>`;

function initHandlebarsInc() {
  const instance = handlebarsInc.create();
  registerVerbatimHelper(instance);
  return instance;
}

test('can register the helper on an instance of handlebars-inc', () => {
  const instance = handlebarsInc.create();
  registerVerbatimHelper(instance);
});

test('can render the verbatim HTML to text', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(basicTemplate);
  const html = '<h1>Hello world!</h1>';
  expect(template({ html })).toBe(`<div class="content">
    <h1>Hello world!</h1>
  </div>`);
});
