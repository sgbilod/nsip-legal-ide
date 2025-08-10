# NSIP Legal/Business IDE

Copyright © 2025 Stephen Bilodeau. All rights reserved.

## Overview

NSIP (Negative Space Interstitial Protocol) Legal/Business IDE is a comprehensive Visual Studio Code extension designed to revolutionize legal document creation, analysis, and management for legal professionals and businesses. It leverages advanced AI, template systems, and legal intelligence to streamline legal workflows.

## Features

- **Document Intelligence**: AI-powered analysis of legal documents with entity extraction, clause detection, and risk assessment
- **Template System**: Advanced template engine for creating legal documents with variables, conditional sections, and inheritance
- **Compliance Validation**: Validate documents against jurisdiction-specific legal requirements with detailed reports and recommendations
- **Legal Protection**: End-to-end encryption, audit trails, and IP tracking
- **Smart Contract Integration**: Create and manage blockchain-based smart contracts with legal wrappers
- **Collaboration**: Secure communication and real-time collaborative editing
- **Document Structure Visualization**: Navigate complex legal documents with ease
- **IP Asset Management**: Track and manage intellectual property assets

## Installation

1. Install the extension from the VS Code Marketplace or:
   ```bash
   npm run package
   ```
   Then install the resulting .vsix file.

2. Configure your AI provider in the extension settings
3. Set up your template repository location

## Usage

### Creating a Document

1. Open the Command Palette (Ctrl+Shift+P)
2. Select "NSIP: Create Legal Document"
3. Choose a template category and template
4. Fill in the required fields
5. The document will be created and opened in the editor

### Analyzing a Document

1. Open a legal document in the editor
2. Open the Command Palette (Ctrl+Shift+P)
3. Select "NSIP: Analyze Current Document"
4. View analysis results in the sidebar

### Validating a Document for Compliance

1. Open a legal document in the editor
2. Open the Command Palette (Ctrl+Shift+P)
3. Select "NSIP: Validate Compliance"
4. The document will be validated against applicable regulatory frameworks
5. Compliance issues will be highlighted in the editor
6. A compliance report with recommendations will be displayed

For detailed information about specific components, see the documentation:

- [Compliance Engine](./docs/compliance-engine.md)
- [Template Engine](./docs/template-engine.md)
- [Document Intelligence](./docs/document-intelligence.md)
4. Choose the document type and jurisdiction
5. View validation results in the Compliance Validator panel

### Tracking IP Assets

1. Open the Command Palette (Ctrl+Shift+P)
2. Select "NSIP: Track IP Asset"
3. Enter the required information
4. View and manage IP assets in the IP Assets panel

### Customizing Templates

1. Open the Command Palette (Ctrl+Shift+P)
2. Select "NSIP: Customize Template"
3. Select a template to customize
4. Edit the template with variable placeholders

## Compliance Rule Manager

The extension now includes a Compliance Rule Manager UI:

- Add, edit, and delete compliance rules directly from the IDE.
- Rules are persisted across sessions.
- Supports rule properties: name, description, severity, jurisdictions.
- UI updates dynamically as rules are changed.

To access, open the Compliance Rule Manager view from the sidebar.

## Extension Settings

This extension contributes the following settings:

* `nsip.ai.provider`: AI provider for document intelligence (openai, anthropic, local)
* `nsip.templates.repository`: Path to template repository
* `nsip.security.encryption`: Encryption standard for sensitive documents
* `nsip.compliance.rules`: Path to compliance rules directory

## Development

### Prerequisites

- Node.js 20.x or later
- Visual Studio Code

### Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to open a new window with the extension loaded

### Project Structure

- `src/extension.ts`: Main extension entry point
- `src/core/`: Core services (ServiceRegistry, EventBus, Logger)
- `src/templates/`: Template engine and related utilities
- `src/managers/`: Business logic managers
- `src/services/`: Domain-specific services
- `src/providers/`: VS Code providers (completion, hover, etc.)
- `src/ui/`: User interface components
- `src/ai/`: AI integration components
- `src/blockchain/`: Blockchain integration components
- `templates/`: Document templates
- `syntaxes/`: Syntax highlighting definitions

### Testing

- Run `npm test` to run all tests
- Run `npm run test:unit` for unit tests only
- Run `npm run test:integration` for integration tests only
- Run `npm run test:e2e` for end-to-end tests only

### Building

- Run `npm run build` to create a production build
- Run `npm run package` to create a VSIX package

## Architecture

The NSIP Legal IDE is built on a modular architecture with the following components:

- **Core**: Service Registry, Event Bus, Logger
- **Services**: Template Engine, Compliance Engine, Legal Protection
- **AI**: Document Analysis, Clause Detection, Risk Assessment
- **UI**: WebViews, TreeViews, Command Palette integration
- **Blockchain**: Smart Contract Management, Decentralized Identity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [VS Code Extension API](https://code.visualstudio.com/api)
- [OpenAI](https://openai.com/)
- [Ethereum](https://ethereum.org/)

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- VS Code Extension API
- Handlebars templating engine
- AJV JSON Schema validator
- Crypto-js for encryption features
