class CodeEditor {
    constructor() {
        this.isEditorActive = false;
        this.currentFile = null;
        this.init();
    }

    init() {
        this.createEditorModal();
        this.setupKeybindings();
    }

    createEditorModal() {
        const editorModal = document.createElement('div');
        editorModal.id = 'codeEditorModal';
        editorModal.className = 'modal';
        editorModal.innerHTML = `
            <div class="modal-content xlarge">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Code Editor</h3>
                    <div class="editor-controls">
                        <button class="editor-btn" id="runCode" title="Run Code">
                            <i class="fas fa-play"></i> Run
                        </button>
                        <button class="editor-btn" id="saveCode" title="Save Code">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button class="editor-btn" id="formatCode" title="Format Code">
                            <i class="fas fa-indent"></i> Format
                        </button>
                        <span class="close">&times;</span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="editor-toolbar">
                        <select id="languageSelect">
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="python">Python</option>
                        </select>
                        <input type="text" id="fileName" placeholder="File name...">
                    </div>
                    <div class="editor-container">
                        <div class="line-numbers"></div>
                        <textarea id="codeTextarea" placeholder="Type your code here..."></textarea>
                        <div class="code-highlight" id="codeHighlight"></div>
                    </div>
                    <div class="output-container">
                        <div class="output-header">
                            <h4>Output</h4>
                            <button class="clear-output" id="clearOutput">
                                <i class="fas fa-trash"></i> Clear
                            </button>
                        </div>
                        <pre id="codeOutput"></pre>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(editorModal);
        this.setupEditorEvents();
    }

    setupEditorEvents() {
        const modal = document.getElementById('codeEditorModal');
        const closeBtn = modal.querySelector('.close');
        const codeTextarea = modal.querySelector('#codeTextarea');
        const lineNumbers = modal.querySelector('.line-numbers');

        // Close modal
        closeBtn.addEventListener('click', () => this.closeEditor());
        
        // Update line numbers
        codeTextarea.addEventListener('input', () => this.updateLineNumbers());
        codeTextarea.addEventListener('scroll', () => this.syncScroll());
        
        // Tab key support
        codeTextarea.addEventListener('keydown', (e) => this.handleTabKey(e));
        
        // Syntax highlighting
        codeTextarea.addEventListener('input', () => this.highlightCode());
        
        // Control buttons
        document.getElementById('runCode').addEventListener('click', () => this.runCode());
        document.getElementById('saveCode').addEventListener('click', () => this.saveCode());
        document.getElementById('formatCode').addEventListener('click', () => this.formatCode());
        document.getElementById('clearOutput').addEventListener('click', () => this.clearOutput());
        
        // Language change
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    openEditor(fileContent = '', fileName = 'new-file.java', language = 'java') {
        this.isEditorActive = true;
        const modal = document.getElementById('codeEditorModal');
        const codeTextarea = modal.querySelector('#codeTextarea');
        const fileNameInput = modal.querySelector('#fileName');
        const languageSelect = modal.querySelector('#languageSelect');
        
        codeTextarea.value = fileContent;
        fileNameInput.value = fileName;
        languageSelect.value = language;
        
        this.updateLineNumbers();
        this.highlightCode();
        modal.style.display = 'block';
        
        // Focus on textarea
        setTimeout(() => codeTextarea.focus(), 100);
    }

    closeEditor() {
        document.getElementById('codeEditorModal').style.display = 'none';
        this.isEditorActive = false;
    }

    updateLineNumbers() {
        const codeTextarea = document.getElementById('codeTextarea');
        const lineNumbers = document.querySelector('.line-numbers');
        const lines = codeTextarea.value.split('\n').length;
        
        lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => 
            `<div class="line-number">${i + 1}</div>`
        ).join('');
    }

    syncScroll() {
        const codeTextarea = document.getElementById('codeTextarea');
        const lineNumbers = document.querySelector('.line-numbers');
        const highlight = document.getElementById('codeHighlight');
        
        lineNumbers.scrollTop = codeTextarea.scrollTop;
        highlight.scrollTop = codeTextarea.scrollTop;
        highlight.scrollLeft = codeTextarea.scrollLeft;
    }

    handleTabKey(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            
            // Insert tab character
            e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
            
            this.updateLineNumbers();
            this.highlightCode();
        }
    }

    highlightCode() {
        const codeTextarea = document.getElementById('codeTextarea');
        const highlight = document.getElementById('codeHighlight');
        const language = document.getElementById('languageSelect').value;
        
        // Simple syntax highlighting (in real app, use a library like Prism or Highlight.js)
        let code = codeTextarea.value;
        
        // Java highlighting
        if (language === 'java') {
            code = code
                .replace(/\b(class|public|private|static|void|int|String|boolean|if|else|for|while|return|new)\b/g, 
                         '<span class="keyword">$1</span>')
                .replace(/\b(true|false|null)\b/g, '<span class="constant">$1</span>')
                .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                .replace( /"([^"]*)"/g, '<span class="string">"$1"</span>');
        }
        
        highlight.innerHTML = code.replace(/\n/g, '<br>');
    }

    changeLanguage(language) {
        this.highlightCode();
    }

    runCode() {
        const code = document.getElementById('codeTextarea').value;
        const language = document.getElementById('languageSelect').value;
        const output = document.getElementById('codeOutput');
        
        output.innerHTML = 'Running code...\n';
        
        // Simple code execution simulation
        setTimeout(() => {
            if (language === 'java') {
                output.innerHTML += this.simulateJavaExecution(code);
            } else if (language === 'javascript') {
                output.innerHTML += this.simulateJavaScriptExecution(code);
            } else {
                output.innerHTML += `Code execution simulated for ${language}\n`;
            }
        }, 1000);
    }

    simulateJavaExecution(code) {
        // Simple Java code simulation
        if (code.includes('System.out.println')) {
            const matches = code.match(/System\.out\.println\(([^)]+)\)/g);
            if (matches) {
                return matches.map(match => 
                    match.replace('System.out.println(', '').replace(');', '')
                ).join('\n') + '\n';
            }
        }
        return 'Program executed successfully!\n';
    }

    simulateJavaScriptExecution(code) {
        try {
            // Safe JavaScript execution simulation
            if (code.includes('console.log')) {
                const matches = code.match(/console\.log\(([^)]+)\)/g);
                if (matches) {
                    return matches.map(match => 
                        match.replace('console.log(', '').replace(');', '')
                    ).join('\n') + '\n';
                }
            }
            return 'JavaScript executed successfully!\n';
        } catch (error) {
            return `Error: ${error.message}\n`;
        }
    }

    saveCode() {
        const code = document.getElementById('codeTextarea').value;
        const fileName = document.getElementById('fileName').value;
        const language = document.getElementById('languageSelect').value;
        
        // Create download link
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('File saved successfully!', 'success');
    }

    formatCode() {
        const codeTextarea = document.getElementById('codeTextarea');
        let code = codeTextarea.value;
        
        // Simple formatting - indent code
        code = code.replace(/\{/g, ' {\n    ')
                  .replace(/\}/g, '\n}\n')
                  .replace(/\;/g, ';\n')
                  .replace(/\n\s*\n/g, '\n'); // Remove extra empty lines
        
        codeTextarea.value = code;
        this.updateLineNumbers();
        this.highlightCode();
        this.showNotification('Code formatted!', 'success');
    }

    clearOutput() {
        document.getElementById('codeOutput').innerHTML = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupKeybindings() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        if (this.isEditorActive) this.saveCode();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.openEditor();
                        break;
                    case 'r':
                        e.preventDefault();
                        if (this.isEditorActive) this.runCode();
                        break;
                }
            }
        });
    }
}

// Add editor styles
const editorStyles = document.createElement('style');
editorStyles.textContent = `
    .modal-content.xlarge {
        max-width: 95%;
        height: 90vh;
    }
    
    .editor-controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    
    .editor-btn {
        padding: 8px 12px;
        background: rgba(255,255,255,0.2);
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .editor-btn:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-1px);
    }
    
