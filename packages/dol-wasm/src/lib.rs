//! DOL-WASM: WebAssembly bindings for the DOL language compiler
//!
//! This crate provides thin WASM bindings over the `metadol` compiler crate,
//! ensuring a single source of truth for DOL parsing and validation.
//!
//! # Architecture
//!
//! ```text
//! Browser → dol-wasm (WASM bindings) → metadol (core compiler)
//! ```
//!
//! This eliminates version drift by using metadol directly instead of
//! maintaining a separate parser implementation.

use metadol::{
    ast::{Declaration, Quantifier, Statement, Visibility},
    parse_and_validate, parse_file, parse_file_all,
    wasm::WasmCompiler,
    ParseError,
};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Initialize panic hook for better error messages in browser console
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Compilation result returned to JavaScript
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompileResult {
    /// Whether compilation was successful
    pub success: bool,
    /// Parsed AST (serialized declarations)
    pub ast: Vec<AstNode>,
    /// Any errors encountered
    pub errors: Vec<CompileError>,
    /// Any warnings
    pub warnings: Vec<String>,
    /// Metadata about the compilation
    pub metadata: CompileMetadata,
}

/// Simplified AST node for browser consumption
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AstNode {
    /// A gene declaration
    Gene {
        name: String,
        visibility: String,
        extends: Option<String>,
        statements: Vec<StatementNode>,
        exegesis: String,
        line: usize,
    },
    /// A trait declaration
    Trait {
        name: String,
        visibility: String,
        statements: Vec<StatementNode>,
        exegesis: String,
        line: usize,
    },
    /// A constraint declaration
    Constraint {
        name: String,
        visibility: String,
        statements: Vec<StatementNode>,
        exegesis: String,
        line: usize,
    },
    /// A system declaration
    System {
        name: String,
        visibility: String,
        version: String,
        requirements: Vec<RequirementNode>,
        statements: Vec<StatementNode>,
        exegesis: String,
        line: usize,
    },
    /// An evolution declaration
    Evolution {
        name: String,
        version: String,
        parent_version: String,
        additions: Vec<StatementNode>,
        deprecations: Vec<StatementNode>,
        removals: Vec<String>,
        rationale: Option<String>,
        exegesis: String,
        line: usize,
    },
    /// A function declaration
    Function {
        name: String,
        visibility: String,
        purity: String,
        params: Vec<ParamNode>,
        return_type: Option<String>,
        line: usize,
    },
    /// A constant declaration
    Const {
        name: String,
        visibility: String,
        const_type: Option<String>,
        line: usize,
    },
}

/// Statement node for browser consumption
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum StatementNode {
    /// Property possession: subject has property
    Has {
        subject: String,
        property: String,
    },
    /// Typed field declaration: has field: Type
    HasField {
        name: String,
        field_type: String,
        default_value: Option<String>,
    },
    /// State or behavior: subject is state
    Is {
        subject: String,
        state: String,
    },
    /// Origin relationship: subject derives from origin
    DerivesFrom {
        subject: String,
        origin: String,
    },
    /// Dependency: subject requires requirement
    Requires {
        subject: String,
        requirement: String,
    },
    /// Composition: uses reference
    Uses {
        reference: String,
    },
    /// Event production: action emits event
    Emits {
        action: String,
        event: String,
    },
    /// Equivalence constraint: subject matches target
    Matches {
        subject: String,
        target: String,
    },
    /// Negative constraint: subject never action
    Never {
        subject: String,
        action: String,
    },
    /// Quantified statement: each/all subject predicate
    Quantified {
        quantifier: String,
        phrase: String,
    },
    /// Nested function
    Function {
        name: String,
    },
    /// Other statement types
    Other {
        description: String,
    },
}

/// Requirement node for system dependencies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequirementNode {
    pub name: String,
    pub constraint: String,
    pub version: String,
}

/// Function parameter node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParamNode {
    pub name: String,
    pub param_type: String,
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
    pub gene_count: usize,
    pub trait_count: usize,
    pub constraint_count: usize,
    pub system_count: usize,
    pub function_count: usize,
    pub source_lines: usize,
}

/// Convert visibility to string
fn visibility_to_string(vis: &Visibility) -> String {
    match vis {
        Visibility::Private => "private".to_string(),
        Visibility::Public => "pub".to_string(),
        Visibility::PubSpirit => "pub(spirit)".to_string(),
        Visibility::PubParent => "pub(parent)".to_string(),
    }
}

