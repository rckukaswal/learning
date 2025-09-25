class CodeNotesApp {
    constructor() {
        this.currentTheme = 'theme-default';
        this.codeEditor = new CodeEditor();
        this.themeSwitcher = new ThemeSwitcher();
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadSampleData();
        this.applySavedSettings();
        this.setupKeyboardShortcuts();
        this.showWelcomeMessage();
    }

    initializeEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // File upload
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Search functionality
        document.getElementById('searchPrograms').addEventListener('input', (e) => {
            this.filterPrograms(e.target.value);
        });

        // Add note button
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.addNewNote();
        });

        // Theme settings
        document.getElementById('fontSize').addEventListener('input', (e) => {
            this.changeFontSize(e.target.value);
        });

        // Quick action buttons
        this.setupQuickActions();
    }

    setupQuickActions() {
        // Create quick action buttons
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        quickActions.innerHTML = `
            <button class="quick-action" id="quickNewFile" title="New File (Ctrl+E)">
                <i class="fas fa-file-code"></i>
            </button>
            <button class="quick-action" id="quickUpload" title="Upload File">
                <i class="fas fa-upload"></i>
            </button>
            <button class="quick-action" id="quickSettings" title="Settings">
                <i class="fas fa-cog"></i>
            </button>
        `;
        
        document.body.appendChild(quickActions);

        // Add styles for quick actions
        const quickActionsStyle = document.createElement('style');
        quickActionsStyle.textContent = `
            .quick-actions {
                position: fixed;
                bottom: 30px;
                right: 30px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 1000;
            }
            
            .quick-action {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            }
            
            .quick-action:hover {
                transform: scale(1.1) translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
        `;
        document.head.appendChild(quickActionsStyle);

        // Event listeners for quick actions
        document.getElementById('quickNewFile').addEventListener('click', () => {
            this.codeEditor.openEditor();
        });

        document.getElementById('quickUpload').addEventListener('click', () => {
            this.switchTab('upload');
            document.getElementById('fileInput').click();
        });

        document.getElementById('quickSettings').addEventListener('click', () => {
            this.switchTab('settings');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + E for new file
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.codeEditor.openEditor();
            }
            
            // Ctrl + / for search
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                document.getElementById('searchPrograms').focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    switchTab(tabName) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Add animation
        document.getElementById(tabName).classList.add('animate-slide-in-up');
        setTimeout(() => {
            document.getElementById(tabName).classList.remove('animate-slide-in-up');
        }, 500);
    }

    async handleFileUpload(files) {
        const fileHandler = new FileHandler();
        const uploadProgress = document.getElementById('uploadProgress');
        
        uploadProgress.innerHTML = '<div class="loading-spinner"></div><p>Uploading files...</p>';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            
            uploadProgress.innerHTML = `
                <div class="progress-bar" style="width: ${progress}%"></div>
                <p>Processing ${file.name}... (${i + 1}/${files.length})</p>
            `;
            
            if (file.name.endsWith('.java')) {
                await fileHandler.processJavaFile(file);
            } else if (file.type.startsWith('image/') || file.name.endsWith('.pdf')) {
                await fileHandler.processNoteFile(file);
            }
        }
        
        uploadProgress.innerHTML = `
            <div class="success-checkmark">
                <div class="check-icon">
                    <span class="icon-line line-tip"></span>
                    <span class="icon-line line-long"></span>
                </div>
            </div>
            <p>All files uploaded successfully!</p>
        `;
        
        this.loadPrograms();
        this.loadNotes();
        
        setTimeout(() => {
            uploadProgress.innerHTML = '';
        }, 3000);
    }

    async loadPrograms() {
        const programs = await FileHandler.getPrograms();
        const grid = document.getElementById('programsGrid');
        
        if (programs.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-code"></i>
                    <h3>No Java Programs Yet</h3>
                    <p>Upload your first Java file to get started!</p>
                    <button class="btn-primary" onclick="app.switchTab('upload')">
                        <i class="fas fa-upload"></i> Upload Java File
                    </button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = programs.map((program, index) => `
            <div class="program-card animate-slide-in-up" style="animation-delay: ${index * 0.1}s" 
                 onclick="app.showProgramCode('${program.id}')">
                <div class="program-icon">
                    <i class="fab fa-java"></i>
                </div>
                <h3>${program.name}</h3>
                <p>${program.description}</p>
                <div class="program-tags">
                    ${program.tags ? program.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="program-meta">
                    <span><i class="far fa-calendar"></i> ${program.date}</span>
                    <span><i class="fas fa-code"></i> ${program.language}</span>
                </div>
                <div class="program-actions">
                    <button class="btn-small" onclick="event.stopPropagation(); app.editProgram('${program.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small" onclick="event.stopPropagation(); app.downloadProgram('${program.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadNotes() {
        const notes = await NotesManager.getNotes();
        const container = document.getElementById('notesContainer');
        
        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>No Notes Yet</h3>
                    <p>Add your first note or upload PDF/Image files!</p>
                    <button class="btn-primary" onclick="app.addNewNote()">
                        <i class="fas fa-plus"></i> Add New Note
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notes.map((note, index) => `
            <div class="note-card animate-slide-in-up" style="animation-delay: ${index * 0.1}s" 
                 onclick="app.showNote('${note.id}')">
                <div class="note-preview ${note.type}">
                    ${note.type === 'image' ? 
                        `<img src="${note.content}" alt="${note.title}">` : 
                        note.type === 'pdf' ?
                        `<i class="fas fa-file-pdf"></i>` :
                        `<i class="fas fa-file-alt"></i>`
                    }
                </div>
                <div class="note-content">
                    <h4>${note.title}</h4>
                    <p>${note.description}</p>
                    <div class="note-meta">
                        <span><i class="far fa-calendar"></i> ${note.date}</span>
                        <span><i class="fas fa-tag"></i> ${note.type}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async showProgramCode(programId) {
        const programs = await FileHandler.getPrograms();
        const program = programs.find(p => p.id === programId);
        
        if (program) {
            document.getElementById('modalTitle').textContent = program.name;
            document.getElementById('codeDisplay').innerHTML = 
                `<code class="language-java">${this.escapeHtml(program.code)}</code>`;
            document.getElementById('codeModal').style.display = 'block';
            hljs.highlightAll();
        }
    }

    async showNote(noteId) {
        const notes = await NotesManager.getNotes();
        const note = notes.find(n => n.id === noteId);
        
        if (note) {
            document.getElementById('noteModalTitle').textContent = note.title;
            const content = document.getElementById('noteContent');
            
            if (note.type === 'image') {
                content.innerHTML = `
                    <div class="image-viewer">
                        <img src="${note.content}" alt="${note.title}" class="note-image">
                        <div class="image-controls">
                            <button class="btn-small" onclick="app.zoomImage(1.2)">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="btn-small" onclick="app.zoomImage(1)">
                                <i class="fas fa-search"></i>
                            </button>
                            <button class="btn-small" onclick="app.zoomImage(0.8)">
                                <i class="fas fa-search-minus"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else if (note.type === 'pdf') {
                content.innerHTML = `<iframe src="${note.content}" width="100%" height="600px"></iframe>`;
            } else {
                content.innerHTML = `<div class="text-note"><pre>${note.content}</pre></div>`;
            }
            
            document.getElementById('noteModal').style.display = 'block';
        }
    }

    closeModals() {
        document.getElementById('codeModal').style.display = 'none';
        document.getElementById('noteModal').style.display = 'none';
        this.codeEditor.closeEditor();
    }

    filterPrograms(searchTerm) {
        const cards = document.querySelectorAll('.program-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
        });
    }

    addNewNote() {
        this.codeEditor.openEditor('', 'new-note.txt', 'text');
    }

    editProgram(programId) {
        // Implementation for editing program
        console.log('Edit program:', programId);
    }

    downloadProgram(programId) {
        // Implementation for downloading program
        console.log('Download program:', programId);
    }

    changeFontSize(size) {
        document.documentElement.style.fontSize = size + 'px';
        localStorage.setItem('fontSize', size);
    }

    zoomImage(scale) {
        const image = document.querySelector('.note-image');
        if (image) {
            image.style.transform = `scale(${scale})`;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    applySavedSettings() {
        const savedTheme = localStorage.getItem('appTheme') || 'default';
        this.themeSwitcher.applyTheme(savedTheme);
        
        const fontSize = localStorage.getItem('fontSize') || '16';
        document.getElementById('fontSize').value = fontSize;
        this.changeFontSize(fontSize);
    }

    loadSampleData() {
        // Load sample programs if none exist
        FileHandler.getPrograms().then(programs => {
            if (programs.length === 0) {
                this.loadPrograms(); // Will show empty state
            }
        });
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('Welcome to CodeNotes! Start by uploading your Java files.', 'info');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 
                            type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Additional CSS for new components
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
    }
    
    .empty-state i {
        font-size: 4rem;
        color: var(--border-color);
        margin-bottom: 1rem;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .program-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
    }
    
    .program-icon i {
        font-size: 1.5rem;
        color: white;
    }
    
    .program-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin: 10px 0;
    }
    
    .tag {
        background: var(--accent-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
    }
    
    .program-actions {
        display: flex;
        gap: 5px;
        margin-top: 10px;
    }
    
    .btn-small {
        padding: 5px 10px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-small:hover {
        background: var(--primary-color);
        color: white;
    }
    
    .note-card {
        display: flex;
        background: var(--surface-color);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
        cursor: pointer;
        margin-bottom: 1rem;
    }
    
    .note-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .note-preview {
        width: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--background-color);
    }
    
    .note-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .note-preview i {
        font-size: 2rem;
        color: var(--text-secondary);
    }
    
    .note-content {
        padding: 1rem;
        flex: 1;
    }
    
    .note-meta {
        display: flex;
        gap: 15px;
        margin-top: 10px;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .image-viewer {
        text-align: center;
    }
    
    .note-image {
        max-width: 100%;
        max-height: 70vh;
        transition: transform 0.3s ease;
    }
    
    .image-controls {
        margin-top: 1rem;
        display: flex;
        gap: 10px;
        justify-content: center;
    }
    
    .text-note pre {
        white-space: pre-wrap;
        font-family: inherit;
        line-height: 1.6;
    }
`;
document.head.appendChild(additionalStyles);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CodeNotesApp();
});
