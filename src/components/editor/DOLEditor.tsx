import Editor, { Monaco } from '@monaco-editor/react';
import { dolLanguageConfig, dolTokensProvider, DOL_LANGUAGE_ID } from '../../editor/dol-language';
import { vudoTheme } from '../../editor/dol-theme';

interface DOLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DEFAULT_CODE = `// DOL v0.8.0 - Define a Gen with fields and methods
gen Counter {
  has value: i32 = 0

  // Pure function - no side effects
  fun get() -> i32 {
    return this.value
  }

  // Effectful function - mutates state
  sex fun increment() {
    this.value = this.value + 1
  }
}

// Top-level effectful function
sex fun main() {
  let c = Counter { value: 0 }
  c.increment()
  println(c.get())
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
