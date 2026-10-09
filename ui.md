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

## The Menu

- Framework
- Tooling
- Basic Usage
- Advanced Usage
- Bonus

---

### Framework
* What is Playwright?
* Comparison between Chrome DevTools and WebDriver
* Advantages of using Playwrigh

---

### What is Playwright?
* Playwright is a powerful web automation tool that supports Chromium, Webkit, and Firefox browsers. 
* It offers support for popular programming languages including JavaScript, Typescript, Python, .NET, and Java.
* Playwright allows for emulation of Chrome for Android and Mobile Safari.

---

### Chrome DevTools vs WebDriver
* Playwright leverages the Chrome DevTools for Chrome/Chromium browser automation.
* For Firefox and Webkit, Playwright provides a similar custom implementation.
* Compared to WebDriver, Chrome DevTools generally offers faster performance.
* Chrome DevTools allows for granular control over the browser.
* One major benefit of Playwright is that you don't need to manage webdrivers!

---

### Why Playwright?
* Web First Assertions: _retry_ until timeout
* Locators: Supercharged Element references with _actionability checks!_
* Sharding, Parallelization, automatic browser management all out of the box!
* Context Management, without the hassle.
* Heaps of tools to to make your developer experience better!

---

### Tooling
- VSCode Extension
- Code Generator
- Debugging
- Trace Viewer
- UI mode

---

### VSCode extension
![Alt text](/images/testrunner.gif)

---

### Codegen with VSCode extension
![Alt text](/images/codegen-vscode.png)

---

### Codegen through CLI
```shell
npx playwright codegen demo.playwright.dev/todomvc
``` 
![Alt text](/images/codegen.png)

---

### Debugging
* Various ways to debug tests
  * Breakpoints in VSCode when using the Playwright Test Extension
  * Playwright inspector (run tests with --debug flag). Set Breakpoints with ``await page.pause();``
  * UI mode where you can easily walk through each step of the test, see logs, errors, network requests, inspect the DOM snapshot 

---

### Trace Viewer
Playwright Trace Viewer is a GUI tool that lets you explore recorded Playwright traces of your tests meaning you can go back and forward through each action of your test and visually see what was happening during each action.
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  retries: process.env.CI ? 1 : 0, // set to 1 when running on CI
  // ...
  use: {
    trace: 'retain-on-failure', // Retain traces on failure
  },
});
```

---

### Trace Viewer
![Alt text](/images/htmlreport-trace.png)

---

### Trace Viewer
![Alt text](/images/trace-viewer.png)

---

### UI Mode
`npx playwright test --ui`
![Alt text](/images/ui-mode.png)

---

### Basic Usage

- Setup & Configuration
- Tests in Playwright
- Playwright API, interacting with your App.
- Locators & ElementHandles
- Web First Assertions
- Parallelization
- Reports

---

### Setup & Configuration
* Initial set up as easy as running: `npm init playwright@latest`
* Configuration exposed through `TestConfig` in `playwright.config.ts`
    * Parallelization
    * Browsers
    * Reporters
    * Global Timeouts

---

#### Assignment 1A

Checkout Repository: https://github.com/Ghislain89/PlaywrightWorkshop

* Run `npm install`
* Run `npm run build`
* Start webApp by running `npm run start`

> Make sure you have NodeJS LTS or above!

The webApp should start on localhost:3000

---

#### Assignment 1A

* Write a testcase to automate the registration and login process for a new account.

> I've already created page objects, we will use these later. Ignore them for now.

---

### Tests in Playwright
```ts
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await test.step('Navigate to Playwright.dev', async () => {
      await page.goto('https://playwright.dev/'); 
  });
  await test.step('Page should have title', async () => {
      // Expect a title "to contain" a substring.
      await expect(page).toHaveTitle(/Playwright/);
  });
});
```

---

### Playwright API - Actions
```ts
Text Input: fill('Peter');
checkbox: setChecked(true); 
Dropdown: selectOption('blue');
Click: click();
Key Presses: pressSequentially('Hello World!');
Key Pres: press('Enter');
Drag & Drop: dragTo(page.locator('#item-to-drop-at'));
File upload: setInputFiles(path.join(__dirname, 'myfile.pdf'));
```

> Before interacting with an element, Playwright will perform actionability checks, e.g. check visbility.

---

### Playwright API - API Requests
```ts
const REPO = 'test-repo-1';
const USER = 'github-username';

test('should create a bug report', async ({ request }) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Bug] report 1',
      body: 'Bug description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();
  const JsonResp = await newIssue.json();
  console.log(JsonResp)
});
```

---

### Playwright API - API Requests
* Additional configuration for things like headers and authentication in `playwright.config.ts`
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    // All requests we send go to this API endpoint.
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      // We set this header per GitHub guidelines.
      'Accept': 'application/vnd.github.v3+json',
      // Add authorization token to all requests.
      // Assuming personal access token available in the environment.
      'Authorization': `token ${process.env.API_TOKEN}`,
    },
  }
});
```

