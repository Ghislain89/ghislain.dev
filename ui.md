---
theme: ./theme
title: Playwright Workshop
layout: intro
hideInToc: true
themeConfig:
  logoOne: "/logo-white-detesters-only.svg"
colorSchema: dark
---

<img src="/images/Playwright_Logo.png" alt="Playwright Logo" class="mx-auto h-24 bg-white rounded-xl px-4 py-2 mb-6" />

# Playwright Workshop

Ghislain Gabriëlse & Jurgen De Reu

[playwright.dev](https://playwright.dev)

---
hideInToc: true
layout: full
---

# Agenda

<Toc text-sm minDepth="1" maxDepth="1" columns="2" />

---
hideInToc: true
---

## Today's test object: booker-platform

A hotel booking app with a web UI, a REST API and Swagger docs, all on `http://localhost:3000`.

```bash
git clone https://github.com/Ghislain89/booker-platform
cd booker-platform
npm install
npx playwright install
npm run setup     # reset the database + seed data
npm run dev       # UI, /api and /api-docs on port 3000
```

- Seed users: `user` / `password123` and `admin` / `password123`
- Something broken? `npm run setup` gives you a clean database

---
hideInToc: true
---

## Preparation check

- Node.js LTS, Git and VS Code with the Playwright Test extension installed
- `npx playwright --version` prints **1.64** or newer
- booker-platform runs on http://localhost:3000
- Went through the [preparation page](https://ghislain.dev/playwright/preparation.html)?

> Something not working? Tell us now, not after the first assignment.

---
layout: new-section
---

# Why Playwright

---

## What is Playwright?

- Open-source framework (Microsoft) for end-to-end testing of web apps
- Chromium (Chrome, Edge), Firefox and WebKit (Safari) on Windows, Linux and macOS
- TypeScript / JavaScript, Python, .NET and Java
- Mobile emulation: Chrome for Android and Mobile Safari
- Comes with its own test runner: `@playwright/test`

---

## How Playwright drives browsers

- No WebDriver: Playwright talks to each browser over its own protocol (Chrome DevTools Protocol for Chromium, patched builds of Firefox and WebKit)
- Browsers are downloaded and pinned per Playwright version: `npx playwright install`
- Since 1.57 Chromium runs on **Chrome for Testing** builds; use `channel: 'chrome'` or `'msedge'` for branded browsers
- Fine-grained control: network interception, multiple contexts, emulation, clock

---

## Why Playwright?

- **Auto-waiting**: actionability checks before every action
- **Web-first assertions** retry until the condition is met
- **Isolation**: every test gets a fresh browser context, in milliseconds
- **Built in**: parallelism, sharding, retries, reporters, API testing
- **Tooling**: VS Code extension, codegen, UI mode, trace viewer
- **AI tooling**: test agents, MCP server and CLI (more at the end of the day)

---
layout: new-section
---

# Your first test

---

## Anatomy of a test

```ts
import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('user can log in', { tag: '@smoke' }, async ({ page }) => {
    await test.step('fill in the credentials', async () => {
      await page.getByLabel('Username').fill('user');
      await page.getByLabel('Password').fill('password123');
    });
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('heading', { name: 'My bookings' })).toBeVisible();
  });
});
```

`{ page }` is a *fixture*. Tags let you run subsets: `npx playwright test --grep @smoke`.

---
layout: two-cols
---

## Configuration

`playwright.config.ts`

- `baseURL`: write `page.goto('/rooms')`
- `webServer`: Playwright starts the app for you
- `projects`: browsers, devices or setups
- `default: false` (1.64): only runs with `--project webkit`
- `retries`, `reporter`, `trace`: more on these later

::right::

```ts
export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium',
      use: devices['Desktop Chrome'] },
    { name: 'webkit',
      use: devices['Desktop Safari'],
      default: false },
  ],
});
```

---

## Running tests

```bash
npx playwright test                       # all tests, headless
npx playwright test login.spec.ts:12      # a single test (file:line)
npx playwright test --project chromium --headed
npx playwright test --grep @smoke         # only tagged tests
npx playwright test --ui                  # UI mode
npx playwright show-report                # open the last HTML report
```

Or run and debug from the **Testing** panel in VS Code.

---

## VS Code extension

![VS Code test runner](/images/testrunner.gif)

---
layout: two-cols
---

## Codegen: record a test

- `npx playwright codegen localhost:3000` or **Record new** in VS Code
- Records locators and actions while you click
- Toolbar adds assertions (visibility, text, value); since 1.55 it can add `toBeVisible()` automatically
- **Pick locator** shows the best locator for any element
- A starting point, not the end result: clean it up and add meaningful assertions

::right::

![Codegen](/images/codegen.png)

---

## Codegen with the VS Code extension

![Codegen in VS Code](/images/codegen-vscode.png)

---

## Linting: catch mistakes early

```ts
// ❌ missing await: the test finishes before this assertion runs
expect(page.getByText('Welcome')).toBeVisible();

// ✅
await expect(page.getByText('Welcome')).toBeVisible();
```

- A missing `await` is the #1 beginner bug
- `eslint-plugin-playwright` flags missing awaits, `test.only`, `waitForTimeout`, non-web-first assertions and more
- Already set up in booker-platform: `npm run lint`
- The plugin is opinionated: pick the rules that suit your team

---
layout: new-section
---

# Locators, actions & assertions

---

## Locators: find elements like a user would

1. `page.getByRole('button', { name: 'Book now' })`
2. `page.getByLabel('Check-in date')`
3. `page.getByPlaceholder('Search')`, `page.getByText('No bookings yet')`
4. `page.getByAltText('Room 101')`, `page.getByTitle('Close')`
5. `page.getByTestId('booking-row')`
6. CSS or XPath: last resort

Locators are **lazy**: they find the element again every time you use them, so they never go stale. (The old `ElementHandle` API, `page.$()`, is discouraged.)

---

## Narrowing down

```ts
// chain: search inside another locator
const card = page.getByRole('article').filter({ hasText: 'Deluxe' });
await card.getByRole('button', { name: 'Book now' }).click();

// filter by a child locator or by visibility
page.getByRole('listitem').filter({ has: page.getByText('Cancelled') });
page.getByRole('button', { name: 'Menu' }).visible();          // 1.63

// within: resolve relative locators per parent (1.64)
const prices = page.getByRole('cell').nth(2).within(page.getByRole('row'));

// readable names in traces and reports (1.53)
page.getByRole('button', { name: 'Confirm' }).describe('Confirm booking');
```

---

## Actions

```ts
await page.getByLabel('Username').fill('user');
await page.getByLabel('Remember me').check();
await page.getByLabel('Room type').selectOption('Suite');
await page.getByRole('button', { name: 'Next' }).click();
await page.getByLabel('Search').pressSequentially('Deluxe');
await page.getByLabel('Search').press('Enter');
await page.getByText('Account').hover();
await page.getByRole('row').first().dragTo(page.getByRole('row').last());
await page.getByLabel('Avatar').setInputFiles('fixtures/avatar.png');
```

> Before every action Playwright waits until the element is visible, stable, enabled and able to receive events: the *actionability checks*.

---

## Web-first assertions

- Regular assertions check **once**: on a dynamic page that makes tests flaky
- Web-first assertions take a **locator** and **retry** until the condition is met or the timeout (5 s by default) expires

```ts
// 👍 retries until the text is visible
await expect(page.getByText('Welcome')).toBeVisible();

// 👎 checks once, fails if the page is a bit slow
expect(await page.getByText('Welcome').isVisible()).toBe(true);
```

Use web-first assertions wherever you can.

---

## Assertions you'll use most

```ts
await expect(page).toHaveURL(/\/my\/bookings/);
await expect(page).toHaveTitle('Booker');
await expect(page.getByRole('row')).toHaveCount(3);
await expect(badge).toHaveText('Confirmed');
await expect(guests).toHaveValue('2');
await expect(nextButton).toBeEnabled();
await expect(tab).toContainClass('active');                    // 1.52
await expect(button).toHaveAccessibleName('Book Deluxe room');  // 1.44
await expect(message).toHaveRole('alert');                      // 1.44
await expect.soft(total).toHaveText('€ 240');      // keeps going on failure
await expect(heading).toBeVisible({ timeout: 10_000 });
```

---

## ARIA snapshots

Assert the structure of the page as assistive technology sees it (1.49):

```ts
await expect(page.getByRole('navigation')).toMatchAriaSnapshot(`
  - navigation:
    - link "Rooms"
    - link "My bookings"
    - button "Log out"
`);
```

- Generate them with codegen or the aria view in UI mode and the trace viewer
- Less brittle than screenshots, more complete than single assertions
- Update them with `--update-snapshots`

---

## Best practices

- Test user-visible behaviour: prefer role, label and text over CSS or XPath
- Keep tests isolated: own data, own state, any order
- Only test what you control: mock third-party services
- No `waitForTimeout`: let web-first assertions do the waiting
- One user goal per test; use `test.step` to keep it readable

---

## Assignment 1A

Make sure booker-platform runs (`npm run dev`), then create `playwright/tests/ui/register.spec.ts`:

- Register a new user
- Log in with that user
- Assert that "No bookings yet" is shown

Record it with codegen or write it yourself. Prefer `getByRole` and `getByLabel`, and add a web-first assertion to every step.

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Debug & report

---

## Debugging

- **VS Code**: set a breakpoint and choose *Debug Test* in the Testing panel
- **Playwright Inspector**: `npx playwright test --debug`, or add `await page.pause()`
- **UI mode**: `npx playwright test --ui` for watch mode, time travel and pick locator
- **Trace viewer**: replay a run that already happened, for example on CI
- **For coding agents**: `npx playwright test --debug=cli` attaches via `playwright-cli` (1.59)

---

## UI mode

`npx playwright test --ui`

![UI mode](/images/ui-mode.png)

---

## Trace viewer

A trace records every action with DOM snapshots, network calls, console logs and the source.

```ts
// playwright.config.ts
use: {
  trace: 'on-first-retry',
  // 'on' | 'off' | 'retain-on-failure'
  // 'retain-on-first-failure' (1.43) | 'retain-on-failure-and-retries' (1.59)
},
```

- Open it from the HTML report, with `npx playwright show-trace trace.zip`, or at trace.playwright.dev
- Since 1.63 every action shows the screenshot side by side with its aria snapshot

---

## Trace viewer

![Trace viewer](/images/trace-viewer.png)

---
layout: two-cols
---

## Reporters

```ts
export default defineConfig({
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
  ],
});
```

Or from the CLI: `npx playwright test --reporter=line`

::right::

### HTML report

- Tests, steps, errors, screenshots, videos and traces
- **Copy prompt** on errors: a ready-made prompt for your AI assistant (1.51)
- **Speedboard** tab: find your slowest tests (1.57)
- Duration waterfall next to test steps (1.63)
- `captureGitInfo` adds commit and diff info (1.51)

---

## HTML report

![HTML report](/images/htmlreport.png)

---

## Parallelism & isolation

- Test **files** run in parallel across workers; tests in one file run in order
- Run tests in a file in parallel too: `fullyParallel: true` or `test.describe.configure({ mode: 'parallel' })`
- Each test gets a fresh browser context: no shared cookies or storage
- The real enemy is shared **data**: two workers registering the same user will collide

```ts
// never runs at the same time as other tests holding the 'branding' lock (1.63)
test('admin changes the hotel name', { lock: 'branding' }, async ({ page }) => {
  // ...
});
```

---

## Hunting flaky tests

```bash
npx playwright test --repeat-each 10       # run every test 10 times
npx playwright test --shuffle              # random order; --shuffle <seed> repeats it (1.64)
npx playwright test --last-failed          # rerun only the failures (1.44)
npx playwright test --only-changed=main    # test files changed since main (1.46)
npx playwright test --fail-on-flaky-tests  # passed on retry = failed (1.45)
```

A flaky test is a test that tells you something. Open the trace before you add a retry.

---

## Assignment 1B

- Configure the HTML reporter and set `trace: 'on'`
- Duplicate your test from 1A a few times and enable `fullyParallel`
- Run with `--repeat-each 5`. What breaks, and why?
- Fix it with unique test data per test (for example `faker` or `Date.now()`)
- Open the report and a trace: which step is the slowest?

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Page objects & fixtures

---
layout: two-cols
---

## Page objects

- One class per page or component
- Methods describe user intent: `login(user)`, `bookRoom(dates)`
- Locators live in one place; tests read like scenarios
- Keep assertions mostly in the tests
- *KISS*: no deep inheritance trees

::right::

```ts
export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
  }

  async login(user: User) {
    await this.page.goto('/login');
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.page
      .getByRole('button', { name: 'Log in' })
      .click();
  }
}
```

---

## Fixtures

- Everything a test needs, set up and torn down for you
- `page`, `context`, `browser`, `request` and `browserName` are built-in fixtures
- Create your own with `test.extend`: page objects, test data, logged-in users, API clients
- Lazy: only set up when a test asks for it
- Scoped per test (default) or per worker

---
layout: two-cols
---

## Without fixtures

```ts
test.describe('login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('user can log in', async () => {
    await loginPage.login(user);
    // ...
  });
});
```

::right::

## With fixtures

```ts
test('user can log in', async ({ loginPage }) => {
  await loginPage.login(user);
  // ...
});

test('wrong password', async ({ loginPage }) => {
  await loginPage.login({ ...user, password: 'x' });
  // ...
});
```

---

## Defining fixtures

```ts
// playwright/support/fixtures.ts
import { test as base } from '@playwright/test';

type Fixtures = { loginPage: LoginPage; newUser: User };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  newUser: async ({ request }, use) => {
    const user = await registerRandomUser(request); // setup
    await use(user);                                // the test runs here
    // teardown: clean up after the test
  },
});
export { expect } from '@playwright/test';
```

---

## Custom assertions

```ts
import { expect as baseExpect, type Locator } from '@playwright/test';

export const expect = baseExpect.extend({
  async toHaveBookingStatus(row: Locator, status: string) {
    let pass = true;
    try {
      await baseExpect(row.getByTestId('status-badge')).toHaveText(status);
    } catch {
      pass = false;
    }
    return { pass, name: 'toHaveBookingStatus', message: () => `expected status "${status}"` };
  },
});

await expect(page.getByRole('row', { name: /Deluxe/ })).toHaveBookingStatus('Confirmed');
```

Combine several fixture files with `mergeTests()` and `mergeExpects()`.

---

## Assignment 2

- Create `LoginPage` and `RegisterPage` page objects
- Refactor your test from 1A to use them
- Expose the page objects as fixtures with `test.extend`
- Bonus: add a `BookingWizard` page object, book a room and verify it in *My bookings*

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Authentication

---

## Reusing authentication

- Logging in through the UI in every test is slow and repetitive
- Log in once in a **setup project**, save the browser state, reuse it everywhere
- `storageState` contains cookies and `localStorage` (and optionally IndexedDB)
- booker-platform keeps its JWT in `localStorage` (`booker.token`), so it ends up in the state file

> Add `playwright/.auth` to your `.gitignore`: it contains real sessions.

---

## Setup project: save the state

```ts
// playwright/tests/ui/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const userFile = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('user');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  await page.context().storageState({ path: userFile });
});
```

---

## Use the state per project

```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'ui-user',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
  {
    name: 'ui-admin',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/admin.json' },
    dependencies: ['setup'],
  },
],
```

Override per file: `test.use({ storageState: 'playwright/.auth/admin.json' })`. Start logged out: `test.use({ storageState: { cookies: [], origins: [] } })`.

---

## Working with storage directly

```ts
// read and write localStorage of the current origin (1.61)
await page.localStorage.setItem('booker.token', token);
const stored = await page.localStorage.getItem('booker.token');

// swap the complete state of an existing context (1.59)
await context.setStorageState('playwright/.auth/admin.json');

// include IndexedDB in the saved state (1.51)
await context.storageState({ path: userFile, indexedDB: true });
```

Fastest setup of all: log in via the API, then store the token. No login form needed.

---

## Assignment 3

- Write `auth.setup.ts` that saves the state for `user` **and** `admin`
- Add `ui-user` and `ui-admin` projects that depend on `setup`
- Make your tests start logged in. Compare the duration in the report: faster?
- Bonus: log in with `POST /api/auth/login` and set `booker.token` instead of using the login form

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Network & API

---

## Waiting for requests & responses

```ts
// Start waiting *before* the click. Note: no await yet.
const responsePromise = page.waitForResponse(
  (response) =>
    response.url().includes('/api/bookings') && response.request().method() === 'POST',
);
await page.getByRole('button', { name: 'Confirm booking' }).click();
const response = await responsePromise;
expect(response.status()).toBe(201);
```

`page.waitForRequest()` works the same way. Pass a URL glob or a predicate.

---

## Mocking responses

```ts
await page.route('**/api/bookings', async (route) => {
  if (route.request().method() !== 'POST') return route.fallback();
  await route.fulfill({
    status: 409,
    json: { success: false, error: 'Room not available' },
  });
});

await bookingWizard.confirm();
await expect(page.getByRole('alert')).toHaveText('Room not available');
```

- Test error states that are hard to trigger for real
- Mock only what the test needs; let everything else through

---

## Modifying responses

```ts
await page.route('**/api/public/rooms*', async (route) => {
  const response = await route.fetch();      // the real request
  const json = await response.json();
  json.data.push({ id: 999, number: '999', type: 'SUITE', price: 1, capacity: 2 });
  await route.fulfill({ response, json });   // the real response, patched body
});

await page.goto('/rooms');
await expect(page.getByText('Room 999')).toBeVisible();
```

---

## More network tools

- **HAR**: record and replay traffic with `page.routeFromHAR('booker.har', { update: true })`
- **WebSockets**: intercept and mock with `page.routeWebSocket()` (1.48)
- **Block resources**: `page.route('**/*.{png,jpg}', (route) => route.abort())`
- **Context-wide**: `context.route()` applies to every page, popups included
- **Service workers** can hide requests from `page.route`: set `serviceWorkers: 'block'`

---

## Seed data via the API

UI tests don't have to click through their setup. The `request` fixture uses the same `baseURL`:

```ts
test('a booking shows up in My bookings', async ({ page, request }) => {
  const login = await request.post('/api/auth/login', {
    data: { username: 'user', password: 'password123' },
  });
  const { data } = await login.json();

  const booking = await request.post('/api/bookings', {
    headers: { Authorization: `Bearer ${data.token}` },
    data: { roomId, checkIn: '2030-06-01T00:00:00.000Z', checkOut: '2030-06-03T00:00:00.000Z' },
  });
  await expect(booking).toBeOK();

  await page.goto('/my/bookings');
  await expect(page.getByRole('row', { name: /June 1, 2030/ })).toBeVisible();
});
```

Or the other way round: act in the UI, verify through the API.

---

## Assignment 4

**Network**

- Mock `POST /api/bookings` to return `409` and assert the "Room not available" alert
- Bonus: patch the rooms response so a fake room shows up

**Hybrid**

- Seed a room (as admin) and a booking (as user) via the API, then verify them in the UI
- Or book in the UI and verify via `GET /api/bookings/my-bookings`
- Bonus: move the seeding into a fixture

---
layout: new-section
---

# Time, contexts & environment

---

## Controlling time: `page.clock`

```ts
await page.clock.install({ time: new Date('2030-06-01T14:59:00') });
await page.goto('/my/bookings');
await expect(page.getByRole('button', { name: 'Check in' })).toBeDisabled();

await page.clock.fastForward('01:00');   // one minute later
await expect(page.getByRole('button', { name: 'Check in' })).toBeEnabled();
```

- `setFixedTime()` freezes `Date.now()` but keeps timers running
- `runFor()`, `pauseAt()` and `resume()` control timers precisely (1.45)

---

## Multiple users: multiple contexts

```ts
test('the guest sees the admin approval', async ({ browser }) => {
  const guest = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  const admin = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
  const guestPage = await guest.newPage();
  const adminPage = await admin.newPage();

  await guestPage.goto('/my/bookings');
  await adminPage.goto('/admin/bookings');
  await adminPage.getByRole('button', { name: 'Approve' }).first().click();

  await expect(guestPage.getByText('Confirmed')).toBeVisible();
  await guest.close();
  await admin.close();
});
```

---
layout: two-cols
---

## Emulation

- Devices: viewport, user agent, touch, device scale factor
- Locale and time zone
- Colour scheme and reduced motion
- Geolocation and permissions
- Offline mode: `context.setOffline(true)`

::right::

```ts
// playwright.config.ts
{ name: 'mobile', use: devices['Pixel 7'] },

// per file or describe block
test.use({
  locale: 'nl-NL',
  timezoneId: 'Europe/Amsterdam',
  colorScheme: 'dark',
  geolocation: { latitude: 52.08, longitude: 4.88 },
  permissions: ['geolocation'],
});
```

---

## Dialogs, downloads & new tabs

```ts
// native dialogs are dismissed by default: accept explicitly
page.once('dialog', (dialog) => dialog.accept());
await page.getByRole('button', { name: 'Cancel booking' }).click();

// downloads
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: 'Invoice (CSV)' }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/invoice-\d+\.csv/);

// new tabs
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Terms' }).click();
await expect(await popupPromise).toHaveTitle(/Terms/);
```

---

## Frames, shadow DOM & unexpected overlays

```ts
// iframes
const map = page.locator('iframe[title="Map"]').contentFrame();
await expect(map.getByRole('button', { name: 'Zoom in' })).toBeVisible();

// open shadow roots are pierced automatically
await page.getByLabel('Card number').fill('4242 4242 4242 4242');

// overlays that may or may not appear (1.42)
await page.addLocatorHandler(
  page.getByRole('dialog', { name: 'Cookie consent' }),
  async (dialog) => {
    await dialog.getByRole('button', { name: 'Accept' }).click();
  },
);
```

---

## Assignment 5

Pick one (or more):

- Cancel a booking (confirm dialog) and download its invoice; check the file name and content
- Two contexts: a guest books, the admin approves, the guest sees the status change
- `page.clock`: the "Check in" button becomes enabled at 15:00
- Add a `mobile` project and run your tests with the `nl-NL` locale and dark mode
- Admin: upload a room image and reorder the rooms with drag & drop
- Open the terms in a new tab, then pay in the payment widget (shadow DOM)

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

<!--
These exercises rely on booker-platform features from phase 2 of the frontend spec (invoices, approvals, check-in countdown, i18n).
-->

---
layout: new-section
---

# Visual & accessibility

---

## Visual regression testing

```ts
test('home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png');
});

test('occupancy chart', async ({ page }) => {
  await page.goto('/admin/reports');
  await expect(page.getByTestId('occupancy-chart')).toHaveScreenshot();
});
```

- First run: no baseline yet, so the test writes one and fails
- Next runs: pixel comparison against the baseline
- Name a snapshot `home.webp`, or set `toHaveScreenshot: { type: 'webp' }`, for smaller files (1.62 / 1.64)

---

## The challenges

- **Volatile content** (dates, banners, animations): mask or hide it
- **Browsers and operating systems render differently**: baselines are stored per project and platform (`home-chromium-darwin.png`)
- Screenshots generated on macOS or Windows won't match on Linux CI: generate the baselines where CI runs (for example in the Playwright Docker image)
- Tune the tolerance with `maxDiffPixels`, `maxDiffPixelRatio` and `threshold`

---

## Masking & hiding

```ts
await expect(page).toHaveScreenshot({
  mask: [page.getByTestId('deal-of-the-day')],
  maskColor: '#ff00ff',
});

await expect(page).toHaveScreenshot({
  stylePath: path.join(__dirname, 'screenshot.css'), // .deal-of-the-day { visibility: hidden }
});
```

```ts
// playwright.config.ts
expect: {
  toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
},
```

---

## Updating baselines

```bash
npx playwright test --update-snapshots            # same as =changed
npx playwright test --update-snapshots=changed    # only rewrite what differs (1.50)
npx playwright test --update-snapshots=missing    # only write new baselines; passes since 1.64
npx playwright test --update-snapshots=all        # rewrite everything
npx playwright test --update-snapshots=none       # never write
```

> Review baseline changes like code changes: they *are* your expected results.

---

## Assignment 6

- Take a screenshot of the home page; run the test twice. Does it pass?
- Mask the "deal of the day" banner and update the baseline
- Then hide the banner with `stylePath` instead. Which do you prefer?
- Bonus: switch the snapshot to WebP and compare the file size

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---

## Accessibility testing with axe

```ts
import AxeBuilder from '@axe-core/playwright';

test('the booking wizard has no detectable a11y issues', async ({ page }) => {
  await page.goto('/book/1');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- Install `@axe-core/playwright` first
- axe scans the **current** state: open dialogs and menus before you scan them
- Automated scans find only part of the issues; keep testing manually as well

---

## Accessibility in your assertions

- `getByRole` locators double as a11y checks: if you can't find it by role, neither can a screen reader
- `toHaveAccessibleName`, `toHaveAccessibleDescription` and `toHaveRole` (1.44)
- `toMatchAriaSnapshot` for whole structures (1.49), also on page level (1.60)
- `page.accessibility` was removed in 1.57: use aria snapshots or axe

---

## Assignment 7

- Run an axe scan on each step of the booking wizard. How many violations?
- Attach the results to the report with `testInfo.attach()`
- Bonus: add an aria snapshot of the main navigation and the booking summary

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Continuous integration

---

## Running in CI

```bash
npm ci                                # install the exact dependencies
npx playwright install --with-deps    # browsers + OS packages (Linux)
npx playwright test
```

- Or skip the install: run in the official image `mcr.microsoft.com/playwright:v1.64.0-noble` (Ubuntu 24.04)
- `npm init playwright@latest` can generate a GitHub Actions workflow for you
- Node 18 is no longer supported: use the current LTS

---

## GitHub Actions

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with: { node-version: lts/*, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v5
        if: ${{ !cancelled() }}
        with: { name: playwright-report, path: playwright-report/, retention-days: 30 }
```

---
layout: two-cols
---

## Sharding

Split the suite over several machines, then merge the reports.

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]
steps:
  # checkout, setup-node, npm ci, install ...
  - run: >-
      npx playwright test
      --shard=${{ matrix.shard }}/4
```

::right::

```ts
// playwright.config.ts
reporter: process.env.CI ? 'blob' : 'html',
```

Upload each `blob-report` folder, then in a final job:

```bash
npx playwright merge-reports \
  --reporter html ./all-blob-reports
```

---

## Keeping CI trustworthy

- `forbidOnly: !!process.env.CI`: a forgotten `test.only` fails the run
- `retries: 2` on CI to detect flaky tests, plus `failOnFlakyTests: true` (1.52) so they don't go unnoticed
- `retryStrategy: 'isolated'` (1.62): run all retries at the end, one by one
- `trace: 'on-first-retry'` and upload the report as an artifact
- Run `npm run lint` before the tests

---

## Assignment 8

- Fork booker-platform and add a GitHub Actions workflow that runs your UI tests
- Upload the HTML report as an artifact; download it and open a trace
- Bonus: shard over two jobs and merge the reports

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# AI-assisted testing

---

## Playwright & AI

- **Copy prompt** on failures in the HTML report, UI mode and trace viewer (1.51)
- **Playwright MCP**: lets an AI agent drive a real browser through the accessibility tree
- **`playwright-cli`**: a token-efficient CLI for coding agents; both are bundled since 1.62 (`npx playwright mcp`, `npx playwright cli`)
- **`--debug=cli`**: an agent can attach to a paused test and step through it (1.59)
- **Test agents**: planner, generator and healer (1.56)

---

## Test agents

```bash
npx playwright init-agents --loop=vscode    # or: claude, codex, opencode
```

- 🎭 **planner** explores the app and writes a Markdown test plan
- 🎭 **generator** turns the plan into Playwright tests
- 🎭 **healer** runs the tests and repairs failing ones
- Regenerate the agent definitions after every Playwright upgrade

---

## Stay critical

- Generated tests are a draft: review them like a colleague's pull request
- Check: meaningful assertions? Role-based locators? Isolated data? No `waitForTimeout`?
- A healer that "fixes" a test may hide a real bug
- Never paste secrets or customer data into a prompt

---

## Assignment 9 (optional)

- Run `npx playwright init-agents` in booker-platform
- Let the planner write a plan for "cancel a booking", then generate the test
- Review the result with the checklist from the previous slide. Would you merge it?

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Wrap-up

---

## Assignment 10: flaky-test clinic

The trainer switches on chaos mode: slow rooms, flaky bookings, random order and a cookie pop-up.

- Make the suite green again
- Without `waitForTimeout` and without adding retries
- Use what you learned today: traces, web-first assertions, mocking, `addLocatorHandler`

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---

## Resources

1. Docs and release notes: https://playwright.dev
2. Discord: https://playwright.dev/community/welcome#community-discord
3. Stack Overflow: https://stackoverflow.com/tags/playwright
4. Playwright Solutions: https://playwrightsolutions.com
5. Test object and solutions: https://github.com/Ghislain89/booker-platform
6. These slides: https://github.com/Ghislain89/playwright-training-slides

---

## Thank you!

Everything from today is on GitHub: booker-platform (with a `solutions` branch) and these slides.

Feedback or questions? Let us know!

Ghislain@DeTesters.nl · Jurgen@DeTesters.nl