/// Convert metadol Statement to browser-friendly StatementNode
fn convert_statement(stmt: &Statement) -> StatementNode {
    match stmt {
        Statement::Has {
            subject,
            property,
            ..
        } => StatementNode::Has {
            subject: subject.clone(),
            property: property.clone(),
        },
        Statement::HasField(field) => StatementNode::HasField {
            name: field.name.clone(),
            field_type: format!("{:?}", field.type_),
            default_value: field.default.as_ref().map(|v| format!("{:?}", v)),
        },
        Statement::Is {
            subject, state, ..
        } => StatementNode::Is {
            subject: subject.clone(),
            state: state.clone(),
        },
        Statement::DerivesFrom {
            subject, origin, ..
        } => StatementNode::DerivesFrom {
            subject: subject.clone(),
            origin: origin.clone(),
        },
        Statement::Requires {
            subject,
            requirement,
            ..
        } => StatementNode::Requires {
            subject: subject.clone(),
            requirement: requirement.clone(),
        },
        Statement::Uses { reference, .. } => StatementNode::Uses {
            reference: reference.clone(),
        },
        Statement::Emits { action, event, .. } => StatementNode::Emits {
            action: action.clone(),
            event: event.clone(),
        },
        Statement::Matches {
            subject, target, ..
        } => StatementNode::Matches {
            subject: subject.clone(),
            target: target.clone(),
        },
        Statement::Never {
            subject, action, ..
        } => StatementNode::Never {
            subject: subject.clone(),
            action: action.clone(),
        },
        Statement::Quantified {
            quantifier,
            phrase,
            ..
        } => StatementNode::Quantified {
            quantifier: match quantifier {
                Quantifier::Each => "each".to_string(),
                Quantifier::All => "all".to_string(),
            },
            phrase: phrase.clone(),
        },
        Statement::Function(func) => StatementNode::Function {
            name: func.name.clone(),
        },
    }
}

/// Convert metadol Declaration to browser-friendly AstNode
fn convert_declaration(decl: &Declaration) -> AstNode {
    match decl {
        Declaration::Gene(gene) => AstNode::Gene {
            name: gene.name.clone(),
            visibility: visibility_to_string(&gene.visibility),
            extends: gene.extends.clone(),
            statements: gene.statements.iter().map(convert_statement).collect(),
            exegesis: gene.exegesis.clone(),
            line: gene.span.line,
        },
        Declaration::Trait(trait_decl) => AstNode::Trait {
            name: trait_decl.name.clone(),
            visibility: visibility_to_string(&trait_decl.visibility),
            statements: trait_decl
                .statements
                .iter()
                .map(convert_statement)
                .collect(),
            exegesis: trait_decl.exegesis.clone(),
            line: trait_decl.span.line,
        },
        Declaration::Constraint(constraint) => AstNode::Constraint {
            name: constraint.name.clone(),
            visibility: visibility_to_string(&constraint.visibility),
            statements: constraint
                .statements
                .iter()
                .map(convert_statement)
                .collect(),
            exegesis: constraint.exegesis.clone(),
            line: constraint.span.line,
        },
        Declaration::System(system) => AstNode::System {
            name: system.name.clone(),
            visibility: visibility_to_string(&system.visibility),
            version: system.version.clone(),
            requirements: system
                .requirements
                .iter()
                .map(|r| RequirementNode {
                    name: r.name.clone(),
                    constraint: r.constraint.clone(),
                    version: r.version.clone(),
                })
                .collect(),
            statements: system.statements.iter().map(convert_statement).collect(),
            exegesis: system.exegesis.clone(),
            line: system.span.line,
        },
        Declaration::Evolution(evolution) => AstNode::Evolution {
            name: evolution.name.clone(),
            version: evolution.version.clone(),
            parent_version: evolution.parent_version.clone(),
            additions: evolution.additions.iter().map(convert_statement).collect(),
            deprecations: evolution
                .deprecations
                .iter()
                .map(convert_statement)
                .collect(),
            removals: evolution.removals.clone(),
            rationale: evolution.rationale.clone(),
            exegesis: evolution.exegesis.clone(),
            line: evolution.span.line,
        },
        Declaration::Function(func) => AstNode::Function {
            name: func.name.clone(),
            visibility: visibility_to_string(&func.visibility),
            purity: match func.purity {
                metadol::ast::Purity::Pure => "pure".to_string(),
                metadol::ast::Purity::Sex => "sex".to_string(),
            },
            params: func
                .params
                .iter()
                .map(|p| ParamNode {
                    name: p.name.clone(),
                    param_type: format!("{:?}", p.type_ann),
                })
                .collect(),
            return_type: func.return_type.as_ref().map(|t| format!("{:?}", t)),
            line: func.span.line,
        },
        Declaration::Const(const_decl) => AstNode::Const {
            name: const_decl.name.clone(),
            visibility: visibility_to_string(&const_decl.visibility),
            const_type: const_decl.type_ann.as_ref().map(|t| format!("{:?}", t)),
            line: const_decl.span.line,
        },
        Declaration::SexVar(var) => AstNode::Const {
            name: var.name.clone(),
            visibility: "private".to_string(),
            const_type: var.type_ann.as_ref().map(|t| format!("{:?}", t)),
            line: var.span.line,
        },
    }
}

