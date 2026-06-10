/**
 * VUDO Monaco Editor Theme
 *
 * A dark theme optimized for DOL (Domain-Oriented Language) editing
 * with the VUDO brand color palette.
 *
 * Color Palette:
 * - Background: #0c0c0a (dark void)
 * - Keywords: #e8c25a (VUDO glow green)
 * - Types: #b9a06c (Mycelium purple)
 * - Strings: #f4d77c (Veve gold/amber)
 * - Numbers: #ec4899 (pink)
 * - Comments: #6b7280 (muted gray)
 * - Operators: #06b6d4 (cyan)
 * - Functions: #f472b6 (light pink)
 * - Variables: #f3ecd8 (light gray)
 * - Punctuation: #9ca3af (medium gray)
 */

import type { editor } from 'monaco-editor';

export const vudoTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Keywords (VUDO glow green)
    { token: 'keyword', foreground: '00ff88', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: '00ff88', fontStyle: 'bold' },
    { token: 'keyword.operator', foreground: '06b6d4' },
    { token: 'keyword.other', foreground: '00ff88' },

    // Types (Mycelium purple)
    { token: 'type', foreground: '8b5cf6' },
    { token: 'type.identifier', foreground: '8b5cf6' },
    { token: 'support.type', foreground: '8b5cf6' },
    { token: 'entity.name.type', foreground: '8b5cf6' },
    { token: 'entity.name.class', foreground: '8b5cf6', fontStyle: 'bold' },
    { token: 'entity.name.interface', foreground: '8b5cf6' },
    { token: 'storage.type', foreground: '8b5cf6' },

    // Strings (Veve gold/amber)
    { token: 'string', foreground: 'fbbf24' },
    { token: 'string.quoted', foreground: 'fbbf24' },
    { token: 'string.template', foreground: 'fbbf24' },
    { token: 'string.escape', foreground: 'f59e0b' },
    { token: 'string.regex', foreground: 'f97316' },

    // Numbers (pink)
    { token: 'number', foreground: 'ec4899' },
    { token: 'number.hex', foreground: 'ec4899' },
    { token: 'number.float', foreground: 'ec4899' },
    { token: 'constant.numeric', foreground: 'ec4899' },

    // Comments (muted gray)
    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '6b7280', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '6b7280', fontStyle: 'italic' },
    { token: 'comment.documentation', foreground: '9ca3af', fontStyle: 'italic' },

    // Operators (cyan)
    { token: 'operator', foreground: '06b6d4' },
    { token: 'delimiter', foreground: '9ca3af' },
    { token: 'delimiter.bracket', foreground: '9ca3af' },
    { token: 'delimiter.parenthesis', foreground: '9ca3af' },
    { token: 'delimiter.square', foreground: '9ca3af' },
    { token: 'delimiter.curly', foreground: '9ca3af' },

    // Functions (light pink)
    { token: 'function', foreground: 'f472b6' },
    { token: 'entity.name.function', foreground: 'f472b6' },
    { token: 'support.function', foreground: 'f472b6' },
    { token: 'meta.function-call', foreground: 'f472b6' },

    // Variables (light gray)
    { token: 'variable', foreground: 'e5e7eb' },
    { token: 'variable.parameter', foreground: 'e5e7eb' },
    { token: 'variable.other', foreground: 'e5e7eb' },
    { token: 'identifier', foreground: 'e5e7eb' },

    // Constants
    { token: 'constant', foreground: 'ec4899' },
    { token: 'constant.language', foreground: '00ff88' },
    { token: 'constant.character', foreground: 'fbbf24' },

    // Punctuation (medium gray)
    { token: 'punctuation', foreground: '9ca3af' },
    { token: 'meta.brace', foreground: '9ca3af' },

    // Tags (for markup languages)
    { token: 'tag', foreground: '00ff88' },
    { token: 'tag.attribute.name', foreground: '8b5cf6' },
    { token: 'tag.attribute.value', foreground: 'fbbf24' },

    // Annotations/Decorators
    { token: 'annotation', foreground: '8b5cf6' },
    { token: 'meta.decorator', foreground: '8b5cf6' },

    // Invalid/Error
    { token: 'invalid', foreground: 'ef4444', fontStyle: 'underline' },
    { token: 'invalid.illegal', foreground: 'ef4444', fontStyle: 'underline' },

    // DOL-specific tokens
    { token: 'dol.domain', foreground: '00ff88', fontStyle: 'bold' },
    { token: 'dol.entity', foreground: '8b5cf6' },
    { token: 'dol.property', foreground: 'e5e7eb' },
    { token: 'dol.relationship', foreground: '06b6d4' },
    { token: 'dol.constraint', foreground: 'f472b6' },
    { token: 'dol.annotation', foreground: '6b7280', fontStyle: 'italic' },
  ],

  colors: {
    // Editor background and foreground
    'editor.background': '#0c0c0a',
    'editor.foreground': '#f3ecd8',

    // Cursor and line highlight
    'editorCursor.foreground': '#e8c25a',
    'editorCursor.background': '#0c0c0a',
    'editor.lineHighlightBackground': '#1a1a12',
    'editor.lineHighlightBorder': '#2a2a4e00',

    // Selection colors
    'editor.selectionBackground': '#e8c25a33',
    'editor.selectionHighlightBackground': '#e8c25a22',
    'editor.inactiveSelectionBackground': '#e8c25a20',

    // Find/search highlight
    'editor.findMatchBackground': '#f4d77c40',
    'editor.findMatchHighlightBackground': '#f4d77c20',
    'editor.findMatchBorder': '#f4d77c',

    // Word highlight
    'editor.wordHighlightBackground': '#b9a06c22',
    'editor.wordHighlightStrongBackground': '#b9a06c33',

    // Bracket matching
    'editorBracketMatch.background': '#e8c25a30',
    'editorBracketMatch.border': '#e8c25a',

    // Line numbers
    'editorLineNumber.foreground': '#4b5563',
    'editorLineNumber.activeForeground': '#e8c25a',

    // Indentation guides
    'editorIndentGuide.background': '#374151',
    'editorIndentGuide.activeBackground': '#6b7280',

    // Whitespace
    'editorWhitespace.foreground': '#374151',

    // Rulers
    'editorRuler.foreground': '#374151',

    // Scrollbar
    'scrollbar.shadow': '#000000',
    'scrollbarSlider.background': '#4b556350',
    'scrollbarSlider.hoverBackground': '#6b728080',
    'scrollbarSlider.activeBackground': '#e8c25a80',

    // Minimap
    'minimap.background': '#0c0c0a',
    'minimap.selectionHighlight': '#e8c25a60',
    'minimapSlider.background': '#4b556330',
    'minimapSlider.hoverBackground': '#6b728050',
    'minimapSlider.activeBackground': '#e8c25a50',

    // Gutter
    'editorGutter.background': '#0c0c0a',
    'editorGutter.addedBackground': '#e8c25a',
    'editorGutter.modifiedBackground': '#f4d77c',
    'editorGutter.deletedBackground': '#ef4444',

    // Overview ruler (right edge markers)
    'editorOverviewRuler.border': '#374151',
    'editorOverviewRuler.errorForeground': '#ef4444',
    'editorOverviewRuler.warningForeground': '#f4d77c',
    'editorOverviewRuler.infoForeground': '#06b6d4',
    'editorOverviewRuler.bracketMatchForeground': '#e8c25a',
    'editorOverviewRuler.findMatchForeground': '#f4d77c',
    'editorOverviewRuler.selectionHighlightForeground': '#e8c25a80',

    // Error/Warning squiggles
    'editorError.foreground': '#ef4444',
    'editorWarning.foreground': '#f4d77c',
    'editorInfo.foreground': '#06b6d4',
    'editorHint.foreground': '#e8c25a',

    // Widget colors (autocomplete, hover, etc.)
    'editorWidget.background': '#0f0f0c',
    'editorWidget.border': '#374151',
    'editorWidget.foreground': '#f3ecd8',

    // Suggest widget (autocomplete)
    'editorSuggestWidget.background': '#0f0f0c',
    'editorSuggestWidget.border': '#374151',
    'editorSuggestWidget.foreground': '#f3ecd8',
    'editorSuggestWidget.highlightForeground': '#e8c25a',
    'editorSuggestWidget.selectedBackground': '#1a1a12',

    // Hover widget
    'editorHoverWidget.background': '#0f0f0c',
    'editorHoverWidget.border': '#374151',
    'editorHoverWidget.foreground': '#f3ecd8',

    // Peek view
    'peekView.border': '#e8c25a',
    'peekViewEditor.background': '#0f0f0c',
    'peekViewEditor.matchHighlightBackground': '#f4d77c40',
    'peekViewResult.background': '#0c0c0a',
    'peekViewResult.fileForeground': '#f3ecd8',
    'peekViewResult.lineForeground': '#9ca3af',
    'peekViewResult.matchHighlightBackground': '#f4d77c40',
    'peekViewResult.selectionBackground': '#1a1a12',
    'peekViewResult.selectionForeground': '#f3ecd8',
    'peekViewTitle.background': '#0f0f0c',
    'peekViewTitleLabel.foreground': '#e8c25a',
    'peekViewTitleDescription.foreground': '#9ca3af',

    // Diff editor
    'diffEditor.insertedTextBackground': '#e8c25a20',
    'diffEditor.removedTextBackground': '#ef444420',
    'diffEditor.insertedLineBackground': '#e8c25a15',
    'diffEditor.removedLineBackground': '#ef444415',

    // Input fields
    'input.background': '#0f0f0c',
    'input.border': '#374151',
    'input.foreground': '#f3ecd8',
    'input.placeholderForeground': '#6b7280',
    'inputOption.activeBackground': '#e8c25a33',
    'inputOption.activeBorder': '#e8c25a',

    // Focus border
    'focusBorder': '#e8c25a80',

    // Dropdown
    'dropdown.background': '#0f0f0c',
    'dropdown.border': '#374151',
    'dropdown.foreground': '#f3ecd8',

    // List colors
    'list.activeSelectionBackground': '#1a1a12',
    'list.activeSelectionForeground': '#f3ecd8',
    'list.hoverBackground': '#1a1a1280',
    'list.hoverForeground': '#f3ecd8',
    'list.focusBackground': '#1a1a12',
    'list.focusForeground': '#f3ecd8',
    'list.highlightForeground': '#e8c25a',
  },
};

/**
 * Register the VUDO theme with Monaco Editor
 * @param monaco - Monaco editor instance
 */
export function registerVudoTheme(monaco: typeof import('monaco-editor')): void {
  monaco.editor.defineTheme('vudo-dark', vudoTheme);
}

/**
 * Apply the VUDO theme to an editor instance
 * @param editor - Monaco editor instance
 */
export function applyVudoTheme(editor: editor.IStandaloneCodeEditor): void {
  editor.updateOptions({ theme: 'vudo-dark' });
}

export default vudoTheme;
