// Tree-sitter imports with fallback handling
let Parser, JavaScript, Python, TypeScript;
import { simpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

/**
 * Carmack-inspired execution tracing and semantic compression
 * Parses codebases with surgical precision using Tree-sitter
 */
export class CodebaseScanner {
    constructor() {
        this.parsers = new Map();
        this.git = simpleGit();
        this.treeSitterLoaded = false;
        // Initialize parsers asynchronously without blocking
        this.initializeParsers().catch(err => 
            console.warn('Parser initialization failed:', err.message)
        );
    }

    async initializeParsers() {
        try {
            // Try to load Tree-sitter dynamically
            const TreeSitter = await import('tree-sitter');
            const JSLang = await import('tree-sitter-javascript');
            const PyLang = await import('tree-sitter-python');
            const TSLang = await import('tree-sitter-typescript');
            
            Parser = TreeSitter.default;
            JavaScript = JSLang.default;
            Python = PyLang.default;
            TypeScript = TSLang.default;

            // JavaScript/TypeScript parser
            const jsParser = new Parser();
            jsParser.setLanguage(JavaScript);
            this.parsers.set('js', jsParser);
            this.parsers.set('jsx', jsParser);
            this.parsers.set('mjs', jsParser);

            // TypeScript parser
            const tsParser = new Parser();
            tsParser.setLanguage(TypeScript.typescript);
            this.parsers.set('ts', tsParser);
            this.parsers.set('tsx', tsParser);

            // Python parser
            const pyParser = new Parser();
            pyParser.setLanguage(Python);
            this.parsers.set('py', pyParser);
            
            this.treeSitterLoaded = true;
            console.log('✅ Tree-sitter parsers loaded successfully');
            
        } catch (error) {
            console.warn('⚠️ Tree-sitter not available, using fallback analysis:', error.message);
            this.treeSitterLoaded = false;
        }
    }

    /**
     * Main entry point - analyzes entire repository
     */
    async scanRepository(repoPath) {
        try {
            console.log(`🔍 Scanning repository: ${repoPath}`);
            
            const repoInfo = await this.getRepositoryInfo(repoPath);
            const files = await this.findSourceFiles(repoPath);
            const parsedFiles = await this.parseFiles(files);
            const dependencyGraph = await this.buildDependencyGraph(parsedFiles);
            const patterns = await this.detectArchitecturalPatterns(parsedFiles);
            
            return {
                repository: repoInfo,
                files: parsedFiles,
                dependencies: dependencyGraph,
                patterns: patterns,
                metrics: this.calculateMetrics(parsedFiles),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Repository scan failed:', error);
            throw new Error(`Failed to scan repository: ${error.message}`);
        }
    }

    /**
     * Clone or analyze local repository
     */
    async getRepositoryInfo(repoPath) {
        const stats = await fs.stat(repoPath);
        
        if (stats.isDirectory()) {
            // Local repository
            try {
                const isRepo = await this.git.cwd(repoPath).checkIsRepo();
                if (isRepo) {
                    const status = await this.git.cwd(repoPath).status();
                    const log = await this.git.cwd(repoPath).log({ maxCount: 5 });
                    return {
                        type: 'local',
                        path: repoPath,
                        branch: status.current,
                        commits: log.all.length,
                        lastCommit: log.latest
                    };
                }
            } catch (error) {
                // Not a git repo, treat as regular directory
            }
            
            return {
                type: 'directory',
                path: repoPath,
                name: path.basename(repoPath)
            };
        }
        
        throw new Error('Invalid repository path');
    }

    /**
     * Find all source code files with intelligent filtering
     */
    async findSourceFiles(repoPath) {
        const supportedExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'mjs'];
        const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache'];
        const files = [];

        async function walkDirectory(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                        await walkDirectory(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).slice(1);
                    if (supportedExtensions.includes(ext)) {
                        files.push({
                            path: fullPath,
                            relativePath: path.relative(repoPath, fullPath),
                            extension: ext,
                            name: entry.name,
                            size: (await fs.stat(fullPath)).size
                        });
                    }
                }
            }
        }

        await walkDirectory(repoPath);
        console.log(`📁 Found ${files.length} source files`);
        return files;
    }

    /**
     * Parse files using Tree-sitter with semantic analysis
     */
    async parseFiles(files) {
        const parsedFiles = [];
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file.path, 'utf8');
                let analysis;
                
                if (this.treeSitterLoaded) {
                    // Use Tree-sitter for advanced parsing
                    const parser = this.parsers.get(file.extension);
                    
                    if (!parser) {
                        console.warn(`No parser for extension: ${file.extension}`);
                        analysis = this.fallbackAnalysis(content, file);
                    } else {
                        const tree = parser.parse(content);
                        analysis = this.analyzeAST(tree, content, file);
                    }
                } else {
                    // Use fallback regex-based analysis
                    analysis = this.fallbackAnalysis(content, file);
                }
                
                parsedFiles.push({
                    ...file,
                    content,
                    analysis,
                    lineCount: content.split('\n').length,
                    complexity: this.calculateComplexity(analysis)
                });
                
            } catch (error) {
                console.error(`Failed to parse ${file.path}:`, error.message);
                // Add file with minimal analysis even if parsing fails
                parsedFiles.push({
                    ...file,
                    content: '',
                    analysis: { functions: [], classes: [], imports: [], exports: [], variables: [], calls: [] },
                    lineCount: 0,
                    complexity: 0
                });
            }
        }
        
        console.log(`⚡ Parsed ${parsedFiles.length} files successfully`);
        return parsedFiles;
    }

    /**
     * Fallback analysis using regex when Tree-sitter is not available
     */
    fallbackAnalysis(content, file) {
        const analysis = {
            functions: [],
            classes: [],
            imports: [],
            exports: [],
            variables: [],
            calls: []
        };

        const lines = content.split('\n');
        
        // JavaScript/TypeScript patterns
        if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(file.extension)) {
            // Function patterns
            const functionPatterns = [
                /function\s+(\w+)/g,
                /const\s+(\w+)\s*=\s*\(/g,
                /let\s+(\w+)\s*=\s*\(/g,
                /(\w+)\s*:\s*function/g,
                /(\w+)\s*=>\s*/g
            ];
            
            functionPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    analysis.functions.push({
                        name: match[1],
                        line: content.substring(0, match.index).split('\n').length,
                        parameters: [],
                        isAsync: content.substring(match.index - 10, match.index).includes('async')
                    });
                }
            });

            // Class patterns
            const classPattern = /class\s+(\w+)/g;
            let match;
            while ((match = classPattern.exec(content)) !== null) {
                analysis.classes.push({
                    name: match[1],
                    line: content.substring(0, match.index).split('\n').length,
                    methods: []
                });
            }

            // Import patterns
            const importPatterns = [
                /import.*from\s+['"`]([^'"`]+)['"`]/g,
                /require\(['"`]([^'"`]+)['"`]\)/g
            ];
            
            importPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    analysis.imports.push({
                        module: match[1],
                        line: content.substring(0, match.index).split('\n').length,
                        type: 'import'
                    });
                }
            });
        }

        // Python patterns
        if (file.extension === 'py') {
            // Function patterns
            const funcPattern = /def\s+(\w+)/g;
            let match;
            while ((match = funcPattern.exec(content)) !== null) {
                analysis.functions.push({
                    name: match[1],
                    line: content.substring(0, match.index).split('\n').length,
                    parameters: [],
                    isAsync: content.substring(match.index - 10, match.index).includes('async')
                });
            }

            // Class patterns
            const classPattern = /class\s+(\w+)/g;
            while ((match = classPattern.exec(content)) !== null) {
                analysis.classes.push({
                    name: match[1],
                    line: content.substring(0, match.index).split('\n').length,
                    methods: []
                });
            }

            // Import patterns
            const importPattern = /(?:from\s+(\w+)\s+)?import\s+([^#\n]+)/g;
            while ((match = importPattern.exec(content)) !== null) {
                analysis.imports.push({
                    module: match[1] || match[2].trim(),
                    line: content.substring(0, match.index).split('\n').length,
                    type: 'import'
                });
            }
        }

        return analysis;
    }

    /**
     * Semantic analysis using Tree-sitter AST
     */
    analyzeAST(tree, content, file) {
        const rootNode = tree.rootNode;
        const analysis = {
            functions: [],
            classes: [],
            imports: [],
            exports: [],
            variables: [],
            calls: []
        };

        function traverse(node) {
            switch (node.type) {
                case 'function_declaration':
                case 'function_expression':
                case 'arrow_function':
                case 'method_definition':
                    analysis.functions.push({
                        name: this.extractFunctionName(node),
                        line: node.startPosition.row + 1,
                        parameters: this.extractParameters(node),
                        isAsync: this.isAsyncFunction(node)
                    });
                    break;
                    
                case 'class_declaration':
                    analysis.classes.push({
                        name: this.extractClassName(node),
                        line: node.startPosition.row + 1,
                        methods: this.extractMethods(node)
                    });
                    break;
                    
                case 'import_statement':
                case 'import_from_statement':
                    analysis.imports.push({
                        module: this.extractImportModule(node),
                        line: node.startPosition.row + 1,
                        type: 'import'
                    });
                    break;
                    
                case 'call_expression':
                    analysis.calls.push({
                        function: this.extractCallName(node),
                        line: node.startPosition.row + 1
                    });
                    break;
            }
            
            for (const child of node.children) {
                traverse(child);
            }
        }

        traverse.call(this, rootNode);
        return analysis;
    }

    /**
     * Build dependency graph for architectural understanding
     */
    async buildDependencyGraph(parsedFiles) {
        const graph = {
            nodes: [],
            edges: [],
            clusters: []
        };

        // Create nodes for each file
        for (const file of parsedFiles) {
            graph.nodes.push({
                id: file.relativePath,
                name: file.name,
                type: 'file',
                size: file.size,
                complexity: file.complexity,
                functions: file.analysis.functions.length,
                classes: file.analysis.classes.length
            });
        }

        // Create edges based on imports/requires
        for (const file of parsedFiles) {
            for (const imp of file.analysis.imports) {
                const targetPath = this.resolveImportPath(imp.module, file);
                if (targetPath) {
                    graph.edges.push({
                        source: file.relativePath,
                        target: targetPath,
                        type: 'import',
                        weight: 1
                    });
                }
            }
        }

        console.log(`🕸️  Built dependency graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
        return graph;
    }

    /**
     * Detect architectural patterns (Muratori-style semantic compression)
     */
    async detectArchitecturalPatterns(parsedFiles) {
        const patterns = {
            mvc: this.detectMVCPattern(parsedFiles),
            modules: this.detectModulePattern(parsedFiles),
            factories: this.detectFactoryPattern(parsedFiles),
            singletons: this.detectSingletonPattern(parsedFiles),
            observers: this.detectObserverPattern(parsedFiles)
        };

        console.log(`🎯 Detected architectural patterns:`, Object.keys(patterns).filter(p => patterns[p].detected));
        return patterns;
    }

    // Helper methods for AST analysis
    extractFunctionName(node) {
        const nameNode = node.children.find(child => child.type === 'identifier');
        return nameNode ? nameNode.text : 'anonymous';
    }

    extractClassName(node) {
        const nameNode = node.children.find(child => child.type === 'identifier');
        return nameNode ? nameNode.text : 'Anonymous';
    }

    extractParameters(node) {
        const params = node.children.find(child => child.type === 'formal_parameters');
        return params ? params.children.filter(c => c.type === 'identifier').map(c => c.text) : [];
    }

    isAsyncFunction(node) {
        return node.children.some(child => child.type === 'async');
    }

    extractImportModule(node) {
        const stringNode = node.children.find(child => child.type === 'string');
        return stringNode ? stringNode.text.slice(1, -1) : '';
    }

    extractCallName(node) {
        const identifierNode = node.children.find(child => child.type === 'identifier' || child.type === 'member_expression');
        return identifierNode ? identifierNode.text : '';
    }

    resolveImportPath(module, fromFile) {
        // Simple resolution - in production would use proper module resolution
        if (module.startsWith('./') || module.startsWith('../')) {
            return path.resolve(path.dirname(fromFile.path), module);
        }
        return null;
    }

    calculateComplexity(analysis) {
        // McCabe-style complexity calculation
        return analysis.functions.length + analysis.classes.length * 2 + analysis.calls.length * 0.1;
    }

    calculateMetrics(parsedFiles) {
        const totalLines = parsedFiles.reduce((sum, file) => sum + file.lineCount, 0);
        const totalFiles = parsedFiles.length;
        const totalFunctions = parsedFiles.reduce((sum, file) => sum + file.analysis.functions.length, 0);
        const totalClasses = parsedFiles.reduce((sum, file) => sum + file.analysis.classes.length, 0);
        const avgComplexity = parsedFiles.reduce((sum, file) => sum + file.complexity, 0) / totalFiles;

        return {
            totalLines,
            totalFiles,
            totalFunctions,
            totalClasses,
            avgComplexity: Math.round(avgComplexity * 100) / 100,
            languages: [...new Set(parsedFiles.map(f => f.extension))]
        };
    }

    // Pattern detection methods
    detectMVCPattern(files) {
        const hasModels = files.some(f => f.name.toLowerCase().includes('model') || f.relativePath.includes('/models/'));
        const hasViews = files.some(f => f.name.toLowerCase().includes('view') || f.relativePath.includes('/views/'));
        const hasControllers = files.some(f => f.name.toLowerCase().includes('controller') || f.relativePath.includes('/controllers/'));
        
        return {
            detected: hasModels && hasViews && hasControllers,
            confidence: (Number(hasModels) + Number(hasViews) + Number(hasControllers)) / 3,
            evidence: { hasModels, hasViews, hasControllers }
        };
    }

    detectModulePattern(files) {
        const hasExports = files.some(f => f.analysis.exports.length > 0);
        const hasImports = files.some(f => f.analysis.imports.length > 0);
        
        return {
            detected: hasExports && hasImports,
            confidence: 0.8,
            evidence: { modularStructure: true }
        };
    }

    detectFactoryPattern(files) {
        const factoryFunctions = files.flatMap(f => 
            f.analysis.functions.filter(fn => 
                fn.name.toLowerCase().includes('factory') || 
                fn.name.toLowerCase().includes('create')
            )
        );
        
        return {
            detected: factoryFunctions.length > 0,
            confidence: Math.min(factoryFunctions.length / files.length, 1),
            evidence: { factoryFunctions: factoryFunctions.length }
        };
    }

    detectSingletonPattern(files) {
        const singletonClasses = files.flatMap(f =>
            f.analysis.classes.filter(cls =>
                cls.name.toLowerCase().includes('singleton') ||
                cls.methods.some(m => m.name === 'getInstance')
            )
        );
        
        return {
            detected: singletonClasses.length > 0,
            confidence: 0.9,
            evidence: { singletonClasses: singletonClasses.length }
        };
    }

    detectObserverPattern(files) {
        const observerMethods = files.flatMap(f =>
            f.analysis.functions.filter(fn =>
                ['subscribe', 'unsubscribe', 'notify', 'addEventListener'].includes(fn.name.toLowerCase())
            )
        );
        
        return {
            detected: observerMethods.length > 0,
            confidence: Math.min(observerMethods.length / 10, 1),
            evidence: { observerMethods: observerMethods.length }
        };
    }
}