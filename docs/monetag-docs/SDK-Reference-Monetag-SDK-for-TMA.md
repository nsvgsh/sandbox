# SDK Reference | Monetag SDK (for TMA)
This section contains a complete technical overview of Monetag’s JavaScript SDK for Telegram Mini Apps. It is designed for developers and integration engineers who need full control and understanding of ad behavior, callbacks, and monetization logic.

Overview [#](#overview)
-----------------------

The SDK serves as a high-level wrapper over Monetag’s ad tag. It creates a global function (e.g., `show_123456`) that you can call from your code to:

*   Show Rewarded Interstitials, Rewarded Popups, or In-App Interstitials
*   Preload ad content for later use
*   Track ad completion and revenue events

The SDK exposes a Promise-based interface and manages ad lifecycle internally, including:

*   Feed loading
*   Preloading
*   Postback resolution
*   Retry logic

SDK Initialization [#](#sdk-initialization)
-------------------------------------------

To use the SDK, you must embed the following script tag:

```
<script
  src="https://yourdomain.com/sdk.js"
  data-zone="123456"
  data-sdk="show_123456">
</script>

```


*   `data-zone`: Main Monetag zone ID
*   `data-sdk`: Global function name available on `window`

After the script loads, the SDK creates a global function (`show_123456`) that accepts configuration and returns a `Promise`.

Method: `show_123456(options)` [#](#method-show_123456options)
--------------------------------------------------------------

The core SDK method. Returns a `Promise` that resolves when the ad event completes successfully or rejects otherwise.

This method accepts either:

*   an **object** with named parameters (recommended)
*   or a **string** (used as shorthand for `type`)

### String-based usage [#](#string-based-usage)

If you call `show_123456('end')`, it’s equivalent to:

```
show_123456({ type: 'end' })

```


Allowed values:

*   `'end'` (default fallback)
*   `'start'`
*   `'pop'`
*   `'preload'`
*   `'inApp'`

If you pass an invalid string, it will default to `'end'`.

### No-argument behavior [#](#no-argument-behavior)

If you call `show_123456()` without parameters:

*   It will fallback to: `show_123456({ type: 'end' })`
*   No `ymid` or `requestVar` will be passed
*   If your zone requires those values, the Promise may reject

Use this only for testing or static setups.

### Result promise: [#](#result-promise)

The Promise returned by `show_123456()` resolves with an object containing:

```
{
  reward_event_type: 'valued' | 'not_valued';
  estimated_price?: number; // Optional approximate revenue
  sub_zone_id?: number;
  zone_id?: number;
  request_var?: string;
  ymid?: string;
  telegram_id?: string;
  // Other optional fields depending on configuration
}

```


You can use these fields to:

*   Confirm whether the ad was monetized (`reward_event_type`)
*   Attribute earnings to UI elements (`request_var`)
*   Track user context (`ymid`, `telegram_id`)
*   Handle revenue logic (`estimated_price`)

Parameters (object or string) [#](#parameters-object-or-string)
---------------------------------------------------------------

The `show_XXX(options)` function accepts a configuration object that controls the behavior of each ad call. Below are all available options and their effects:

```
string | {
  type?: 'end' | 'start' | 'preload' | 'pop' | 'inApp',
  ymid?: string,
  requestVar?: string,
  timeout?: number,
  catchIfNoFeed?: boolean,
  inAppSettings?: {
    frequency: number,
    capping: number,
    interval: number,
    timeout: number,
    everyPage?: boolean
  }
}

```


### Parameters [#](#parameters)

#### `type` (`string`, optional, default value = ’end') [#](#type-string-optional-default-value--end)

Defines what kind of ad action to perform. Supported values:

*   `"end"`: Show a **Rewarded Interstitial**. The Promise resolves **after** the ad is shown and **closed**.
*   `"start"`: Also shows a **Rewarded Interstitial**, but the Promise resolves **when the ad starts** (before completion).
*   `"preload"`: Starts loading ad materials **in background** without showing. Call `"end"` later to show it.
*   `"pop"`: Opens a **Rewarded Popup** (in new browser tab or Telegram WebApp). Must be called inside a user action.
*   `"inApp"`: Triggers or configures an **In-App Interstitial** (can auto-show ads on interval or show immediately).

#### `ymid` (`string`, optional) [#](#ymid-string-optional)

Custom event or user identifier.  
Used to match the frontend call with backend postbacks (`ymid` will appear in postback URL).

Examples:

*   `ymid: 'user_abc_123'`
*   `ymid: 'session-456'`

#### `requestVar` (`string`, optional) [#](#requestvar-string-optional)

Custom label for the placement or ad trigger source.  
Used in analytics and Monetag reporting — lets you analyze monetization by source.

Examples:

*   `requestVar: 'level_end'`
*   `requestVar: 'bonus_button'`

#### `timeout` (`number`, optional) [#](#timeout-number-optional)

Sets a maximum time (in seconds) for the **preload operation** to complete.  
If the ad is not preloaded within the specified duration, the Promise will **reject via `.catch()`**.

> ⚠️ The `timeout` parameter only works with `type: 'preload'`.  
> It has **no effect** for other `type` values like `'end'`, `'start'`, `'pop'`, or `'inApp'`.

Example usage:

```
show_XXX({ type: 'preload', timeout: 5 })
  .then(() => {
    // Ad successfully preloaded
  })
  .catch(() => {
    // Preload took too long — use fallback logic
  });

```


This is useful when you want to preload ads in the background, but avoid freezing your app if the ad cannot be loaded due to network issues, blocked domains, or slow response.

Example of usage you may check [here](about:/docs/ad-integration/faq/#how-can-i-handle-timeouts-or-blocked-ad-resources)

#### `catchIfNoFeed` (`boolean`, optional) [#](#catchifnofeed-boolean-optional)

If set to `true`, the Promise will **reject via `.catch()` when no ad feed is available**.

This is useful when you want to implement **fallback logic** (e.g. show another network’s ad or trigger a custom reward flow).

Example:

```
show_XXX({ catchIfNoFeed: true })
  .catch(() => {
    // no Monetag ad, use another network
  })

```


By default, when there is no feed, the Promise is silently resolved with no ad shown — set this flag if you want to explicitly catch this case.

#### `inAppSettings` (`object`, required for `"inApp"` initialization) [#](#inappsettings-object-required-for-inapp-initialization)

Used only with `type: 'inApp'` to enable automatic display of **In-App Interstitials**.


|Key      |Type   |Description                                                             |
|---------|-------|------------------------------------------------------------------------|
|frequency|number |Maximum number of ads shown in a time window (see capping).             |
|capping  |number |Time window in hours for frequency cap.                                 |
|interval |number |Time between ads in seconds.                                            |
|timeout  |number |Delay before first ad is eligible to show, in seconds.                  |
|everyPage|boolean|If true, resets timer on every navigation (e.g. new screen, page, etc.).|


Example:

```
show_XXX({
  type: 'inApp',
  inAppSettings: {
    frequency: 3,
    capping: 2, // hours
    interval: 120,
    timeout: 10,
    everyPage: true
  }
});

```


### Summary of Event Types [#](#summary-of-event-types)



* type: "end"
  * Description: Show Rewarded Interstitial, resolve after user finishes the ad
  * When Promise resolves: After ad is shown and closed
* type: "start"
  * Description: Same as "end", but resolve as soon as the ad starts
  * When Promise resolves: Immediately after ad starts
* type: "preload"
  * Description: Load ad in background without showing
  * When Promise resolves: When preloading completes or fails
* type: "pop"
  * Description: Show Rewarded Popup in a new tab (must be called on click)
  * When Promise resolves: After popup opens or fails
* type: "inApp"
  * Description: Set up In-App Interstitial behavior or trigger it manually
  * When Promise resolves: When init completes or ad is shown


Usage Examples [#](#usage-examples)
-----------------------------------

### Full flow with preload and end [#](#full-flow-with-preload-and-end)

```
// preload ad in advance on app loading
show_123456({
  type: 'preload',
  requestVar: 'bonus_button'
});

```


```
// show ad later on some trigger
show_123456({
  type: 'end',
  ymid: 'uid-45',
  requestVar: 'bonus_button'
}).then((result) => {
  if (result.reward_event_type === 'valued') {
    giveReward();
  }
});

```


### Ad with timeout handling [#](#ad-with-timeout-handling)

```
let preloaded = false;

show_XXX({ type: 'preload', timeout: 5, ymid: 'user123' })
  .then(() => {
    preloaded = true;
  });

button.onclick = () => {
  if (preloaded) {
    show_XXX({ ymid: 'user123' });
  } else {
    alert('No ads available, try again later.');
  }
};

```


```
button.addEventListener('click', () => {
  show_123456({
    type: 'pop',
    ymid: 'popup-001',
    requestVar: 'shop_cta'
  });
});

```


### Enable In-App Interstitial autoplay mode [#](#enable-in-app-interstitial-autoplay-mode)

```
show_123456({
  type: 'inApp',
  inAppSettings: {
    frequency: 2,
    capping: 0.1,
    interval: 30,
    timeout: 5,
    everyPage: false
  }
});

```


Error Handling [#](#error-handling)
-----------------------------------

The Promise returned by `show_123456()` may reject with an `Error` object. You can access the reason using `.message` in the `catch()` block.

Example:

```
show_123456()
  .catch((error) => {
    console.log('Ad failed:', error.message);
  });

```


Possible `.message` values include:

*   Ad feed is empty
*   Zone misconfigured
*   Network error
*   Timeout exceeded
*   `pop` not triggered from user action

These messages can be used for debugging, logging, or triggering fallback behavior in your app.

Best Practices [#](#best-practices)
-----------------------------------

*   Always provide a **unique** `ymid` per call
*   Set `requestVar` to identify UI context (e.g., “shop\_button”)
*   Wrap SDK calls in `.then()` / `await` and `.catch()`
*   Never call `pop` outside of a direct user click
*   Use `preload` for smooth UI and instant ad start