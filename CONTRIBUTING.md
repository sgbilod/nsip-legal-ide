# Contributing to NSIP Legal/Business IDE

Copyright © 2025 Stephen Bilodeau. All rights reserved.

Thank you for your interest in contributing to the NSIP Legal/Business IDE extension! This guide will help you understand how to contribute effectively to the project.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Architecture](#project-architecture)
3. [Coding Standards](#coding-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Documentation](#documentation)
6. [Pull Request Process](#pull-request-process)
7. [Extension Points](#extension-points)

## Development Setup

### Prerequisites

- Node.js 20.x or later
- Visual Studio Code
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork to your local machine
   ```bash
   git clone https://github.com/your-username/nsip-legal-ide.git
   cd nsip-legal-ide
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Build the extension
   ```bash
   npm run compile
   ```
5. Open the project in VS Code
   ```bash
   code .
   ```
6. Press F5 to launch a new VS Code window with the extension loaded

## Project Architecture

The NSIP Legal/Business IDE follows a modular architecture with several key components:

### Core Services

- **ServiceRegistry**: Central service locator for dependency management
- **EventBus**: Observer pattern implementation for loose coupling between services
- **Logger**: Centralized logging with severity levels

### Business Logic

- **TemplateEngine**: Handles document template rendering with variables
- **TemplateManager**: Manages template repository and creation
- **ComplianceEngine**: Validates documents against legal rules
- **LegalProtectionService**: Handles document encryption and security

### Blockchain Integration

- **SmartContractManager**: Manages the creation, compilation, deployment, and execution of legal smart contracts
- **MultiChainPlatform**: Core platform for interacting with multiple blockchain networks
- **MultiChainAdapter**: Adapter pattern implementation for different blockchain platforms
- **ContractTemplateManager**: Manages legal smart contract templates for different use cases
- **SmartContractUIManager**: VS Code UI integration for smart contract management
- **DecentralizedIdentity**: Manages digital identities for contract signing and verification

### User Interface

- **NotificationManager**: Manages notifications for user alerts and messages
- **ComplianceView**: Tree view displaying compliance issues with severity indicators
- **DocumentExplorer**: File explorer specialized for legal documents and templates
- **DashboardView**: Dashboard showing compliance scores and quick access to documents
- **StatusBarManager**: Status bar integration showing compliance status
- **QuickPickService**: Quick pick menus for templates, rules, and actions
- **WebviewService**: Service for creating and managing extension webviews
- **DocumentIntelligenceProvider**: Provides code completion and hover information
- **WebViews**: Interactive web-based UI components
- **TreeViews**: Hierarchical representation of document structure and templates
- **LegalContractsView**: TreeView for browsing and managing smart contracts
- **ContractDeploymentView**: UI for deploying contracts to different networks
- **ContractExecutionPanel**: WebView for executing contract methods with parameter inputs

### Extension Points

The extension can be extended in the following ways:

1. **Template Providers**: Add new template sources
2. **Compliance Rules**: Add jurisdiction-specific compliance rules
3. **Document Analyzers**: Add specialized document analysis tools
4. **AI Integrations**: Integrate with different AI providers
5. **Blockchain Platforms**: Integrate with additional blockchain networks
6. **Smart Contract Types**: Add new legal smart contract templates
7. **Contract Deployment Options**: Add new deployment environments

## Coding Standards

The project follows TypeScript best practices and uses ESLint and Prettier for code quality:

- Use strong typing with interfaces and type definitions
- Follow the Single Responsibility Principle
- Use dependency injection via the ServiceRegistry
- Document all public APIs with JSDoc comments
- Use async/await for asynchronous operations
- Handle and log errors appropriately

### Style Guidelines

- Use 4 spaces for indentation
- Use PascalCase for class names and interfaces
- Use camelCase for variable and function names
- Use UPPER_CASE for constants
- Prefix interfaces with "I" (e.g., IService)
- Use meaningful variable and function names

## Testing Guidelines

The project uses Jest for testing. All new features should include appropriate tests:

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete workflows

### Test Guidelines

- Aim for at least 80% code coverage
- Mock external dependencies (VS Code API, file system, etc.)
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern
- Test both happy paths and error conditions

### Running Tests

- Run all tests: `npm test`
- Run unit tests: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Run end-to-end tests: `npm run test:e2e`

## Documentation

Good documentation is essential for the project:

### Code Documentation

- Use JSDoc comments for all public APIs
- Document parameters, return values, and thrown exceptions
- Include examples where appropriate
- Document complex algorithms and business rules

### User Documentation

- Update the README.md with any new features
- Document extension settings
- Provide examples for common use cases
- Create or update feature guides

### Generate Documentation

- Use TypeDoc to generate API documentation: `npm run docs`

## Pull Request Process

1. Create a new branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the coding standards

3. Add tests for your changes

4. Run tests and ensure they pass
   ```bash
   npm test
   ```

5. Run the linter and fix any issues
   ```bash
   npm run lint
   ```

6. Commit your changes with a descriptive commit message
   ```bash
   git commit -m "Add feature: your feature description"
   ```

7. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

8. Submit a pull request to the main repository

9. Address any feedback from code reviews

## Extension Points

### Adding a New Template Provider

1. Create a new class that implements `ITemplateProvider` interface
2. Register it with the `TemplateRegistry` in your initialization code
3. Implement template fetching, parsing, and rendering methods

### Adding Compliance Rules

1. Create a new class that implements `IComplianceRule` interface
2. Define the rule's jurisdiction, severity, and validation logic
3. Register it with the `ComplianceEngine`

### Adding Document Analyzers

1. Create a new class that implements `IDocumentAnalyzer` interface
2. Implement the analysis logic
3. Register it with the `DocumentIntelligenceProvider`

### Integrating with AI Providers

1. Create a new class that implements `IAIProvider` interface
2. Implement methods for document analysis, entity extraction, etc.
3. Register it with the `AIRegistry`

### Contributing to Blockchain Components

1. **Smart Contract Development**
   - Follow Solidity best practices for contract development
   - Use the established contract template structure in `templates/contracts/`
   - Test contracts thoroughly with unit tests using the test framework
   - Document contract interfaces, events, and state variables

2. **Multi-Chain Support**
   - Follow the adapter pattern when adding support for new blockchain platforms
   - Implement the `IMultiChainAdapter` interface for new chain integrations
   - Use the `MultiChainPlatform` as the primary interaction point
   - Register new adapters with the `ServiceRegistry`

3. **Contract Templates**
   - Add new contract templates to the `ContractTemplateManager`
   - Follow the established template naming and categorization conventions
   - Include comprehensive descriptions and parameter documentation
   - Implement validation logic for template parameters

4. **UI Components for Blockchain**
   - Extend the `SmartContractUIManager` for new UI features
   - Use VS Code's TreeView API for contract visualization
   - Follow the command contribution pattern in package.json
   - Maintain consistent user experience with other extension components

## Thank You!

Your contributions to the NSIP Legal/Business IDE are greatly appreciated. By following these guidelines, you help ensure that the project remains high-quality, well-tested, and maintainable.
