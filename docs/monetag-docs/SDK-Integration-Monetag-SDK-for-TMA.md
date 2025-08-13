# SDK Integration | Monetag SDK (for TMA)
To start showing ads in your Telegram Mini App, the first step is to integrate the Monetag SDK. This SDK is a universal client-side JavaScript file that supports all available formats: Rewarded Interstitial, Rewarded Popup, and In-App Interstitial.

You can integrate it either by including a script tag in your HTML, or by installing an npm package for modern JavaScript frameworks like React.

### Method 1: Script Tag [#](#method-1-script-tag)

For basic HTML-based apps, include the following script in your HTML file:

```
<script src="https://domain.com/sdk.js" data-zone="XXX" data-sdk="show_XXX"></script>

```


Replace `XXX` with your ad zone ID from the Monetag dashboard.

After this script is loaded, the global method `show_XXX()` will be available in your app. This method is used to show ads and control ad logic from your JavaScript code.

### Method 2: npm Package (for React or modern front-end stacks) [#](#method-2-npm-package-for-react-or-modern-front-end-stacks)

Install the official Monetag SDK via npm:

```
npm install monetag-tg-sdk --save

```


Then use it in your app like this:

```
import createAdHandler from 'monetag-tg-sdk'

const showAd = createAdHandler(YOUR_ZONE_ID)

```


This gives you a function that works exactly like `show_XXX()` from the script-based version.

### Behavior of the SDK [#](#behavior-of-the-sdk)

*   The SDK **ignores zone-level settings** like frequency, interval, and timeout. You manage those manually in your app.
*   The SDK **returns a Promise** from each `show()` call, resolving when the ad completes or rejecting if there’s an error or timeout.
*   The SDK **can preload ads**, letting you show them instantly later.
*   You can **track ad placements** with the `requestVar` option.
*   You can pass **user IDs** (e.g. `ymid`) to support postback tracking on the backend.
*   You can **handle fallback logic** if an ad is not available.

### Best Practices [#](#best-practices)

1.  Preload ads when possible to avoid delays when showing.
2.  Always use `.catch()` on SDK calls to gracefully handle cases where an ad fails to load or is unavailable.
3.  If you’re using user IDs or rewards, pass `ymid` consistently in both preload and show calls.
4.  Use `requestVar` to track performance of specific placements in your app.
5.  Avoid placing SDK scripts multiple times in the app – use one per zone.
6.  In React apps, use state to track when ads are ready before enabling buttons.
7.  In production, test all ad behaviors inside Telegram, not just in a browser.

### Avoid These Common Mistakes [#](#avoid-these-common-mistakes)

These are based on issues we’ve seen from real publishers:

*   Calling `show_XXX()` without preloading, leading to visible delays
*   Forgetting to use `.catch()` and showing no feedback to users on ad failure
*   Using outdated scripts or incorrect zone IDs
*   Expecting SDK to follow zone settings (frequency, timeout, etc.) — SDK overrides them
*   Forgetting to set `ymid` for rewarded postbacks
*   React components not disabling ad buttons while preloading

Once the SDK is integrated, you can proceed to implement specific ad formats. Each format has different logic and placement strategies, which we’ll cover in the next sections.