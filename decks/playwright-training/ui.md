---
theme: ../../theme
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

Two evenings · [playwright.dev](https://playwright.dev)

---
hideInToc: true
---

## Agenda

<div class="grid grid-cols-2 gap-10">
<div>

### Evening 1: your first stable tests

- Why Playwright
- Your first test
- Locators, actions & assertions → **1A**
- Debug & report → **1B**

</div>
<div>

### Evening 2: scale up your suite

- Page objects & fixtures → **2**
- Authentication → **3**
- Network & API → **4**
- Flaky-test clinic → **5**
- CI and what's next

</div>
</div>

*Going further* is at the end of the deck: time and contexts, visual and accessibility testing, CI in depth and AI. Assignments 6–10 are for after the workshop.

---
hideInToc: true
---

## Our test object: booker-platform

A hotel booking app with a web UI, a REST API and Swagger docs, all on `http://localhost:3000`.

```bash
git clone https://github.com/Ghislain89/booker-platform
cd booker-platform
npm install
npx playwright install chromium
npm run setup     # reset the database + seed data
npm run dev       # UI, /api and /api-docs on port 3000
```

- Seed users: `user` / `password123` and `admin` / `password123`
- Something broken? `npm run setup` gives you a clean database
- Built for testing: a seed API, a test mode and chaos flags. More on these in evening 2.

---
hideInToc: true
---

## Preparation check

- Node.js LTS, Git and VS Code with the Playwright Test extension installed
- `npx playwright --version` prints **1.64** or newer
- booker-platform runs on http://localhost:3000
- Went through the [preparation page](https://ghislain.dev/playwright/preparation.html)?

> Something not working? Tell us now, not after the first assignment. The app won't start? booker-platform also runs in Docker: see its README.

All assignments, with hints, are also on [ghislain.dev/playwright/assignments.html](https://ghislain.dev/playwright/assignments.html).

---
layout: new-section
---

# Evening 1: your first stable tests

From a first recorded test to tests that pass every time

---
layout: new-section
---

# Why Playwright

---

## What is Playwright?

- Open-source framework (Microsoft) for end-to-end testing of web apps
- Chromium (Chrome, Edge), Firefox and WebKit (Safari) on Windows, Linux and macOS
- TypeScript / JavaScript, Python, .NET and Java
- Comes with its own test runner: `@playwright/test`
- No WebDriver: Playwright talks to each browser over its own protocol. The browsers are pinned per Playwright version: `npx playwright install`

<!--
Chromium runs on Chrome for Testing builds since 1.57. Use channel: 'chrome' or 'msedge' for the branded browsers.
Mobile emulation: Chrome for Android and Mobile Safari (see Going further).
Platforms: WebKit needs macOS 15 or newer (macOS 13 was dropped in 1.58, macOS 14 in 1.59). Ubuntu 20.04 (1.63) and Debian 11 (1.62) are no longer supported.
-->

---

## Why Playwright?

- **Auto-waiting**: actionability checks before every action
- **Web-first assertions** retry until the condition is met
- **Isolation**: every test gets a fresh browser context, in milliseconds
- **Built in**: parallelism, retries, reporters, API testing, mobile emulation
- **Tooling**: VS Code extension, codegen, UI mode, trace viewer
- **AI tooling**: MCP server, CLI and test agents (see *Going further*)

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
- `default: false`: only runs with `--project webkit`; `--project="*"` runs them all
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

<!--
default: false on a project: since 1.64. A plain npx playwright test skips those projects, on CI too: pass --project="*" to run every project.
-->

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
- The toolbar adds assertions: visibility, text, value
- **Pick locator** shows the best locator for any element
- A starting point, not the end result: clean it up and add meaningful assertions

::right::

![Codegen](/images/codegen.png)

<!--
Since 1.55 codegen can add toBeVisible() assertions automatically.
-->

---

## Codegen with the VS Code extension

![Codegen in VS Code](/images/codegen-vscode.png)

---

## Linting: catch mistakes early

```ts
// ❌ missing await: the test finishes before this assertion runs
expect(page.getByText('No bookings yet')).toBeVisible();

// ✅
await expect(page.getByText('No bookings yet')).toBeVisible();
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

1. `page.getByRole('button', { name: 'Log in' })`
2. `page.getByLabel('Check-in date')`
3. `page.getByText('No bookings yet')`, `page.getByPlaceholder('Search rooms')`
4. `page.getByAltText('Photo 1 of 3 of room 101')`, `page.getByTitle('Map showing the hotel location')`
5. `page.getByTestId('total-price')`
6. CSS or XPath: last resort

Locators are **lazy**: they find the element again every time you use them, so they never go stale. (The old `ElementHandle` API, `page.$()`, is discouraged.)

---

## Strict mode: one locator, one element

```ts
// the register page has "Password" and "Confirm password"
await page.getByLabel('Password').fill('secret123');
// Error: strict mode violation: getByLabel('Password') resolved to 2 elements
```

Names match **case-insensitively** and as a **substring**. Make the locator more specific:

```ts
page.getByLabel('Password', { exact: true });                // the exact name
page.getByRole('main').getByRole('link', { name: 'Terms' }); // scope: the footer has a terms link too
page.getByRole('article', { name: 'Room 201' })              // scope to one card or row
  .getByRole('link', { name: 'Book now' });
```

- Read the error: it lists every element it found, each with a locator that would be unique
- `.first()` and `.nth(1)` hide the error, but break as soon as the order changes

---

## Narrowing down

```ts
// chain: search inside another locator
const card = page.getByRole('article', { name: 'Room 201' });
await card.getByRole('link', { name: 'Book now' }).click();

// filter a list by text
const deluxe = page.getByRole('article').filter({ hasText: 'Deluxe' });

// or by a child locator: the bookings you can still cancel
const cancellable = page
  .getByRole('row')
  .filter({ has: page.getByRole('button', { name: 'Cancel booking' }) });

// lists: assert the count instead of picking one
await expect(page.getByRole('article')).toHaveCount(6);
```

---

## Actions

```ts
// /login
await page.getByLabel('Username').fill('user');
await page.getByLabel('Password').fill('password123');
await page.getByLabel('Remember me').check();
await page.getByRole('button', { name: 'Log in' }).click();

// /rooms
await page.getByLabel('Suite').check();
await page.getByLabel('Sort by').selectOption('Price: low to high');
await page.getByLabel('Check-in date').fill('2031-05-01');
await page.getByLabel('Check-in date').press('Tab');

// the header and /my/profile
await page.getByRole('button', { name: 'Account' }).hover();
await page.getByLabel('Choose a photo').setInputFiles('playwright/test-data/avatar.png');
```

> Before every action Playwright waits until the element is visible, stable, enabled and able to receive events: the *actionability checks*.

---

## Web-first assertions

- Regular assertions check **once**: on a dynamic page that makes tests flaky
- Web-first assertions take a **locator** and **retry** until the condition is met or the timeout (5 s by default) expires

```ts
// 👍 retries until the text is visible
await expect(page.getByText('No bookings yet')).toBeVisible();

// 👎 checks once, fails if the page is a bit slow
expect(await page.getByText('No bookings yet').isVisible()).toBe(true);
```

Use web-first assertions wherever you can.

---

## Assertions you'll use most

```ts
// /my/bookings
await expect(page).toHaveURL(/\/my\/bookings/);
await expect(page).toHaveTitle('My bookings | Booker');
await expect(page.getByRole('tab', { name: 'Upcoming' })).toHaveAttribute('aria-selected', 'true');

// the booking wizard, /book/203, two nights
await expect(page.getByLabel('Adults')).toHaveValue('1');
await expect(page.getByLabel('Breakfast')).not.toBeChecked();
await expect(page.getByTestId('total-price')).toHaveText('€ 350');
await expect(page.getByRole('button', { name: 'Confirm booking' })).toBeDisabled();
await expect.soft(page.getByRole('heading', { level: 1 })).toHaveText('Book room 203'); // keeps going

// /login, after registering: wait longer than the default 5 s
await expect(page.getByRole('region', { name: 'Notifications' }))
  .toContainText('Account created', { timeout: 10_000 });
```

---

## Best practices

- Test user-visible behaviour: prefer role, label and text over CSS or XPath
- Keep tests isolated: own data, own state, any order
- Only test what you control: mock third-party services
- No `waitForTimeout`: let web-first assertions do the waiting
- One user goal per test; use `test.step` to keep it readable

---

## Assignment 1A

Make sure booker-platform runs (`npm run dev`), then create `playwright/tests/ui/register.spec.ts`. Start on the login page (`/login`):

- Follow the link to *Register* and register a new user
- Log in with that user
- Assert that "No bookings yet" is shown

Write it yourself first, then compare with what codegen records. Prefer `getByRole` and `getByLabel`, and add a web-first assertion to every step.

> Expect a strict mode violation or two. Read the error before you fix it.

<div class="flex justify-center gap-5 mt-2">
  <img src="/programming.png" alt="Programming" width="100">
  <img src="/exam-time.png" alt="Exam time" width="100">
</div>

<!--
The two violations are deliberate: getByLabel('Password') on /register also matches "Confirm password", and /login has two "Register" links (header and below the form). Fixes: exact: true, and scoping to main.
Codegen avoids both, so ask the room what codegen picked and why.
Registering needs the terms checkbox.
-->

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
  // or 'on' | 'off' | 'retain-on-failure' | 'retain-on-first-failure'

  // plus a screenshot and the aria snapshot of every action:
  // trace: { mode: 'on-first-retry', snapshots: { dom: true, aria: true, screen: true } },
},
```

- Open it from the HTML report, with `npx playwright show-trace trace.zip`, or at trace.playwright.dev
- With aria and screen snapshots on, the viewer shows each action's screenshot next to its aria snapshot

<!--
retain-on-first-failure: 1.43. retain-on-failure-and-retries: 1.59. The snapshots object: 1.63. By default a trace only has DOM snapshots (snapshots: true means { dom: true }); in the viewer, Display Aria puts the screenshot next to the aria snapshot.
-->

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

Or from the CLI: `--reporter=line` replaces these, `--add-reporter=line` adds one

::right::

### HTML report

- Tests, steps, errors, screenshots, videos and traces
- **Copy prompt** on errors: a ready-made prompt for your AI assistant
- **Speedboard** tab: find your slowest tests
- A duration waterfall next to the test steps

<!--
Copy prompt: 1.51. Speedboard: 1.57. Waterfall: 1.63. captureGitInfo (commit and diff in the report): 1.51. --add-reporter: 1.63.
-->

---

## HTML report

![HTML report](/images/htmlreport.png)

---

## Parallelism & test data

- Test **files** run in parallel across workers; tests in one file run in order
- `fullyParallel: true` runs the tests inside a file in parallel too
- Each test gets a fresh browser context: no shared cookies or storage
- The real enemy is shared **data**: two workers registering the same user collide
- `--repeat-each 5` runs every test five times: the quickest way to find out

```ts
// ❌ the same user in every test: the second registration gets "Username already exists"
const username = 'alice';

// ✅ unique per test
const username = `alice-${crypto.randomUUID().slice(0, 8)}`;
```

---

## Assignment 1B

- Configure the HTML reporter and set `trace: 'on'`
- Duplicate your test from 1A a few times and enable `fullyParallel`
- Run with `--repeat-each 5`. What breaks, and why?
- Fix it with unique test data per test, for example `createRandomUser()` from `playwright/support/datafactories`
- Open the report and a trace: which step is the slowest?

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---

## Evening 1: recap

- Locate by role and label; `exact: true` or scoping when a locator matches more than one element
- Web-first assertions wait for you; `isVisible()` doesn't
- UI mode and the trace viewer show what really happened
- Every test brings its own data

**Before evening 2**: finish 1A and 1B, and run `git pull` in booker-platform.

Next time: page objects, fixtures, authentication, the network and a flaky-test clinic.

---
layout: new-section
---

# Evening 2: scale up your suite

Page objects, fixtures, a shared login, the network and a flaky-test clinic

---

## Welcome back

- `git pull` in booker-platform: it has starter files for assignment 2
- `npm run setup` for a clean database
- Questions about 1A and 1B?

Tonight we turn a few tests into a suite: reusable page objects and fixtures, a shared login, control over the network, and a suite that stays green when the app misbehaves.

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
- Starters in booker-platform: `playwright/support/pages/`

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
- booker-platform has a test-support API, `/api/testing/seed`: unique data per test, removed afterwards. Ask your developers for one.

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
class: dense
---

## Defining fixtures

```ts
// playwright/support/fixtures/ui.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = { loginPage: LoginPage; guest: { username: string; password: string } };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  guest: async ({ request }, use) => {
    const namespace = `t_${crypto.randomUUID().slice(0, 8)}`;
    const response = await request.post('/api/testing/seed', {   // setup
      data: { namespace, users: [{ username: 'guest' }] },
    });
    const { user, password } = (await response.json()).data.users[0];
    await use({ username: user.username, password });             // the test runs here
    await request.delete(`/api/testing/namespace/${namespace}`); // teardown
  },
});
export { expect } from '@playwright/test';
```

---

## Assignment 2

- Finish the starter page objects in `playwright/support/pages/`: `LoginPage` and `RegisterPage`
- Refactor your test from 1A to use them
- Expose them as fixtures in `playwright/support/fixtures/ui.fixture.ts`
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

## Log in via the API

Faster still: skip the login form and put the token where the app expects it.

```ts
setup('authenticate as user via the API', async ({ page, request }) => {
  const response = await request.post('/api/auth/login', {
    data: { username: 'user', password: 'password123' },
  });
  const { token } = (await response.json()).data;

  await page.goto('/');
  await page.localStorage.setItem('booker.token', token);
  await page.context().storageState({ path: userFile });
});
```

Keep one test that logs in through the form: that's a feature too.

<!--
page.localStorage: since 1.61. Before that: page.evaluate((t) => localStorage.setItem('booker.token', t), token).
-->

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

await bookingWizard.book({ checkIn: '2031-05-01', checkOut: '2031-05-03' }); // your page object
await expect(page.getByRole('alert')).toHaveText('Room not available');
```

- Test error states that are hard to trigger for real
- Mock only what the test needs; let everything else through

---

## Modifying responses

```ts
await page.route('**/api/public/rooms*', async (route) => {
  const response = await route.fetch();              // the real request
  const json = await response.json();
  json.data.unshift({ ...json.data[0], id: 'fake-room', number: '999', price: 1 });
  await route.fulfill({ response, json });           // the real response, patched body
});

await page.goto('/rooms');
await expect(page.getByRole('article', { name: 'Room 999' })).toContainText('€ 1');
```

Copying a real room keeps every field the page needs.

---
class: dense
---

## Seed data via the API

UI tests don't have to click through their setup. The `request` fixture uses the same `baseURL`:

```ts
test('a booking shows up in My bookings', async ({ page, request }) => {
  const login = await request.post('/api/auth/login', {
    data: { username: 'user', password: 'password123' },
  });
  const headers = { Authorization: `Bearer ${(await login.json()).data.token}` };
  const room = (await (await request.get('/api/public/rooms/203')).json()).data;

  const response = await request.post('/api/bookings', {
    headers,
    data: { roomId: room.id, checkIn: '2030-06-01', checkOut: '2030-06-03' },
  });
  await expect(response).toBeOK();
  const booking = (await response.json()).data;

  await page.goto('/my/bookings'); // logged in as user (storage state)
  await expect(page.getByRole('row', { name: /June 1, 2030/ })).toBeVisible();

  await request.delete(`/api/bookings/${booking.id}`, { headers }); // clean up: free the dates
});
```

<!--
Or the other way round: act in the UI, verify through the API (assignment 4).
Run it twice without the clean-up: the second run gets a 409. A fixture can clean up even when the test fails (assignment 4 bonus).
-->

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

# Flaky-test clinic

---

## Hunting flaky tests

```bash
npx playwright test --repeat-each 10       # run every test 10 times
npx playwright test --last-failed          # rerun only the failures
npx playwright test --fail-on-flaky-tests  # passed on retry = failed
```

A flaky test is a test that tells you something. Open the trace before you add a retry.

Usual suspects: shared data, fixed waits, `nth()` on a list that changes order, overlays, a slow or unreliable backend.

<!--
--last-failed: 1.44. --fail-on-flaky-tests: 1.45. --shuffle [seed] and --only-changed: see Going further.
-->

---

## Tools for unstable pages

```ts
// an overlay that may or may not show up
await page.addLocatorHandler(
  page.getByRole('dialog', { name: 'We value your privacy' }),
  async (dialog) => {
    await dialog.getByRole('button', { name: 'Accept all' }).click();
  },
);

// retry one step, and only where a real user would retry too
await expect(async () => {
  await page.getByRole('button', { name: 'Confirm booking' }).click();
  await expect(page).toHaveURL(/\/my\/bookings$/, { timeout: 5_000 });
}).toPass({ timeout: 30_000 });
```

Find list items by name, not by position: `getByRole('article', { name: 'Room 201' })`, not `getByRole('article').nth(3)`.

<!--
addLocatorHandler: since 1.42.
-->

---

## Ask for testability

booker-platform has test hooks. Your app can have them too: ask your developers.

- `?test=1`: test mode. No animations, the same "deal of the day" every time, notifications stay open
- `POST /api/testing/reset` and `/seed`: known data, unique per test
- `x-booker-flags`: switch on chaos or bugs for one test or project

```ts
{
  name: 'chaos',
  use: {
    extraHTTPHeaders: {
      'x-booker-flags': 'slow-rooms,flaky-booking,random-order,popup-cookie',
    },
  },
}
```

---

## Assignment 5: flaky-test clinic

The trainer switches on chaos mode: slow rooms, flaky bookings, random order and a cookie pop-up.

- Make your suite green again
- Without `waitForTimeout` and without adding retries
- Use what you learned: traces, web-first assertions, locators by name, `addLocatorHandler`, `toPass`

Practising on your own? Add the `chaos` project from the previous slide and run `npx playwright test --project chaos`.

<!--
The trainer switches flags on for everyone at /__trainer (admin only); participants can also use the x-booker-flags header (see the README for the full list of flags).
Expected fixes: addLocatorHandler for the "We value your privacy" dialog, find rooms by name instead of position, rely on web-first assertions for slow-rooms, and use expect(...).toPass() only around the confirm step (flaky-booking fails before the booking is saved).
Reference solution: assignment5.chaos.spec.ts on the solutions branch.
-->

---
layout: two-cols
---

## Running in CI

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: lts/* }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with: { name: playwright-report, path: playwright-report/ }
```

::right::

<div class="mt-12">

- `--with-deps`: browsers plus their Linux packages
- `forbidOnly` on CI: a forgotten `test.only` fails the run
- `retries: 2` on CI, with a trace on the first retry
- Upload the report, also when tests fail
- Sharding, Docker and more: *Going further*

</div>

---

## What's next

*Going further*, in the rest of this deck, with an assignment per topic:

- **6** Time, contexts & environment: clock, two users, mobile, dialogs, downloads, frames
- **7** Visual regression testing
- **8** Accessibility testing
- **9** CI in depth: sharding and merged reports
- **10** AI-assisted testing (optional)

Reference solutions for every assignment are on the `solutions` branch of booker-platform.

---

## Resources

1. Docs and release notes: https://playwright.dev
2. Discord: https://playwright.dev/community/welcome#community-discord
3. Stack Overflow: https://stackoverflow.com/tags/playwright
4. Playwright Solutions: https://playwrightsolutions.com
5. Test object and solutions: https://github.com/Ghislain89/booker-platform
6. All assignments with hints: https://ghislain.dev/playwright/assignments.html
7. These slides: https://github.com/Ghislain89/ghislain.dev/tree/main/decks/playwright-training

---

## Thank you!

Everything from these two evenings is on GitHub: booker-platform (with a `solutions` branch) and these slides.

Feedback or questions? Let us know!

Ghislain@DeTesters.nl · Jurgen@DeTesters.nl

---
layout: new-section
---

# Going further

Self-study after the workshop: assignments 6–10

---
layout: new-section
---

# Time, contexts & environment

---

## Controlling time: `page.clock`

```ts
// user's booking for room 302 starts today (`today` is 'yyyy-mm-dd'); check-in opens at 15:00
await page.clock.setFixedTime(new Date(`${today}T14:59:50`));
await page.goto('/my/bookings');
const countdown = page.getByTestId('check-in-countdown').filter({ hasText: 'room 302' });
await expect(countdown).toHaveText('Check-in for room 302 opens in 00:00:10');

await page.clock.setFixedTime(new Date(`${today}T15:00:00`));
await expect(countdown).toHaveText('Check-in for room 302 is open');
```

- `setFixedTime()` fixes `Date.now()` and keeps timers running, so the page works as usual
- `install()` with `fastForward()`, `runFor()` or `pauseAt()` controls the timers too; they stop the app's own timers as well

<!--
runFor(), pauseAt() and resume(): since 1.45.
In booker-platform, install() + pauseAt() freezes React Query's timers, so the page never finishes loading. Use setFixedTime.
-->

---

## Multiple users: multiple contexts

```ts
test('the guest sees the admin approval', async ({ browser }) => {
  await using guest = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  await using admin = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
  const guestPage = await guest.newPage();
  const adminPage = await admin.newPage();

  // the guest has a pending booking for room `number`
  await guestPage.goto('/my/bookings');
  await adminPage.goto('/admin/bookings');
  const pending = adminPage.getByRole('row', { name: `Room ${number}` });
  await pending.getByRole('button', { name: 'Approve' }).click();

  const booking = guestPage.getByRole('row', { name: `Room ${number}` });
  await expect(booking.getByTestId('status-badge')).toHaveText('Confirmed'); // no reload
});
```

`await using` closes both contexts when the test ends, also when it fails.

<!--
await using: since 1.59. Without it, close the contexts yourself at the end of the test. Those lines don't run when an assertion fails, and Playwright doesn't close contexts that you created.
-->

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
  reducedMotion: 'reduce',
  geolocation: { latitude: 52.08, longitude: 4.88 },
  permissions: ['geolocation'],
});
```

<!--
reducedMotion, forcedColors and contrast as test options: since 1.63 (before: contextOptions). Since 1.64 the devices also set the screen size, so window.screen and device media queries follow the device; opt out with screen: undefined.
-->

---

## Dialogs, downloads & new tabs

```ts
// native dialogs are dismissed by default: accept explicitly
const row = page.getByRole('row', { name: /Room 201/ });
page.once('dialog', (dialog) => dialog.accept());
await row.getByRole('button', { name: 'Cancel booking' }).click();

// downloads
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Download CSV invoice for room 302' }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/^invoice-room-302-[\d-]+\.csv$/);

// new tabs
const popupPromise = page.waitForEvent('popup');
await page.getByRole('main').getByRole('link', { name: 'Terms' }).click();
await expect(await popupPromise).toHaveTitle(/Terms and conditions/);
```

---

## Frames & shadow DOM

```ts
// iframes: the map on the home page
const map = page.getByTitle('Map showing the hotel location').contentFrame();
await expect(map.getByRole('button', { name: 'Zoom in' })).toBeVisible();

// or search every frame, without locating the iframe first
await expect(page.frameLocator().getByRole('button', { name: 'Zoom in' })).toBeVisible();

// open shadow roots are pierced automatically: the payment form in the booking wizard
await page.getByLabel('Card number').fill('4242 4242 4242 4242');
```

- `contentFrame()` turns an iframe locator into a frame locator
- `frameLocator()` without a selector searches every frame; it throws when elements match in more than one frame
- Closed shadow roots can't be reached: test those through their public API

<!--
page.frameLocator() without a selector: since 1.63.
-->

---

## Assignment 6

Pick one (or more):

- Cancel a booking (confirm dialog) and download its invoice; check the file name and content
- Two contexts: a guest books, the admin approves, the guest sees the status change
- `page.clock`: the check-in countdown on My bookings reaches "is open" at 15:00
- Add a `mobile` project and run your tests with the `nl-NL` locale and dark mode
- Admin: upload a room image and reorder the rooms with drag & drop
- Open the terms in a new tab, then pay in the payment widget (shadow DOM)

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

<!--
All of these exist in booker-platform. Payment test card: 4242 4242 4242 4242 (any future date and CVC); 4000 0000 0000 0002 is declined.
Hints: page.waitForEvent('download'), browser.newContext() with the admin storage state, page.clock.setFixedTime (not install+pauseAt: that freezes React Query timers), devices['Pixel 7'] + locale + colorScheme, setInputFiles with a buffer, locator.dragTo, context.waitForEvent('page'). The payment form is in an open shadow root, so ordinary locators reach it.
Reference solutions: the assignment6.*.spec.ts files on the solutions branch.
-->

---
layout: new-section
---

# Visual regression

---

## Visual regression testing

```ts
test('home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png');
});

