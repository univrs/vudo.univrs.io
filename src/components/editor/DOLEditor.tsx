import Editor, { Monaco } from '@monaco-editor/react';
import { dolLanguageConfig, dolTokensProvider, DOL_LANGUAGE_ID } from '../../editor/dol-language';
import { vudoTheme } from '../../editor/dol-theme';

interface DOLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DEFAULT_CODE = `// My First Spirit
spirit HelloWorld {
  pub fn main() -> String {
    "Hello from the Mycelium!"
  }
}`;

export function DOLEditor({ value, onChange }: DOLEditorProps) {
  const handleEditorWillMount = (monaco: Monaco) => {
    // Register DOL language
    monaco.languages.register({ id: DOL_LANGUAGE_ID });
    monaco.languages.setLanguageConfiguration(DOL_LANGUAGE_ID, dolLanguageConfig);
    monaco.languages.setMonarchTokensProvider(DOL_LANGUAGE_ID, dolTokensProvider);

    // Register VUDO theme
    monaco.editor.defineTheme('vudo-dark', vudoTheme);
  };

  return (
    <Editor
      height="100%"
      language={DOL_LANGUAGE_ID}
      theme="vudo-dark"
      value={value || DEFAULT_CODE}
      onChange={(v) => onChange(v || '')}
      beforeMount={handleEditorWillMount}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        automaticLayout: true,
      }}
    />
  );
}
