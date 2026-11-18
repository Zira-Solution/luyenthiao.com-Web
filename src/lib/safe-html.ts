import sanitize from 'sanitize-html'

// Exam HTML (prompts, word boxes, tables) is authored by admins and rendered with innerHTML. It is sanitised at
// render time with the same pure-JS code on the server and in the browser, so SSR and hydration agree
// (spec 2026-11-18-web-security-foundation §6). Allow-list adapted from Zoney.vn-Web src/lib/sanitize-html.ts.
// No `class` (author classes could restyle the app, e.g. a full-screen overlay) and no `id` (DOM clobbering).

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i, /^[a-z]+$/i]
const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]*$/i
const LENGTH = [/^-?\d+(\.\d+)?(px|em|rem|%)$/]

const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p',
    'br',
    'hr',
    'div',
    'span',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'sub',
    'sup',
    'small',
    'mark',
    'ul',
    'ol',
    'li',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'a',
    'audio',
    'source',
  ],
  allowedAttributes: {
    img: ['src', 'alt', 'width', 'height'],
    a: ['href', 'target', 'rel'],
    audio: ['src', 'controls'],
    source: ['src', 'type'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    '*': ['style'],
  },
  allowedStyles: {
    '*': {
      color: COLOR,
      'background-color': COLOR,
      'text-align': [/^(left|right|center|justify)$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'font-style': [/^(normal|italic)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
      'font-size': LENGTH,
      width: LENGTH,
      height: LENGTH,
      'margin-left': LENGTH,
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  transformTags: {
    img: (tagName, attribs) => {
      const src = attribs.src?.trim()
      if (src && /^data:/i.test(src) && !SAFE_DATA_IMAGE.test(src)) {
        const { src: _dropped, ...rest } = attribs
        return { tagName, attribs: rest }
      }
      return { tagName, attribs }
    },
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
    }),
  },
}

export function sanitizeHtml(html: string): string {
  return sanitize(html, OPTIONS)
}
