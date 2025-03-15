const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = window.location.origin;
const SITE_NAME = 'AI Article Generator';
const LOCAL_STORAGE_KEYS = {
    API_KEY: 'openRouterApiKey',
    THEME: 'theme',
    SAVED_ARTICLES: 'savedArticles',
    MODEL: 'selectedModel',
    TEMPERATURE: 'temperature',
    WORD_COUNT: 'wordCountTarget',
    TONE: 'writingTone',
    LANGUAGE: 'outputLanguage'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Ensure theme toggle works immediately
    document.getElementById('themeToggle').onclick = toggleTheme;
    
    // Add language change event to update UI text
    document.getElementById('languageSelect').addEventListener('change', updateUILanguage);
});

function initializeApp() {
    try {
        // Load saved settings
        loadSavedSettings();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Load saved articles
        loadSavedArticles();
        
        // Update theme toggle button text
        updateThemeToggleText();
        
        // Update UI text based on language
        updateUILanguage();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Error initializing application. Please reload the page.');
    }
}

function loadSavedSettings() {
    // Load API key
    const cachedApiKey = localStorage.getItem(LOCAL_STORAGE_KEYS.API_KEY);
    if (cachedApiKey) {
        document.getElementById('apiKey').value = cachedApiKey;
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('Theme loaded from localStorage:', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, 'dark');
        console.log('Theme set to dark based on system preference');
    } else {
        // Explicitly set light theme if no preference is found
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, 'light');
        console.log('Theme defaulted to light');
    }
    
    // Load model preference
    const savedModel = localStorage.getItem(LOCAL_STORAGE_KEYS.MODEL);
    if (savedModel && document.getElementById('modelSelect')) {
        document.getElementById('modelSelect').value = savedModel;
    }
    
    // Load temperature preference
    const savedTemperature = localStorage.getItem(LOCAL_STORAGE_KEYS.TEMPERATURE);
    if (savedTemperature && document.getElementById('temperatureSlider')) {
        document.getElementById('temperatureSlider').value = savedTemperature;
        document.getElementById('temperatureValue').textContent = savedTemperature;
    }
    
    // Load word count target
    const savedWordCount = localStorage.getItem(LOCAL_STORAGE_KEYS.WORD_COUNT);
    if (savedWordCount && document.getElementById('wordCountTarget')) {
        document.getElementById('wordCountTarget').value = savedWordCount;
    }
    
    // Load tone preference
    const savedTone = localStorage.getItem(LOCAL_STORAGE_KEYS.TONE);
    if (savedTone && document.getElementById('toneSelect')) {
        document.getElementById('toneSelect').value = savedTone;
    }
    
    // Load language preference
    const savedLanguage = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE);
    if (savedLanguage && document.getElementById('languageSelect')) {
        document.getElementById('languageSelect').value = savedLanguage;
    }
}

function initializeEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Generate button
    document.getElementById('generateButton').addEventListener('click', generateBlog);
    
    // Clear cache button
    document.getElementById('clearCacheButton').addEventListener('click', clearCache);
    
    // Copy button
    document.getElementById('copyButton').addEventListener('click', copyContent);
    
    // Print button
    document.getElementById('printButton').addEventListener('click', printArticle);
    
    // Download button
    document.getElementById('downloadButton').addEventListener('click', downloadArticle);
    
    // Save button
    document.getElementById('saveButton').addEventListener('click', () => {
        document.getElementById('saveModal').classList.add('visible');
    });
    
    // Password toggle
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // Temperature slider
    const temperatureSlider = document.getElementById('temperatureSlider');
    if (temperatureSlider) {
        temperatureSlider.addEventListener('input', (e) => {
            document.getElementById('temperatureValue').textContent = e.target.value;
            localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPERATURE, e.target.value);
        });
    }
    
    // Model select
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', (e) => {
            localStorage.setItem(LOCAL_STORAGE_KEYS.MODEL, e.target.value);
        });
    }
    
    // Tone select
    const toneSelect = document.getElementById('toneSelect');
    if (toneSelect) {
        toneSelect.addEventListener('change', (e) => {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TONE, e.target.value);
        });
    }
    
    // Language select
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, e.target.value);
        });
    }
    
    // Word count target
    const wordCountTarget = document.getElementById('wordCountTarget');
    if (wordCountTarget) {
        wordCountTarget.addEventListener('change', (e) => {
            localStorage.setItem(LOCAL_STORAGE_KEYS.WORD_COUNT, e.target.value);
        });
    }
    
    // Modal close button
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            document.getElementById('saveModal').classList.remove('visible');
        });
    }
    
    // Save article button
    const saveArticleButton = document.getElementById('saveArticleButton');
    if (saveArticleButton) {
        saveArticleButton.addEventListener('click', saveArticle);
    }
    
    // Add keyboard shortcut for generating article (Ctrl+Enter)
    document.getElementById('topic').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateBlog();
        }
    });
}

