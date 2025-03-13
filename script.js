// DOM Elements
const apiKeyInput = document.getElementById('api-key');
const toggleApiKeyBtn = document.getElementById('toggle-api-key');
const topicInput = document.getElementById('topic');
const competitorUrlInput = document.getElementById('competitor-url');
const generateBtn = document.getElementById('generate-btn');
const resultSection = document.querySelector('.result-section');
const resultContent = document.getElementById('result-content');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const closeNotificationBtn = document.getElementById('close-notification');
const progressContainer = document.getElementById('progress-container');
const progressStatusText = document.getElementById('progress-status-text');
const progressPercentage = document.getElementById('progress-percentage');
const progressBarFill = document.getElementById('progress-bar-fill');
const wordCount = document.getElementById('word-count');

// Constants
const API_KEY_STORAGE_KEY = 'openrouter_api_key';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/learnlm-1.5-pro-experimental:free';
const MIN_WORD_COUNT = 1500;
const MAX_WORD_COUNT = 2000;
const MAX_TOKENS = 4096;

// Progress stages
const PROGRESS_STAGES = [
    { percentage: 10, status: 'Initializing request...' },
    { percentage: 20, status: 'Analyzing topic...' },
    { percentage: 30, status: 'Researching competitor content...' },
    { percentage: 40, status: 'Planning article structure...' },
    { percentage: 50, status: 'Generating headings...' },
    { percentage: 60, status: 'Writing introduction...' },
    { percentage: 70, status: 'Creating main content...' },
    { percentage: 80, status: 'Developing FAQs...' },
    { percentage: 90, status: 'Finalizing SEO metadata...' },
    { percentage: 95, status: 'Polishing content...' },
    { percentage: 100, status: 'Article complete!' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Add event listeners
    toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    apiKeyInput.addEventListener('change', saveApiKey);
    document.getElementById('generator-form').addEventListener('submit', handleFormSubmit);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadMarkdown);
    closeNotificationBtn.addEventListener('click', hideNotification);

    // Form validation
    [topicInput, competitorUrlInput, apiKeyInput].forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // Initial form validation
    validateForm();
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    
    // Toggle icon
    const icon = toggleApiKeyBtn.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// Save API key to localStorage
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        showNotification('API key saved successfully', 'success');
    } else {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    validateForm();
}

// Validate form inputs
function validateForm() {
    const apiKey = apiKeyInput.value.trim();
    const topic = topicInput.value.trim();
    const url = competitorUrlInput.value.trim();
    
    const isValid = apiKey && topic && isValidUrl(url);
    generateBtn.disabled = !isValid;
    
    return isValid;
}

// Check if URL is valid
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    if (validateForm()) {
        generateArticle();
    } else {
        showNotification('Please fill in all required fields with valid information', 'error');
    }
}

// Process the generated content to ensure proper formatting
function processGeneratedContent(content) {
    // Ensure content has {start} and {finish} tags
    let processedContent = content;
    
    // Remove any existing start/finish tags to avoid duplicates
    processedContent = processedContent.replace('{start}', '').replace('{finish}', '');
    
    // Trim whitespace
    processedContent = processedContent.trim();
    
    // Add start tag at the beginning if not present
    if (!processedContent.startsWith('{start}')) {
        processedContent = '{start}\n\n' + processedContent;
    }
    
    // Add finish tag at the end if not present
    if (!processedContent.endsWith('{finish}')) {
        processedContent = processedContent + '\n\n{finish}';
    }
    
    // Ensure there are 5 FAQs
    processedContent = ensureFiveUniqueQAs(processedContent);
    
    // Ensure all headings are properly formatted (with ## for H2, ### for H3, etc.)
    processedContent = ensureProperHeadings(processedContent);
    
    return processedContent;
}

