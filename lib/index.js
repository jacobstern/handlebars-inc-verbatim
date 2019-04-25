import createDOMPurify from 'dompurify';

const METADATA_KEY = '__idomVerbatimData';

let DOMPurify;
if (typeof window !== 'undefined') {
  DOMPurify = createDOMPurify(window);
}

function setPrivateMetadata(node, key, value) {
  if (typeof node[METADATA_KEY] !== 'object') {
    node[METADATA_KEY] = {};
  }
  node[METADATA_KEY][key] = value;
}

function getPrivateMetadata(node, key) {
  if (node != null && typeof node[METADATA_KEY] === 'object') {
    return node[METADATA_KEY][key];
  }
  return undefined;
}

export function idomVerbatim(html, { idom, uniqueKey }) {
  const currentElement = idom.currentElement();
  if (currentElement === null) {
    // Non-browser backend, just emit content as text
    idom.text(html);
  } else {
    if (DOMPurify == null) {
      throw new Error(
        'The handlebars-inc-verbatim library failed to load DOMPurify. \
Are you running in a browser environment?'
      );
    }

    let pointer = idom.currentPointer();
    const source = getPrivateMetadata(pointer, 'source');
    if (source === html && getPrivateMetadata(pointer, 'key') === uniqueKey) {
      while (getPrivateMetadata(pointer, 'key') === uniqueKey) {
        // Avoid unnecessary update
        idom.skipNode();
        pointer = idom.currentPointer();
      }
    } else {
      while (getPrivateMetadata(pointer, 'key') === uniqueKey) {
        currentElement.removeChild(pointer);
        pointer = idom.currentPointer();
      }

      if (typeof html === 'string') {
        const sanitized = DOMPurify.sanitize(html);
        const container = document.createElement('div');
        container.innerHTML = sanitized;
        const childNodesCopy = [];
        for (let i = 0; i < container.childNodes.length; i++) {
          const child = container.childNodes[i];
          childNodesCopy.push(child);
        }
        childNodesCopy.forEach(child => {
          setPrivateMetadata(child, 'key', uniqueKey);
          setPrivateMetadata(child, 'source', html);
          currentElement.insertBefore(child, pointer);
          idom.skipNode();
          pointer = idom.currentPointer();
        });
      }
    }
  }
}

export function registerVerbatimHelper(handlebars) {
  handlebars.registerHelper('idomVerbatim', idomVerbatim);
}

export default registerVerbatimHelper;