function updateThemeToggleText() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const themeText = themeToggle.querySelector('span');
    const themeIcon = themeToggle.querySelector('i');
    
    if (currentTheme === 'dark') {
        themeText.textContent = 'Switch to Light Mode';
        themeIcon.className = 'fas fa-sun';
    } else {
        themeText.textContent = 'Switch to Dark Mode';
        themeIcon.className = 'fas fa-moon';
    }
}

function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);
        
        updateThemeToggleText();
        console.log('Theme toggled to:', newTheme);
    } catch (error) {
        console.error('Theme toggle error:', error);
        showError('Failed to switch theme');
    }
}

function togglePasswordVisibility() {
    const apiKeyInput = document.getElementById('apiKey');
    const toggleButton = document.getElementById('togglePassword');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        apiKeyInput.type = 'password';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function clearCache() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.API_KEY);
        document.getElementById('apiKey').value = '';
        showSuccess('API key successfully deleted!');
    } catch (error) {
        console.error('Clear cache error:', error);
        showError('Failed to delete saved API key');
    }
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

function getWordCount(text) {
    return text.trim().split(/\s+/).length;
}

function createSegmentPrompt(topic, section, wordCount, tone, language) {
    const toneInstructions = {
        professional: {
            english: "Use a formal, authoritative tone with industry-specific terminology where appropriate.",
            malay: "Gunakan nada formal dan berwibawa dengan terminologi khusus industri jika sesuai."
        },
        casual: {
            english: "Use a relaxed, conversational tone with simple language and occasional colloquialisms.",
            malay: "Gunakan nada santai dan percakapan dengan bahasa yang mudah dan sesekali ungkapan sehari-hari."
        },
        academic: {
            english: "Use a scholarly tone with precise language, citations, and well-structured arguments.",
            malay: "Gunakan nada akademik dengan bahasa yang tepat, petikan, dan hujah yang terstruktur dengan baik."
        },
        conversational: {
            english: "Write as if having a friendly conversation with the reader, using questions and personal pronouns.",
            malay: "Tulis seolah-olah sedang berbual mesra dengan pembaca, menggunakan soalan dan kata ganti nama peribadi."
        },
        persuasive: {
            english: "Use compelling language with strong calls to action and emotional appeals.",
            malay: "Gunakan bahasa yang meyakinkan dengan seruan tindakan yang kuat dan rayuan emosi."
        },
        personal: {
            english: "Write in first person (I, me, my) with a highly personal, authentic voice. Use colloquial expressions, contractions, and casual language as if sharing your own experiences and thoughts with a friend. Include personal anecdotes and relatable examples where appropriate.",
            malay: "Tulis dalam orang pertama (saya, aku) dengan suara peribadi dan autentik. Gunakan ungkapan sehari-hari dan bahasa santai seolah-olah berkongsi pengalaman dan pemikiran anda sendiri dengan rakan. Sertakan anekdot peribadi dan contoh yang berkaitan jika sesuai."
        }
    };
    
    const toneInstruction = toneInstructions[tone]?.[language] || toneInstructions.personal[language];
    
    const prompts = {
        introduction: {
            english: `Write an engaging introduction (exactly ${wordCount} words) for an article about "${topic}". 
                Naturally incorporate key keywords, grab the reader's attention, and outline what will be discussed in the article.
                ${toneInstruction} Format in markdown.`,
            malay: `Tulis pengenalan yang menarik (tepat ${wordCount} patah perkataan) untuk artikel mengenai "${topic}". 
                Masukkan kata kunci utama secara semula jadi, tarik perhatian pembaca, dan gariskan apa yang akan dibincangkan dalam artikel.
                ${toneInstruction} Format dalam markdown.`
        },
        mainContent: {
            english: `Write a detailed main content section (exactly ${wordCount} words) for an article about "${topic}".
                Focus on providing valuable and actionable information with appropriate H2 and H3 headings.
                Include statistics, examples, and personal experiences. ${toneInstruction} Format in markdown.`,
            malay: `Tulis bahagian kandungan utama yang terperinci (tepat ${wordCount} patah perkataan) untuk artikel mengenai "${topic}".
                Fokus pada memberikan maklumat yang berharga dan boleh dilaksanakan dengan tajuk H2 dan H3 yang sesuai.
                Sertakan statistik, contoh, dan pengalaman peribadi. ${toneInstruction} Format dalam markdown.`
        },
        conclusion: {
            english: `Write a strong conclusion (exactly ${wordCount} words) for an article about "${topic}".
                Summarize the key points and include a call to action. ${toneInstruction} Format in markdown.`,
            malay: `Tulis kesimpulan yang kuat (tepat ${wordCount} patah perkataan) untuk artikel mengenai "${topic}".
                Ringkaskan poin-poin utama dan sertakan seruan untuk bertindak. ${toneInstruction} Format dalam markdown.`
        },
        faq: {
            english: `Write a FAQ section (exactly ${wordCount} words) with 5 common questions and detailed answers about "${topic}".
                Format in markdown with H2 for "Frequently Asked Questions" and each question in H3. ${toneInstruction}`,
            malay: `Tulis bahagian Soalan Lazim (tepat ${wordCount} patah perkataan) dengan 5 soalan umum dan jawapan terperinci mengenai "${topic}".
                Format dalam markdown dengan H2 untuk "Soalan Lazim" dan setiap soalan dalam H3. ${toneInstruction}`
        }
    };
    
    return prompts[section][language];
}