// Ensure there are exactly 5 FAQs in the content
function ensureFiveUniqueQAs(content) {
    // Find the FAQ section
    const faqRegex = /## (?:FAQ|Frequently Asked Questions)s?(?:\r?\n|\r)([^#]*)/i;
    const match = content.match(faqRegex);
    
    if (!match) {
        // If no FAQ section found, return the content as is
        return content;
    }
    
    // Extract the FAQ section
    const faqSection = match[1];
    
    // Find all Q&A pairs
    const qaRegex = /-\s+(?:Q\d+:|Question:)?\s*(.*?)\?\s*(?:\r?\n|\r)\s*(?:A\d+:|Answer:)?\s*([\s\S]*?)(?=(?:\r?\n|\r)-|\s*(?:##|$))/g;
    const qaPairs = [];
    let qaMatch;
    
    while ((qaMatch = qaRegex.exec(faqSection)) !== null) {
        qaPairs.push({
            question: qaMatch[1].trim(),
            answer: qaMatch[2].trim()
        });
    }
    
    // If we have exactly 5 Q&A pairs, return the content as is
    if (qaPairs.length === 5) {
        return content;
    }
    
    // If we have more than 5, keep only the first 5
    if (qaPairs.length > 5) {
        const newFaqSection = qaPairs.slice(0, 5).map((qa, index) => {
            return `- Q${index + 1}: ${qa.question}?\n  A${index + 1}: ${qa.answer}`;
        }).join('\n\n');
        
        return content.replace(faqRegex, `## Frequently Asked Questions\n${newFaqSection}\n\n`);
    }
    
    // If we have less than 5, add generic ones to make it 5
    if (qaPairs.length < 5) {
        const genericQuestions = [
            { question: "What are the key benefits of this approach", answer: "The key benefits include improved efficiency, better results, and long-term sustainability. By implementing these strategies, you can achieve better outcomes while using fewer resources." },
            { question: "How long does it take to see results", answer: "Results typically begin to appear within 2-4 weeks, though significant improvements may take 2-3 months depending on your specific situation and how consistently you apply the recommended strategies." },
            { question: "Is this approach suitable for beginners", answer: "Yes, this approach is designed to be accessible for beginners while still offering value to experienced practitioners. We provide step-by-step guidance to help you get started regardless of your experience level." },
            { question: "What tools or resources are needed to get started", answer: "To get started, you'll need basic tools like a computer with internet access, relevant software applications, and a willingness to learn. Most resources are freely available online, though some premium tools may enhance your results." },
            { question: "How does this compare to other similar methods", answer: "This approach stands out for its comprehensive nature, ease of implementation, and proven results. Unlike other methods that may focus on just one aspect, our approach addresses all critical factors for success." }
        ];
        
        const existingQuestions = qaPairs.map(qa => qa.question.toLowerCase());
        const additionalQAs = genericQuestions.filter(qa => !existingQuestions.includes(qa.question.toLowerCase())).slice(0, 5 - qaPairs.length);
        
        const allQAs = [...qaPairs, ...additionalQAs];
        const newFaqSection = allQAs.map((qa, index) => {
            return `- Q${index + 1}: ${qa.question}?\n  A${index + 1}: ${qa.answer}`;
        }).join('\n\n');
        
        return content.replace(faqRegex, `## Frequently Asked Questions\n${newFaqSection}\n\n`);
    }
    
    return content;
}

// Ensure all headings are properly formatted
function ensureProperHeadings(content) {
    // Split content by lines
    const lines = content.split(/\r?\n/);
    const processedLines = [];
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if it's a heading
        if (/^#+\s+/.test(line)) {
            // It's already a heading, keep it as is
            processedLines.push(line);
        } else if (/^[A-Z][\w\s]+:$/.test(line) && !line.includes(':') && i > 0 && !lines[i-1].startsWith('#')) {
            // It looks like a heading but doesn't have # symbols
            // Convert it to an H2 heading
            processedLines.push(`## ${line}`);
        } else {
            // Not a heading, keep it as is
            processedLines.push(line);
        }
    }
    
    return processedLines.join('\n');
}

// Generate article
async function generateArticle() {
    const apiKey = apiKeyInput.value.trim();
    const topic = topicInput.value.trim();
    const competitorUrl = competitorUrlInput.value.trim();

    // Show loading state and reset progress
    setLoadingState(true);
    showProgressIndicator();
    resetProgress();
    
    // Reset result section
    resultContent.innerHTML = '';
    resultSection.classList.add('hidden');

    try {
        // Start progress animation
        startProgressAnimation();
        
        // Generate the article
        updateProgress(30, 'Generating article content...');
        const prompt = constructPrompt(topic, competitorUrl);
        
        const response = await callOpenRouterAPI(prompt, apiKey);
        
        if (response && response.choices && response.choices.length > 0) {
            let generatedContent = response.choices[0].message.content;
            
            // Process the content to ensure proper formatting
            generatedContent = processGeneratedContent(generatedContent);
            
            // Check word count
            const wordCountResult = countWords(generatedContent);
            
            if (wordCountResult < MIN_WORD_COUNT) {
                updateProgress(85, 'Article too short, expanding content...');
                
                try {
                    // Request additional content to reach the minimum word count
                    const additionalContent = await expandArticle(generatedContent, topic, competitorUrl, apiKey, MIN_WORD_COUNT - wordCountResult);
                    
                    // Combine the original and additional content
                    let fullContent = combineContent(generatedContent, additionalContent);
                    
                    // Process the combined content
                    fullContent = processGeneratedContent(fullContent);
                    
                    // Complete the progress
                    updateProgress(100, 'Article complete!');
                    
                    // Display the result
                    displayResult(fullContent);
                    showNotification('Article generated successfully!', 'success');
                } catch (expansionError) {
                    console.error('Error expanding article:', expansionError);
                    // If expansion fails, still show the original content
                    updateProgress(100, 'Article complete (without expansion)');
                    
                    // Display the result
                    displayResult(generatedContent);
                    showNotification('Article generated with limited length due to API constraints', 'warning');
                }
            } else {
                // Complete the progress
                updateProgress(100, 'Article complete!');
                
                // Display the result
                displayResult(generatedContent);
                showNotification('Article generated successfully!', 'success');
            }
        } else {
            throw new Error('Invalid or empty response from API');
        }
    } catch (error) {
        console.error('Error generating article:', error);
        showNotification(`Error: ${error.message || 'Failed to generate article'}. Please check your API key and try again.`, 'error');
        hideProgressIndicator();
        
        // Display error in result area too
        resultContent.innerHTML = `<div class="error-message">
            <h3>Error Generating Article</h3>
            <p>${error.message || 'An unknown error occurred while generating the article.'}</p>
            <p>Please check your API key and try again. If the problem persists, try a different topic or URL.</p>
        </div>`;
        resultSection.classList.remove('hidden');
    } finally {
        setLoadingState(false);
        
        // Stop the progress animation
        if (window.progressAnimationInterval) {
            clearInterval(window.progressAnimationInterval);
        }
    }
}

// Construct prompt for the AI
function constructPrompt(topic, url) {
    return `Please ignore all previous instructions. Following the guidelines provided by https://rankmath.com/kb/score-100-in-tests/. I Want You To Act As A Content Writer Very Proficient SEO Writer Writes Fluently casual English. Write a 1500-2000 words 100% Unique, SEO-optimized, Human-Written article in casual English with at least 15 headings and subheadings (including H1, H2, H3, and H4 headings) that covers the topic "${topic}", include bullet points or a numbered list if needed. Write The article In Your Own Words Rather Than Copying And Pasting From Other Sources. Consider perplexity and burstiness when creating content, ensuring high levels of both without losing specificity or context. Use formal "we" language with rich, detailed paragraphs that engage the reader. Write In A Conversational Style As Written By A Human (Use An Informal Tone, Utilize Personal Pronouns, Keep It Simple, Engage The Reader, Use The Active Voice, Keep It Brief, Use Rhetorical Questions, and Incorporate Analogies And Metaphors). End with a conclusion paragraph and 5 unique FAQs After The Conclusion. this is important to Bold Title and all headings of article, and use appropriate headings for H tags. Start with {start} tags at the beginning of the article and end with {finish} tags at the end of the article. Now Write An markdown formatted Article On This URL "${url}" that it can outrank in Google. At the end of the article, I want you to write the  

1) Focus Keywords: SEO Friendly Focus Keywords Within 6 Words. 

2) SEO Title: SEO Friendly SEO Title Within 60 Characters With Add Above Focus Keywords at the start.

3) Slug: SEO Friendly Slug within 15 characters including Focus Keywords.

4) Meta Description: SEO Friendly meta description within 155 characters including Above Focus Keywords.

5) Alt text image: represents the contents, mood, or theme of a article.`;
}

// Count words in content
function countWords(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
}

// Expand article to reach target word count
async function expandArticle(originalContent, topic, competitorUrl, apiKey, additionalWordsNeeded) {
    // Create a prompt to expand the article
    const expansionPrompt = `
The following is a partial SEO article about "${topic}" that needs to be expanded with approximately ${additionalWordsNeeded} more words to reach a total of ${MIN_WORD_COUNT}-${MAX_WORD_COUNT} words. 

Following the guidelines provided by https://rankmath.com/kb/score-100-in-tests/, please analyze the existing content and add more detailed sections, examples, case studies, or expand on existing points.

IMPORTANT INSTRUCTIONS:
1. Do NOT create duplicate sections
2. Do NOT add another FAQ section if one already exists (just expand the existing one)
3. Ensure your additions flow seamlessly with the existing content
4. Add transition sentences to connect your additions with the existing content
5. Format your additions in markdown with appropriate headings (H2-H4) that fit with the existing structure
6. Write in a conversational style as written by a human (use an informal tone, utilize personal pronouns, keep it simple, engage the reader, use the active voice)
7. Incorporate analogies and metaphors where appropriate
8. Consider perplexity and burstiness when creating content
9. Use formal "we" language with rich, detailed paragraphs

Original content:
${originalContent.substring(0, 800)}... [truncated for brevity]

Please provide ONLY the additional content that should be added to the article. Format it in markdown with appropriate headings (H2-H4) that fit with the existing structure.`;

    // Call the API for expansion
    const response = await callOpenRouterAPI(expansionPrompt, apiKey, true);
    
    if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
    } else {
        throw new Error('Failed to expand article content');
    }
}

