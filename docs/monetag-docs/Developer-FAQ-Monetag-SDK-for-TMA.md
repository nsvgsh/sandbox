# Developer FAQ | Monetag SDK (for TMA)
This section addresses the most common questions developers ask when integrating Monetag ads into their Telegram Mini Apps. All answers are based on real-world usage, support cases, and internal best practices.

### What zone ID should I use in the SDK? [#](#what-zone-id-should-i-use-in-the-sdk)

Always use the **main zone ID** provided by Monetag.  
Each SDK setup includes one main zone and several linked sub-zones — only the main zone should be used in:

*   The `<script>` tag (`data-zone="XXX"`)
*   The npm SDK call (`createAdHandler(XXX)`)

Using a sub-zone ID will cause the SDK to work incorrectly or not at all.

### What is `ymid` and do I need it? [#](#what-is-ymid-and-do-i-need-it)

`ymid` is an optional identifier that you can pass when calling `show_XXX()` to help you match postbacks with user actions on your backend.

You can use:

*   User ID
*   Session ID
*   UUID
*   Any string that helps link the action to your system

If `ymid` is not provided, the SDK will try to detect the Telegram user ID, but this only works if the Telegram WebApp API is connected and initialized.

### What’s the difference between `requestVar` and `ymid`? [#](#whats-the-difference-between-requestvar-and-ymid)

*   `ymid` is used for **backend tracking** (appears in the postback)
*   `requestVar` is used for **analytics and reporting** (visible in Monetag statistics)

Use `requestVar` if you want to distinguish different placements (e.g. different buttons).

### Can I preload ads before showing them? [#](#can-i-preload-ads-before-showing-them)

Yes. Preloading is highly recommended for Rewarded Interstitials and In-App Interstitials.

```
show_XXX({ type: 'preload', ymid: 'session-123' }).then(() => {
  show_XXX({ ymid: 'session-123' })
})

```


This reduces latency and improves UX.

Yes, the SDK supports Rewarded Interstitial, Rewarded Popup, and In-App Interstitial — and you can use them together in one app.  
However, we recommend avoiding too many ads in short time spans.

Check the following:

*   Are you using the correct (main) zone ID?
*   Is the SDK script actually loaded before calling the function?
*   Are you calling the ad method from a user interaction (especially for popups)?
*   Is `.catch()` implemented for error handling?
*   Is there ad inventory available at that moment?

### Do I need to wait for the SDK to be ready before calling it? [#](#do-i-need-to-wait-for-the-sdk-to-be-ready-before-calling-it)

Yes. Make sure the SDK script is loaded. In React or modern frameworks, call it from `useEffect` or after DOM is ready.

### Can I use the SDK with Next.js / React? [#](#can-i-use-the-sdk-with-nextjs--react)

Yes. Use the npm package `monetag-tg-sdk` and call `createAdHandler(zoneId)` once, then use the returned function where needed.

Example:

```
import createAdHandler from 'monetag-tg-sdk'

const adHandler = createAdHandler(YOUR_ZONE_ID)

const onClick = () => {
  adHandler({ ymid: 'user-123' }).then(() => {
    // success logic
  }).catch(() => {
    // fallback
  })
}

```


Always use `.catch()` to detect failure and show fallback logic (another ad, retry, or notification).

Example:

```
show_XXX().catch(() => {
  showOtherAd()
})

```


Yes. The SDK allows you to show Rewarded Interstitial ads at any time, including during navigation between pages or views.

You can call `show_XXX()` whenever needed — including in routing hooks or page transition events. This makes it possible to implement interstitial ads **between screens**, similar to how ads work in native mobile apps.

#### React + React Router Example [#](#react--react-router-example)

If you’re using `react-router-dom`, you can hook into route changes like this:

```
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const AdOnRouteChange = () => {
  const location = useLocation()

  useEffect(() => {
    show_XXX({
      ymid: getUUID(),
      requestVar: 'router_change'
    })
  }, [location])

  return null
}

```


Make sure this component is mounted outside your main routing switch, so it doesn’t unmount during transitions.

Replace XXX with your actual zone ID.

### How can I handle timeouts or blocked ad resources? [#](#how-can-i-handle-timeouts-or-blocked-ad-resources)

Sometimes an ad may fail to load or show due to network issues, blocked domains (e.g., country-level firewalls), etc. To handle such cases, we recommend using **preload with timeout** and showing fallback content if needed.

You can preload the ad in the background and show it later if it was successfully loaded.  
Use the `type: 'preload'` option together with `timeout` (in seconds) to limit how long the SDK will wait for the preload operation.

```
let preloaded = false;

show_XXX({ type: 'preload', timeout: 5, ymid: 'user123' })
  .then(() => {
    preloaded = true;
  })
  .catch(() => {
    // preload failed — ad not available
  });

button.onclick = () => {
  if (preloaded) {
    show_XXX({ ymid: 'user123' });
  } else {
    alert('No ads available, try again later.');
  }
};

```


React Example:

```
const [isPreloaded, setIsPreloaded] = React.useState(false);

React.useEffect(() => {
  show_XXX({ type: 'preload', timeout: 5, ymid: 'user123' })
    .then(() => setIsPreloaded(true))
    .catch(() => setIsPreloaded(false));
}, []);

const onClick = () => {
  if (!isPreloaded) {
    return alert('No ads available, try again later.');
  }

  show_XXX({ ymid: 'user123' });
  setIsPreloaded(false);
};

return <button onClick={onClick}>Show ad</button>;

```


This pattern gives users faster feedback and avoids UI freezes caused by slow or blocked ad requests.

#### ⚠️ Not supported: `timeout` for direct calls [#](#-not-supported-timeout-for-direct-calls)

The `timeout` parameter **only works** for `type: 'preload'`.  
It has **no effect** for other types (`'end'`, `'start'`, `'pop'`, `'inApp'`), and using it in such cases will not influence ad behavior or error handling.

If you need to handle fallback logic when an ad fails to show, use `.catch()`:

```
show_XXX({ ymid: 'user123' })
  .then(() => {
    // ad was shown and closed
  })
  .catch(() => {
    // ad failed — show fallback
  });

```


🟢 Summary:

*   Use `type: 'preload'` + `timeout` to control background loading
*   Always pair with `.catch()` to handle errors or fallback paths

This FAQ will expand as we collect more developer feedback. If your question isn’t listed here, reach out to Monetag support or your account manager.