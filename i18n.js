(function() {
    function setLanguage(lang) {
        localStorage.setItem('cyberShield_lang', lang);
        document.documentElement.lang = lang;
        
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // Handle different element types
                if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'placeholder')) {
                    el.placeholder = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });

        // Trigger custom event for complex components (like the Academy)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }

    function initLanguage() {
        const savedLang = localStorage.getItem('cyberShield_lang') || 'en';
        
        // Add CSS for language selector
        const style = document.createElement('style');
        style.textContent = `
            .lang-switcher {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                background: rgba(21, 26, 35, 0.8);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 6px;
                display: flex;
                gap: 4px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            }
            .lang-btn {
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: #94A3B8;
                font-family: inherit;
                font-weight: 700;
                font-size: 12px;
                cursor: pointer;
                border-radius: 12px;
                transition: all 0.2s ease;
            }
            .lang-btn.active {
                background: rgba(30, 144, 255, 0.2);
                color: #00E5FF;
            }
            .lang-btn:hover:not(.active) {
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
            }
        `;
        document.head.appendChild(style);

        // Create UI
        const switcher = document.createElement('div');
        switcher.className = 'lang-switcher';
        
        const langs = [
            { code: 'en', label: 'EN' },
            { code: 'hi', label: 'हि' },
            { code: 'es', label: 'ES' }
        ];

        langs.forEach(l => {
            const btn = document.createElement('button');
            btn.className = `lang-btn ${savedLang === l.code ? 'active' : ''}`;
            btn.textContent = l.label;
            btn.onclick = () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setLanguage(l.code);
            };
            switcher.appendChild(btn);
        });

        document.body.appendChild(switcher);
        setLanguage(savedLang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguage);
    } else {
        initLanguage();
    }
})();