// Combine original content with additional content
function combineContent(originalContent, additionalContent) {
    // Find the FAQs section or the end of the content to insert the additional content
    const faqIndex = originalContent.indexOf('## FAQ');
    const faqLongIndex = originalContent.indexOf('## Frequently Asked Questions');
    const conclusionIndex = originalContent.indexOf('## Conclusion');
    
    // Use the index that exists and comes first
    let insertIndex = -1;
    
    // Check for FAQ sections
    if (faqIndex !== -1 && faqLongIndex !== -1) {
        insertIndex = Math.min(faqIndex, faqLongIndex);
    } else if (faqIndex !== -1) {
        insertIndex = faqIndex;
    } else if (faqLongIndex !== -1) {
        insertIndex = faqLongIndex;
    } 
    // If no FAQ section, check for conclusion
    else if (conclusionIndex !== -1) {
        insertIndex = conclusionIndex;
    }
    
    if (insertIndex !== -1) {
        // Insert before FAQs or Conclusion
        return originalContent.substring(0, insertIndex) + 
               "\n\n" + additionalContent + "\n\n" + 
               originalContent.substring(insertIndex);
    } else {
        // If no FAQs or Conclusion section, check for metadata section
        const metadataIndex = originalContent.indexOf('Focus Keywords:');
        
        if (metadataIndex !== -1) {
            // Insert before metadata
            return originalContent.substring(0, metadataIndex) + 
                   "\n\n" + additionalContent + "\n\n" + 
                   originalContent.substring(metadataIndex);
        } else {
            // If no clear insertion point, check for finish tag
            const finishIndex = originalContent.indexOf('{finish}');
            
            if (finishIndex !== -1) {
                // Insert before finish tag
                return originalContent.substring(0, finishIndex) + 
                       "\n\n" + additionalContent + "\n\n" + 
                       originalContent.substring(finishIndex);
            } else {
                // If no clear insertion point, just append to the end
                return originalContent + "\n\n" + additionalContent;
            }
        }
    }
}

