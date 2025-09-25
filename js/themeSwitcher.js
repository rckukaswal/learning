class ThemeSwitcher {
    constructor() {
        this.themes = {
            'default': {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#f093fb',
                background: '#f8f9fa',
                surface: '#ffffff',
                textPrimary: '#2d3748',
                textSecondary: '#718096',
                border: '#e2e8f0'
            },
            'dark': {
                primary: '#8b5cf6',
                secondary: '#6d28d9',
                accent: '#a78bfa',
                background: '#1a202c',
                surface: '#2d3748',
                textPrimary: '#f7fafc',
                textSecondary: '#cbd5e0',
                border: '#4a5568'
            },
            'blue': {
                primary: '#3182ce',
                secondary: '#2c5aa0',
                accent: '#63b3ed',
                background: '#ebf8ff',
                surface: '#ffffff',
                textPrimary: '#2d3748',
                textSecondary: '#718096',
                border: '#bee3f8'
            },
            'green': {
                primary: '#38a169',
                secondary: '#2f855a',
                accent: '#68d391',
                background: '#f0fff4',
                surface: '#ffffff',
                textPrimary: '#2d3748',
                textSecondary: '#718096',
                border: '#c6f6d5'
            },
            'purple': {
                primary: '#9f7aea',
                secondary: '#6b46c1',
                accent: '#d6bcfa',
                background: '#faf5ff',
                surface: '#ffffff',
                textPrimary: '#2d3748',
                textSecondary: '#718096',
                border: '#e9d8fd'
            },
            'orange': {
                primary: '#ed8936',
                secondary: '#dd6b20',
                accent: '#fbd38d',
                background: '#fffaf0',
                surface: '#ffffff',
                textPrimary: '#2d3748',
                textSecondary: '#718096',
                border: '#feebc8'
            }
        };
        
        this.currentTheme = this.getSavedTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.createThemeSelector();
    }

    setupEventListeners() {
        // Theme toggle button
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.cycleThemes();
        });

        // Theme select dropdown
        document.getElementById('themeSelect')?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.cycleThemes();
            }
        });
    }

    createThemeSelector() {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer) {
            const themeSelector = `
                <div class="setting-item">
                    <label for="themeSelect">Select Theme:</label>
                    <select id="themeSelect" class="theme-select">
                        ${Object.keys(this.themes).map(theme => `
                            <option value="${theme}" ${theme === this.currentTheme ? 'selected' : ''}>
                                ${this.capitalizeFirstLetter(theme)} Theme
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="theme-previews">
                    ${Object.keys(this.themes).map(theme => `
                        <div class="theme-preview ${theme === this.currentTheme ? 'active' : ''}" 
                             data-theme="${theme}"
                             style="background: linear-gradient(135deg, ${this.themes[theme].primary}, ${this.themes[theme].secondary})">
                            <span>${this.capitalizeFirstLetter(theme)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            
            const existingThemeSettings = settingsContainer.querySelector('#themeSettings');
            if (!existingThemeSettings) {
                const themeSettings = document.createElement('div');
                themeSettings.id = 'themeSettings';
                themeSettings.innerHTML = themeSelector;
                settingsContainer.appendChild(themeSettings);
                
                // Add event listeners to previews
                themeSettings.querySelectorAll('.theme-preview').forEach(preview => {
                    preview.addEventListener('click', () => {
                        const theme = preview.dataset.theme;
                        this.applyTheme(theme);
                    });
                });
            }
        }
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Update CSS variables
        Object.keys(theme).forEach(key => {
            const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, theme[key]);
        });
        
        this.currentTheme = themeName;
        this.saveTheme(themeName);
        this.updateActiveThemeIndicator();
        
        // Add animation effect
        document.body.style.animation = 'none';
        setTimeout(() => {
            document.body.style.animation = 'themeTransition 0.5s ease';
        }, 10);
    }

    cycleThemes() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        this.applyTheme(themeNames[nextIndex]);
    }

    getSavedTheme() {
        return localStorage.getItem('appTheme') || 'default';
    }

    saveTheme(themeName) {
        localStorage.setItem('appTheme', themeName);
        
        // Update select dropdown if exists
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = themeName;
        }
    }

    updateActiveThemeIndicator() {
        document.querySelectorAll('.theme-preview').forEach(preview => {
            preview.classList.toggle('active', preview.dataset.theme === this.currentTheme);
        });
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Method to get current theme info
    getCurrentThemeInfo() {
        return {
            name: this.currentTheme,
            colors: this.themes[this.currentTheme]
        };
    }

    // Method to add custom theme
    addCustomTheme(name, colors) {
        if (!name || !colors) return false;
        
        this.themes[name] = {
            primary: colors.primary || '#667eea',
            secondary: colors.secondary || '#764ba2',
            accent: colors.accent || '#f093fb',
            background: colors.background || '#f8f9fa',
            surface: colors.surface || '#ffffff',
            textPrimary: colors.textPrimary || '#2d3748',
            textSecondary: colors.textSecondary || '#718096',
            border: colors.border || '#e2e8f0'
        };
        
        this.createThemeSelector(); // Refresh selector
        return true;
    }
}

// Add CSS for theme transition
const themeTransitionStyle = document.createElement('style');
themeTransitionStyle.textContent = `
    @keyframes themeTransition {
        from {
            opacity: 0.8;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .theme-previews {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 15px;
    }
    
    .theme-preview {
        width: 100%;
        height: 60px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        transition: all 0.3s ease;
        border: 3px solid transparent;
    }
    
    .theme-preview.active {
        border-color: #fff;
        box-shadow: 0 0 0 2px var(--primary-color);
        transform: scale(1.05);
    }
    
    .theme-preview:hover {
        transform: scale(1.05);
    }
    
    .theme-select {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--surface-color);
        color: var(--text-primary);
        width: 200px;
    }
`;
document.head.appendChild(themeTransitionStyle);
