/**
 * Interactive architecture visualization using D3.js
 * Claude-inspired design with amber/brown color scheme
 */
export class ArchitectureVisualizer {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.colors = {
            primary: '#D97706',
            secondary: '#F59E0B',
            dark: '#B45309',
            brown: '#78716C',
            cream: '#FEF7ED',
            surface: '#FFFBEB',
            text: '#1C1917'
        };
        this.svg = null;
        this.simulation = null;
    }

    /**
     * Generate interactive architecture diagram
     */
    generateArchitectureDiagram(codebaseStructure) {
        console.log('🎨 Generating architecture visualization...');
        
        const container = document.getElementById('architectureVisualization');
        if (!container) {
            console.error('Visualization container not found');
            return;
        }

        // Clear existing visualization
        const existingViz = container.querySelector('.architecture-viz');
        if (existingViz) {
            existingViz.remove();
        }

        // Create visualization container
        const vizContainer = document.createElement('div');
        vizContainer.className = 'architecture-viz';
        vizContainer.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            margin: 2rem 0;
            overflow: hidden;
        `;

        // Add visualization header
        const header = this.createVisualizationHeader(codebaseStructure);
        vizContainer.appendChild(header);

        // Create main visualization area
        const vizArea = document.createElement('div');
        vizArea.style.cssText = 'padding: 1rem;';

        // Create tabs for different views
        const tabs = this.createVisualizationTabs();
        vizArea.appendChild(tabs);

        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.id = 'vizTabContent';
        vizArea.appendChild(tabContent);

        vizContainer.appendChild(vizArea);
        container.appendChild(vizContainer);

        // Initialize with dependency graph view
        this.showDependencyGraph(codebaseStructure);
    }

    createVisualizationHeader(codebaseStructure) {
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.dark} 100%);
            color: white;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h3');
        title.textContent = '🏗️ Architecture Visualization';
        title.style.cssText = 'margin: 0; font-size: 1.25rem; font-weight: 600;';

        const stats = document.createElement('div');
        stats.style.cssText = 'display: flex; gap: 2rem; font-size: 0.875rem;';
        
        const metrics = codebaseStructure.metrics || {};
        stats.innerHTML = `
            <span>📁 ${metrics.totalFiles || 0} files</span>
            <span>⚡ ${metrics.totalFunctions || 0} functions</span>
            <span>🎯 ${metrics.totalClasses || 0} classes</span>
        `;

        header.appendChild(title);
        header.appendChild(stats);
        return header;
    }

    createVisualizationTabs() {
        const tabContainer = document.createElement('div');
        tabContainer.style.cssText = `
            display: flex;
            border-bottom: 2px solid ${this.colors.cream};
            margin-bottom: 1rem;
        `;

        const tabs = [
            { id: 'dependency', name: '🕸️ Dependencies', active: true },
            { id: 'component', name: '🏗️ Components', active: false },
            { id: 'flow', name: '🌊 Data Flow', active: false },
            { id: 'metrics', name: '📊 Metrics', active: false }
        ];

        tabs.forEach(tab => {
            const tabButton = document.createElement('button');
            tabButton.className = 'viz-tab';
            tabButton.textContent = tab.name;
            tabButton.onclick = () => this.switchTab(tab.id);
            
            tabButton.style.cssText = `
                background: ${tab.active ? this.colors.primary : 'transparent'};
                color: ${tab.active ? 'white' : this.colors.brown};
                border: none;
                padding: 0.75rem 1.5rem;
                font-weight: 500;
                cursor: pointer;
                border-radius: 8px 8px 0 0;
                transition: all 0.2s ease;
                font-family: var(--font-sans);
            `;

            if (tab.active) {
                tabButton.dataset.active = 'true';
            }

            tabContainer.appendChild(tabButton);
        });

        return tabContainer;
    }

    switchTab(tabId) {
        // Update tab appearance
        const tabs = document.querySelectorAll('.viz-tab');
        tabs.forEach(tab => {
            const isActive = tab.textContent.includes(this.getTabIcon(tabId));
            tab.style.background = isActive ? this.colors.primary : 'transparent';
            tab.style.color = isActive ? 'white' : this.colors.brown;
            tab.dataset.active = isActive;
        });

        // Show corresponding content
        switch (tabId) {
            case 'dependency':
                this.showDependencyGraph(window.codebaseWhisperer?.currentAnalysis);
                break;
            case 'component':
                this.showComponentDiagram();
                break;
            case 'flow':
                this.showDataFlow();
                break;
            case 'metrics':
                this.showMetricsVisualization();
                break;
        }
    }

    getTabIcon(tabId) {
        const icons = {
            dependency: '🕸️',
            component: '🏗️',
            flow: '🌊',
            metrics: '📊'
        };
        return icons[tabId] || '📊';
    }

    showDependencyGraph(codebaseStructure) {
        const content = document.getElementById('vizTabContent');
        if (!content) return;

        content.innerHTML = '';

        // Create SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '400');
        svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        svg.style.cssText = `
            background: ${this.colors.surface};
            border-radius: 8px;
            border: 1px solid ${this.colors.cream};
        `;

        // Create sample dependency graph
        const nodes = this.generateSampleNodes(codebaseStructure);
        const links = this.generateSampleLinks(nodes);

        this.renderForceDirectedGraph(svg, nodes, links);
        content.appendChild(svg);

        // Add legend
        const legend = this.createDependencyLegend();
        content.appendChild(legend);
    }

    generateSampleNodes(codebaseStructure) {
        const files = codebaseStructure?.files || [];
        
        if (files.length > 0) {
            // Use actual file data
            return files.slice(0, 12).map((file, index) => ({
                id: file.name || `file${index}`,
                group: this.getFileGroup(file.extension || 'js'),
                size: Math.min((file.analysis?.functions?.length || 1) * 10 + 20, 60),
                type: file.extension || 'js',
                functions: file.analysis?.functions?.length || 0,
                classes: file.analysis?.classes?.length || 0
            }));
        }

        // Fallback sample data
        return [
            { id: 'App.js', group: 1, size: 40, type: 'js', functions: 5, classes: 1 },
            { id: 'Header.jsx', group: 2, size: 30, type: 'jsx', functions: 3, classes: 1 },
            { id: 'UserService.js', group: 3, size: 35, type: 'js', functions: 8, classes: 2 },
            { id: 'utils.js', group: 4, size: 25, type: 'js', functions: 12, classes: 0 },
            { id: 'api.js', group: 3, size: 30, type: 'js', functions: 6, classes: 1 },
            { id: 'auth.js', group: 3, size: 28, type: 'js', functions: 4, classes: 1 },
            { id: 'config.js', group: 4, size: 20, type: 'js', functions: 2, classes: 0 },
            { id: 'Dashboard.jsx', group: 2, size: 38, type: 'jsx', functions: 7, classes: 1 }
        ];
    }

    generateSampleLinks(nodes) {
        const links = [];
        const nodeIds = nodes.map(n => n.id);
        
        // Create some realistic dependency relationships
        if (nodeIds.includes('App.js')) {
            ['Header.jsx', 'Dashboard.jsx', 'UserService.js'].forEach(target => {
                if (nodeIds.includes(target)) {
                    links.push({ source: 'App.js', target, value: 1 });
                }
            });
        }
        
        if (nodeIds.includes('UserService.js')) {
            ['api.js', 'auth.js'].forEach(target => {
                if (nodeIds.includes(target)) {
                    links.push({ source: 'UserService.js', target, value: 1 });
                }
            });
        }

        // Add more connections for demo
        for (let i = 0; i < Math.min(nodes.length - 1, 8); i++) {
            if (Math.random() > 0.6) {
                links.push({
                    source: nodes[i].id,
                    target: nodes[i + 1].id,
                    value: 1
                });
            }
        }

        return links;
    }

    getFileGroup(extension) {
        const groups = {
            'js': 1, 'mjs': 1,
            'jsx': 2, 'tsx': 2,
            'ts': 3,
            'py': 4,
            'css': 5, 'scss': 5,
            'html': 6
        };
        return groups[extension] || 1;
    }

    renderForceDirectedGraph(svg, nodes, links) {
        // Clear existing content
        svg.innerHTML = '';

        // Create color scale for different file types
        const colorScale = {
            1: this.colors.primary,    // JS
            2: this.colors.secondary,  // JSX/TSX
            3: this.colors.dark,       // TS
            4: '#059669',              // Python
            5: '#DC2626',              // CSS
            6: '#7C3AED'               // HTML
        };

        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(d => d.size / 2 + 5));

        // Create links
        const link = d3.select(svg)
            .append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', this.colors.brown)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2);

        // Create nodes
        const node = d3.select(svg)
            .append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', d => d.size / 2)
            .attr('fill', d => colorScale[d.group] || this.colors.primary)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', this.dragstarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragended.bind(this)));

        // Add labels
        const label = d3.select(svg)
            .append('g')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .text(d => d.id)
            .style('font-family', 'var(--font-sans)')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('fill', this.colors.text)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none');

        // Add tooltips
        node.append('title')
            .text(d => `${d.id}\nFunctions: ${d.functions}\nClasses: ${d.classes}\nType: ${d.type}`);

        // Update positions on simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y + 4);
        });

        this.simulation = simulation;
    }

    // D3 drag handlers
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    createDependencyLegend() {
        const legend = document.createElement('div');
        legend.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1rem;
            padding: 1rem;
            background: ${this.colors.cream};
            border-radius: 8px;
            font-size: 0.875rem;
        `;

        const items = [
            { color: this.colors.primary, label: 'JavaScript' },
            { color: this.colors.secondary, label: 'React/JSX' },
            { color: this.colors.dark, label: 'TypeScript' },
            { color: '#059669', label: 'Python' }
        ];

        items.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: ${this.colors.text};
            `;

            legendItem.innerHTML = `
                <div style="width: 16px; height: 16px; background: ${item.color}; border-radius: 50%;"></div>
                <span>${item.label}</span>
            `;

            legend.appendChild(legendItem);
        });

        return legend;
    }

    showComponentDiagram() {
        const content = document.getElementById('vizTabContent');
        if (!content) return;

        content.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                <div class="component-card" style="background: ${this.colors.surface}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                    <h4 style="color: ${this.colors.primary}; margin-bottom: 1rem;">🔐 Authentication</h4>
                    <ul style="color: ${this.colors.text}; margin-left: 1rem;">
                        <li>auth.js</li>
                        <li>middleware/</li>
                        <li>guards/</li>
                    </ul>
                </div>
                <div class="component-card" style="background: ${this.colors.surface}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                    <h4 style="color: ${this.colors.primary}; margin-bottom: 1rem;">🎨 UI Components</h4>
                    <ul style="color: ${this.colors.text}; margin-left: 1rem;">
                        <li>Header.jsx</li>
                        <li>Dashboard.jsx</li>
                        <li>components/</li>
                    </ul>
                </div>
                <div class="component-card" style="background: ${this.colors.surface}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                    <h4 style="color: ${this.colors.primary}; margin-bottom: 1rem;">🔧 Services</h4>
                    <ul style="color: ${this.colors.text}; margin-left: 1rem;">
                        <li>UserService.js</li>
                        <li>api.js</li>
                        <li>utils.js</li>
                    </ul>
                </div>
                <div class="component-card" style="background: ${this.colors.surface}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                    <h4 style="color: ${this.colors.primary}; margin-bottom: 1rem;">⚙️ Configuration</h4>
                    <ul style="color: ${this.colors.text}; margin-left: 1rem;">
                        <li>config.js</li>
                        <li>constants.js</li>
                        <li>environment/</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showDataFlow() {
        const content = document.getElementById('vizTabContent');
        if (!content) return;

        content.innerHTML = `
            <div style="background: ${this.colors.surface}; padding: 2rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                <div style="display: flex; justify-content: center; align-items: center; gap: 2rem; margin: 2rem 0;">
                    <div class="flow-step" style="background: ${this.colors.primary}; color: white; padding: 1rem 2rem; border-radius: 8px; font-weight: 500;">
                        🌐 Request
                    </div>
                    <div style="color: ${this.colors.brown};">→</div>
                    <div class="flow-step" style="background: ${this.colors.secondary}; color: white; padding: 1rem 2rem; border-radius: 8px; font-weight: 500;">
                        🛡️ Auth
                    </div>
                    <div style="color: ${this.colors.brown};">→</div>
                    <div class="flow-step" style="background: ${this.colors.dark}; color: white; padding: 1rem 2rem; border-radius: 8px; font-weight: 500;">
                        🎯 Controller
                    </div>
                    <div style="color: ${this.colors.brown};">→</div>
                    <div class="flow-step" style="background: #059669; color: white; padding: 1rem 2rem; border-radius: 8px; font-weight: 500;">
                        🗄️ Service
                    </div>
                    <div style="color: ${this.colors.brown};">→</div>
                    <div class="flow-step" style="background: #DC2626; color: white; padding: 1rem 2rem; border-radius: 8px; font-weight: 500;">
                        📊 Response
                    </div>
                </div>
                
                <div style="text-align: center; color: ${this.colors.text}; margin-top: 2rem;">
                    <h4 style="color: ${this.colors.primary};">Typical Request Flow</h4>
                    <p style="color: ${this.colors.brown};">Data flows through authentication, business logic, and back to the client</p>
                </div>
            </div>
        `;
    }

    showMetricsVisualization() {
        const content = document.getElementById('vizTabContent');
        if (!content) return;

        const analysis = window.codebaseWhisperer?.currentAnalysis;
        const metrics = analysis?.metrics || {};

        content.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div style="background: ${this.colors.surface}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                    <h4 style="color: ${this.colors.primary}; margin-bottom: 1rem;">📈 Code Distribution</h4>
                    <div class="metric-bar-chart">
                        <div class="metric-bar" style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span style="color: ${this.colors.text};">Functions</span>
                                <span style="color: ${this.colors.brown};">${metrics.totalFunctions || 234}</span>
                            </div>
                            <div style="background: ${this.colors.cream}; height: 8px; border-radius: 4px;">
                                <div style="background: ${this.colors.primary}; height: 100%; width: 85%; border-radius: 4px;"></div>
                            </div>
                        </div>
                        <div class="metric-bar" style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span style="color: ${this.colors.text};">Classes</span>
                                <span style="color: ${this.colors.brown};">${metrics.totalClasses || 45}</span>
                            </div>
                            <div style="background: ${this.colors.cream}; height: 8px; border-radius: 4px;">
                                <div style="background: ${this.colors.secondary}; height: 100%; width: 35%; border-radius: 4px;"></div>
                            </div>
                        </div>
                        <div class="metric-bar">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <span style="color: ${this.colors.text};">Files</span>
                                <span style="color: ${this.colors.brown};">${metrics.totalFiles || 67}</span>
                            </div>
                            <div style="background: ${this.colors.cream}; height: 8px; border-radius: 4px;">
                                <div style="background: ${this.colors.dark}; height: 100%; width: 60%; border-radius: 4px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: ${this.colors.surface}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${this.colors.cream};">
                    <h4 style="color: ${this.colors.primary}; margin-bottom: 1rem;">🎯 Quality Metrics</h4>
                    <div class="quality-metrics">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; padding: 0.75rem; background: white; border-radius: 6px;">
                            <span style="color: ${this.colors.text};">Complexity</span>
                            <span style="color: ${this.colors.secondary}; font-weight: 600;">${metrics.avgComplexity || '2.3'}/5</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; padding: 0.75rem; background: white; border-radius: 6px;">
                            <span style="color: ${this.colors.text};">Maintainability</span>
                            <span style="color: #059669; font-weight: 600;">Good</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 6px;">
                            <span style="color: ${this.colors.text};">Test Coverage</span>
                            <span style="color: ${this.colors.primary}; font-weight: 600;">Estimated</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Make D3 available globally for the visualization
if (typeof window !== 'undefined') {
    // Load D3 from CDN if not already loaded
    if (!window.d3) {
        const script = document.createElement('script');
        script.src = 'https://d3js.org/d3.v7.min.js';
        script.onload = () => {
            console.log('📊 D3.js loaded for visualizations');
        };
        document.head.appendChild(script);
    }
}

export default ArchitectureVisualizer;