async function generateBlog() {
    const topic = document.getElementById('topic').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
    // Validate inputs
    if (!validateInputs(topic, apiKey)) {
        return;
    }

    // Save API key
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_KEY, apiKey);
    
    // Get model, temperature, tone, and language settings
    const model = document.getElementById('modelSelect')?.value || 'google/learnlm-1.5-pro-experimental:free';
    const temperature = parseFloat(document.getElementById('temperatureSlider')?.value || 0.7);
    const targetWordCount = parseInt(document.getElementById('wordCountTarget')?.value || 2000);
    const tone = document.getElementById('toneSelect')?.value || 'personal';
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    // Save preferences
    localStorage.setItem(LOCAL_STORAGE_KEYS.MODEL, model);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPERATURE, temperature);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WORD_COUNT, targetWordCount);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TONE, tone);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, language);
    
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressBar').style.display = 'block';
    document.getElementById('blogContent').innerHTML = '';
    document.getElementById('copyButton').style.display = 'none';
    document.getElementById('printButton').style.display = 'none';
    document.getElementById('downloadButton').style.display = 'none';
    document.getElementById('saveButton').style.display = 'none';
    
    // Set article title
    document.getElementById('articleTitle').textContent = language === 'english' ? 
        `Article: ${topic}` : 
        `Artikel: ${topic}`;
    
    startProgressAnimation();

    try {
        // Calculate word counts for each section based on target total
        const totalWords = targetWordCount;
        const introWords = Math.round(totalWords * 0.1);
        const mainContentWords = Math.round(totalWords * 0.7);
        const conclusionWords = Math.round(totalWords * 0.1);
        const faqWords = Math.round(totalWords * 0.1);
        
        // Generate content in segments
        const segments = [
            { type: 'introduction', words: introWords, status: language === 'english' ? 'Generating introduction...' : 'Menjana pengenalan...' },
            { type: 'mainContent', words: mainContentWords, status: language === 'english' ? 'Generating main content...' : 'Menjana kandungan utama...' },
            { type: 'conclusion', words: conclusionWords, status: language === 'english' ? 'Generating conclusion...' : 'Menjana kesimpulan...' },
            { type: 'faq', words: faqWords, status: language === 'english' ? 'Generating FAQ section...' : 'Menjana bahagian Soalan Lazim...' }
        ];

        let fullContent = '';
        let currentProgress = 0;

        for (const segment of segments) {
            // Update status
            document.getElementById('generationStatus').textContent = segment.status;
            
            const prompt = createSegmentPrompt(topic, segment.type, segment.words, tone, language);
            const content = await generateSegment(prompt, apiKey, model, temperature);
            fullContent += content + '\n\n';
            
            // Update progress
            currentProgress += (100 / (segments.length + 1)); // +1 for metadata
            updateProgress(Math.min(currentProgress, 95));
        }

        // Update status for metadata generation
        document.getElementById('generationStatus').textContent = language === 'english' ? 'Generating SEO metadata...' : 'Menjana metadata SEO...';
        
        // Generate SEO metadata
        const metadataPrompt = language === 'english' ?
            `For an article about "${topic}", generate:
            - Focus Keywords: (primary keyword + 2-3 secondary keywords)
            - SEO Title: (50-60 characters, include power words + numbers, make it sound personal)
            - Slug: (3-4 words with main keyword)
            - Meta Description: (150-155 characters, include a personal call to action using "I" or "my" perspective)
            - Suggested Image Alt Text: (2-3 examples that sound personal and conversational)
            
            Write all of this in a personal, colloquial style as if you're sharing your own thoughts and experiences.` :
            `Untuk artikel mengenai "${topic}", hasilkan:
            - Kata Kunci Fokus: (kata kunci utama + 2-3 kata kunci sekunder)
            - Tajuk SEO: (50-60 aksara, sertakan kata-kata kuat + angka, buatnya kedengaran peribadi)
            - Slug: (3-4 perkataan dengan kata kunci utama)
            - Penerangan Meta: (150-155 aksara, sertakan seruan tindakan peribadi menggunakan perspektif "Saya" atau "aku")
            - Cadangan Teks Alt Imej: (2-3 contoh yang kedengaran peribadi dan perbualan)
            
            Tulis semua ini dalam gaya peribadi dan sehari-hari seolah-olah anda berkongsi pemikiran dan pengalaman anda sendiri.`;

        const metadata = await generateSegment(metadataPrompt, apiKey, model, temperature);
        
        // Display content
        displayContent(fullContent, metadata, topic);
        
        // Show success message
        showSuccess(language === 'english' ? 'Article successfully generated!' : 'Artikel berjaya dihasilkan!');
    } catch (error) {
        console.error('Generation Error:', error);
        showError(language === 'english' ? 'Error generating content: ' + error.message : 'Ralat menjana kandungan: ' + error.message);
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

function validateInputs(topic, apiKey) {
    let isValid = true;
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    // Validate topic
    if (!topic) {
        document.getElementById('topicError').textContent = language === 'english' ? 
            'Please enter an article topic' : 
            'Sila masukkan topik artikel';
        document.getElementById('topicError').classList.add('visible');
        isValid = false;
    } else {
        document.getElementById('topicError').classList.remove('visible');
    }
    
    // Validate API key
    if (!apiKey) {
        document.getElementById('apiKeyError').textContent = language === 'english' ? 
            'Please enter your OpenRouter API key' : 
            'Sila masukkan kunci API OpenRouter anda';
        document.getElementById('apiKeyError').classList.add('visible');
        isValid = false;
    } else {
        document.getElementById('apiKeyError').classList.remove('visible');
    }
    
    return isValid;
}

async function generateSegment(prompt, apiKey, model, temperature) {
    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: temperature,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate segment');
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error('Invalid response format from API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(`API Error: ${error.message}`);
    }
}

function updateProgress(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressText.textContent = `${Math.round(progress)}%`;
}

function startProgressAnimation() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

function stopProgressAnimation() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = '100%';
    progressBar.setAttribute('aria-valuenow', 100);
    progressText.textContent = '100%';
    
    setTimeout(() => {
        document.getElementById('loadingSpinner').style.display = 'none';
    }, 500);
}