/// Convert ParseError to CompileError
fn convert_parse_error(err: &ParseError) -> CompileError {
    let span = err.span();
    CompileError {
        message: err.to_string(),
        line: span.line,
        column: span.column,
        error_type: "ParseError".to_string(),
    }
}

/// Compile DOL source code to an AST
///
/// This is the main entry point for the WASM module.
/// It parses the DOL source using metadol and returns a compilation result.
#[wasm_bindgen]
pub fn compile_dol(source: &str) -> Result<JsValue, JsValue> {
    let source_lines = source.lines().count();

    // Parse all declarations from the source
    match parse_file_all(source) {
        Ok(declarations) => {
            // Convert to browser-friendly format
            let ast: Vec<AstNode> = declarations.iter().map(convert_declaration).collect();

            // Count declaration types
            let mut gene_count = 0;
            let mut trait_count = 0;
            let mut constraint_count = 0;
            let mut system_count = 0;
            let mut function_count = 0;

            for node in &ast {
                match node {
                    AstNode::Gene { .. } => gene_count += 1,
                    AstNode::Trait { .. } => trait_count += 1,
                    AstNode::Constraint { .. } => constraint_count += 1,
                    AstNode::System { .. } => system_count += 1,
                    AstNode::Function { .. } | AstNode::Const { .. } => function_count += 1,
                    AstNode::Evolution { .. } => {}
                }
            }

            let result = CompileResult {
                success: true,
                ast,
                errors: vec![],
                warnings: vec![],
                metadata: CompileMetadata {
                    version: env!("CARGO_PKG_VERSION").to_string(),
                    gene_count,
                    trait_count,
                    constraint_count,
                    system_count,
                    function_count,
                    source_lines,
                },
            };

            serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
        Err(err) => {
            let result = CompileResult {
                success: false,
                ast: vec![],
                errors: vec![convert_parse_error(&err)],
                warnings: vec![],
                metadata: CompileMetadata {
                    version: env!("CARGO_PKG_VERSION").to_string(),
                    gene_count: 0,
                    trait_count: 0,
                    constraint_count: 0,
                    system_count: 0,
                    function_count: 0,
                    source_lines,
                },
            };

            serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
    }
}

/// Parse and validate DOL source code
///
/// Returns both the AST and validation results (warnings for empty exegesis, etc.)
#[wasm_bindgen]
pub fn compile_and_validate(source: &str) -> Result<JsValue, JsValue> {
    let source_lines = source.lines().count();

    match parse_and_validate(source) {
        Ok((decl, validation)) => {
            let ast = vec![convert_declaration(&decl)];

            // Convert validation warnings to strings
            let warnings: Vec<String> = validation.warnings.iter().map(|w| w.to_string()).collect();

            let result = CompileResult {
                success: validation.is_valid(),
                ast,
                errors: vec![],
                warnings,
                metadata: CompileMetadata {
                    version: env!("CARGO_PKG_VERSION").to_string(),
                    gene_count: if matches!(decl, Declaration::Gene(_)) {
                        1
                    } else {
                        0
                    },
                    trait_count: if matches!(decl, Declaration::Trait(_)) {
                        1
                    } else {
                        0
                    },
                    constraint_count: if matches!(decl, Declaration::Constraint(_)) {
                        1
                    } else {
                        0
                    },
                    system_count: if matches!(decl, Declaration::System(_)) {
                        1
                    } else {
                        0
                    },
                    function_count: if matches!(decl, Declaration::Function(_)) {
                        1
                    } else {
                        0
                    },
                    source_lines,
                },
            };

            serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
        Err(err) => {
            let result = CompileResult {
                success: false,
                ast: vec![],
                errors: vec![convert_parse_error(&err)],
                warnings: vec![],
                metadata: CompileMetadata {
                    version: env!("CARGO_PKG_VERSION").to_string(),
                    gene_count: 0,
                    trait_count: 0,
                    constraint_count: 0,
                    system_count: 0,
                    function_count: 0,
                    source_lines,
                },
            };

            serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
    }
}

/// Get the version of the DOL compiler
#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Validate DOL source without full compilation
/// Returns true if the source is syntactically valid
#[wasm_bindgen]
pub fn validate_dol(source: &str) -> bool {
    parse_file(source).is_ok()
}

/// Format DOL source code (stub for future implementation)
#[wasm_bindgen]
pub fn format_dol(source: &str) -> String {
    // TODO: Implement proper formatting using metadol
    source.to_string()
}

/// Result from compile_to_wasm containing bytecode or error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmBytecodeResult {
    /// Whether compilation was successful
    pub success: bool,
    /// WASM bytecode (only present on success)
    pub bytecode: Option<Vec<u8>>,
    /// Error message (only present on failure)
    pub error: Option<String>,
    /// Size of generated bytecode in bytes
    pub bytecode_size: usize,
}

/// Compile DOL source code to WebAssembly bytecode
///
/// This function parses DOL source, then uses the WasmCompiler to emit
/// actual WASM bytecode that can be instantiated via the browser's WebAssembly API.
///
/// # Example (JavaScript)
///
/// ```javascript
/// const result = compile_to_wasm(dolSource);
/// if (result.success) {
///     const wasmModule = await WebAssembly.compile(result.bytecode);
///     const instance = await WebAssembly.instantiate(wasmModule);
///     // Call exported functions...
/// }
/// ```
#[wasm_bindgen]
pub fn compile_to_wasm(source: &str) -> Result<JsValue, JsValue> {
    // Parse the DOL source
    match parse_file_all(source) {
        Ok(declarations) => {
            if declarations.is_empty() {
                let result = WasmBytecodeResult {
                    success: false,
                    bytecode: None,
                    error: Some("No declarations found in source".to_string()),
                    bytecode_size: 0,
                };
                return serde_wasm_bindgen::to_value(&result)
                    .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)));
            }

            // Filter to only function declarations (WASM compiler only supports functions)
            let functions: Vec<_> = declarations
                .iter()
                .filter(|d| matches!(d, Declaration::Function(_)))
                .collect();

            if functions.is_empty() {
                let result = WasmBytecodeResult {
                    success: false,
                    bytecode: None,
                    error: Some("No function declarations found. WASM compilation requires at least one 'fun' declaration.".to_string()),
                    bytecode_size: 0,
                };
                return serde_wasm_bindgen::to_value(&result)
                    .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)));
            }

            // Create WASM compiler with optimization enabled
            let mut compiler = WasmCompiler::new().with_optimization(true);

            // Compile the first function declaration to WASM bytecode
            // TODO: Support compiling multiple functions into a single module
            match compiler.compile(functions[0]) {
                Ok(bytecode) => {
                    let bytecode_size = bytecode.len();
                    let result = WasmBytecodeResult {
                        success: true,
                        bytecode: Some(bytecode),
                        error: None,
                        bytecode_size,
                    };
                    serde_wasm_bindgen::to_value(&result)
                        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
                }
                Err(err) => {
                    let result = WasmBytecodeResult {
                        success: false,
                        bytecode: None,
                        error: Some(format!("WASM compilation error: {}", err)),
                        bytecode_size: 0,
                    };
                    serde_wasm_bindgen::to_value(&result)
                        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
                }
            }
        }
        Err(err) => {
            let result = WasmBytecodeResult {
                success: false,
                bytecode: None,
                error: Some(format!("Parse error: {}", err)),
                bytecode_size: 0,
            };
            serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
    }
}

