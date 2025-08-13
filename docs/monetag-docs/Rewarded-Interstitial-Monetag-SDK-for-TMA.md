# Rewarded Interstitial | Monetag SDK (for TMA)
Rewarded Interstitial – Integration Guide [#](#rewarded-interstitial--integration-guide)
----------------------------------------------------------------------------------------

Rewarded Interstitial is a full-screen ad format that grants a reward to the user after they watch the ad. The Monetag SDK provides a simple method to display and control this format, with support for preloading, user tracking, and fallback handling.

![Example](https://docs.monetag.com/docs/ad-integration/rewarded-interstitial/images/reward-interstitial-example.83fa5115757118f6e68b9070df5893ac.gif)

This guide explains how to implement the format in your Telegram Mini App using both standard JavaScript and React (via the official npm package).

> ⚠️ **Important:** For proper positioning of UI elements (e.g. the close button and timer), it’s recommended to use the official Telegram WebApp SDK (`Telegram.WebApp`).  
> If the SDK is not available, Monetag cannot detect safe visual areas, and interface elements might overlap with Telegram or system UI (as seen on some devices).  
> To ensure visual stability, you should connect the Telegram SDK manually.

### Basic Usage (Script Tag) [#](#basic-usage-script-tag)

If you’re using the SDK via HTML, trigger the ad with:

```
show_XXX().then(() => {
  console.log('User watched the ad');
}).catch(() => {
  console.log('Ad failed or was skipped');
});

```


Replace `XXX` with your **main zone ID** — the one provided in your Monetag dashboard for the SDK setup.  
The main zone controls the entire SDK behavior and links to all related sub-zones.

### Basic Usage (React + npm package) [#](#basic-usage-react--npm-package)

```
import createAdHandler from 'monetag-tg-sdk'

const adHandler = createAdHandler(REWARDED_INTERSTITIAL_ZONE_ID)

const ShowAdButton = () => {
  const onClick = () => {
    adHandler().then(() => {
      console.log('User watched the ad')
    }).catch(() => {
      console.log('Ad failed or was skipped')
    })
  }

  return <button onClick={onClick}>Show Ad</button>
}

```


### Tracking Events with `ymid` [#](#tracking-events-with-ymid)

You can pass a unique identifier using the `ymid` parameter:

```
show_XXX({ ymid: 'user-id-or-event-id' })

```


This identifier will be included in the postback and can be used on your backend to match the ad impression to a specific user or event.

You can use:

*   A user ID from your system
*   A session ID
*   A UUID
*   Any unique string that helps you identify the action

```
Telegram.WebApp.ready()
// Then the SDK may resolve the Telegram user ID automatically

```


### Preloading the Ad [#](#preloading-the-ad)

To reduce delay at the moment of ad display, you can preload it:

```
show_XXX({ type: 'preload', ymid: 'event-id-123' }).then(() => {
  show_XXX({ ymid: 'event-id-123' })
})

```


React example:

```
const [adReady, setAdReady] = useState(false)

useEffect(() => {
  show_XXX({ type: 'preload', ymid: 'event-id-123' }).then(() => setAdReady(true))
}, [])

const onClick = () => {
  show_XXX({ ymid: 'event-id-123' })
}

```


### Fallback Logic [#](#fallback-logic)

If the ad is unavailable or fails to show, you can fall back to another ad source:

```
show_XXX({ type: 'preload', ymid: 'event-id' }).then(() => {
  show_XXX({ ymid: 'event-id' }).catch(() => {
    showOtherAd()
  })
}).catch(() => {
  showOtherAd()
})

```


### Common Mistakes to Avoid [#](#common-mistakes-to-avoid)

*   Calling `show_XXX()` without `.catch()` – no way to handle failures or show fallback
*   Not passing `ymid` – postback will still be triggered, but it won’t be linked to a known user or event unless Telegram ID is resolved
*   Using sub-zone ID instead of the main zone ID – the SDK may not work properly
*   Not preloading – ads may appear with a noticeable delay
*   Triggering ads before the SDK has loaded
*   Including multiple SDK tags on the same page

### Best Practices [#](#best-practices)

*   Preload ads before enabling “Watch Ad” buttons
*   Provide user feedback (e.g. loading states) during preloading
*   Handle reward logic only after the `.then()` callback resolves
*   Use `ymid` to link postbacks to internal user or event logic
*   Use `requestVar` if you want to track different placements or buttons
*   Always test your integration inside Telegram, not just in a browser

Once Rewarded Interstitial is working, you can confidently implement reward logic and start monetizing your app effectively.