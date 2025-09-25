class NotesManager {
    static async processNoteFile(file) {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                this.processImageFile(file);
            } else if (file.type === 'application/pdf') {
                this.processPdfFile(file);
            } else {
                this.processTextFile(file);
            }
            resolve();
        });
    }

    static processImageFile(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            await this.saveNote({
                title: file.name,
                content: e.target.result,
                type: 'image',
                date: new Date().toLocaleDateString(),
                description: 'Image note'
            });
        };
        
        reader.readAsDataURL(file);
    }

    static processPdfFile(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            await this.saveNote({
                title: file.name,
                content: e.target.result,
                type: 'pdf',
                date: new Date().toLocaleDateString(),
                description: 'PDF document'
            });
        };
        
        reader.readAsDataURL(file);
    }

    static async processTextFile(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            await this.saveNote({
                title: file.name,
                content: e.target.result,
                type: 'text',
                date: new Date().toLocaleDateString(),
                description: 'Text note'
            });
        };
        
        reader.readAsText(file);
    }

    static async saveNote(note) {
        const notes = await this.getNotes();
        note.id = this.generateId();
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    static async getNotes() {
        return JSON.parse(localStorage.getItem('notes') || '[]');
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