test('room card', async ({ page }) => {
  await page.goto('/rooms');
  await expect(page.getByRole('article', { name: 'Room 201' })).toHaveScreenshot();
});
```

- First run: no baseline yet, so the test writes one and fails
- Next runs: pixel comparison against the baseline
- Name a snapshot `home.webp`, or set `toHaveScreenshot: { type: 'webp' }`, to store lossless WebP instead of PNG

<!--
WebP snapshots: 1.62 (file name) and 1.64 (type option). Not always smaller: in Chromium the browser encodes the WebP itself, and booker's home page comes out at about twice the size of the PNG (1.64: 251 against 134 KB on macOS, 274 against 130 KB on Linux). That's the answer to the bonus of assignment 7.
-->

---

## The challenges

- **Volatile content** (dates, banners, animations): mask or hide it, or ask for a test mode. booker's `?test=1` turns off animations and fixes the "deal of the day"
- **Browsers and operating systems render differently**: baselines are stored per project and platform (`home-chromium-darwin.png`)
- Screenshots generated on macOS or Windows won't match on Linux CI: generate the baselines where CI runs (for example in the Playwright Docker image)
- Tune the tolerance with `maxDiffPixels`, `maxDiffPixelRatio` and `threshold`
- **Upgrading Playwright** upgrades the browsers too, and rendering can shift: update the baselines in a separate pull request

<!--
An example: since 1.64 the devices also set the screen size, which changes pages that read window.screen or use device media queries.
-->

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
npx playwright test --update-snapshots=changed    # only rewrite what differs
npx playwright test --update-snapshots=missing    # only write new baselines
npx playwright test --update-snapshots=all        # rewrite everything
npx playwright test --update-snapshots=none       # never write
```