// Start progress animation
function startProgressAnimation() {
    let currentStageIndex = 0;
    
    const progressInterval = setInterval(() => {
        if (currentStageIndex >= PROGRESS_STAGES.length) {
            clearInterval(progressInterval);
            return;
        }
        
        const stage = PROGRESS_STAGES[currentStageIndex];
        updateProgress(stage.percentage, stage.status);
        
        // Move to next stage with some randomness to simulate real progress
        if (Math.random() > 0.3 || currentStageIndex === 0) {
            currentStageIndex++;
        }
    }, 1000 + Math.random() * 1000); // Random interval between 1-2 seconds
    
    // Store the interval ID to clear it if needed
    window.progressAnimationInterval = progressInterval;
}

// Update progress indicator
function updateProgress(percentage, statusText) {
    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
    progressStatusText.textContent = statusText;
}

// Reset progress
function resetProgress() {
    updateProgress(0, 'Initializing...');
}

// Show progress indicator
function showProgressIndicator() {
    progressContainer.classList.remove('hidden');
}

// Hide progress indicator
function hideProgressIndicator() {
    progressContainer.classList.add('hidden');
    
    // Clear any ongoing progress animation
    if (window.progressAnimationInterval) {
        clearInterval(window.progressAnimationInterval);
    }
}

