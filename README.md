# AI Article Generator

![AI Article Generator](https://img.shields.io/badge/AI-Article%20Generator-4361ee)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A powerful web-based tool that leverages OpenRouter API to generate high-quality, SEO-optimized articles on any topic. This application provides a user-friendly interface for creating professional content with customizable settings.

## 🌟 Features

- **AI-Powered Content Generation**: Create comprehensive articles with introduction, main content, conclusion, and FAQ sections
- **Personal Writing Style**: Generate content in a personal, first-person voice with colloquial expressions and conversational tone
- **SEO Optimization**: Automatically generates SEO metadata including focus keywords, meta descriptions, and image alt text
- **Customizable Settings**:
  - Multiple AI models to choose from (Claude, GPT, Llama, etc.)
  - Adjustable creativity level (temperature)
  - Target word count control
  - Writing tone selection (Personal & Colloquial, Conversational, Casual, Professional, Academic, Persuasive)
- **Content Management**:
  - Save articles locally
  - Load previously saved articles
  - Copy content to clipboard
  - Download as Markdown files
  - Print articles directly
- **User Experience**:
  - Dark/Light theme toggle
  - Responsive design for all devices
  - Real-time progress tracking
  - Keyboard shortcuts (Ctrl+Enter to generate)
  - Password protection for API keys

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenRouter API key (free or paid)
- Internet connection

## 🚀 Getting Started

### Installation

1. Clone or download this repository
2. No build process required - it's ready to use!

### Usage

1. Open `index.html` in your web browser
2. Enter your OpenRouter API key (get one at [OpenRouter.ai](https://openrouter.ai))
3. Enter your article topic
4. Adjust advanced settings if desired (model, temperature, word count, tone)
5. Click "Generate Article" or press Ctrl+Enter
6. Wait for the generation process to complete
7. Use the control buttons to save, copy, download, or print your article

## 🔑 API Key Security

Your OpenRouter API key is stored locally in your browser's localStorage. It never leaves your device except when making API calls to OpenRouter. You can clear your saved API key at any time using the "Clear Saved API Key" button.

## 🛠️ Technical Details

This application is built with:
- HTML5
- CSS3 with CSS Variables for theming
- Vanilla JavaScript (ES6+)
- Marked.js for Markdown rendering
- Font Awesome for icons

The application uses a modular approach with separate files:
- `index.html`: Main structure and UI elements
- `styles.css`: All styling and theme definitions
- `script.js`: Application logic and API integration

## 📝 Changelog

### Version 1.0.0 (2024-06-01)
- Initial release with core functionality
- Added article generation with OpenRouter API
- Implemented theme toggle (light/dark mode)
- Added save/load article functionality
- Implemented copy, download, and print features

### Version 1.1.0 (2024-06-15)
- Added writing tone selection
- Improved theme toggle functionality
- Enhanced UI with smoother transitions
- Added keyboard shortcuts
- Fixed various bugs and improved error handling

### Version 1.2.0 (2024-06-30)
- Added more AI model options
- Improved responsive design for mobile devices
- Enhanced SEO metadata generation
- Added progress tracking during generation
- Fixed theme toggle issues
- Added comprehensive documentation

### Version 1.3.0 (Current)
- Added personal, colloquial writing style as the default tone
- Enhanced prompts to generate more authentic, first-person content
- Improved SEO metadata to match the personal writing style
- Increased default creativity setting for more natural language
- Updated UI to prioritize personal writing options

## 🔮 Planned Features

- User accounts for cloud storage of articles
- Article editing capabilities
- Image generation integration
- Export to more formats (PDF, HTML, DOCX)
- Advanced SEO analysis tools
- Multi-language support

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- OpenRouter for providing access to various AI models
- Marked.js for Markdown rendering
- Font Awesome for the beautiful icons
- All contributors and users of this tool

---

Made with ❤️ by xhanafix © 2024 