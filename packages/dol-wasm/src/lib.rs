//! DOL-WASM: WebAssembly bindings for the DOL language compiler
//!
//! This crate provides a WASM interface for parsing and validating DOL source code.
//! For MVP, it performs basic syntax validation and returns an AST-like structure.
//!
//! # DOL Syntax Overview
//! - `spirit` keyword defines a reactive computation unit
//! - `fn` keyword defines functions within spirits
//! - Curly braces `{}` for block structure
//! - Comments with `//` and `/* */`

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Represents a parsed DOL node in the AST
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum DolNode {
    /// A spirit declaration (reactive computation unit)
    Spirit {
        name: String,
        body: Vec<DolNode>,
        line: usize,
    },
    /// A function declaration within a spirit
    Function {
        name: String,
        params: Vec<String>,
        body: String,
        line: usize,
    },
    /// A state binding
    State {
        name: String,
        initial_value: String,
        line: usize,
    },
    /// An effect declaration
    Effect {
        dependencies: Vec<String>,
        body: String,
        line: usize,
    },
    /// A comment node
    Comment {
        content: String,
        line: usize,
    },
    /// Unknown or unrecognized syntax
    Unknown {
        content: String,
        line: usize,
    },
}

/// Result of DOL compilation/parsing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompileResult {
    /// Whether compilation was successful
    pub success: bool,
    /// Parsed AST nodes
    pub ast: Vec<DolNode>,
    /// Any errors encountered
    pub errors: Vec<CompileError>,
    /// Any warnings
    pub warnings: Vec<String>,
    /// Metadata about the compilation
    pub metadata: CompileMetadata,
}

/// Compilation error information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompileError {
    pub message: String,
    pub line: usize,
    pub column: usize,
    pub error_type: String,
}

/// Metadata about the compilation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompileMetadata {
    pub version: String,
    pub spirit_count: usize,
    pub function_count: usize,
    pub source_lines: usize,
}

/// Token types for lexical analysis
#[derive(Debug, Clone, PartialEq)]
enum Token {
    Spirit,
    Fn,
    State,
    Effect,
    Let,
    Const,
    Identifier(String),
    OpenBrace,
    CloseBrace,
    OpenParen,
    CloseParen,
    Colon,
    Arrow,
    Comma,
    Equals,
    StringLiteral(String),
    NumberLiteral(String),
    Comment(String),
    Whitespace,
    Newline,
    Unknown(char),
    Eof,
}

/// Simple lexer for DOL source code
struct Lexer<'a> {
    source: &'a str,
    chars: std::iter::Peekable<std::str::Chars<'a>>,
    line: usize,
    column: usize,
}

impl<'a> Lexer<'a> {
    fn new(source: &'a str) -> Self {
        Lexer {
            source,
            chars: source.chars().peekable(),
            line: 1,
            column: 1,
        }
    }

    fn next_char(&mut self) -> Option<char> {
        let c = self.chars.next();
        if let Some(ch) = c {
            if ch == '\n' {
                self.line += 1;
                self.column = 1;
            } else {
                self.column += 1;
            }
        }
        c
    }

    fn peek_char(&mut self) -> Option<&char> {
        self.chars.peek()
    }

    fn skip_whitespace(&mut self) {
        while let Some(&c) = self.peek_char() {
            if c == ' ' || c == '\t' || c == '\r' {
                self.next_char();
            } else {
                break;
            }
        }
    }

    fn read_identifier(&mut self, first: char) -> String {
        let mut ident = String::new();
        ident.push(first);
        while let Some(&c) = self.peek_char() {
            if c.is_alphanumeric() || c == '_' {
                ident.push(self.next_char().unwrap());
            } else {
                break;
            }
        }
        ident
    }

    fn read_string(&mut self, quote: char) -> String {
        let mut s = String::new();
        while let Some(c) = self.next_char() {
            if c == quote {
                break;
            } else if c == '\\' {
                if let Some(escaped) = self.next_char() {
                    s.push(escaped);
                }
            } else {
                s.push(c);
            }
        }
        s
    }

