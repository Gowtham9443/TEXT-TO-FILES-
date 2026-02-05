tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        border: "hsl(var(--border))",
                        input: "hsl(var(--input))",
                        ring: "hsl(var(--ring))",
                        background: "hsl(var(--background))",
                        foreground: "hsl(var(--foreground))",
                        primary: {
                            DEFAULT: "#38bdf8",
                            foreground: "#0f172a",
                        },
                    },
                },
            },
        }
    


        let currentTab = 'html';
        let splitData = { html: '', css: '', js: '' };

        // Initialize Theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            // Uncomment below if you want to respect system light mode by default
            // document.documentElement.classList.remove('dark');
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.toggle('dark');
            const icon = document.getElementById('theme-icon');
            icon.className = isDark ? 'fas fa-moon text-lg' : 'fas fa-sun text-lg';
            showToast(isDark ? "Dark Mode Enabled" : "Light Mode Enabled");
        }

        function updateInputStats() {
            const text = document.getElementById('input-code').value;
            document.getElementById('input-stats').innerText = `${text.length.toLocaleString()} characters`;
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-message').innerText = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        function switchTab(type) {
            currentTab = type;
            ['html', 'css', 'js'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                const pane = document.getElementById(`output-${t}`);
                if (t === type) {
                    btn.classList.add('tab-active');
                    btn.classList.remove('text-slate-400');
                    pane.classList.remove('hidden');
                } else {
                    btn.classList.remove('tab-active');
                    btn.classList.add('text-slate-400');
                    pane.classList.add('hidden');
                }
            });
        }

        function handleSplit() {
            const raw = document.getElementById('input-code').value;
            if (!raw.trim()) {
                showToast("Empty input!");
                return;
            }

            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(raw, 'text/html');
                let extractedCSS = "";
                let extractedJS = "";

                // Styles
                const styles = doc.querySelectorAll('style');
                styles.forEach(s => {
                    extractedCSS += s.innerHTML + "\n\n";
                    s.remove();
                });

                // Scripts
                const scripts = doc.querySelectorAll('script');
                scripts.forEach(s => {
                    if (!s.src) {
                        extractedJS += s.innerHTML + "\n\n";
                        s.remove();
                    }
                });

                // Linking
                if (extractedCSS.trim()) {
                    const link = doc.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'style.css';
                    doc.head.appendChild(link);
                }
                if (extractedJS.trim()) {
                    const script = doc.createElement('script');
                    script.src = 'script.js';
                    doc.body.appendChild(script);
                }

                let finalHTML = doc.documentElement.outerHTML;
                finalHTML = finalHTML.replace(/> </g, '>\n<');

                splitData = {
                    html: finalHTML,
                    css: extractedCSS.trim(),
                    js: extractedJS.trim()
                };

                document.getElementById('output-html').textContent = splitData.html;
                document.getElementById('output-css').textContent = splitData.css || "/* No internal CSS detected */";
                document.getElementById('output-js').textContent = splitData.js || "// No internal JavaScript detected";

                document.getElementById('empty-state').classList.add('hidden');
                showToast("Magic complete! Code split.");

            } catch (err) {
                showToast("Oops! Parsing failed.");
            }
        }

        function resetAll() {
            document.getElementById('input-code').value = '';
            document.getElementById('output-html').textContent = '';
            document.getElementById('output-css').textContent = '';
            document.getElementById('output-js').textContent = '';
            document.getElementById('empty-state').classList.remove('hidden');
            splitData = { html: '', css: '', js: '' };
            updateInputStats();
            showToast("Workspace reset");
        }

        function copyCurrent() {
            const text = splitData[currentTab];
            if (!text) return;
            
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(`${currentTab.toUpperCase()} copied!`);
        }

        function downloadCurrent() {
            const content = splitData[currentTab];
            if (!content) return;
            const ext = { html: 'html', css: 'css', js: 'js' };
            const names = { html: 'index', css: 'style', js: 'script' };
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${names[currentTab]}.${ext[currentTab]}`;
            a.click();
            URL.revokeObjectURL(url);
        }