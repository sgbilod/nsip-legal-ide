# Template Engine Documentation

Copyright © 2025 Stephen Bilodeau. All rights reserved.

## Overview

The Template Engine is a key component of the NSIP Legal IDE that provides document template management and rendering capabilities. It enables legal professionals to create, manage, and use document templates with variables, conditional sections, and schema validation.

## Features

- Template loading from filesystem or repository
- Schema validation for template variables
- Handlebars-based templating with extended functionality
- Support for template inheritance and composition
- Template versioning and history
- Conditional sections based on document context
- Custom helpers for legal-specific formatting
- Template management UI

## Architecture

The TemplateEngine implements the IService interface and provides template loading, rendering, and management functionality. It uses Handlebars as the underlying template engine with extended capabilities.

### Key Components

1. **TemplateEngine**: Core service that manages templates and provides rendering capabilities
2. **Template**: Interface representing a document template with schema and content
3. **ValidationError**: Error thrown when template variable validation fails
4. **TemplateSchema**: JSON Schema for validating template variables
5. **TemplateHelpers**: Custom Handlebars helpers for legal document formatting

## Usage

### Rendering a Template

```typescript
// Get the template engine from the service registry
const registry = ServiceRegistry.getInstance();
const templateEngine = registry.get<TemplateEngine>('templateEngine');

// Define the template context (variables)
const context = {
  title: "Non-Disclosure Agreement",
  partyA: {
    name: "Acme Corporation",
    address: "123 Main Street, Anytown, USA",
    representative: "John Doe"
  },
  partyB: {
    name: "XYZ Ltd.",
    address: "456 Business Ave, Somewhere, USA",
    representative: "Jane Smith"
  },
  effectiveDate: "2025-08-09",
  term: "2 years",
  governingLaw: "State of Delaware",
  includeArbitration: true
};

// Render the template
const renderedDocument = templateEngine.renderTemplate('contracts/nda', context);
```

### Creating a New Template

```typescript
// Create a new template
await templateEngine.createTemplate(
  'contracts',  // Category
  'service-agreement',  // Template name
  `<h1>{{title}}</h1>
  <p>This Service Agreement is made between {{provider.name}} and {{client.name}}.</p>
  {{#if includePaymentTerms}}
  <h2>Payment Terms</h2>
  <p>{{paymentTerms}}</p>
  {{/if}}`,  // Template content
  {
    // JSON Schema for the template
    type: 'object',
    properties: {
      title: { type: 'string' },
      provider: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' }
        },
        required: ['name']
      },
      client: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' }
        },
        required: ['name']
      },
      includePaymentTerms: { type: 'boolean' },
      paymentTerms: { type: 'string' }
    },
    required: ['title', 'provider', 'client']
  }
);
```

### Updating an Existing Template

```typescript
// Update an existing template
await templateEngine.updateTemplate(
  'contracts/service-agreement',  // Template ID
  `<h1>{{title}}</h1>
  <p>This Service Agreement (the "Agreement") is made between {{provider.name}} ("Provider") and {{client.name}} ("Client").</p>
  {{#if includePaymentTerms}}
  <h2>Payment Terms</h2>
  <p>{{paymentTerms}}</p>
  {{/if}}`,  // Updated content
  {
    // Updated schema (if needed)
    type: 'object',
    properties: {
      title: { type: 'string' },
      provider: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' }
        },
        required: ['name']
      },
      client: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' }
        },
        required: ['name']
      },
      includePaymentTerms: { type: 'boolean' },
      paymentTerms: { type: 'string' }
    },
    required: ['title', 'provider', 'client']
  }
);
```

### Deleting a Template

```typescript
// Delete a template
await templateEngine.deleteTemplate('contracts/service-agreement');
```

## Custom Helpers

The Template Engine provides several custom Handlebars helpers for legal document formatting:

1. **eq**: Equality comparison (`{{#if (eq value1 value2)}}...{{/if}}`)
2. **ne**: Inequality comparison (`{{#if (ne value1 value2)}}...{{/if}}`)
3. **uppercase**: Convert text to uppercase (`{{uppercase text}}`)
4. **lowercase**: Convert text to lowercase (`{{lowercase text}}`)
5. **capitalize**: Capitalize the first letter of each word (`{{capitalize text}}`)
6. **date**: Format a date (`{{date value format}}`)
7. **currency**: Format a number as currency (`{{currency amount currencyCode}}`)
8. **paragraph**: Format text as a legal paragraph (`{{paragraph number content}}`)
9. **section**: Create a legal document section (`{{#section title}}...{{/section}}`)
10. **clause**: Create a legal clause with automatic numbering (`{{#clause}}...{{/clause}}`)

## Best Practices

1. **Use Schemas**: Always define schemas for templates to ensure proper validation
2. **Category Organization**: Organize templates into logical categories
3. **Template Inheritance**: Use template inheritance for common document structures
4. **Versioning**: Implement template versioning for critical documents
5. **Conditional Sections**: Use conditional sections to create flexible templates

## Extending the Engine

The template engine is designed to be extensible. You can add new functionality by:

1. Adding new custom Handlebars helpers
2. Implementing template inheritance
3. Creating specialized template repositories
4. Adding support for additional output formats

## Troubleshooting

- **Schema Validation**: Ensure context objects match the defined schema
- **Helper Errors**: Check that custom helpers are being used correctly
- **Template Loading**: Verify template paths and permissions
- **Inheritance Issues**: Check that parent templates exist and are correctly referenced