    fn read_line_comment(&mut self) -> String {
        let mut comment = String::new();
        while let Some(&c) = self.peek_char() {
            if c == '\n' {
                break;
            }
            comment.push(self.next_char().unwrap());
        }
        comment
    }

    fn read_block_comment(&mut self) -> String {
        let mut comment = String::new();
        let mut prev = ' ';
        while let Some(c) = self.next_char() {
            if prev == '*' && c == '/' {
                comment.pop(); // Remove the trailing '*'
                break;
            }
            comment.push(c);
            prev = c;
        }
        comment
    }

    fn next_token(&mut self) -> (Token, usize, usize) {
        self.skip_whitespace();

        let line = self.line;
        let column = self.column;

        match self.next_char() {
            None => (Token::Eof, line, column),
            Some('\n') => (Token::Newline, line, column),
            Some('{') => (Token::OpenBrace, line, column),
            Some('}') => (Token::CloseBrace, line, column),
            Some('(') => (Token::OpenParen, line, column),
            Some(')') => (Token::CloseParen, line, column),
            Some(':') => (Token::Colon, line, column),
            Some(',') => (Token::Comma, line, column),
            Some('=') => {
                if self.peek_char() == Some(&'>') {
                    self.next_char();
                    (Token::Arrow, line, column)
                } else {
                    (Token::Equals, line, column)
                }
            }
            Some('/') => {
                if self.peek_char() == Some(&'/') {
                    self.next_char();
                    let comment = self.read_line_comment();
                    (Token::Comment(comment), line, column)
                } else if self.peek_char() == Some(&'*') {
                    self.next_char();
                    let comment = self.read_block_comment();
                    (Token::Comment(comment), line, column)
                } else {
                    (Token::Unknown('/'), line, column)
                }
            }
            Some('"') => {
                let s = self.read_string('"');
                (Token::StringLiteral(s), line, column)
            }
            Some('\'') => {
                let s = self.read_string('\'');
                (Token::StringLiteral(s), line, column)
            }
            Some(c) if c.is_alphabetic() || c == '_' => {
                let ident = self.read_identifier(c);
                let token = match ident.as_str() {
                    "spirit" => Token::Spirit,
                    "fn" => Token::Fn,
                    "state" => Token::State,
                    "effect" => Token::Effect,
                    "let" => Token::Let,
                    "const" => Token::Const,
                    _ => Token::Identifier(ident),
                };
                (token, line, column)
            }
            Some(c) if c.is_numeric() => {
                let mut num = String::new();
                num.push(c);
                while let Some(&ch) = self.peek_char() {
                    if ch.is_numeric() || ch == '.' {
                        num.push(self.next_char().unwrap());
                    } else {
                        break;
                    }
                }
                (Token::NumberLiteral(num), line, column)
            }
            Some(c) => (Token::Unknown(c), line, column),
        }
    }
}

/// Parser for DOL source code
struct Parser<'a> {
    lexer: Lexer<'a>,
    current_token: Token,
    current_line: usize,
    current_column: usize,
    errors: Vec<CompileError>,
    warnings: Vec<String>,
}

impl<'a> Parser<'a> {
    fn new(source: &'a str) -> Self {
        let mut lexer = Lexer::new(source);
        let (token, line, column) = lexer.next_token();
        Parser {
            lexer,
            current_token: token,
            current_line: line,
            current_column: column,
            errors: Vec::new(),
            warnings: Vec::new(),
        }
    }

    fn advance(&mut self) {
        let (token, line, column) = self.lexer.next_token();
        self.current_token = token;
        self.current_line = line;
        self.current_column = column;
    }

    fn skip_newlines(&mut self) {
        while self.current_token == Token::Newline {
            self.advance();
        }
    }

    fn add_error(&mut self, message: &str, error_type: &str) {
        self.errors.push(CompileError {
            message: message.to_string(),
            line: self.current_line,
            column: self.current_column,
            error_type: error_type.to_string(),
        });
    }

