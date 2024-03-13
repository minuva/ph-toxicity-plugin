## How to develop

All of the plugin's code is located in the `index.js` file, which is JavaScript ran inside of PostHog.
To get yourself up to speed with this environment, we sincerely recommend checking out our [Plugins overview in PostHog Docs]([the Plugins Overview](https://posthog.com/docs/plugins/build/overview).
For a crash course, read our [plugin building tutorial in PostHog Docs](https://posthog.com/docs/plugins/build/tutorial).

## How to test

To test the plugin, you'll need to install a few `npm` dependencies already specified in `package.json`:
```bash
npm install
```

This will get you the testing library Jest and some our test helpers.
Then to run tests it's just:

```bash
npm test
```

## How to install

1. Open PostHog.
1. Open the Plugins page from the sidebar.
1. Head to the Advanced tab.
1. "Install from GitHub, GitLab or npm" using this repository's URL.