> Review baseline changes like code changes: they *are* your expected results.

<!--
The modes: 1.50. Since 1.64 a run with =missing passes when it only wrote new baselines.
-->

---

## Assignment 7

- Take a screenshot of the home page; run the test twice. Does it pass?
- Mask the "deal of the day" banner and update the baseline
- Then hide the banner with `stylePath` instead. Which do you prefer?
- Now open the page with `?test=1`. Do you still need either?
- Bonus: switch the snapshot to WebP and compare the file size

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

---
layout: new-section
---

# Accessibility

---

## Accessibility testing with axe

```ts
import AxeBuilder from '@axe-core/playwright';

test('the booking wizard has no detectable a11y issues', async ({ page }) => {
  await page.goto('/book/101');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- `@axe-core/playwright` is already installed in booker-platform
- axe scans the **current** state: open dialogs and menus before you scan them
- Automated scans find only part of the issues; keep testing manually as well

---

## Accessibility in your assertions

- `getByRole` locators double as a11y checks: if you can't find it by role, neither can a screen reader
- A strict mode violation can be an a11y finding too: two buttons both called "Show" are ambiguous for a screen reader user as well
- `toHaveAccessibleName`, `toHaveAccessibleDescription` and `toHaveRole`
- `toMatchAriaSnapshot` for whole structures

<!--
toHaveAccessibleName, toHaveAccessibleDescription, toHaveRole: 1.44. toMatchAriaSnapshot: 1.49, on page level since 1.60.
page.accessibility was removed in 1.57: use aria snapshots or axe.
-->

---

## ARIA snapshots

Assert the structure of the page as assistive technology sees it:

```ts
await expect(page.getByRole('navigation', { name: 'Main' })).toMatchAriaSnapshot(`
  - navigation "Main":
    - list:
      - listitem:
        - link "Rooms"
      - listitem:
        - link "My bookings"
    - button "Log out"
`);
```

- Generate them with codegen or the aria view in UI mode and the trace viewer
- Less brittle than screenshots, more complete than single assertions
- Partial matching: you can leave out elements ("Signed in as user"), but not levels (the `list`)
- Update them with `--update-snapshots`

---

## Assignment 8

- Run an axe scan on each step of the booking wizard. How many violations?
- Attach the results to the report with `testInfo.attach()`
- Bonus: add an aria snapshot of the main navigation and the booking summary

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

<!--
Trainer variant: switch on the bug-a11y flag and compare the results.
-->

---
layout: new-section
---

# CI in depth

---

## Running in CI

```bash
npm ci                                # install the exact dependencies
npx playwright install --with-deps    # browsers + OS packages (Linux)
npx playwright test
```

- Or skip the install: run in the official image `mcr.microsoft.com/playwright:v1.64.0-noble` (Ubuntu 24.04); its version must match your `@playwright/test`
- `npm init playwright@latest` can generate a GitHub Actions workflow for you
- Use a supported Node.js LTS, such as 22 or 24: Node 20 reached end-of-life in April 2026

<!--
Image tags also exist for Ubuntu 22.04 (-jammy) and, since 1.61, Ubuntu 26.04 (-resolute). The images run Node 24 since 1.57. Playwright itself needs Node 20 or newer.
-->

---

## GitHub Actions

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: lts/*, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v7
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
- `retries: 2` on CI to detect flaky tests, plus `failOnFlakyTests: true` so they don't go unnoticed
- `retryStrategy: 'isolated'`: run all retries at the end, one by one
- `trace: 'on-first-retry'` and upload the report as an artifact
- Run `npm run lint` before the tests

<!--
failOnFlakyTests: 1.52. retryStrategy: 1.62.
-->

---

## Assignment 9

- Fork booker-platform and add a GitHub Actions workflow that runs your UI tests
- Upload the HTML report as an artifact; download it and open a trace
- Bonus: shard over two jobs and merge the reports

<div class="flex justify-center gap-5 mt-6">
  <img src="/programming.png" alt="Programming" width="150">
  <img src="/exam-time.png" alt="Exam time" width="150">
</div>

<!--
Downloaded the report artifact? npx playwright show-report playwright-report.zip opens it without unzipping (1.60).
The actions in the workflow: v7 of checkout, setup-node and upload-artifact (Node 24). GitHub runs every JavaScript action on Node 24 since September 2026.
-->

---
layout: new-section
---

# AI-assisted testing

---

## Playwright & AI

- **Copy prompt** on failures in the HTML report, UI mode and trace viewer
- **Playwright MCP**: lets an AI agent drive a real browser through the accessibility tree
- **`playwright-cli`**: a token-efficient CLI for coding agents; both are bundled (`npx playwright mcp`, `npx playwright cli`)
- **`--debug=cli`** and **`npx playwright trace`**: an agent can step through a paused test, or read a trace from the command line
- **Agent skills**: `npx playwright init-skills` installs skills for the CLI, for traces and for component testing
- **Test agents**: planner, generator and healer

<!--
Copy prompt: 1.51. Test agents: 1.56. --debug=cli and npx playwright trace: 1.59. MCP and CLI bundled, init-skills: 1.62.
init-skills writes to .claude/skills; --loop=agents writes to .agents/skills.
WebMCP (1.64): Playwright MCP also offers the agent the tools that a page registers through the experimental WebMCP API, and page.webmcp tests them.
-->

---

## Test agents

```bash
npx playwright init-agents --loop=vscode    # or: claude, codex, copilot, opencode
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

