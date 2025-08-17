import { CodebaseScanner } from './parsers/CodebaseScanner.js';
import { CodebaseWhisperer } from './ai/CodebaseWhisperer.js';
import { ArchitectureVisualizer } from './visualization/ArchitectureVisualizer.js';

/**
 * Main application class - The Codebase Whisperer
 * Orchestrates parsing, AI analysis, and visualization
 */
class CodebaseWhispererApp {
    constructor() {
        this.scanner = new CodebaseScanner();
        this.whisperer = new CodebaseWhisperer();
        this.visualizer = new ArchitectureVisualizer();
        this.currentAnalysis = null;
        this.isAnalyzing = false;
        
        this.initializeUI();
        console.log('🧠 Codebase Whisperer initialized');
    }

    initializeUI() {
        // Repository analysis button
        window.analyzeRepository = () => this.analyzeRepository();
        
        // AI question handler
        window.askQuestion = () => this.askQuestion();
        
        // File upload handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                this.handleFileUpload(event);
            });
        }

        // Demo data button for testing
        this.addDemoButton();
    }

    async analyzeRepository() {
        if (this.isAnalyzing) {
            console.log('Analysis already in progress...');
            return;
        }

        const repoUrl = document.getElementById('repoUrl')?.value;
        const fileInput = document.getElementById('fileInput');
        
        if (!repoUrl && (!fileInput || !fileInput.files.length)) {
            this.showMessage('Please provide a repository URL or upload files', 'warning');
            return;
        }

        try {
            this.isAnalyzing = true;
            this.showMessage('🔍 Analyzing codebase...', 'info');
            this.showLoadingState(true);

            let analysisResult;

            if (repoUrl) {
                // For demo purposes, we'll simulate GitHub analysis
                analysisResult = await this.analyzeGitHubRepo(repoUrl);
            } else {
                // Handle file upload
                analysisResult = await this.analyzeUploadedFiles(fileInput.files);
            }

            this.currentAnalysis = analysisResult;
            await this.displayAnalysisResults(analysisResult);
            
            this.showMessage('✅ Analysis complete!', 'success');
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showMessage(`❌ Analysis failed: ${error.message}`, 'error');
        } finally {
            this.isAnalyzing = false;
            this.showLoadingState(false);
        }
    }

    async analyzeGitHubRepo(repoUrl) {
        // For demo purposes, create a mock analysis
        console.log(`Analyzing GitHub repository: ${repoUrl}`);
        
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate demo analysis based on repo URL
        const repoName = repoUrl.split('/').pop() || 'demo-repo';
        
        return {
            repository: {
                type: 'github',
                url: repoUrl,
                name: repoName,
                analyzedAt: new Date().toISOString()
            },
            files: this.generateDemoFiles(repoName),
            dependencies: this.generateDemoDependencies(),
            patterns: this.generateDemoPatterns(),
            metrics: {
                totalLines: 15420,
                totalFiles: 67,
                totalFunctions: 234,
                totalClasses: 45,
                avgComplexity: 2.3,
                languages: ['js', 'ts', 'py']
            }
        };
    }

    async analyzeUploadedFiles(files) {
        console.log(`Analyzing ${files.length} uploaded files`);
        
        // In a real implementation, this would process the uploaded files
        // For demo, we'll create a mock analysis
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            repository: {
                type: 'upload',
                fileCount: files.length,
                analyzedAt: new Date().toISOString()
            },
            files: Array.from(files).map((file, index) => ({
                name: file.name,
                path: file.name,
                size: file.size,
                type: file.name.split('.').pop(),
                analysis: {
                    functions: Math.floor(Math.random() * 10) + 1,
                    classes: Math.floor(Math.random() * 5),
                    imports: Math.floor(Math.random() * 8)
                }
            })),
            dependencies: this.generateDemoDependencies(),
            patterns: this.generateDemoPatterns(),
            metrics: {
                totalLines: Math.floor(Math.random() * 10000) + 5000,
                totalFiles: files.length,
                totalFunctions: Math.floor(Math.random() * 200) + 100,
                totalClasses: Math.floor(Math.random() * 50) + 20,
                avgComplexity: (Math.random() * 3 + 1).toFixed(1),
                languages: [...new Set(Array.from(files).map(f => f.name.split('.').pop()))]
            }
        };
    }

    async displayAnalysisResults(analysis) {
        // Show results section
        const resultsSection = document.getElementById('analysisResults');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        // Update metrics display
        this.updateMetricsDisplay(analysis.metrics);
        
        // Generate architectural insights using AI
        const architecturalInsights = await this.whisperer.analyzeArchitecture(analysis);
        this.displayArchitecturalInsights(architecturalInsights);
        
        // Create visualization
        this.visualizer.generateArchitectureDiagram(analysis);
        
        console.log('📊 Analysis results displayed');
    }

    updateMetricsDisplay(metrics) {
        const metricsHtml = `
            <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div class="metric-card">
                    <div class="metric-value" style="font-size: 2rem; font-weight: 700; color: var(--claude-amber);">${metrics.totalFiles}</div>
                    <div class="metric-label" style="color: var(--claude-text-secondary);">Files</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="font-size: 2rem; font-weight: 700; color: var(--claude-amber);">${metrics.totalFunctions}</div>
                    <div class="metric-label" style="color: var(--claude-text-secondary);">Functions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="font-size: 2rem; font-weight: 700; color: var(--claude-amber);">${metrics.totalClasses}</div>
                    <div class="metric-label" style="color: var(--claude-text-secondary);">Classes</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="font-size: 2rem; font-weight: 700; color: var(--claude-amber);">${metrics.totalLines.toLocaleString()}</div>
                    <div class="metric-label" style="color: var(--claude-text-secondary);">Lines of Code</div>
                </div>
            </div>
            
            <div class="languages-display" style="margin: 1rem 0;">
                <strong>Languages:</strong> 
                ${metrics.languages.map(lang => `<span class="language-tag" style="background: var(--claude-cream); color: var(--claude-amber-dark); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; margin-right: 0.5rem;">${lang.toUpperCase()}</span>`).join('')}
            </div>
        `;

        const visualizationDiv = document.getElementById('architectureVisualization');
        if (visualizationDiv) {
            visualizationDiv.innerHTML = metricsHtml + visualizationDiv.innerHTML;
        }
    }

    displayArchitecturalInsights(insights) {
        const insightsHtml = `
            <div class="architecture-insights" style="margin: 2rem 0;">
                <h3 style="color: var(--claude-text-primary); margin-bottom: 1rem;">🏗️ Architectural Analysis</h3>
                
                <div class="insight-card" style="background: var(--claude-surface-elevated); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 0.5rem;">Architecture Style</h4>
                    <p style="color: var(--claude-text-secondary);">${insights.architecturalStyle}</p>
                </div>
                
                <div class="insight-card" style="background: var(--claude-surface-elevated); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 0.5rem;">Key Components</h4>
                    <ul style="color: var(--claude-text-secondary); margin-left: 1rem;">
                        ${insights.components.map(comp => `<li><strong>${comp.name}</strong>: ${comp.responsibility}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-card" style="background: var(--claude-surface-elevated); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 0.5rem;">Design Patterns</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${insights.patterns.map(pattern => `<span class="pattern-tag" style="background: var(--claude-amber); color: white; padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.875rem;">${pattern}</span>`).join('')}
                    </div>
                </div>
                
                ${insights.recommendations.length > 0 ? `
                <div class="insight-card" style="background: var(--claude-surface-elevated); padding: 1.5rem; border-radius: 8px;">
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 0.5rem;">💡 Recommendations</h4>
                    <ul style="color: var(--claude-text-secondary); margin-left: 1rem;">
                        ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;

        const visualizationDiv = document.getElementById('architectureVisualization');
        if (visualizationDiv) {
            visualizationDiv.innerHTML += insightsHtml;
        }
    }

    async askQuestion() {
        const questionInput = document.getElementById('queryInput');
        const responseDiv = document.getElementById('aiResponse');
        const responseContent = document.getElementById('responseContent');
        
        if (!questionInput || !responseDiv || !responseContent) {
            console.error('UI elements not found');
            return;
        }

        const question = questionInput.value.trim();
        if (!question) {
            this.showMessage('Please enter a question', 'warning');
            return;
        }

        if (!this.currentAnalysis) {
            this.showMessage('Please analyze a repository first', 'warning');
            return;
        }

        try {
            this.showMessage('🤖 AI is analyzing your question...', 'info');
            responseDiv.style.display = 'block';
            responseContent.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div> Thinking...';

            const response = await this.whisperer.answerQuestion(question, this.currentAnalysis);
            
            const responseHtml = `
                <div class="ai-answer">
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 1rem;">Answer:</h4>
                    <p style="color: var(--claude-text-primary); line-height: 1.6; margin-bottom: 1.5rem;">${response.answer}</p>
                    
                    ${response.codeExamples.length > 0 ? `
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 1rem;">Code Examples:</h4>
                    ${response.codeExamples.map(example => `
                        <div style="margin-bottom: 1rem;">
                            <div style="font-weight: 500; color: var(--claude-text-secondary); margin-bottom: 0.5rem;">${example.file}</div>
                            <pre style="background: var(--claude-text-primary); color: var(--claude-cream); padding: 1rem; border-radius: 4px; overflow-x: auto; font-family: var(--font-mono); font-size: 0.875rem;"><code>${example.code}</code></pre>
                            <p style="color: var(--claude-text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">${example.explanation}</p>
                        </div>
                    `).join('')}
                    ` : ''}
                    
                    ${response.relatedFiles.length > 0 ? `
                    <h4 style="color: var(--claude-amber-dark); margin-bottom: 1rem;">Related Files:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${response.relatedFiles.map(file => `
                            <span style="background: var(--claude-cream); color: var(--claude-amber-dark); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">${file.path}</span>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--claude-text-muted);">
                        Confidence: ${(response.confidence * 100).toFixed(0)}%
                    </div>
                </div>
            `;

            responseContent.innerHTML = responseHtml;
            this.showMessage('✅ Question answered!', 'success');

        } catch (error) {
            console.error('Question answering failed:', error);
            responseContent.innerHTML = `<p style="color: var(--claude-accent);">Error: ${error.message}</p>`;
            this.showMessage('❌ Failed to answer question', 'error');
        }
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            console.log(`Selected ${files.length} files for analysis`);
            this.showMessage(`📁 Selected ${files.length} files`, 'info');
        }
    }

    showMessage(message, type = 'info') {
        // Create or update message display
        let messageDiv = document.getElementById('messageDisplay');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'messageDisplay';
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-weight: 500;
                z-index: 1000;
                max-width: 400px;
                box-shadow: var(--shadow-lg);
            `;
            document.body.appendChild(messageDiv);
        }

        const styles = {
            info: 'background: var(--claude-surface-elevated); color: var(--claude-text-primary); border: 1px solid var(--claude-border);',
            success: 'background: var(--claude-success); color: white;',
            warning: 'background: var(--claude-amber); color: white;',
            error: 'background: var(--claude-accent); color: white;'
        };

        messageDiv.style.cssText += styles[type] || styles.info;
        messageDiv.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    showLoadingState(isLoading) {
        const buttons = document.querySelectorAll('.btn-primary');
        buttons.forEach(btn => {
            if (isLoading) {
                btn.disabled = true;
                btn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div> Analyzing...';
            } else {
                btn.disabled = false;
                // Restore original text
                if (btn.onclick === analyzeRepository) {
                    btn.innerHTML = '🔍 Analyze Codebase';
                } else if (btn.onclick === askQuestion) {
                    btn.innerHTML = '💬 Get Answer';
                }
            }
        });
    }

    addDemoButton() {
        // Add demo button for testing
        const demoButton = document.createElement('button');
        demoButton.className = 'btn btn-secondary';
        demoButton.innerHTML = '🎭 Load Demo Data';
        demoButton.onclick = () => this.loadDemoData();
        demoButton.style.cssText = 'margin: 1rem; position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
        document.body.appendChild(demoButton);
    }

    async loadDemoData() {
        this.showMessage('Loading demo data...', 'info');
        
        // Set demo repo URL
        const repoInput = document.getElementById('repoUrl');
        if (repoInput) {
            repoInput.value = 'https://github.com/facebook/react';
        }
        
        // Trigger analysis
        await this.analyzeRepository();
    }

    // Demo data generators
    generateDemoFiles(repoName) {
        const fileTypes = ['js', 'ts', 'jsx', 'tsx', 'py'];
        const files = [];
        
        for (let i = 0; i < 15; i++) {
            const type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
            files.push({
                name: `file${i + 1}.${type}`,
                relativePath: `src/components/file${i + 1}.${type}`,
                size: Math.floor(Math.random() * 5000) + 500,
                extension: type,
                analysis: {
                    functions: Math.floor(Math.random() * 8) + 1,
                    classes: Math.floor(Math.random() * 3),
                    imports: Math.floor(Math.random() * 6),
                    exports: Math.floor(Math.random() * 4)
                },
                lineCount: Math.floor(Math.random() * 200) + 50,
                complexity: (Math.random() * 3 + 1).toFixed(1)
            });
        }
        
        return files;
    }

    generateDemoDependencies() {
        return {
            nodes: [
                { id: 'src/app.js', type: 'file', size: 1200 },
                { id: 'src/components/Header.jsx', type: 'file', size: 800 },
                { id: 'src/utils/helpers.js', type: 'file', size: 600 },
                { id: 'src/api/client.js', type: 'file', size: 1000 }
            ],
            edges: [
                { source: 'src/app.js', target: 'src/components/Header.jsx', type: 'import' },
                { source: 'src/app.js', target: 'src/utils/helpers.js', type: 'import' },
                { source: 'src/components/Header.jsx', target: 'src/api/client.js', type: 'import' }
            ]
        };
    }

    generateDemoPatterns() {
        return {
            mvc: { detected: true, confidence: 0.8 },
            modules: { detected: true, confidence: 0.9 },
            factories: { detected: false, confidence: 0.2 },
            singletons: { detected: true, confidence: 0.6 },
            observers: { detected: true, confidence: 0.7 }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codebaseWhisperer = new CodebaseWhispererApp();
});

export default CodebaseWhispererApp;