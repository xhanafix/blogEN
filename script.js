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
    TONE: 'writingTone'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Ensure theme toggle works immediately
    document.getElementById('themeToggle').onclick = toggleTheme;
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

function createSegmentPrompt(topic, section, wordCount, tone) {
    const toneInstructions = {
        professional: "Use a formal, authoritative tone with industry-specific terminology where appropriate.",
        casual: "Use a relaxed, conversational tone with simple language and occasional colloquialisms.",
        academic: "Use a scholarly tone with precise language, citations, and well-structured arguments.",
        conversational: "Write as if having a friendly conversation with the reader, using questions and personal pronouns.",
        persuasive: "Use compelling language with strong calls to action and emotional appeals.",
        personal: "Write in first person (I, me, my) with a highly personal, authentic voice. Use colloquial expressions, contractions, and casual language as if sharing your own experiences and thoughts with a friend. Include personal anecdotes and relatable examples where appropriate."
    };
    
    const toneInstruction = toneInstructions[tone] || toneInstructions.personal;
    
    const prompts = {
        introduction: `Write an engaging introduction (exactly ${wordCount} words) for an article about "${topic}". 
            Naturally incorporate key keywords, grab the reader's attention, and outline what will be discussed in the article.
            ${toneInstruction} Format in markdown.`,
            
        mainContent: `Write a detailed main content section (exactly ${wordCount} words) for an article about "${topic}".
            Focus on providing valuable and actionable information with appropriate H2 and H3 headings.
            Include statistics, examples, and personal experiences. ${toneInstruction} Format in markdown.`,
            
        conclusion: `Write a strong conclusion (exactly ${wordCount} words) for an article about "${topic}".
            Summarize the key points and include a call to action. ${toneInstruction} Format in markdown.`,
            
        faq: `Write a FAQ section (exactly ${wordCount} words) with 5 common questions and detailed answers about "${topic}".
            Format in markdown with H2 for "Frequently Asked Questions" and each question in H3. ${toneInstruction}`
    };
    
    return prompts[section];
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
    
    // Get model, temperature, and tone settings
    const model = document.getElementById('modelSelect')?.value || 'google/learnlm-1.5-pro-experimental:free';
    const temperature = parseFloat(document.getElementById('temperatureSlider')?.value || 0.7);
    const targetWordCount = parseInt(document.getElementById('wordCountTarget')?.value || 2000);
    const tone = document.getElementById('toneSelect')?.value || 'personal';
    
    // Save preferences
    localStorage.setItem(LOCAL_STORAGE_KEYS.MODEL, model);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPERATURE, temperature);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WORD_COUNT, targetWordCount);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TONE, tone);
    
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
    document.getElementById('articleTitle').textContent = `Article: ${topic}`;
    
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
            { type: 'introduction', words: introWords, status: 'Generating introduction...' },
            { type: 'mainContent', words: mainContentWords, status: 'Generating main content...' },
            { type: 'conclusion', words: conclusionWords, status: 'Generating conclusion...' },
            { type: 'faq', words: faqWords, status: 'Generating FAQ section...' }
        ];

        let fullContent = '';
        let currentProgress = 0;

        for (const segment of segments) {
            // Update status
            document.getElementById('generationStatus').textContent = segment.status;
            
            const prompt = createSegmentPrompt(topic, segment.type, segment.words, tone);
            const content = await generateSegment(prompt, apiKey, model, temperature);
            fullContent += content + '\n\n';
            
            // Update progress
            currentProgress += (100 / (segments.length + 1)); // +1 for metadata
            updateProgress(Math.min(currentProgress, 95));
        }

        // Update status for metadata generation
        document.getElementById('generationStatus').textContent = 'Generating SEO metadata...';
        
        // Generate SEO metadata
        const metadataPrompt = `For an article about "${topic}", generate:
            - Focus Keywords: (primary keyword + 2-3 secondary keywords)
            - SEO Title: (50-60 characters, include power words + numbers, make it sound personal)
            - Slug: (3-4 words with main keyword)
            - Meta Description: (150-155 characters, include a personal call to action using "I" or "my" perspective)
            - Suggested Image Alt Text: (2-3 examples that sound personal and conversational)
            
            Write all of this in a personal, colloquial style as if you're sharing your own thoughts and experiences.`;

        const metadata = await generateSegment(metadataPrompt, apiKey, model, temperature);
        
        // Display content
        displayContent(fullContent, metadata, topic);
        
        // Show success message
        showSuccess('Article successfully generated!');
    } catch (error) {
        console.error('Generation Error:', error);
        showError('Error generating content: ' + error.message);
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

function validateInputs(topic, apiKey) {
    let isValid = true;
    
    // Validate topic
    if (!topic) {
        document.getElementById('topicError').textContent = 'Please enter an article topic';
        document.getElementById('topicError').classList.add('visible');
        isValid = false;
    } else {
        document.getElementById('topicError').classList.remove('visible');
    }
    
    // Validate API key
    if (!apiKey) {
        document.getElementById('apiKeyError').textContent = 'Please enter your OpenRouter API key';
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
    
    // Calculate word count
    const wordCount = getWordCount(articleContent);
    const targetWordCount = parseInt(document.getElementById('wordCountTarget')?.value || 2000);
    
    // Display word count with appropriate styling
    wordCountElement.textContent = `Total Word Count: ${wordCount} words`;
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
    
    // Store current article in session storage for potential saving
    sessionStorage.setItem('currentArticle', JSON.stringify({
        topic: topic,
        content: articleContent,
        metadata: metadata,
        wordCount: wordCount,
        date: new Date().toISOString()
    }));
}

function copyContent() {
    const blogContent = document.getElementById('blogContent').innerText;
    const seoMetadata = document.getElementById('seoMetadataContent').innerText;
    
    const fullContent = `${blogContent}\n\n--- SEO Metadata ---\n${seoMetadata}`;
    
    navigator.clipboard.writeText(fullContent)
        .then(() => showSuccess('Content copied to clipboard!'))
        .catch(err => showError('Failed to copy content: ' + err));
}

function printArticle() {
    window.print();
}

function downloadArticle() {
    const blogContent = document.getElementById('blogContent').innerText;
    const seoMetadata = document.getElementById('seoMetadataContent').innerText;
    const topic = document.getElementById('topic').value.trim();
    
    const fullContent = `# ${topic}\n\n${blogContent}\n\n## SEO Metadata\n\n${seoMetadata}`;
    
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
    
    showSuccess('Article has been downloaded!');
}

function loadSavedArticles() {
    const savedArticles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_ARTICLES) || '[]');
    const articlesList = document.getElementById('articlesList');
    
    if (savedArticles.length === 0) {
        articlesList.innerHTML = '<p class="empty-state">No saved articles.</p>';
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
                <span>${article.wordCount} words</span>
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
    
    // Set article title
    document.getElementById('articleTitle').textContent = `Article: ${article.topic}`;
    
    // Display content
    displayContent(article.content, article.metadata, article.topic);
    
    // Scroll to output section
    document.querySelector('.output-section').scrollIntoView({ behavior: 'smooth' });
    
    showSuccess('Article loaded!');
}

function saveArticle() {
    const currentArticle = JSON.parse(sessionStorage.getItem('currentArticle') || 'null');
    if (!currentArticle) {
        showError('No article to save');
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
    
    showSuccess('Article successfully saved!');
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