---

### Locators
Playwright offers two methods for referencing elements
* ElementHandles 👎
* Locators 👍

ElementHandles point to specific elements at a specific point in time. 
When Using Locators, an up-to-date element is fetched every single time you use it.

---

### Examples
```ts
const handle = await page.$('text=Submit');
// ...
await handle.hover();
await handle.click();
```
```ts
const locator = page.getByText('Submit');
// ...
await locator.hover();
await locator.click();
```

---

### Best Practices
* Test user-visible behavior
  * Prefer user-facing attributes to XPath or CSS selectors
* Make tests as isolated as possible 
* Avoid testing third-party dependencies, only test what _you_ control.

---

### Web First Assertions
* Regular Assertions usually only assert *once*
* Lazy loading or slower websites may result in *flaky* tests.
* Web First assertion(s) continously retry the assertion until the condition is met (or a timeout)
* Input for a web first assertion is a *locator*

---

### Web First Assertion - Example

```ts
// 👍 Expect a locator to be visible
await expect(page.getByText('welcome')).toBeVisible(); 


// 👎 Expect true/false to be true
expect(await page.getByText('welcome').isVisible()).toBe(true);
```
It is considered a best practice to use web first assertions as much as possible!

---

### Parallelization

Playwright runs _files_ in parallel. Running _tests_ in parallel requires configuration

```ts
import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('runs in parallel 1', async ({ page }) => { /* ... */ });
test('runs in parallel 2', async ({ page }) => { /* ... */ });
```
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
});
```

<!--
that parallel tests are executed in separate worker processes and cannot share any state or global variables. Each test executes all relevant hooks just for itself, including beforeAll and afterAll.
-->

---

### Reports - Configuring them
* You can either set the reporter through the CLI: `npx playwright test --reporter=line`
* Or through the `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['json', {  outputFile: 'test-results.json' }]
  ],
});
```
* You can provide 1 or more reporters.

---

### HTML reporter
* Contains Test & Step Information
* If enabled, trace files per testcase.

![Alt text](/images/htmlreport.png)

---

### HTML reporter
![Alt text](/images/htmlreport-trace.png)

---

#### Community Plugins

![Alt text](/images/dashboard.png)

---

#### Assignment 1B

* Set up Playwright to save HTML reports for your tests.
* Configure Playwright to always capture and store execution traces for better debugging and analysis.
* Duplicate the testcase a few times
* Enable parallel execution for these testcases
* Did you encounter any issues?

> I've already created page objects, we will use these later. Ignore them for now.

---

### Advanced Usage
- Network Monitoring & Manipulation
- Reusing authentication sessions
- Page objects
- Fixtures

---

### Network Monitoring & Manipulation

---

### Waiting for Requests

```ts
// Start waiting for request before clicking. Note no await.
const requestPromise = page.waitForRequest('https://example.com/resource');
await page.getByText('trigger request').click();
const request = await requestPromise;

// Alternative way with a predicate. Note no await.
const requestPromise = page.waitForRequest(request =>
  request.url() === 'https://example.com' && request.method() === 'GET',
);
await page.getByText('trigger request').click();
const request = await requestPromise;
```

---

### Waiting for Responses

```ts
// Start waiting for response before clicking. Note no await.
const responsePromise = page.waitForResponse('https://example.com/resource');
await page.getByText('trigger response').click();
const response = await responsePromise;