// Call OpenRouter API
async function callOpenRouterAPI(prompt, apiKey, isFallback = false) {
    const payload = {
        model: MODEL,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: isFallback ? 0.5 : 0.7,
        max_tokens: isFallback ? 2048 : MAX_TOKENS,
        top_p: 0.9
    };

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'SEO Article Generator'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMessage = `API request failed with status ${response.status}`;
            
            try {
                const errorData = await response.json();
                
                if (errorData.error && errorData.error.message) {
                    errorMessage = errorData.error.message;
                }
                
                // Check for specific error types
                if (response.status === 401) {
                    errorMessage = "Invalid API key. Please check your OpenRouter API key and try again.";
                } else if (response.status === 429) {
                    errorMessage = "Rate limit exceeded. Please wait a moment before trying again.";
                } else if (response.status === 400) {
                    errorMessage = `Bad request: ${errorMessage}. Try with a simpler prompt.`;
                }
            } catch (e) {
                // If we can't parse the error JSON, just use the status code message
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Validate the response structure
        if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
            throw new Error("Received invalid response format from API");
        }
        
        return data;
    } catch (error) {
        console.error("API call error:", error);
        throw error;
    }
}

// Display the generated result
function displayResult(content) {
    try {
        // Remove {start} and {finish} tags for display
        let displayContent = content.replace('{start}', '').replace('{finish}', '').trim();
        
        // Apply markdown formatting
        const parsedContent = marked.parse(displayContent);
        
        // Apply bold formatting to headings
        let enhancedContent = parsedContent
            .replace(/<h1>(.*?)<\/h1>/g, '<h1><strong>$1</strong></h1>')
            .replace(/<h2>(.*?)<\/h2>/g, '<h2><strong>$1</strong></h2>')
            .replace(/<h3>(.*?)<\/h3>/g, '<h3><strong>$1</strong></h3>')
            .replace(/<h4>(.*?)<\/h4>/g, '<h4><strong>$1</strong></h4>');
        
        // Set the content
        resultContent.innerHTML = enhancedContent;
        
        // Show the result section
        resultSection.classList.remove('hidden');
        
        // Apply syntax highlighting
        hljs.highlightAll();
        
        // Calculate and display word count
        updateWordCount(content);
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
        
        // Hide progress indicator
        hideProgressIndicator();
    } catch (error) {
        console.error('Error displaying result:', error);
        
        // Fallback display method if parsing fails
        resultContent.textContent = content.replace('{start}', '').replace('{finish}', '').trim();
        resultSection.classList.remove('hidden');
        updateWordCount(content);
        
        showNotification('Generated content displayed in plain text due to formatting issues', 'warning');
    }
}

// Update word count
function updateWordCount(content) {
    // Count words (split by whitespace and filter out empty strings)
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    
    // Format the count with commas for thousands
    const formattedCount = count.toLocaleString();
    
    // Update the display
    wordCount.textContent = `${formattedCount} words`;
    
    // Add a class based on word count for potential styling
    if (count < MIN_WORD_COUNT) {
        wordCount.className = 'word-count-low';
    } else if (count >= MIN_WORD_COUNT && count < MAX_WORD_COUNT) {
        wordCount.className = 'word-count-medium';
    } else {
        wordCount.className = 'word-count-high';
    }
}

// Copy to clipboard
function copyToClipboard() {
    // Get the content without the {start} and {finish} tags
    const content = resultContent.textContent;
    const textToCopy = content.replace('{start}', '').replace('{finish}', '').trim();
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showNotification('Content copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Failed to copy content', 'error');
        });
}

// Download as markdown
function downloadMarkdown() {
    // Get the content without the {start} and {finish} tags
    const content = resultContent.textContent;
    const markdownContent = content.replace('{start}', '').replace('{finish}', '').trim();
    
    const topic = topicInput.value.trim();
    const filename = `${topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-seo-article.md`;
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification('File downloaded successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

// Hide notification
function hideNotification() {
    notification.classList.add('hidden');
}

// Set loading state
function setLoadingState(isLoading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    
    if (isLoading) {
        btnText.textContent = 'Generating...';
        spinner.classList.remove('hidden');
        generateBtn.disabled = true;
    } else {
        btnText.textContent = 'Generate Article';
        spinner.classList.add('hidden');
        generateBtn.disabled = false;
    }
} 