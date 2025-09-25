class CodeNotesApp {
    constructor() {
        this.currentTheme = 'theme-default';
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadPrograms();
        this.loadNotes();
        this.applySavedSettings();
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
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(102, 126, 234, 0.1)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = 'transparent';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = 'transparent';
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
    }

    async handleFileUpload(files) {
        const fileHandler = new FileHandler();
        
        for (let file of files) {
            if (file.name.endsWith('.java')) {
                await fileHandler.processJavaFile(file);
            } else if (file.type.startsWith('image/') || file.name.endsWith('.pdf')) {
                await fileHandler.processNoteFile(file);
            }
        }
        
        this.loadPrograms();
        this.loadNotes();
    }

    async loadPrograms() {
        const programs = await FileHandler.getPrograms();
        const grid = document.getElementById('programsGrid');
        
        grid.innerHTML = programs.map(program => `
            <div class="program-card" onclick="app.showProgramCode('${program.id}')">
                <h3>${program.name}</h3>
                <p>${program.description}</p>
                <div class="program-meta">
                    <span>${program.date}</span>
                    <span>${program.language}</span>
                </div>
            </div>
        `).join('');
    }

    async loadNotes() {
        const notes = await NotesManager.getNotes();
        const container = document.getElementById('notesContainer');
        
        container.innerHTML = notes.map(note => `
            <div class="note-card" onclick="app.showNote('${note.id}')">
                <div class="note-preview">
                    ${note.type === 'image' ? 
                        `<img src="${note.content}" alt="${note.title}">` : 
                        `<i class="fas fa-file-${note.type}"></i>`
                    }
                </div>
                <h4>${note.title}</h4>
                <p>${note.description}</p>
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
                content.innerHTML = `<img src="${note.content}" alt="${note.title}" style="max-width: 100%;">`;
            } else if (note.type === 'pdf') {
                content.innerHTML = `<iframe src="${note.content}" width="100%" height="600px"></iframe>`;
            } else {
                content.innerHTML = `<pre>${note.content}</pre>`;
            }
            
            document.getElementById('noteModal').style.display = 'block';
        }
    }

    closeModals() {
        document.getElementById('codeModal').style.display = 'none';
        document.getElementById('noteModal').style.display = 'none';
    }

    filterPrograms(searchTerm) {
        const cards = document.querySelectorAll('.program-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
        });
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
        const savedTheme = localStorage.getItem('theme') || 'theme-default';
        this.setTheme(savedTheme);
        
        const fontSize = localStorage.getItem('fontSize') || '16';
        document.documentElement.style.fontSize = fontSize + 'px';
    }

    setTheme(themeName) {
        document.body.classList.remove(this.currentTheme);
        document.body.classList.add(themeName);
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CodeNotesApp();
});