    fn expect_identifier(&mut self) -> Option<String> {
        match &self.current_token {
            Token::Identifier(name) => {
                let name = name.clone();
                self.advance();
                Some(name)
            }
            _ => {
                self.add_error("Expected identifier", "SyntaxError");
                None
            }
        }
    }

    fn parse_spirit(&mut self) -> Option<DolNode> {
        let line = self.current_line;
        self.advance(); // consume 'spirit'
        self.skip_newlines();

        let name = self.expect_identifier()?;
        self.skip_newlines();

        // Expect opening brace
        if self.current_token != Token::OpenBrace {
            self.add_error("Expected '{' after spirit name", "SyntaxError");
            return None;
        }
        self.advance();

        let mut body = Vec::new();
        let mut brace_depth = 1;

        // Parse spirit body
        while brace_depth > 0 {
            self.skip_newlines();

            match &self.current_token {
                Token::Eof => {
                    self.add_error("Unexpected end of file, unclosed spirit block", "SyntaxError");
                    break;
                }
                Token::OpenBrace => {
                    brace_depth += 1;
                    self.advance();
                }
                Token::CloseBrace => {
                    brace_depth -= 1;
                    self.advance();
                }
                Token::Fn => {
                    if let Some(func) = self.parse_function() {
                        body.push(func);
                    }
                }
                Token::State => {
                    if let Some(state) = self.parse_state() {
                        body.push(state);
                    }
                }
                Token::Effect => {
                    if let Some(effect) = self.parse_effect() {
                        body.push(effect);
                    }
                }
                Token::Comment(content) => {
                    body.push(DolNode::Comment {
                        content: content.clone(),
                        line: self.current_line,
                    });
                    self.advance();
                }
                _ => {
                    self.advance();
                }
            }
        }

        Some(DolNode::Spirit { name, body, line })
    }

    fn parse_function(&mut self) -> Option<DolNode> {
        let line = self.current_line;
        self.advance(); // consume 'fn'
        self.skip_newlines();

        let name = self.expect_identifier()?;
        self.skip_newlines();

        // Parse parameters
        let mut params = Vec::new();
        if self.current_token == Token::OpenParen {
            self.advance();
            while self.current_token != Token::CloseParen && self.current_token != Token::Eof {
                self.skip_newlines();
                if let Token::Identifier(param) = &self.current_token {
                    params.push(param.clone());
                    self.advance();
                    self.skip_newlines();
                    if self.current_token == Token::Comma {
                        self.advance();
                    }
                } else if self.current_token == Token::CloseParen {
                    break;
                } else {
                    self.advance();
                }
            }
            if self.current_token == Token::CloseParen {
                self.advance();
            }
        }

        self.skip_newlines();

        // Parse function body (simplified - just collect until closing brace)
        let mut body = String::new();
        if self.current_token == Token::OpenBrace {
            self.advance();
            let mut brace_depth = 1;
            while brace_depth > 0 && self.current_token != Token::Eof {
                match &self.current_token {
                    Token::OpenBrace => {
                        brace_depth += 1;
                        body.push('{');
                    }
                    Token::CloseBrace => {
                        brace_depth -= 1;
                        if brace_depth > 0 {
                            body.push('}');
                        }
                    }
                    Token::Identifier(s) => body.push_str(s),
                    Token::StringLiteral(s) => {
                        body.push('"');
                        body.push_str(s);
                        body.push('"');
                    }
                    Token::NumberLiteral(n) => body.push_str(n),
                    Token::Newline => body.push('\n'),
                    _ => body.push(' '),
                }
                self.advance();
            }
        }

        Some(DolNode::Function {
            name,
            params,
            body: body.trim().to_string(),
            line,
        })
    }

