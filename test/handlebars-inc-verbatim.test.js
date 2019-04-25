import handlebarsInc from 'handlebars-inc';
import registerVerbatimHelper from '../lib';

const basicTemplate = `<div class="content">
  {{ idomVerbatim html }}
</div>`;

const moreComplexTemplate = `<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    {{ idomVerbatim html}}
    <h2>Some other content</h2>
  </div>
</section>`;

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

test('can render to the DOM', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(basicTemplate);
  const html = '<h1>Hello world!</h1>';
  const div = document.createElement('div');
  instance.patch(div, template({ html }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<div class="content">
  <h1>Hello world!</h1>
</div>`);
});

test('can handle a slightly more complex template', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(moreComplexTemplate);
  const html = '<h1>Hello world!</h1>';
  const div = document.createElement('div');
  instance.patch(div, template({ html }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    <h1>Hello world!</h1>
    <h2>Some other content</h2>
  </div>
</section>`);
});

test('can render verbatim HTML that is just a text node', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(basicTemplate);
  const html = 'Hello world!';
  const div = document.createElement('div');
  instance.patch(div, template({ html }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<div class="content">
  Hello world!
</div>`);
});

test('can render multiple elements in the HTML', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(moreComplexTemplate);
  // prettier-ignore
  const html = '<h1>Hello world!</h1>Here is some text.<h2>And a subheading!</h2>';
  const div = document.createElement('div');
  instance.patch(div, template({ html }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    <h1>Hello world!</h1>Here is some text.<h2>And a subheading!</h2>
    <h2>Some other content</h2>
  </div>
</section>`);
});

test('can render the same HTML multiple times', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(moreComplexTemplate);
  const html = '<h1>Hello world!</h1>';
  const div = document.createElement('div');
  instance.patch(div, template({ html }, { backend: 'idom' }));
  const expected = `<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    <h1>Hello world!</h1>
    <h2>Some other content</h2>
  </div>
</section>`;
  expect(div.innerHTML).toBe(expected);
  instance.patch(div, template({ html }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(expected);
});

test('accepts a falsy argument', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(basicTemplate);
  const div = document.createElement('div');
  instance.patch(div, template({}, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<div class="content">
  
</div>`);
});

test('can render different HTML', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(moreComplexTemplate);
  const initialHTML = '<h1>Hello world!</h1>';
  const div = document.createElement('div');
  const expectedInitialHTML = `<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    <h1>Hello world!</h1>
    <h2>Some other content</h2>
  </div>
</section>`;
  instance.patch(div, template({ html: initialHTML }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(expectedInitialHTML);
  // prettier-ignore
  const otherHTML = '<h1>Hello world!</h1>Here is some text.<h2>And a subheading!</h2>';
  instance.patch(div, template({ html: otherHTML }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    <h1>Hello world!</h1>Here is some text.<h2>And a subheading!</h2>
    <h2>Some other content</h2>
  </div>
</section>`);
  instance.patch(div, template({ html: initialHTML }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(expectedInitialHTML);
  instance.patch(div, template({ html: null }, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<section class="section">
  <div class="content">
    <span>Some content</span>
    Text
    
    <h2>Some other content</h2>
  </div>
</section>`);
});

test('can render two adjacent verbatim fragments', () => {
  const instance = initHandlebarsInc();
  const template = instance.compile(`<div class="content">
{{ idomVerbatim content1 }}{{ idomVerbatim content2 }}
</div>`);
  const div = document.createElement('div');
  const data = {
    content1: '<h1>Hello world!</h1>\nHere is an introductory paragraph.\n',
    content2: '<h2>About Handlebars Inc</h2>',
  };
  instance.patch(div, template(data, { backend: 'idom' }));
  expect(div.innerHTML).toBe(`<div class="content">
<h1>Hello world!</h1>
Here is an introductory paragraph.
<h2>About Handlebars Inc</h2>
</div>`);
  instance.patch(
    div,
    template({ ...data, content1: null }, { backend: 'idom' })
  );
  expect(div.innerHTML).toBe(`<div class="content">
<h2>About Handlebars Inc</h2>
</div>`);
});