// Alternative way with a predicate. Note no await.
const responsePromise = page.waitForResponse(response =>
  response.url() === 'https://example.com' && response.status() === 200
);
await page.getByText('trigger response').click();
const response = await responsePromise;
```

---

### Mocking Responses

```ts
await page.route('**/api/fetch_data', route => route.fulfill({
  status: 200, // Set an explicit response code
  body: testData, // Put whatever data you need here!
}));
await page.goto('https://example.com');
```

---

### Modifying Responses
```ts
test('gets the json from api and adds a new fruit', async ({ page }) => {
  // Get the response and add to it
  await page.route('*/**/api/v1/fruits', async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.push({ name: 'Playwright', id: 100 });
    // Fulfill using the original response, while patching the response body
    // with the given JSON object.
    await route.fulfill({  status: 200, response, json });
  });

  // Go to the page
  await page.goto('https://demo.playwright.dev/api-mocking');

  // Assert that the new fruit is visible
  await expect(page.getByText('Playwright', { exact: true })).toBeVisible();
});
```

---

#### Assignment 2
Attempting to create a user that already exists results in a HTTP Statuscode _409_ on the register endpoint
* Duplicate the testcase you created earlier
* Apply response modification to trigger a 409 and a toasters that shows the user already exists.
* Rerun your other testcases, do they still work?

> Especially for toasters, web first assertions are your friend!

---

### Reusing authentication sessions

---

#### Storing Authentication State
```ts
//auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('username');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('https://github.com/');
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
```

---

#### Using Authentication State
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

#### Assignment 3

* Write a setup testcase that stores authentication state
* Update the testcase you created earlier to make use of this authenticated state
* Run your testcase again!

---

### Page Objects (React Example)
* Page Object Classes describing interactions for _each_ component
* Page Object Classes describing interactions for _each_ page, typically uses 1 or more components
* Tests only use interactions/functions and do not reference elements directly.

* _KISS_

Let's look at an example!

---

### Fixtures
* Fixtures can contain just about anything you want
  * Testdata
  * Helpers
  * Page Objects!
* Fixtures are scoped to the consuming testcase.
* The _page_ we've been seeing in many slides, is one of Playwrights built in fixtures. 

---

### Page Objects without fixtures
```ts
test.describe('todo tests', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo('item1');
    await todoPage.addToDo('item2');
  });
  test('should add an item', async () => {
    await todoPage.addToDo('my item');
    // ...
  });
});
```

---

### Page Objects with fixtures
```ts
test('should add an item', async ({ todoPage }) => {
  await todoPage.addToDo('my item');
  // ...
});

test('should remove an item', async ({ todoPage }) => {
  await todoPage.remove('item1');
  // ...
});
```

---

#### Assignment 4

* Refactor your testcase to use the page objects I defined. 
* Try to use Fixtures!
* BONUS: Expand the testcase to also add a Todo and assert that your todo was succesfully created.

*hint*: Some preperation has already been done

---

# Bonus

- Visual Regression Testing
- Accessability Testing
- Component Testing [out of scope for today]
- CI Integration
- Linting

---

### Visual Regression Testing
```ts
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveScreenshot();
});
```
_"Error: A snapshot doesn't exist at example.spec.ts-snapshots/example-test-1-chromium-darwin.png, writing actual."_

---

### Assignment 5
* Create a testcase that takes a screenshot of the login page
* Run it once to generate the snapshot
* Run it a second time, does it pass?

---

### Visual Regression Testing - The Challenges
* Dynamic or volatile elements change often, causing mismatches
    * Apply Custom CSS to hide these elements
    * Mask elements by locator
* Snapshots are unique per browser and operating system.
* Locally generated screenshots (on Windows/macOS) won't pass in (Linux) CI.

---

```ts
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveScreenshot({ stylePath: path.join(__dirname, 'screenshot.css') });
});
```


```ts
await page.goto('https://playwright.dev');
await expect(page).toHaveScreenshot({
  mask: [page.locator('img')],
  maskColor: '#00FF00', // green
});
```

---

### Assignment 5
* Mask the volatile element!
* Update the snapshot
* Run it a second time, does your test pass?

---

### Accessability Testing
* Playwright needs an additional library like _Axe_ to run accessability tests. 

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // 1

test.describe('homepage', () => { // 2
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('https://your-site.com/'); // 3
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze(); // 4
    expect(accessibilityScanResults.violations).toEqual([]); // 5
  });
});
```
NOTE: It scans _current_ state. make sure the page is in the desired state.

---

###  Assignment 7
* Create a testcase that adds a few todos. 
* Once the Todos are created, run an accessability scan with Axe.
* How many violations are there?

---

### CI Integration
* Setting everything up manually
```bash
# Install NPM packages
npm ci

# Install Playwright browsers and dependencies
npx playwright install --with-deps
```

---

* Using official Docker Container

```yml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  playwright:
    name: 'Playwright Tests'
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.41.1-jammy
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Run your tests
        run: npx playwright test
        env:
          HOME: /root
```

---

### Assingment 8
* Try and get the Github Actions workflow running!

---

### Linting
* Mistakes are easy to make
* Best practices are hard to implement, even harder to maintain

Linting _can_ help with this. Playwright supplies an ESLint plugin that enforces some best practices
example: Prevent a ``test.only`` from being comitted

* Plugin is _very_ opinionated, might not work well for everyone.

Find it on NPM: ``eslint-plugin-playwright``

---

### Online Sources
1. https://playwright.dev
2. Discord: https://playwright.dev/community/welcome#community-discord
3. Stack overflow: https://stackoverflow.com/tags/playwright
4. Playwright Solutions: https://playwrightsolutions.com/
5: Community Reporter: https://rodrigoodhin.gitlab.io/playwright-html/#/1.1.5/screenshots

---

## Thank You!

Repositories, assignments our implementation and PDF of the presentation will be shared via e-mail!

Feedback or Questions? Let us know!

Ghislain@DeTesters.nl
Jurgen@DeTesters.nl
