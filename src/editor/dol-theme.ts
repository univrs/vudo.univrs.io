/**
 * VUDO Monaco Editor Theme
 *
 * A dark theme optimized for DOL (Domain-Oriented Language) editing
 * with the VUDO brand color palette.
 *
 * Color Palette:
 * - Background: #0a0a0f (dark void)
 * - Keywords: #00ff88 (VUDO glow green)
 * - Types: #8b5cf6 (Mycelium purple)
 * - Strings: #fbbf24 (Veve gold/amber)
 * - Numbers: #ec4899 (pink)
 * - Comments: #6b7280 (muted gray)
 * - Operators: #06b6d4 (cyan)
 * - Functions: #f472b6 (light pink)
 * - Variables: #e5e7eb (light gray)
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
    'editor.background': '#0a0a0f',
    'editor.foreground': '#e5e7eb',

    // Cursor and line highlight
    'editorCursor.foreground': '#00ff88',
    'editorCursor.background': '#0a0a0f',
    'editor.lineHighlightBackground': '#1a1a2e',
    'editor.lineHighlightBorder': '#2a2a4e00',

    // Selection colors
    'editor.selectionBackground': '#00ff8833',
    'editor.selectionHighlightBackground': '#00ff8822',
    'editor.inactiveSelectionBackground': '#00ff8820',

    // Find/search highlight
    'editor.findMatchBackground': '#fbbf2440',
    'editor.findMatchHighlightBackground': '#fbbf2420',
    'editor.findMatchBorder': '#fbbf24',

    // Word highlight
    'editor.wordHighlightBackground': '#8b5cf622',
    'editor.wordHighlightStrongBackground': '#8b5cf633',

    // Bracket matching
    'editorBracketMatch.background': '#00ff8830',
    'editorBracketMatch.border': '#00ff88',

    // Line numbers
    'editorLineNumber.foreground': '#4b5563',
    'editorLineNumber.activeForeground': '#00ff88',

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
    'scrollbarSlider.activeBackground': '#00ff8880',

    // Minimap
    'minimap.background': '#0a0a0f',
    'minimap.selectionHighlight': '#00ff8860',
    'minimapSlider.background': '#4b556330',
    'minimapSlider.hoverBackground': '#6b728050',
    'minimapSlider.activeBackground': '#00ff8850',

    // Gutter
    'editorGutter.background': '#0a0a0f',
    'editorGutter.addedBackground': '#00ff88',
    'editorGutter.modifiedBackground': '#fbbf24',
    'editorGutter.deletedBackground': '#ef4444',

    // Overview ruler (right edge markers)
    'editorOverviewRuler.border': '#374151',
    'editorOverviewRuler.errorForeground': '#ef4444',
    'editorOverviewRuler.warningForeground': '#fbbf24',
    'editorOverviewRuler.infoForeground': '#06b6d4',
    'editorOverviewRuler.bracketMatchForeground': '#00ff88',
    'editorOverviewRuler.findMatchForeground': '#fbbf24',
    'editorOverviewRuler.selectionHighlightForeground': '#00ff8880',

    // Error/Warning squiggles
    'editorError.foreground': '#ef4444',
    'editorWarning.foreground': '#fbbf24',
    'editorInfo.foreground': '#06b6d4',
    'editorHint.foreground': '#00ff88',

    // Widget colors (autocomplete, hover, etc.)
    'editorWidget.background': '#0f0f1a',
    'editorWidget.border': '#374151',
    'editorWidget.foreground': '#e5e7eb',

    // Suggest widget (autocomplete)
    'editorSuggestWidget.background': '#0f0f1a',
    'editorSuggestWidget.border': '#374151',
    'editorSuggestWidget.foreground': '#e5e7eb',
    'editorSuggestWidget.highlightForeground': '#00ff88',
    'editorSuggestWidget.selectedBackground': '#1a1a2e',

    // Hover widget
    'editorHoverWidget.background': '#0f0f1a',
    'editorHoverWidget.border': '#374151',
    'editorHoverWidget.foreground': '#e5e7eb',

    // Peek view
    'peekView.border': '#00ff88',
    'peekViewEditor.background': '#0f0f1a',
    'peekViewEditor.matchHighlightBackground': '#fbbf2440',
    'peekViewResult.background': '#0a0a0f',
    'peekViewResult.fileForeground': '#e5e7eb',
    'peekViewResult.lineForeground': '#9ca3af',
    'peekViewResult.matchHighlightBackground': '#fbbf2440',
    'peekViewResult.selectionBackground': '#1a1a2e',
    'peekViewResult.selectionForeground': '#e5e7eb',
    'peekViewTitle.background': '#0f0f1a',
    'peekViewTitleLabel.foreground': '#00ff88',
    'peekViewTitleDescription.foreground': '#9ca3af',

    // Diff editor
    'diffEditor.insertedTextBackground': '#00ff8820',
    'diffEditor.removedTextBackground': '#ef444420',
    'diffEditor.insertedLineBackground': '#00ff8815',
    'diffEditor.removedLineBackground': '#ef444415',

    // Input fields
    'input.background': '#0f0f1a',
    'input.border': '#374151',
    'input.foreground': '#e5e7eb',
    'input.placeholderForeground': '#6b7280',
    'inputOption.activeBackground': '#00ff8833',
    'inputOption.activeBorder': '#00ff88',

    // Focus border
    'focusBorder': '#00ff8880',

    // Dropdown
    'dropdown.background': '#0f0f1a',
    'dropdown.border': '#374151',
    'dropdown.foreground': '#e5e7eb',

    // List colors
    'list.activeSelectionBackground': '#1a1a2e',
    'list.activeSelectionForeground': '#e5e7eb',
    'list.hoverBackground': '#1a1a2e80',
    'list.hoverForeground': '#e5e7eb',
    'list.focusBackground': '#1a1a2e',
    'list.focusForeground': '#e5e7eb',
    'list.highlightForeground': '#00ff88',
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
