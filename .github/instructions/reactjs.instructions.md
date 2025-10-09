---
description: 'ReactJS development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# ReactJS Development Instructions

Official React documentation is at https://react.dev.

## Project Context

- Functional components with hooks as default
- Follow React's official style guide and best practices
- Use Vite and respect its existing implicit imports
- Implement proper component composition and reusability patterns

## Development Standards

### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature for scalability
- Group shared components in the components/ directory
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow
- use Radix UI primitives wherever possible

### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Do not use prop-types
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

### State Management

- Use Dexie for global application state management and data persistence
- Use `useState` for local component state
- Implement proper state normalization and data structures
- Leverage `useContext` for sharing state across component trees where Dexie is not appropriate

### Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects when appropriate to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values and inform the developer when doing so

### Styling

- Use CSS Modules
- Use Radix primitives where possible
- Implement responsive design with mobile-first approach
- Follow BEM methodology or similar naming conventions for CSS classes
- Use CSS custom properties (variables) for theming
- Implement consistent spacing, typography, and color systems
- Ensure accessibility with proper ARIA attributes and semantic HTML

### Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists and notify developer when doing so
- Profile components with React DevTools to identify performance bottlenecks

### Data Fetching

- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies
- Handle offline scenarios and network errors gracefully

### Error Handling

- Implement Error Boundaries for component-level error handling as needed
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

### Forms and Validation

- Use controlled components for form inputs
- Implement proper form real-validation Radix
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use debounced validation for better user experience
- Handle file uploads and complex form scenarios

### Routing

- Use React Router for client-side routing using its declarative mode
- Implement nested routes and route protection as needed
- Handle route parameters and query strings properly
- Implement lazy loading for route-based code splitting
- Use proper navigation patterns and back button handling
- Implement breadcrumbs and navigation state management

### Security

- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Use Content Security Policy (CSP) headers

### Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios

## Task Completion and Cleanup

When completing a task list or wrapping up feature implementation, always perform these cleanup steps:

### Code Quality Checks

- **Remove Unused Imports**: Check all modified files for unused import statements and remove them
- **Validate ESLint Rules**: Ensure no ESLint errors or warnings remain in the codebase
- **Check Console Errors**: Verify no console errors or warnings appear in browser developer tools
- **Remove Debug Code**: Remove any temporary console.log statements, commented code, or debugging artifacts

### Import Management

- Use the `get_errors` tool to identify unused import warnings
- Remove imports that are no longer referenced in the component
- Consolidate multiple imports from the same module when possible
- Maintain alphabetical ordering of import statements for consistency
- Verify that all used functions, components, and utilities are properly imported

### Final Validation

- Run the application to ensure all functionality works as expected
- Test navigation flows and user interactions
- Verify responsive design works across different screen sizes
- Check accessibility features are functioning properly
- Confirm all new routes and links work correctly

## Additional Guidelines

- Follow React's naming conventions (PascalCase for components, camelCase for functions)
- Use meaningful commit messages and maintain clean git history
- Implement proper code splitting and lazy loading strategies
- Document complex components and custom hooks with JSDoc
- Use ESLint and Prettier for consistent code formatting
- Keep dependencies up to date and audit for security vulnerabilities
- Implement proper environment configuration for different deployment stages
- Use React Developer Tools for debugging and performance analysis

## Common Patterns

- Higher-Order Components (HOCs) for cross-cutting concerns
- Render props pattern for component composition
- Compound components for related functionality
- Provider pattern for context-based state sharing
- Container/Presentational component separation
- Custom hooks for reusable logic extraction
