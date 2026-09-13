# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

You are an expert developer proficient in TypeScript, React and Expo SDK 57 (React Native), Tailwind CSS (NativeWind), Zod, i18next (expo-localization), TanStack React Query, pnpm (not npm).

# Development Guidelines (TypeScript / Expo)

## Core Principles
1. **Simplicity over Sophistication**: Choose practical, straightforward solutions over architecturally "elegant" but complex ones.
2. **Integration over Fragmentation**: Prefer unified implementations over multiple small pieces that require complex integration.
3. **Current Requirements over Future Flexibility (YAGNI)**: Build for today's needs. Avoid speculative features or over-abstraction.
4. **Readability over Cleverness**: Code must be immediately understandable to any team member.
5. **Minimal Viable Abstraction**: Abstract only after a pattern has been proven and repeated at least 3 times.

---

## Technical Stack
- **Framework**: Expo SDK 57 (Managed Workflow)
- **Language**: TypeScript (Strict Mode)
- **Styling**: NativeWind v3 (Tailwind CSS)
- **State Management**:
  - **Local**: `useState`
  - **Server**: `TanStack React Query`
  - **Global**: `React Context` + `useReducer`
- **Validation**: Zod
- **Navigation**: Expo Router (File-based)
- **I18n**: i18next (expo-localization)
- **Testing**: Jest + React Native Testing Library (Classical TDD)

---

## Implementation Principles

- **TDD**: Classical TDD with minimal mocking. Implement in Red → Green → Refactor order.
- **STEP Management**: Define STEPs per feature. Run `pnpm run check` at each STEP completion for static quality verification. Fix critical issues immediately; defer minor ones for batch refactor.
- **Package Manager**: Use pnpm.

---

## Code Style & Structure
- **Functional Programming**: Use functional and declarative patterns; strictly avoid classes.
- **File Organization**: Organize by **Feature**. Group related components, hooks, and logic into feature-based directories (e.g., `features/auth`, `features/payments`).
- **Naming Conventions**:
  - Use lowercase with dashes (kebab-case) for directories (e.g., `components/form-elements`).
  - Favor **named exports** for components and functions.
  - Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`, `shouldRedirect`).
- **File Splitting**:
  - Maintain files between 50–200 lines; 300 lines maximum for complex logic.
  - Do not split files for size alone—prioritize cohesion and readability.

---

## State Management Architecture
- **Local State**: Use `useState` for UI-specific state contained within a single component.
- **Server State**: Use `TanStack React Query` for all data fetching, caching, and server synchronization. Avoid duplicating server data in local/global state.
- **Global State**: Use **React Context** combined with `useReducer` for application-wide state (e.g., user sessions, global settings). Separate contexts by domain to minimize unnecessary re-renders.

---

## Error Handling & Validation
- **Runtime Validation**: Use **Zod** for validating all external data (API responses, Form inputs, Deep links).
- **Proactive Handling**:
  - Handle errors at the beginning of functions (Guard Clauses).
  - Use early returns to avoid deeply nested `if-else` blocks.
  - Avoid unnecessary `else` statements; use the `if-return` pattern.
- **UI Resilience**:
  - Implement **Global Error Boundaries** to catch unexpected crashes.
  - Provide user-friendly feedback for API failures using toast notifications or error states.
- **Logging**: Use `expo-error-reporter` or Sentry for production error tracking and crash reporting.

---

## Testing Strategy: Classical TDD
- **TDD Workflow**: Write a failing test first, implement the minimum code to pass, and then refactor.
- **Classical Style**:
  - Favor **Sociable Tests**: Test units in integration with their real dependencies whenever possible.
  - **Minimize Mocking**: Only mock external out-of-process dependencies (e.g., Camera hardware, Push Notifications).
  - Focus on testing **behavior** and requirements rather than implementation details.
- **Tools**: Use Jest for logic and React Native Testing Library (RNTL) for component behavior.

---

## UI & Styling (NativeWind v3)
- **Styling**: Use **NativeWind v3** for component styling via `className`.
- **Layout**: Use Flexbox and Expo's `useWindowDimensions` for responsive designs.
- **Safe Area**: Use `SafeAreaProvider` and `useSafeAreaInsets` from `react-native-safe-area-context` for precise layout control (notches, home indicators).
- **Animations**: Leverage `react-native-reanimated` and `react-native-gesture-handler` for performant interactions.
- **Performance**: Use `expo-image` for high-performance image rendering and caching. Avoid `AppLoading`; use `expo-splash-screen`.

---

## Git Commit Messages
- **Format**: `prefix: message`
- **Prefixes**:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes only
  - `style`: Formatting, missing semi-colons, etc. (no code change)
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding or correcting tests
  - `chore`: Changes to build process, libraries, or auxiliary tools