function displayContent(articleContent, metadata, topic) {
    stopProgressAnimation();
    
    const blogContent = document.getElementById('blogContent');
    const seoMetadata = document.getElementById('seoMetadataContent');
    const wordCountElement = document.getElementById('wordCount');
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    // Calculate word count
    const wordCount = getWordCount(articleContent);
    const targetWordCount = parseInt(document.getElementById('wordCountTarget')?.value || 2000);
    
    // Display word count with appropriate styling
    wordCountElement.textContent = language === 'english' ? 
        `Total Word Count: ${wordCount} words` : 
        `Jumlah Kiraan Perkataan: ${wordCount} perkataan`;
    wordCountElement.className = 'word-count';
    
    if (Math.abs(wordCount - targetWordCount) > targetWordCount * 0.1) {
        wordCountElement.classList.add('warning');
    } else {
        wordCountElement.classList.add('success');
    }

    // Configure marked options
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
        sanitize: false
    });

    // Display main article content
    try {
        blogContent.innerHTML = marked.parse(articleContent);
    } catch (error) {
        console.error('Markdown parsing error:', error);
        blogContent.innerHTML = articleContent; // Fallback to plain text
    }

    // Parse and display metadata
    const metadataLines = metadata.split('\n').filter(line => line.trim());
    const metadataHtml = metadataLines.map(line => `<div>${line}</div>`).join('');
    seoMetadata.innerHTML = metadataHtml;

    // Show control buttons
    document.getElementById('copyButton').style.display = 'block';
    document.getElementById('printButton').style.display = 'block';
    document.getElementById('downloadButton').style.display = 'block';
    document.getElementById('saveButton').style.display = 'block';
    
    // Update SEO Metadata heading
    document.querySelector('.seo-metadata h3').innerHTML = language === 'english' ? 
        '<i class="fas fa-search"></i> SEO Metadata' : 
        '<i class="fas fa-search"></i> Metadata SEO';
    
    // Store current article in session storage for potential saving
    sessionStorage.setItem('currentArticle', JSON.stringify({
        topic: topic,
        content: articleContent,
        metadata: metadata,
        wordCount: wordCount,
        date: new Date().toISOString(),
        language: language
    }));
}