    .editor-toolbar {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        padding: 10px;
        background: var(--surface-color);
        border-radius: 5px;
    }
    
    .editor-toolbar select, 
    .editor-toolbar input {
        padding: 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--surface-color);
        color: var(--text-primary);
    }
    
    .editor-container {
        position: relative;
        height: 400px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 20px;
    }
    
    .line-numbers {
        position: absolute;
        left: 0;
        top: 0;
        width: 50px;
        height: 100%;
        background: #f5f5f5;
        border-right: 1px solid #ddd;
        padding: 10px 5px;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #666;
        overflow: hidden;
    }
    
    .line-number {
        text-align: right;
        padding-right: 10px;
    }
    
    #codeTextarea {
        position: absolute;
        left: 50px;
        top: 0;
        width: calc(100% - 50px);
        height: 100%;
        border: none;
        padding: 10px;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
        resize: none;
        background: transparent;
        color: transparent;
        caret-color: var(--text-primary);
        z-index: 2;
    }
    
    #codeHighlight {
        position: absolute;
        left: 50px;
        top: 0;
        width: calc(100% - 50px);
        height: 100%;
        padding: 10px;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre;
        overflow: auto;
        background: var(--surface-color);
        color: var(--text-primary);
        z-index: 1;
    }
    
    .keyword { color: #d73a49; font-weight: bold; }
    .string { color: #032f62; }
    .comment { color: #6a737d; font-style: italic; }
    .constant { color: #005cc5; }
    
    .output-container {
        border: 1px solid var(--border-color);
        border-radius: 5px;
        padding: 15px;
        background: var(--surface-color);
    }
    
    .output-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .clear-output {
        padding: 5px 10px;
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }
    
    #codeOutput {
        background: #1a1a1a;
        color: #00ff00;
        padding: 15px;
        border-radius: 5px;
        font-family: monospace;
        min-height: 100px;
        max-height: 200px;
        overflow: auto;
        white-space: pre-wrap;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: var(--success-color);
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success { background: var(--success-color); }
    .notification.error { background: var(--error-color); }
    .notification.info { background: var(--primary-color); }
`;
document.head.appendChild(editorStyles);