    fn parse_state(&mut self) -> Option<DolNode> {
        let line = self.current_line;
        self.advance(); // consume 'state'
        self.skip_newlines();

        let name = self.expect_identifier()?;
        self.skip_newlines();

        let mut initial_value = String::new();
        if self.current_token == Token::Equals {
            self.advance();
            self.skip_newlines();

            // Read the initial value
            match &self.current_token {
                Token::StringLiteral(s) => {
                    initial_value = format!("\"{}\"", s);
                    self.advance();
                }
                Token::NumberLiteral(n) => {
                    initial_value = n.clone();
                    self.advance();
                }
                Token::Identifier(i) => {
                    initial_value = i.clone();
                    self.advance();
                }
                _ => {}
            }
        }

        Some(DolNode::State {
            name,
            initial_value,
            line,
        })
    }

    fn parse_effect(&mut self) -> Option<DolNode> {
        let line = self.current_line;
        self.advance(); // consume 'effect'
        self.skip_newlines();

        let mut dependencies = Vec::new();

        // Parse dependencies in brackets if present
        if self.current_token == Token::OpenParen {
            self.advance();
            while self.current_token != Token::CloseParen && self.current_token != Token::Eof {
                if let Token::Identifier(dep) = &self.current_token {
                    dependencies.push(dep.clone());
                    self.advance();
                    if self.current_token == Token::Comma {
                        self.advance();
                    }
                } else {
                    self.advance();
                }
            }
            if self.current_token == Token::CloseParen {
                self.advance();
            }
        }

        self.skip_newlines();

        // Parse effect body
        let mut body = String::new();
        if self.current_token == Token::OpenBrace {
            self.advance();
            let mut brace_depth = 1;
            while brace_depth > 0 && self.current_token != Token::Eof {
                match &self.current_token {
                    Token::OpenBrace => {
                        brace_depth += 1;
                        body.push('{');
                    }
                    Token::CloseBrace => {
                        brace_depth -= 1;
                        if brace_depth > 0 {
                            body.push('}');
                        }
                    }
                    Token::Newline => body.push('\n'),
                    _ => body.push(' '),
                }
                self.advance();
            }
        }

        Some(DolNode::Effect {
            dependencies,
            body: body.trim().to_string(),
            line,
        })
    }

    fn parse(&mut self) -> Vec<DolNode> {
        let mut nodes = Vec::new();

        loop {
            self.skip_newlines();

            match &self.current_token {
                Token::Eof => break,
                Token::Spirit => {
                    if let Some(spirit) = self.parse_spirit() {
                        nodes.push(spirit);
                    }
                }
                Token::Comment(content) => {
                    nodes.push(DolNode::Comment {
                        content: content.clone(),
                        line: self.current_line,
                    });
                    self.advance();
                }
                Token::Fn => {
                    // Top-level function (not in spirit)
                    if let Some(func) = self.parse_function() {
                        nodes.push(func);
                    }
                }
                _ => {
                    // Unknown top-level syntax
                    if let Token::Identifier(content) = &self.current_token {
                        self.warnings.push(format!(
                            "Warning: Unexpected identifier '{}' at line {}",
                            content, self.current_line
                        ));
                    }
                    self.advance();
                }
            }
        }

        nodes
    }
}