function copyContent() {
    const blogContent = document.getElementById('blogContent').innerText;
    const seoMetadata = document.getElementById('seoMetadataContent').innerText;
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    const fullContent = `${blogContent}\n\n--- ${language === 'english' ? 'SEO Metadata' : 'Metadata SEO'} ---\n${seoMetadata}`;
    
    navigator.clipboard.writeText(fullContent)
        .then(() => showSuccess(language === 'english' ? 'Content copied to clipboard!' : 'Kandungan disalin ke papan keratan!'))
        .catch(err => showError(language === 'english' ? 'Failed to copy content: ' + err : 'Gagal menyalin kandungan: ' + err));
}

function printArticle() {
    window.print();
}

function downloadArticle() {
    const blogContent = document.getElementById('blogContent').innerText;
    const seoMetadata = document.getElementById('seoMetadataContent').innerText;
    const topic = document.getElementById('topic').value.trim();
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    const fullContent = `# ${topic}\n\n${blogContent}\n\n## ${language === 'english' ? 'SEO Metadata' : 'Metadata SEO'}\n\n${seoMetadata}`;
    
    // Create a blob and download link
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Create filename from topic
    const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'article';
    
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showSuccess(language === 'english' ? 'Article has been downloaded!' : 'Artikel telah dimuat turun!');
}

