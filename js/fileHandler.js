class FileHandler {
    static async processJavaFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const content = e.target.result;
                const programs = this.extractPrograms(content, file.name);
                
                for (let program of programs) {
                    await this.saveProgram(program);
                }
                
                resolve();
            };
            
            reader.readAsText(file);
        });
    }

    static extractPrograms(content, fileName) {
        const programs = [];
        const programBlocks = content.split(/(?=public class|class |import )/);
        
        let programCount = 1;
        
        for (let block of programBlocks) {
            if (block.trim()) {
                programs.push({
                    name: `Program ${programCount++} - ${fileName}`,
                    code: block.trim(),
                    language: 'Java',
                    date: new Date().toLocaleDateString(),
                    description: 'Java program extracted from file'
                });
            }
        }
        
        return programs;
    }

    static async saveProgram(program) {
        const programs = await this.getPrograms();
        program.id = this.generateId();
        programs.push(program);
        localStorage.setItem('javaPrograms', JSON.stringify(programs));
    }

    static async getPrograms() {
        return JSON.parse(localStorage.getItem('javaPrograms') || '[]');
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
