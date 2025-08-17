import axios from 'axios';

/**
 * IBM watsonx.ai integration for code intelligence
 * Uses Granite 3.3 model for semantic understanding and Q&A
 */
export class CodebaseWhisperer {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.WATSONX_API_KEY;
        this.projectId = config.projectId || process.env.WATSONX_PROJECT_ID;
        this.baseUrl = config.baseUrl || 'https://us-south.ml.cloud.ibm.com';
        this.modelId = 'ibm/granite-3-8b-instruct';
        this.maxTokens = 8000; // Increased for more detailed responses
        this.temperature = 0.2; // Slightly higher for more natural responses
        
        // Check if we should use mock responses based on demo mode or missing credentials
        const demoMode = process.env.DEMO_MODE === 'true';
        const hasCredentials = this.apiKey && this.projectId;
        
        if (demoMode || !hasCredentials) {
            if (!hasCredentials) {
                console.warn('⚠️  IBM watsonx.ai credentials not configured. Using mock responses.');
            } else {
                console.log('🎭 Demo mode enabled. Using mock responses.');
            }
            this.useMockResponses = true;
        } else {
            console.log('🧠 IBM watsonx.ai credentials configured. Using real AI.');
            this.useMockResponses = false;
        }
    }

    /**
     * Main Q&A interface - answers questions about codebase
     */
    async answerQuestion(question, codebaseContext) {
        try {
            console.log(`🤖 Processing question: "${question}"`);
            console.log(`🎭 Using mock responses: ${this.useMockResponses}`);
            console.log(`🔑 Has API key: ${!!this.apiKey}`);
            console.log(`🆔 Has project ID: ${!!this.projectId}`);
            console.log(`🎯 Demo mode env: ${process.env.DEMO_MODE}`);
            
            if (this.useMockResponses) {
                console.log('📝 Returning mock response');
                return this.generateMockResponse(question, codebaseContext);
            }

            console.log('🔥 Making REAL IBM API call');
            const prompt = this.buildCodeAnalysisPrompt(question, codebaseContext);
            console.log('📝 Built prompt:', prompt.substring(0, 200) + '...');
            
            const response = await this.callGraniteModel(prompt);
            console.log('✅ Got real IBM response:', response);
            
            return {
                question,
                answer: response.answer,
                codeExamples: response.examples || [],
                confidence: response.confidence || 0.8,
                relatedFiles: this.findRelatedFiles(question, codebaseContext),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('AI analysis failed:', error);
            return this.generateErrorResponse(question, error);
        }
    }

    /**
     * Analyze overall architecture using AI
     */
    async analyzeArchitecture(codebaseStructure) {
        try {
            console.log('🏗️  Analyzing architectural patterns with AI...');
            
            if (this.useMockResponses) {
                return this.generateMockArchitecturalAnalysis(codebaseStructure);
            }

            const prompt = this.buildArchitecturePrompt(codebaseStructure);
            const response = await this.callGraniteModel(prompt);
            
            return {
                architecturalStyle: response.style || 'Modular',
                components: response.components || [],
                patterns: response.patterns || [],
                recommendations: response.recommendations || [],
                dataFlow: response.dataFlow || [],
                criticalPaths: response.criticalPaths || [],
                confidence: response.confidence || 0.7
            };
        } catch (error) {
            console.error('Architectural analysis failed:', error);
            return this.generateDefaultArchitecture(codebaseStructure);
        }
    }

    /**
     * Generate comprehensive documentation for the entire repository
     */
    async generateComprehensiveDocumentation(codebaseContext) {
        try {
            console.log('📚 Starting comprehensive documentation generation...');
            
            if (this.useMockResponses) {
                return this.generateMockDocumentation(codebaseContext);
            }

            const prompt = this.buildDocumentationPrompt(codebaseContext);
            console.log('📝 Built documentation prompt length:', prompt.length);
            
            const response = await this.callGraniteModel(prompt);
            console.log('✅ Got comprehensive documentation from IBM API');
            
            return {
                documentation: response.answer,
                generatedAt: new Date().toISOString(),
                repository: codebaseContext.repository || {},
                confidence: response.confidence || 0.8
            };
        } catch (error) {
            console.error('Comprehensive documentation generation failed:', error);
            return this.generateDefaultDocumentation(codebaseContext);
        }
    }

    /**
     * Generate code explanations for specific functions/classes
     */
    async explainCodeSegment(codeSegment, context) {
        try {
            const prompt = this.buildCodeExplanationPrompt(codeSegment, context);
            
            if (this.useMockResponses) {
                return this.generateMockExplanation(codeSegment);
            }

            const response = await this.callGraniteModel(prompt);
            
            return {
                summary: response.summary,
                purpose: response.purpose,
                parameters: response.parameters || [],
                dependencies: response.dependencies || [],
                complexity: response.complexity || 'Medium',
                suggestions: response.suggestions || []
            };
        } catch (error) {
            console.error('Code explanation failed:', error);
            return this.generateDefaultExplanation(codeSegment);
        }
    }

    /**
     * Get IBM Cloud access token using API key
     */
    async getAccessToken() {
        try {
            const response = await axios.post(
                'https://iam.cloud.ibm.com/identity/token',
                'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=' + this.apiKey,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                }
            );
            
            return response.data.access_token;
        } catch (error) {
            console.error('Failed to get IBM Cloud access token:', error.response?.data || error.message);
            throw new Error('Authentication failed - check your IBM API key');
        }
    }

    /**
     * Call IBM watsonx.ai Granite 3.3 model
     */
    async callGraniteModel(prompt) {
        try {
            console.log('🔐 Getting IBM access token...');
            // First get an access token
            const accessToken = await this.getAccessToken();
            console.log('✅ Got access token:', accessToken.substring(0, 50) + '...');
            
            console.log('📤 Making IBM watsonx.ai API call...');
            const payload = {
                input: prompt,
                parameters: {
                    decoding_method: 'greedy',
                    max_new_tokens: this.maxTokens,
                    temperature: this.temperature,
                    stop_sequences: []  // Remove stop sequences that might cut off responses
                },
                model_id: this.modelId,
                project_id: this.projectId
            };
            console.log('📋 API payload:', JSON.stringify(payload, null, 2));
            
            const response = await axios.post(
                `${this.baseUrl}/ml/v1/text/generation?version=2023-05-29`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('📥 IBM API response status:', response.status);
            console.log('📄 IBM API response data:', response.data);
            
            const generatedText = response.data.results[0].generated_text;
            console.log('🎯 Generated text length:', generatedText.length);
            console.log('🎯 Generated text preview:', generatedText.substring(0, 200) + '...');
            console.log('🎯 Generated text ending:', generatedText.substring(Math.max(0, generatedText.length - 200)));
            
            const parsedResponse = this.parseAIResponse(generatedText);
            console.log('🔄 Parsed response:', parsedResponse);
            
            return parsedResponse;
        } catch (error) {
            console.error('IBM watsonx.ai API call failed:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
            throw error;
        }
    }

    /**
     * Build structured prompt for code analysis
     */
    buildCodeAnalysisPrompt(question, codebaseContext) {
        const repository = codebaseContext.repository || {};
        const metrics = codebaseContext.metrics || {};
        const patterns = codebaseContext.patterns || {};
        const files = codebaseContext.files || [];

        // Get actual repository information
        let repoContext = '';
        if (repository.type === 'github') {
            const repoName = repository.name || repository.url?.split('/').pop();
            repoContext = `
REPOSITORY INFORMATION:
- Name: ${repoName}
- Type: GitHub Repository
- URL: ${repository.url}
- Languages: ${metrics.languages?.join(', ') || 'Multiple'}
- Files: ${metrics.totalFiles || 0} files analyzed
- Functions: ${metrics.totalFunctions || 0}
- Classes: ${metrics.totalClasses || 0}
`;
        } else if (repository.type === 'upload') {
            // Add context for uploaded repositories
            const projectName = repository.name || 'Uploaded Project';
            const primaryLanguage = metrics.languages?.[0] || 'Multiple';
            repoContext = `
REPOSITORY INFORMATION:
- Name: ${projectName}
- Type: Local Upload
- Primary Language: ${primaryLanguage}
- Languages: ${metrics.languages?.join(', ') || 'Multiple'}
- Files: ${metrics.totalFiles || 0} files analyzed
- Functions: ${metrics.totalFunctions || 0}
- Classes: ${metrics.totalClasses || 0}
- Lines of Code: ${metrics.totalLines || 0}
`;
        }

        // Send ALL files to Watson - let it understand what's relevant
        // Watson is smart enough to handle large contexts and understand repository structure
        const filesToShow = files; // Include ALL files - no arbitrary limits
        const sampleFiles = filesToShow.map(file => {
            const fullPath = file.relativePath || file.name;
            const extension = file.extension || 'unknown';
            const fileSize = file.size || (file.content?.length || 0);
            
            let fileInfo = `
═══════════════════════════════════════
📁 PATH: ${fullPath}
📄 TYPE: ${extension} file
📏 SIZE: ${fileSize} bytes (${file.lineCount || 0} lines)`;

            // Add function and class details if available
            if (Array.isArray(file.analysis?.functions) && file.analysis.functions.length > 0) {
                fileInfo += `\n🔧 FUNCTIONS: ${file.analysis.functions.slice(0, 8).map(f => f.name || 'unnamed').join(', ')}`;
            }
            if (Array.isArray(file.analysis?.classes) && file.analysis.classes.length > 0) {
                fileInfo += `\n🏗️  CLASSES: ${file.analysis.classes.slice(0, 5).map(c => c.name || 'unnamed').join(', ')}`;
            }
            if (Array.isArray(file.analysis?.imports) && file.analysis.imports.length > 0) {
                fileInfo += `\n📦 IMPORTS: ${file.analysis.imports.slice(0, 8).join(', ')}`;
            }
            
            // Include content for ALL files - let Watson decide what's relevant
            if (file.content && file.content.length > 0) {
                // For binary files, just show file type
                if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif') {
                    fileInfo += `\n📷 CONTENT: [Binary image file - ${extension.toUpperCase()}]`;
                } else if (extension === 'pyc' || file.name.includes('.cpython-')) {
                    fileInfo += `\n🔧 CONTENT: [Compiled Python bytecode]`;
                } else {
                    // For text files, include meaningful content - scale based on file importance
                    const fileName = (file.name || '').toLowerCase();
                    const isImportant = fileName.includes('readme') || fileName.includes('main') || fileName.includes('index') || fileName.includes('config') || extension === 'md';
                    const maxContent = isImportant ? 1500 : 600; // More for important files
                    const actualContent = Math.min(file.content.length, maxContent);
                    const preview = file.content.substring(0, actualContent);
                    fileInfo += `\n📝 CONTENT:\n${preview}${file.content.length > maxContent ? '\n...[TRUNCATED]' : ''}`;
                }
                console.log(`📄 Adding ${file.name}: ${file.content.length} chars`);
            } else {
                fileInfo += `\n❌ CONTENT: [Empty or no content]`;
                console.log(`⚠️  No content for ${file.name}`);
            }
            
            return fileInfo;
        }).join('\n');

        // Add comprehensive file summary
        const fileSummary = `
COMPREHENSIVE FILE OVERVIEW:
- Total Files Available: ${files.length}
- Files Shown Below: ${filesToShow.length}
- Key File Types: ${[...new Set(filesToShow.map(f => f.extension))].filter(Boolean).join(', ')}
- Main Code Files: ${filesToShow.filter(f => ['js', 'py', 'ts', 'jsx', 'tsx'].includes(f.extension)).length}
- Documentation Files: ${filesToShow.filter(f => ['md', 'txt'].includes(f.extension)).length}
`;

        return `You are a senior software engineer and codebase assistant. You have COMPLETE CONTEXT of this entire codebase and can provide detailed, specific answers about the code, architecture, and functionality.

${repoContext}
${fileSummary}

DETAILED CODEBASE CONTEXT:
${sampleFiles}

USER QUESTION: "${question}"

How to respond:
- Answer naturally and conversationally like a helpful colleague
- For code questions: Reference specific files, functions, and patterns you see
- For general questions: Answer normally without forcing code references  
- Be practical and actionable in your advice
- If you don't see relevant code for the question, say so honestly

Answer the question helpfully:`;
    }

    /**
     * Build prompt for architectural analysis
     */
    buildArchitecturePrompt(codebaseStructure) {
        const files = codebaseStructure.files || [];
        const dependencies = codebaseStructure.dependencies || { nodes: [], edges: [] };
        const metrics = codebaseStructure.metrics || {};

        return `Analyze this codebase architecture and provide insights as a senior architect.

CODEBASE OVERVIEW:
- ${metrics.totalFiles} files across ${metrics.languages?.length || 1} languages
- ${metrics.totalFunctions} functions, ${metrics.totalClasses} classes
- Average complexity: ${metrics.avgComplexity}

FILE STRUCTURE:
${files.slice(0, 20).map(f => `${f.relativePath} (${f.analysis?.functions?.length || 0} functions, ${f.analysis?.classes?.length || 0} classes)`).join('\n')}

DEPENDENCY GRAPH:
- ${dependencies.nodes.length} components
- ${dependencies.edges.length} dependencies

Analyze and provide:
1. Primary architectural style/pattern
2. Key components and their responsibilities  
3. Data flow patterns
4. Code organization quality
5. Potential improvements

JSON Response:
{
  "style": "Architectural pattern name",
  "components": [{"name": "Component", "responsibility": "What it does", "files": ["list"]}],
  "patterns": ["Design patterns found"],
  "dataFlow": ["How data moves through system"],
  "recommendations": ["Specific improvements"],
  "confidence": 0.7
}`;
    }

    /**
     * Build prompt for comprehensive documentation generation
     */
    buildDocumentationPrompt(codebaseContext) {
        const repository = codebaseContext.repository || {};
        const metrics = codebaseContext.metrics || {};
        const files = codebaseContext.files || [];
        
        // Use the same file processing as questions to get complete context
        const prompt = this.buildCodeAnalysisPrompt("Generate comprehensive documentation for this repository", codebaseContext);
        
        // Replace the question part with documentation instructions
        return prompt.replace(
            /USER QUESTION: "Generate comprehensive documentation for this repository"/,
            `DOCUMENTATION GENERATION REQUEST:

Create comprehensive, professional documentation for this repository including:

1. **PROJECT OVERVIEW**
   - What this project does
   - Key features and capabilities
   - Target audience/use cases

2. **ARCHITECTURE & STRUCTURE**
   - Overall architecture pattern
   - Directory structure explanation
   - Key components and their roles
   - Data flow and interactions

3. **TECHNICAL DETAILS**
   - Programming languages and frameworks used
   - Dependencies and external libraries
   - Configuration files and their purposes
   - Database schema (if applicable)

4. **API DOCUMENTATION** (if applicable)
   - Endpoints and their functions
   - Request/response formats
   - Authentication mechanisms

5. **SETUP & INSTALLATION**
   - Prerequisites
   - Installation steps
   - Configuration requirements
   - Environment variables

6. **USAGE EXAMPLES**
   - Common use cases
   - Code examples
   - Integration examples

7. **FILE STRUCTURE GUIDE**
   - Detailed explanation of each major file/directory
   - Purpose and functionality of key files
   - How files interact with each other

8. **DEVELOPMENT GUIDE**
   - How to contribute
   - Coding standards
   - Testing procedures
   - Deployment process

Generate professional, markdown-formatted documentation that would help both developers and users understand and work with this codebase.`
        );
    }

    /**
     * Build prompt for code explanation
     */
    buildCodeExplanationPrompt(codeSegment, context) {
        return `Explain this code segment like a senior developer mentor:

CODE CONTEXT:
File: ${context.filePath || 'Unknown'}
Language: ${context.language || 'JavaScript'}

CODE:
\`\`\`${context.language || 'javascript'}
${codeSegment}
\`\`\`

Provide a clear explanation including:
1. What this code does (purpose)
2. How it works (mechanism)
3. Parameters and return values
4. Dependencies and relationships
5. Complexity assessment
6. Potential improvements

JSON Response:
{
  "summary": "One-line description",
  "purpose": "Detailed purpose explanation",
  "parameters": [{"name": "param", "type": "string", "description": "what it does"}],
  "dependencies": ["External dependencies"],
  "complexity": "Low|Medium|High",
  "suggestions": ["Improvement suggestions"]
}`;
    }

    /**
     * Parse AI response from text
     */
    parseAIResponse(text) {
        // Since we're no longer using JSON format, return the text directly
        return {
            answer: text.trim(),
            confidence: 0.8,
            codeExamples: [], // We can enhance this later to extract code blocks
            examples: []
        };
    }

    /**
     * Filter files to only include those useful for AI analysis
     */
    filterFilesForAI(files) {
        const binaryExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'zip', 'tar', 'gz', 'exe', 'dll', 'so', 'dylib'];
        const importantExtensions = ['md', 'js', 'py', 'ts', 'jsx', 'tsx', 'json', 'yml', 'yaml', 'txt', 'html', 'css', 'sql', 'sh', 'bat', 'env'];
        
        return files
            .filter(file => {
                const ext = (file.extension || '').toLowerCase();
                const fileName = (file.name || '').toLowerCase();
                
                // Skip true binary files (images, executables, etc.)
                if (binaryExtensions.includes(ext)) return false;
                
                // Skip compiled Python files
                if (ext === 'pyc' || fileName.includes('.cpython-')) return false;
                
                // Skip cache directories but keep the files themselves
                if (fileName.includes('__pycache__') || fileName.includes('node_modules') || fileName.includes('.git/')) return false;
                
                // Include ALL text-based files, even if they're small or empty
                // Empty __init__.py files are important for Python packages
                return true;
            })
            .sort((a, b) => {
                // Prioritize important files
                const aExt = (a.extension || '').toLowerCase();
                const bExt = (b.extension || '').toLowerCase();
                const aName = (a.name || '').toLowerCase();
                const bName = (b.name || '').toLowerCase();
                
                // README files first
                if (aName.includes('readme') && !bName.includes('readme')) return -1;
                if (bName.includes('readme') && !aName.includes('readme')) return 1;
                
                // Main/index files next
                if ((aName.includes('main') || aName.includes('index')) && 
                    !(bName.includes('main') || bName.includes('index'))) return -1;
                if ((bName.includes('main') || bName.includes('index')) && 
                    !(aName.includes('main') || aName.includes('index'))) return 1;
                
                // Important extensions next
                const aImportant = importantExtensions.includes(aExt);
                const bImportant = importantExtensions.includes(bExt);
                if (aImportant && !bImportant) return -1;
                if (bImportant && !aImportant) return 1;
                
                return 0;
            });
    }

    /**
     * Select most relevant files for the question
     */
    selectRelevantFiles(question, codebaseContext) {
        const files = codebaseContext.files || [];
        const questionLower = question.toLowerCase();
        const questionWords = questionLower.split(' ').filter(word => word.length > 2);
        
        // Enhanced relevance scoring
        const scoredFiles = files.map(file => {
            let score = 0;
            const fileName = file.name.toLowerCase();
            const relativePath = (file.relativePath || '').toLowerCase();
            
            // Exact file name match (highest priority)
            if (questionWords.some(word => fileName.includes(word))) score += 10;
            
            // File extension relevance
            const fileExt = file.extension?.toLowerCase();
            if (questionLower.includes(fileExt)) score += 5;
            
            // Path relevance
            if (questionWords.some(word => relativePath.includes(word))) score += 3;
            
            // Function name relevance
            const functionNames = Array.isArray(file.analysis?.functions) ? 
                file.analysis.functions.map(f => (f.name || '').toLowerCase()) : [];
            if (functionNames.some(name => questionWords.some(word => name.includes(word)))) score += 6;
            
            // Class name relevance
            const classNames = Array.isArray(file.analysis?.classes) ? 
                file.analysis.classes.map(c => (c.name || '').toLowerCase()) : [];
            if (classNames.some(name => questionWords.some(word => name.includes(word)))) score += 6;
            
            // Content relevance (if available)
            if (file.content && questionWords.some(word => file.content.toLowerCase().includes(word))) score += 2;
            
            // Prioritize important file types
            if (fileName.includes('readme') || fileName.includes('main') || fileName.includes('index')) score += 1;
            
            return { ...file, relevanceScore: score };
        });
        
        return scoredFiles
            .filter(f => f.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 8); // Increased to 8 relevant files
    }

    /**
     * Find files related to the question
     */
    findRelatedFiles(question, codebaseContext) {
        const relevantFiles = this.selectRelevantFiles(question, codebaseContext);
        return relevantFiles.map(f => ({
            path: f.relativePath,
            relevance: f.relevanceScore,
            functions: Array.isArray(f.analysis?.functions) ? f.analysis.functions.length : 0,
            classes: Array.isArray(f.analysis?.classes) ? f.analysis.classes.length : 0
        }));
    }

    // Mock responses for demo purposes
    generateMockResponse(question, codebaseContext) {
        const mockResponses = {
            'authentication': {
                answer: 'This codebase implements JWT-based authentication with a middleware pattern. The auth flow starts in auth.js with login validation, generates tokens using jsonwebtoken, and protects routes through authMiddleware.js.',
                examples: [
                    {
                        file: 'auth/authMiddleware.js',
                        code: 'const jwt = require("jsonwebtoken");\n\nfunction authenticateToken(req, res, next) {\n  const authHeader = req.headers["authorization"];\n  const token = authHeader && authHeader.split(" ")[1];\n  \n  if (!token) return res.sendStatus(401);\n  \n  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {\n    if (err) return res.sendStatus(403);\n    req.user = user;\n    next();\n  });\n}',
                        explanation: 'Middleware function that validates JWT tokens on protected routes'
                    }
                ],
                confidence: 0.9
            },
            'default': {
                answer: `Based on the codebase analysis, this appears to be a ${codebaseContext.metrics?.languages?.[0] || 'JavaScript'} application with ${codebaseContext.metrics?.totalFiles || 0} files. The architecture follows a modular pattern with clear separation of concerns.`,
                examples: [],
                confidence: 0.7
            }
        };

        const questionKey = Object.keys(mockResponses).find(key => 
            question.toLowerCase().includes(key)
        ) || 'default';

        return {
            question,
            ...mockResponses[questionKey],
            relatedFiles: this.findRelatedFiles(question, codebaseContext),
            timestamp: new Date().toISOString()
        };
    }

    generateMockArchitecturalAnalysis(codebaseStructure) {
        return {
            architecturalStyle: 'Modular Monolith',
            components: [
                {
                    name: 'Authentication System',
                    responsibility: 'User authentication and authorization',
                    files: ['auth/', 'middleware/']
                },
                {
                    name: 'Data Layer',
                    responsibility: 'Database operations and models',
                    files: ['models/', 'database/']
                },
                {
                    name: 'API Layer',
                    responsibility: 'REST API endpoints and routing',
                    files: ['routes/', 'controllers/']
                }
            ],
            patterns: ['Middleware Pattern', 'Module Pattern', 'MVC'],
            dataFlow: [
                'Request → Router → Controller → Service → Model → Database',
                'Authentication middleware intercepts protected routes',
                'Error handling middleware catches and formats errors'
            ],
            recommendations: [
                'Consider implementing input validation middleware',
                'Add comprehensive error logging',
                'Implement API rate limiting',
                'Add automated testing for critical paths'
            ],
            confidence: 0.8
        };
    }

    generateMockExplanation(codeSegment) {
        return {
            summary: 'Function that processes data with error handling',
            purpose: 'This code segment appears to be a utility function that processes input data, validates it, and returns a transformed result with proper error handling.',
            parameters: [
                { name: 'data', type: 'object', description: 'Input data to be processed' },
                { name: 'options', type: 'object', description: 'Configuration options for processing' }
            ],
            dependencies: ['Built-in JavaScript functions', 'Error handling utilities'],
            complexity: 'Medium',
            suggestions: [
                'Add input validation',
                'Consider using TypeScript for better type safety',
                'Add unit tests for edge cases'
            ]
        };
    }

    generateErrorResponse(question, error) {
        return {
            question,
            answer: `I encountered an error while analyzing your question: ${error.message}. This might be due to API limitations or network issues. Please try again or rephrase your question.`,
            examples: [],
            confidence: 0.1,
            relatedFiles: [],
            error: true,
            timestamp: new Date().toISOString()
        };
    }

    generateDefaultArchitecture(codebaseStructure) {
        return {
            architecturalStyle: 'Unknown',
            components: [],
            patterns: [],
            dataFlow: [],
            recommendations: ['Configure IBM watsonx.ai for detailed analysis'],
            confidence: 0.1
        };
    }

    generateDefaultExplanation(codeSegment) {
        return {
            summary: 'Code analysis unavailable',
            purpose: 'Configure IBM watsonx.ai for detailed code explanations',
            parameters: [],
            dependencies: [],
            complexity: 'Unknown',
            suggestions: ['Set up AI integration for detailed analysis']
        };
    }

    generateMockDocumentation(codebaseContext) {
        const repository = codebaseContext.repository || {};
        const metrics = codebaseContext.metrics || {};
        
        return {
            documentation: `# ${repository.name || 'Project'} Documentation

## Project Overview
This is a comprehensive documentation for the ${repository.name || 'project'} repository. The project contains ${metrics.totalFiles || 0} files with ${metrics.totalFunctions || 0} functions across ${metrics.languages?.join(', ') || 'multiple languages'}.

## Architecture
The project follows a modular architecture with clear separation of concerns.

## Technical Stack
- Languages: ${metrics.languages?.join(', ') || 'Multiple'}
- Total Lines of Code: ${metrics.totalLines || 0}

## Getting Started
1. Clone the repository
2. Install dependencies
3. Run the application

*Note: This is a mock documentation. Configure IBM watsonx.ai for detailed documentation generation.*`,
            generatedAt: new Date().toISOString(),
            repository,
            confidence: 0.5
        };
    }

    generateDefaultDocumentation(codebaseContext) {
        return {
            documentation: '# Documentation Generation Failed\n\nUnable to generate documentation. Please check your IBM watsonx.ai configuration.',
            generatedAt: new Date().toISOString(),
            repository: codebaseContext.repository || {},
            confidence: 0.1
        };
    }
}