function loadSavedArticles() {
    const savedArticles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_ARTICLES) || '[]');
    const articlesList = document.getElementById('articlesList');
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    if (savedArticles.length === 0) {
        articlesList.innerHTML = `<p class="empty-state">${language === 'english' ? 'No saved articles.' : 'Tiada artikel tersimpan.'}</p>`;
        return;
    }
    
    // Sort articles by date (newest first)
    savedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate HTML for each article
    const articlesHtml = savedArticles.map((article, index) => `
        <div class="article-card" data-index="${index}">
            <h4>${article.topic}</h4>
            <div class="article-meta">
                <span>${new Date(article.date).toLocaleDateString()}</span>
                <span>${article.wordCount} ${article.language === 'malay' ? 'perkataan' : 'words'}</span>
                ${article.language ? `<span class="article-language">${article.language === 'malay' ? 'Bahasa Malaysia' : 'English'}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    articlesList.innerHTML = articlesHtml;
    
    // Add event listeners to article cards
    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            loadArticle(savedArticles[index]);
        });
    });
}

function loadArticle(article) {
    // Set topic
    document.getElementById('topic').value = article.topic;
    
    // Set language if available
    if (article.language && document.getElementById('languageSelect')) {
        document.getElementById('languageSelect').value = article.language;
        localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, article.language);
    }
    
    // Set article title
    const language = article.language || 'english';
    document.getElementById('articleTitle').textContent = language === 'english' ? 
        `Article: ${article.topic}` : 
        `Artikel: ${article.topic}`;
    
    // Display content
    displayContent(article.content, article.metadata, article.topic);
    
    // Scroll to output section
    document.querySelector('.output-section').scrollIntoView({ behavior: 'smooth' });
    
    // Show success message
    showSuccess(language === 'english' ? 'Article loaded!' : 'Artikel dimuat!');
}

function saveArticle() {
    const currentArticle = JSON.parse(sessionStorage.getItem('currentArticle') || 'null');
    if (!currentArticle) {
        const language = document.getElementById('languageSelect')?.value || 'english';
        showError(language === 'english' ? 'No article to save' : 'Tiada artikel untuk disimpan');
        return;
    }
    
    const articleName = document.getElementById('articleName').value.trim() || currentArticle.topic;
    currentArticle.topic = articleName;
    
    // Get existing saved articles
    const savedArticles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_ARTICLES) || '[]');
    
    // Add new article
    savedArticles.push(currentArticle);
    
    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(savedArticles));
    
    // Close modal
    document.getElementById('saveModal').classList.remove('visible');
    
    // Reload saved articles list
    loadSavedArticles();
    
    // Show success message
    const language = currentArticle.language || 'english';
    showSuccess(language === 'english' ? 'Article successfully saved!' : 'Artikel berjaya disimpan!');
}