/// Validate bracket matching in DOL source
fn validate_brackets(source: &str) -> Vec<CompileError> {
    let mut errors = Vec::new();
    let mut brace_stack: Vec<(char, usize, usize)> = Vec::new();
    let mut paren_stack: Vec<(char, usize, usize)> = Vec::new();

    let mut line = 1;
    let mut column = 1;
    let mut in_string = false;
    let mut string_char = '"';
    let mut prev_char = ' ';

    for c in source.chars() {
        if c == '\n' {
            line += 1;
            column = 1;
            continue;
        }

        // Handle string literals
        if !in_string && (c == '"' || c == '\'') {
            in_string = true;
            string_char = c;
        } else if in_string && c == string_char && prev_char != '\\' {
            in_string = false;
        }

        if !in_string {
            match c {
                '{' => brace_stack.push((c, line, column)),
                '}' => {
                    if brace_stack.pop().is_none() {
                        errors.push(CompileError {
                            message: "Unexpected closing brace '}'".to_string(),
                            line,
                            column,
                            error_type: "BracketError".to_string(),
                        });
                    }
                }
                '(' => paren_stack.push((c, line, column)),
                ')' => {
                    if paren_stack.pop().is_none() {
                        errors.push(CompileError {
                            message: "Unexpected closing parenthesis ')'".to_string(),
                            line,
                            column,
                            error_type: "BracketError".to_string(),
                        });
                    }
                }
                _ => {}
            }
        }

        prev_char = c;
        column += 1;
    }

    // Check for unclosed brackets
    for (_, line, column) in brace_stack {
        errors.push(CompileError {
            message: "Unclosed brace '{'".to_string(),
            line,
            column,
            error_type: "BracketError".to_string(),
        });
    }

    for (_, line, column) in paren_stack {
        errors.push(CompileError {
            message: "Unclosed parenthesis '('".to_string(),
            line,
            column,
            error_type: "BracketError".to_string(),
        });
    }

    errors
}

/// Compile DOL source code to an AST
///
/// This is the main entry point for the WASM module.
/// It parses the DOL source and returns a compilation result.
#[wasm_bindgen]
pub fn compile_dol(source: &str) -> Result<JsValue, JsValue> {
    // First validate brackets
    let bracket_errors = validate_brackets(source);

    // Parse the source
    let mut parser = Parser::new(source);
    let ast = parser.parse();

    // Combine errors
    let mut all_errors = bracket_errors;
    all_errors.extend(parser.errors);

    // Count spirits and functions
    let spirit_count = ast.iter().filter(|n| matches!(n, DolNode::Spirit { .. })).count();
    let function_count = ast.iter().filter(|n| matches!(n, DolNode::Function { .. })).count();

    let result = CompileResult {
        success: all_errors.is_empty(),
        ast,
        errors: all_errors,
        warnings: parser.warnings,
        metadata: CompileMetadata {
            version: "0.1.0".to_string(),
            spirit_count,
            function_count,
            source_lines: source.lines().count(),
        },
    };

    // Convert to JsValue using serde-wasm-bindgen
    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Get the version of the DOL compiler
#[wasm_bindgen]
pub fn get_version() -> String {
    "0.1.0".to_string()
}

/// Validate DOL source without full compilation
/// Returns true if the source is syntactically valid
#[wasm_bindgen]
pub fn validate_dol(source: &str) -> bool {
    let bracket_errors = validate_brackets(source);
    if !bracket_errors.is_empty() {
        return false;
    }

    let mut parser = Parser::new(source);
    let _ = parser.parse();
    parser.errors.is_empty()
}

/// Format DOL source code (stub for future implementation)
#[wasm_bindgen]
pub fn format_dol(source: &str) -> String {
    // TODO: Implement proper formatting
    // For now, just return the source as-is
    source.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_brackets_valid() {
        let source = r#"
            spirit Counter {
                fn increment() {
                    count = count + 1
                }
            }
        "#;
        let errors = validate_brackets(source);
        assert!(errors.is_empty());
    }

    #[test]
    fn test_validate_brackets_unclosed() {
        let source = r#"
            spirit Counter {
                fn increment() {
                    count = count + 1
            }
        "#;
        let errors = validate_brackets(source);
        assert!(!errors.is_empty());
    }

    #[test]
    fn test_parse_spirit() {
        let source = r#"
            spirit Counter {
                state count = 0

                fn increment() {
                    count = count + 1
                }
            }
        "#;
        let mut parser = Parser::new(source);
        let ast = parser.parse();

        assert!(!ast.is_empty());
        assert!(matches!(ast[0], DolNode::Spirit { .. }));
    }

    #[test]
    fn test_validate_valid_source() {
        let source = r#"
            spirit App {
                fn render() {}
            }
        "#;
        assert!(validate_dol(source));
    }
}
