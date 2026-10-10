# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

You are an expert developer proficient in TypeScript, React and Expo SDK 57 (React Native), Tailwind CSS v4 (Uniwind), Zod, i18next (expo-localization), TanStack React Query, pnpm (not npm).

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
- **Styling**: Uniwind (Tailwind CSS v4). NativeWind is not used.
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

- **TDD**: Classical TDD with minimal mocking. Confirm Red → minimal implementation → confirm Green → refactor. Follow `.cursor/rules/tdd-cycle.mdc`.
- **Work units**: Epic (table in `docs/product.md`; not a milestone) / Story / Task (GitHub Issues) / Sub (checklist in the Task issue). A release is a GitHub milestone holding the Stories and Tasks that ship in it. Story branch once → plan → Task branch → Sub 完了まで実装 → merge Task into Story → merge Story to `master` (PR closes the Story and Task issues). `docs/` holds the current spec only; Story-scoped notes go in Issues. **Sub (`ST-###`) is the implementation unit** and may be a horizontal layer (docs / schema / db / hooks / UI). When a Story changes the spec or screens, ST-001 of its first Task updates `docs/`. Docs Subs need no tests; schema / db / hooks Subs get layer tests; UI Subs cover acceptance with RNTL. **Do not commit unless the user asks** (then one Sub = one commit). Follow `.cursor/rules/agile-workflow.mdc`.
- **Simplicity**: YAGNI, SOLID at feature granularity, no speculative abstraction. Follow `.cursor/rules/simplicity-first.mdc`.
- **Features / data**: Domain in `src/features/<name>/` (screens, feature components). Cross-feature code in `src/shared/`. Persisted state (local SQLite or remote) uses TanStack Query. Follow `.cursor/rules/feature-query.mdc`.
- **Quality gate**: Run `pnpm run check` at each Sub completion. Fix critical issues immediately; defer minor ones for batch refactor.
- **Package Manager**: Use pnpm.

---

## Code Style & Structure

- **Functional Programming**: Use functional and declarative patterns; strictly avoid classes.
- **File Organization**: Organize by **Feature** under `src/features/<kebab-name>/` (`screens/`, `components/`, `hooks/`, `db/`, `schemas/`). Put cross-feature UI, hooks, theme, db connection, QueryClient factory, and utils under `src/shared/`. Keep `src/app/` as routes only. Tests go in each layer’s `test/` (e.g. `hooks/test/`), not next to the source file.
- **Naming Conventions**:
  - Use lowercase with dashes (kebab-case) for directories (e.g., `features/stamps`, `shared/theme`).
  - Favor **named exports** for components and functions.
  - Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`, `shouldRedirect`).
  - Route default exports are named by role, without `Route`: tab roots `*Tab` (`HomeTab`), pushed screens `*Page` (`RallyDetailPage`), form sheets `*Sheet` (`EditStampSheet`), layouts `*Layout`. Feature screen bodies stay `*Screen`.
  - Destructure Query results with names (React Compiler: never dot into hook results to call functions): `const { data: rallies, isError: isRalliesError, refetch: refetchRallies } = useRallies()`, `const { mutate: saveStamp, isPending: isSaving } = useSaveStamp()`.
- **Routing**:
  - Read URL params in the route file and validate them with Zod (`useIdParam` / `idParamSchema`); pass typed values to the feature screen. An invalid param closes the screen like a missing record.
  - Navigate with `<Link href asChild>` when a press only navigates; otherwise destructure `const { push, back } = useRouter()`. Import the imperative `router` only outside components.
  - Write hrefs with params as objects: `push({ pathname: "/edit-stamp", params: { stampId } })` (typed routes check the params).
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

Details and the mandatory Red → Green cycle live in `.cursor/rules/tdd-cycle.mdc`. Summary:

- **Classical Style**: Prefer sociable tests; mock only out-of-process dependencies (e.g. Camera, Push Notifications); assert behavior, not implementation details.
- **Tools**: Jest for logic and React Native Testing Library (RNTL) for component behavior.
- **Location**: `src/features/<name>/<layer>/test/` (e.g. `hooks/test/`). Do not colocate `*.test.ts(x)` with source.

---

## UI & Styling (Uniwind + Tailwind CSS v4)

- **Styling**: Use **Uniwind** and Tailwind utility `className` on React Native components. Load the `uniwind` skill for setup, theming, variants, and third-party bindings.
- **Priority**: This repo's Uniwind `className` rules override `expo-native-ui`'s "CSS and Tailwind are not supported" guidance. Keep `expo-native-ui` for Safe Area and `@expo/ui` selection — not for inline-style-only styling or icons (see **Icons**).
- **Colors**: Use the semantic theme tokens in `tailwind.css` (`bg-background`, `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`, `bg-surface-muted`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-inverse`). They carry light and dark values, so do not write `dark:` variants. Never hard-code hex in components; for native views that take a color value (`@expo/ui`), use `useAccentColor()` / `useCSSVariable`.
- **Icons**: Use lucide icons from `@/shared/components/icons` (each wrapped once with `withUniwind`; color with `colorClassName="accent-*"`). Add new icons to that module. SF Symbols only where the API accepts nothing else: `NativeTabs.Trigger.Icon`, `Stack.Toolbar.Button icon`, and the `@expo/ui` `Menu` label.
- **Corners**: Add `border-continuous` to every `rounded-*` box (not needed for `rounded-full`).
- **Do not use NativeWind APIs**: no `nativewind/babel`, `cssInterop`, `remapProps`, `ThemeProvider`, or `tailwind.config.js`. Theme lives in CSS (`@theme`). Third-party components use `withUniwind()`, never wrapping core `react-native` / Reanimated primitives.
- **className**: Use complete string literals (no `bg-${color}-500`). Core RN components already accept `className`; non-style color props use `{prop}ClassName` with `accent-*`.
- **Layout**: Use Flexbox and Expo's `useWindowDimensions` for responsive designs.
- **Safe Area**: Use `SafeAreaProvider` and `useSafeAreaInsets` from `react-native-safe-area-context` for precise layout control (notches, home indicators).
- **Animations**: Leverage `react-native-reanimated` and `react-native-gesture-handler` for performant interactions.
- **Performance**: When images are needed, add `expo-image` (not installed until then) for rendering and caching. Avoid `AppLoading`; use `expo-splash-screen`.
- **Accessibility props**: Use ARIA props (`role`, `aria-label`, `aria-disabled`, `aria-selected`, `aria-busy`, `aria-valuetext`), not `accessibility*` props.
- **Wiring**: CSS entry is `tailwind.css` (root), imported once in `src/app/_layout.tsx`. `metro.config.js` wraps with `withUniwindConfig` outermost. `uniwind-types.d.ts` is generated by Metro and committed (ignored by Prettier). `css.d.ts` declares `*.css` for `tsc` (CI has no gitignored `expo-env.d.ts`). Jest maps `.css` to `__mocks__/style-mock.ts`.

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