/// Compile DOL source to WASM bytecode and return as Uint8Array
///
/// This is a convenience function that returns the raw bytecode directly
/// as a JavaScript Uint8Array, suitable for immediate use with WebAssembly.instantiate().
///
/// # Example (JavaScript)
///
/// ```javascript
/// try {
///     const wasmBytes = compile_to_wasm_bytes(dolSource);
///     const wasmModule = await WebAssembly.instantiate(wasmBytes);
/// } catch (err) {
///     console.error("Compilation failed:", err);
/// }
/// ```
#[wasm_bindgen]
pub fn compile_to_wasm_bytes(source: &str) -> Result<Vec<u8>, JsValue> {
    // Parse the DOL source
    let declarations = parse_file_all(source)
        .map_err(|err| JsValue::from_str(&format!("Parse error: {}", err)))?;

    if declarations.is_empty() {
        return Err(JsValue::from_str("No declarations found in source"));
    }

    // Create WASM compiler with optimization enabled
    let mut compiler = WasmCompiler::new().with_optimization(true);

    // Compile the first declaration to WASM bytecode
    compiler
        .compile(&declarations[0])
        .map_err(|err| JsValue::from_str(&format!("WASM compilation error: {}", err)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_simple_gene() {
        let source = r#"
gene Counter {
    counter has value
}

exegesis {
    A simple counter gene.
}
        "#;
        assert!(validate_dol(source));
    }

    #[test]
    fn test_validate_system_syntax() {
        let source = r#"
system Counter @ 0.1.0 {
    requires base >= 0.0.1
    all counters is tracked
}

exegesis {
    A counter system.
}
        "#;
        assert!(validate_dol(source));
    }

    #[test]
    fn test_invalid_syntax() {
        let source = r#"
gene Unclosed {
    has value
        "#;
        assert!(!validate_dol(source));
    }

    #[test]
    fn test_version() {
        let version = get_version();
        assert!(!version.is_empty());
    }
}