function updateUILanguage() {
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    // Update input labels and placeholders
    document.getElementById('topicLabel').textContent = language === 'english' ? 'Article Topic:' : 'Topik Artikel:';
    document.getElementById('topic').placeholder = language === 'english' ? 
        'Enter your article topic' : 'Masukkan topik artikel anda';
    
    document.getElementById('apiKeyLabel').textContent = language === 'english' ? 'OpenRouter API Key:' : 'Kunci API OpenRouter:';
    document.getElementById('apiKey').placeholder = language === 'english' ? 
        'Enter your API key' : 'Masukkan kunci API anda';
    
    document.getElementById('apiKeyHelp').innerHTML = language === 'english' ? 
        'Get your API key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a>' : 
        'Dapatkan kunci API anda di <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a>';
    
    // Update advanced settings labels
    document.getElementById('advancedSettingsLabel').textContent = language === 'english' ? 
        'Advanced Settings' : 'Tetapan Lanjutan';
    
    document.getElementById('modelSelectLabel').textContent = language === 'english' ? 
        'AI Model:' : 'Model AI:';
    
    document.getElementById('temperatureLabel').textContent = language === 'english' ? 
        'Creativity (Temperature):' : 'Kreativiti (Suhu):';
    
    document.getElementById('wordCountLabel').textContent = language === 'english' ? 
        'Target Word Count:' : 'Sasaran Bilangan Perkataan:';
    
    document.getElementById('toneSelectLabel').textContent = language === 'english' ? 
        'Writing Tone:' : 'Nada Penulisan:';
    
    document.getElementById('languageSelectLabel').textContent = language === 'english' ? 
        'Output Language:' : 'Bahasa Output:';
    
    // Update tone select options
    const toneSelect = document.getElementById('toneSelect');
    const currentTone = toneSelect.value;
    
    // Save current options
    const toneOptions = {
        personal: language === 'english' ? 'Personal & Colloquial' : 'Peribadi & Sehari-hari',
        conversational: language === 'english' ? 'Conversational' : 'Perbualan',
        casual: language === 'english' ? 'Casual' : 'Santai',
        professional: language === 'english' ? 'Professional' : 'Profesional',
        academic: language === 'english' ? 'Academic' : 'Akademik',
        persuasive: language === 'english' ? 'Persuasive' : 'Meyakinkan'
    };
    
    // Update options
    toneSelect.innerHTML = '';
    Object.entries(toneOptions).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        toneSelect.appendChild(option);
    });
    
    // Restore selected value
    toneSelect.value = currentTone;
    
    // Update buttons
    document.getElementById('generateButton').innerHTML = language === 'english' ? 
        '<i class="fas fa-magic"></i> Generate Article' : 
        '<i class="fas fa-magic"></i> Jana Artikel';
    
    document.getElementById('clearCacheButton').innerHTML = language === 'english' ? 
        '<i class="fas fa-trash"></i> Clear Saved API Key' : 
        '<i class="fas fa-trash"></i> Padam Kunci API Tersimpan';
    
    // Update save modal text
    document.getElementById('saveModalTitle').textContent = language === 'english' ? 'Save Article' : 'Simpan Artikel';
    document.getElementById('articleNameLabel').textContent = language === 'english' ? 'Article Name:' : 'Nama Artikel:';
    document.getElementById('articleName').placeholder = language === 'english' ? 
        'Enter a name for this article' : 'Masukkan nama untuk artikel ini';
    document.getElementById('saveArticleButton').textContent = language === 'english' ? 'Save' : 'Simpan';
    
    // Update saved articles section
    document.querySelector('#savedArticles h3').innerHTML = language === 'english' ? 
        '<i class="fas fa-history"></i> Saved Articles' : 
        '<i class="fas fa-history"></i> Artikel Tersimpan';
    
    // Update SEO metadata heading if it exists
    const seoHeading = document.querySelector('.seo-metadata h3');
    if (seoHeading) {
        seoHeading.innerHTML = language === 'english' ? 
            '<i class="fas fa-search"></i> SEO Metadata' : 
            '<i class="fas fa-search"></i> Metadata SEO';
    }
    
    // Update article title if it's the default
    const articleTitle = document.getElementById('articleTitle');
    if (articleTitle.textContent === 'Your Article' || articleTitle.textContent === 'Artikel Anda') {
        articleTitle.textContent = language === 'english' ? 'Your Article' : 'Artikel Anda';
    }
    
    // Update empty state text for saved articles
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.textContent = language === 'english' ? 'No saved articles.' : 'Tiada artikel tersimpan.';
    }
}

// Add CSS for toast notifications
(function addToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
            max-width: 90%;
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast.error {
            background-color: var(--error-color);
        }
        
        .toast.success {
            background-color: var(--success-color);
        }
        
        .toast i {
            font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
            .toast {
                left: 20px;
                right: 20px;
                text-align: center;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);
})(); 