## Assignment 10 (optional)

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

# More Playwright

---

## More locator tricks

```ts
// only the visible matches, for example when a desktop and a mobile menu both exist
page.getByRole('link', { name: 'My bookings' }).visible();

// resolve nth() per row: the check-in date of every booking
const checkIns = page.getByRole('cell').nth(1).within(page.getByRole('row'));

// a readable name in traces and reports
page.getByRole('button', { name: 'Confirm booking' }).describe('Confirm booking');

// everything except: rooms that can't be booked
page.getByRole('article').filter({ hasNot: page.getByRole('link', { name: 'Book now' }) });
```

<!--
describe(): 1.53. visible(): 1.63. within(): 1.64.
-->

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

await expect(page.getByRole('row', { name: /Room 302/ })).toHaveBookingStatus('Confirmed');
```

Combine several fixture files with `mergeTests()` and `mergeExpects()`.

---

## More network tools

- **HAR**: record and replay traffic with `page.routeFromHAR('booker.har', { update: true })`
- **WebSockets**: intercept and mock with `page.routeWebSocket()`
- **Block resources**: `page.route('**/*.{png,jpg}', (route) => route.abort())`
- **Context-wide**: `context.route()` applies to every page, popups included
- **Service workers** can hide requests from `page.route`: set `serviceWorkers: 'block'`

<!--
routeWebSocket: 1.48.
-->

---

## More runner and storage features

```ts
// never runs at the same time as other tests holding the 'branding' lock
test('admin changes the hotel name', { lock: 'branding' }, async ({ page }) => {
  // ...
});

// swap the complete state of an existing context
await context.setStorageState('playwright/.auth/admin.json');

// include IndexedDB in the saved state
await context.storageState({ path: userFile, indexedDB: true });
```

```bash
npx playwright test --shuffle              # random order; --shuffle <seed> repeats it
npx playwright test --only-changed=main    # only test files changed since main
```

<!--
IndexedDB in storageState: 1.51. setStorageState: 1.59. lock: 1.63. --shuffle <seed>: 1.64. --only-changed: 1.46.
-->
