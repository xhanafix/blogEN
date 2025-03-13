# SEO Article Generator

A web-based tool that generates high-quality SEO-optimized articles using the OpenRouter API. This application helps content creators and marketers create articles that can outrank competitor content.

## Features

- **AI-Powered Content Generation**: Leverages OpenRouter's AI models to create SEO-optimized articles
- **Competitor Analysis**: Generates content specifically designed to outrank a target URL
- **SEO Best Practices**: Follows RankMath guidelines for optimal SEO structure
- **Markdown Formatting**: Outputs content in properly formatted markdown
- **Word Count Tracking**: Ensures articles meet the 1500-2000 word target
- **Local Storage**: Saves your API key securely in your browser
- **Copy & Download**: Easily copy content to clipboard or download as markdown files
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Enter your OpenRouter API Key**
   - Sign up at [OpenRouter](https://openrouter.ai/) to get an API key
   - Your key is stored locally in your browser and never sent to our servers

2. **Specify Your Topic**
   - Enter the main topic for your article

3. **Enter Competitor URL**
   - Provide the URL of the article you want to outrank

4. **Generate Article**
   - Click the "Generate Article" button and wait for the AI to create your content
   - The progress bar will show you the current status

5. **Review and Use**
   - Copy the generated content or download it as a markdown file
   - The article includes proper headings, FAQs, and SEO metadata

## Technical Details

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **API**: OpenRouter (google/learnlm-1.5-pro-experimental model)
- **Libraries**:
  - Marked.js for Markdown parsing
  - Highlight.js for syntax highlighting
  - Font Awesome for icons

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. Enter your OpenRouter API key
4. Start generating SEO-optimized content!

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenRouter API key
- Internet connection

## Privacy

This application runs entirely in your browser. Your API key and generated content are stored locally and never sent to our servers.

## Changelog

### Version 1.0.0 (2023-06-15)
- Initial release with basic article generation functionality

### Version 1.1.0 (2023-08-20)
- Added support for RankMath SEO guidelines
- Improved heading structure in generated articles
- Enhanced markdown formatting

### Version 1.2.0 (2023-10-05)
- Added word count tracking
- Implemented article expansion for short content
- Improved error handling for API calls

### Version 1.3.0 (2023-12-10)
- Added copy to clipboard functionality
- Added download as markdown feature
- Improved notification system

### Version 2.0.0 (2024-03-13)
- Complete UI redesign with responsive layout
- Enhanced prompt engineering for better article quality
- Added progress indicator with status updates
- Implemented content processing to ensure proper formatting
- Added automatic FAQ generation and management
- Improved heading formatting with bold styling
- Enhanced metadata generation for better SEO
- Added support for perplexity and burstiness in content

### Version 2.1.0 (2024-03-15)
- Fixed issues with content combination
- Improved handling of {start} and {finish} tags
- Enhanced FAQ detection and formatting
- Added better error recovery for API failures
- Improved content display with syntax highlighting

## License

MIT License 