# 🧠 Codebase Whisperer Agent

**AI-powered codebase intelligence that understands your code like a senior developer**

[![IBM TechXchange 2025](https://img.shields.io/badge/IBM_TechXchange-2025-blue)](https://www.ibm.com/events/techxchange)
[![Powered by watsonx](https://img.shields.io/badge/Powered_by-IBM_watsonx-darkblue)](https://www.ibm.com/watsonx)
[![Agentic AI](https://img.shields.io/badge/Agentic-AI-green)](https://www.ibm.com/watsonx)

> Built for IBM TechXchange 2025 Pre-conference watsonx Hackathon - "Build with agentic AI challenge"

## 🎯 What It Does

The Codebase Whisperer Agent transforms any unfamiliar codebase into an interactive conversation partner. Upload a repository or paste a GitHub URL, then ask natural language questions like "How does authentication work?" and get detailed explanations with specific code examples—as if consulting a senior developer who's worked on the project for years.

### Key Capabilities
- **📊 Instant Repository Analysis** - Parse and understand entire codebases in seconds
- **🤖 AI-Powered Q&A** - Ask natural language questions, get expert-level answers with code examples
- **🏗️ Architecture Visualization** - Interactive dependency graphs and component diagrams
- **📚 Documentation Generation** - Create comprehensive technical specifications automatically
- **⚡ Real-time Intelligence** - Live code analysis using IBM watsonx.ai Granite 3.3

## 🏗️ How It Works

### Multi-Agent Architecture
The system employs three specialized AI agents powered by IBM watsonx.ai:

1. **Code Analysis Agent** - Deep semantic analysis using IBM watsonx Granite 3.3
2. **Query Processing Agent** - Natural language understanding and contextual responses  
3. **Documentation Generation Agent** - Comprehensive technical documentation creation

### Technical Flow
```
Repository Input → Tree-sitter Parsing → Complete Context → IBM watsonx Granite 3.3 → Expert Insights
```

**Key Innovation**: Unlike tools that analyze metadata, we send **complete file contents** to IBM Watson, enabling true code comprehension.

## 🛠️ Technology Stack

- **AI Engine**: IBM watsonx.ai with Granite 3.3 models
- **Code Parsing**: Tree-sitter for multi-language syntax analysis
- **Backend**: Node.js/Express with real-time API integration
- **Frontend**: Vanilla JavaScript with Claude-inspired design
- **Architecture**: Multi-agent system with specialized AI coordination

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- IBM watsonx.ai account and API credentials
- Git for repository cloning

### Installation

```bash
# Clone the repository
git clone https://github.com/harshareddy832/codewhisperer.git
cd codewhisperer

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your IBM watsonx credentials
```

### Environment Configuration

Get your IBM watsonx.ai credentials from [IBM Cloud Console](https://cloud.ibm.com/apidocs/watsonx-ai) and add them to `.env`:

```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_BASE_URL=https://us-south.ml.cloud.ibm.com
```

### Run the Application

```bash
# Start the server
npm start

# Open your browser
# Navigate to http://localhost:3001
```

## 📖 Usage Examples

### Analyze a Repository
1. **GitHub URL**: Paste `https://github.com/facebook/react` 
2. **Local Upload**: Drag and drop your project files
3. **Wait for Analysis**: Tree-sitter parses all files, Watson analyzes content

### Ask Smart Questions
```
🔍 "How does authentication work in this codebase?"
🔍 "What happens when a user submits a form?"
🔍 "Explain the database connection setup"
🔍 "What are the main API endpoints and their functions?"
```

### Generate Documentation
- Click "📚 Generate Comprehensive Documentation"
- Get instant 40+ page technical specification
- Copy to clipboard or download as Markdown

## 🏛️ Architecture Deep Dive

### Agent Collaboration
```javascript
// Simplified agent coordination
const codebaseContext = {
    repository: analysisResult.repository,
    files: analysisResult.files,        // Complete file contents
    metrics: analysisResult.metrics,    // Code statistics
    patterns: analysisResult.patterns   // Architectural insights
};

// Shared context across all AI agents
```

### IBM watsonx Integration
- **Model**: `ibm/granite-3-8b-instruct` optimized for code understanding
- **Context Window**: 8,000 tokens for comprehensive analysis
- **Authentication**: OAuth 2.0 with automatic token management
- **Processing**: Real-time API calls with complete repository context

### Data Flow
1. **Repository Ingestion** - GitHub API or file upload
2. **Code Parsing** - Tree-sitter extracts syntax and structure
3. **Context Building** - Complete file contents organized for AI
4. **Watson Processing** - IBM Granite 3.3 provides semantic understanding
5. **Response Generation** - Structured answers with code examples

## 🎯 Hackathon Context

**Challenge**: Build with agentic AI challenge  
**Innovation**: Multi-agent system that reads code like humans  
**Impact**: Transform 3-month developer onboarding into 3-minute expertise  

### Problem Solved
Developers spend **60% of their time** understanding unfamiliar code. Our agent provides instant expert-level insights, making any developer productive on any codebase within minutes.

### Technical Achievement
- **Real AI Integration**: Live IBM watsonx API calls (not mock responses)
- **Complete Context**: Sends entire repository content to Watson
- **Agentic Architecture**: Specialized agents working together
- **Production Ready**: Handles real-world codebases efficiently

## 🎬 Demo Video

Watch our 3-minute demonstration: [Demo Video Link]([https://vimeo.com/1110690654?share=copy])

## 🏆 What Makes This Special

### vs. Existing Tools
- **GitHub Copilot**: Generates new code → **We explain existing code**
- **Documentation Tools**: Static information → **We provide conversational exploration**
- **Search Engines**: Text matching → **We offer contextual comprehension**

### Technical Innovation
- **Complete Context Processing**: No content filtering or summarization
- **Multi-Agent Coordination**: Specialized AI agents working together
- **Real-time Intelligence**: Live IBM watsonx API integration
- **Human-like Understanding**: Reads code relationships and architectural patterns

## 📄 License

MIT License - Built with ❤️ for developers everywhere

---

**🎯 Goal**: Make every developer feel like they have a senior colleague who understands any codebase instantly.

*Ready to whisper with your codebase?* 🚀
