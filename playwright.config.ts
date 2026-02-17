import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PW_TEST_PORT ?? "3501");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && PORT=${port} ./node_modules/.bin/next start --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
