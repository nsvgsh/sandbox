# How to integrate PropellerAds' S2S conversion tracking

### Contents:

### 1. Introduction to Server-to-Server (S 2 S) Tracking

### 2. Available tokens

### 3. Handling multiple conversion events

### 4. Process of setting up S 2 S tracking

### I do see my Tracker/CPA network in the list

### There is no Tracker/CPA network in the list

### 5. Links to the instructions for the specific trackers

### 6. What to do with trackers that donʼt support $, {}, or CAPITALS in

### tokens

### 7. Postback vs API: Whatʼs the Difference?

### 1. Introduction to Server-to-Server (S 2 S) Tracking

A **Postback URL** is a server-to-server (S 2 S) URL that an advertiser's system or affiliate
network calls to send conversion data back to a tracking platform.


This method provides reliable, real-time, server-side tracking of desired user actions,
like purchases or app installs. It bypasses third-party cookie restrictions and ad
blockers for better fraud prevention and data accuracy.

**Why Do PropellerAds Use It?**

1. **Accuracy:** Ensures precise tracking of user actions and conversions.
2. **Optimization:** Provides performance data to optimize campaigns for better results.
3. **Automation:** Eliminates the need for manual tracking, saving time and reducing
    errors.

**How it Works**

1. A user clicks on an ad and is directed to a landing page by following the Target
    URL. The **Target URL** is the specific web address of the merchant's product or
    page to which users are redirected after clicking an affiliate's unique tracking link.
    This URL directs potential customers to a specific landing page on the brand's
    website, often a product page, so they can complete a purchase or take another
    desired action.
2. Information about the click is sent via tokens to the affiliate network and then to a
    tracking platform.
3. The user performs a desired action (e.g., makes a purchase) on the advertiser's
    server.
4. The affiliate network or advertiser's server activates the postback URL by "calling"
    it.
5. The postback URL sends contextual data, such as the conversion type, user ID, and
    conversion value, directly to the tracking platform.
6. The tracking platform then uses this data to attribute the conversion to the correct
    affiliate or campaign.

Setting up S 2 S tracking is required to see conversions in your Statistics Page.
This setting is mandatory for the CPA Goal pricing model or campaigns with the Smart
Optimization Tool enabled.
The S 2 S Postback URL generated in your account will work in all campaigns. It already
includes several preset parameters, but you can add additional ones at any time.


### 2. Available tokens

As a Self-Service Advertiser, you can use the following **variables** (dynamic tags/tokens)
to track data you're interested in through your URL and your tracking system _(the list of
tokens available for specific ad format and pricing model can be found below the Target
URL field on the campaign creation page)_

**${SUBID}** - a unique ID for tracking conversions
**{zoneid}** - unique ID of the ad zone where the ad is displayed
**{subzone_id} -** unique ID of the subzone (if the subzones are included in the ad zone)
**{campaignid}** - ID of the campaign
**{os}** - userʼs operating system
**{country}** - userʼs country in two-letter code
**{cost}** - the price of the click/impressions
**{device}** - the name of the userʼs device
**{browser}** - userʼs browser
**{browserversion}** - version of the userʼs browser
**{osversion}** - version of the userʼs operating system
**{countryname}** - the name of the userʼs country
**{region}** - name of the userʼs region (district/state)
**{isp}** - name of the userʼs ISP
**{useragent}** - userʼs raw user-agent
**{language}** - the language of the userʼs browser
**{connection_type}** - userʼs connection type
**{carrier}** - name of the userʼs mobile carrier
**{clickID}** - unique ID of the click
**{bannerid}** - unique ID of the creative (banner)
**{user_activity}** - user's activity level
**{payout}** - payment for each conversion received from your CPA network
**{zone_type}** - the type of push (classic or in-page)
**{survey_exit_type} -** the type of the survey

### 3. Handling multiple conversion events:

**_Optional:_** If you want to track **more** than **one conversion event** (for campaigns with
complex user flows, such as iGaming, Utilities &Finance campaigns), you can use the
optional **goal** parameter in your postback link.

**How it works:**
You can add the **&goal=** parameter to specify the conversion level:

```
goal=2^ —^ second-level^ conversion^ (e.g.,^ first-time^ deposit)
```

goal=3 — third-level conversion (e.g., redeposit)
This allows you to track post-registration or other funnel events independently from the
initial conversion.

**Example postback URLs:**

**1 st (main) conversion (** e.g. registration **):**
_[http://ad.propellerads.com/conversion.php?](http://ad.propellerads.com/conversion.php?)
aid=xxxxx&pid=&tid=yyyyy&visitor_id=${SUBID}_
**2 nd conversion (** e.g. first-time deposit **):**
_[http://ad.propellerads.com/conversion.php?](http://ad.propellerads.com/conversion.php?)
aid=xxxxx&pid=&tid=yyyyy&visitor_id=${SUBID}&goal= 2_
**3 rd conversion (** e.g. redeposit **):**
_[http://ad.propellerads.com/conversion.php?](http://ad.propellerads.com/conversion.php?)
aid=xxxxx&pid=&tid=yyyyy&visitor_id=${SUBID}&goal= 3_

**_Make sure your tracking platform or affiliate network supports multiple
conversion events and passes back the same visitor/sub ID for each stage_**

_Only events from the main postback affect performance in_ **_CPA goal_** _campaigns._

### 4. Process of setting up S 2 S tracking

PropellerAds integrated ready-to-use Postback links with several trackers:

*** I do see my Tracker/CPA network in the list
* There is no Tracker/CPA network in the list**

### If you have your Tracker/CPA network in the list:

1. Go to the Tracking tab in your PropellerAds account and select a Tracker or CPA
network you are using from the list on the tracking menu on the PropellerAds
dashboard.


2. Copy the ready-to-use Postback URL from the platform

**_Note:You don't need to make any changes in Postback when selecting a tracker
from the list._**

**3.** Put our Postback into your tracker and generate a new Target URL in your tracking
system. This link will be used as a Target URL in PropellerAds.
**4.** Copy the link generated in your tracker (Target URL) and paste it into the **Target
URL** field while creating a campaign in PropellerAds.
**5.** You can also check if the generated link (Target URL) works properly in the following
field of the **Tracking** tab:


_Note: Conversion may take up to 24 hours to register in our statistics._
__________________________________________________________________

## If you didn't find a tracker in the suggested list

**1.** Go to the **Tracking** tab and select "Other tracker or CPA network."
**2.** Then you have to **replace** our **${SUBID}** token (that passes the information about
conversions) with the **token** of your **Tracker/ CPA network** that passes conversions
there - in case you don't know the correct token, please contact your tracker's support


for assistance.
You can also change **the ${PAYOUT}** token (payment for each conversion received
from your CPA network) **,** if necessary, to pass the conversion price.

**_Example:_**
_The Postback link in your PropellerAds account looks like this:
[http://ad.propellerads.com/conversion.php?](http://ad.propellerads.com/conversion.php?)
aid=xxxxx&pid=&tid=yyyyy&visitor_id=${SUBID}_

**_Let's say_** _the token that passes information about conversions in your_ **_Tracker_** _or_ **_CPA
Network_** _is_ **_{aff_sub}._**

_After replacing ${SUBID} token with {aff_sub} this link can look like:
[http://ad.propellerads.com/conversion.php?aid=xxxxx&pid=&tid=yyyyy&visitor_id=](http://ad.propellerads.com/conversion.php?aid=xxxxx&pid=&tid=yyyyy&visitor_id=)
{aff_sub}_

**3**. Place the link into your tracker and generate a new Target URL in your tracking
system.

**4.** Copy the link generated in your tracker (Target URL) and paste it to the Target URL
field while creating the campaign in PropellerAds.
**5.** You can also check if the generated link (Target URL) works properly in the following
field of the **Tracking** tab:


```
Note: it may take up to 24 hours for the conversion to be registered in our statistics.
```
### 5. Links to the instructions for the specific trackers

You can also read the following step-by-step guides about PropellerAds integration with
different tracking systems:



### 6. What to do with trackers that donʼt support $, {}, or CAPITALS in

### tokens?

Some trackers cannot process symbols, brackets, or capitals, which can cause an issue
with PropellerAds' clickid macro ${SUBID}.
**Solution:** PropellerAds has predefined aliases for ${SUBID} that avoid special
characters.
**Available Aliases:** {SUBID}, {CLICKID}, {click_id}, {clickid}, {CLICK_ID}, ${subid},
_~click_id~_

➡ **Example:** Instead of using ${SUBID} in your target url, use {SUBID} or {CLICKID}.
But if your tracker supports special symbols, then.

### 7. Postback vs API: Whatʼs the Difference?

**Postback (Server-to-Server Call) -** A URL request sent automatically from one server
to another when an event happens (e.g., a conversion)

```
Typically uses GET or POST
Simple and lightweight
Triggered in real-time
```
**API (Application Programming Interface) -** A set of endpoints advertisers can query
or push data to


```
Supports more complex data exchange
Requires authentication (token, key, etc.)
You control when and what you request
```
_Note: To set up the API integration, please contact your account manager for
assistance._

In conclusion, we want to add some words about the postback methods we are using
on PropellerAds - there are two of them: **GET** and **POST**.

**GET Method:** Data is sent in the URL - Used in redirects or tracking links
Example: https://example.com/landing?click_id=abc123&source=propellerads

**POST Method** Data is sent in the body of the request (not in the URL) - Used in
postbacks and server-to-server communication

**Example:**
```
POST to https://example.com/postback

Body:

{

"click_id": "abc123",

"conversion": "signup"

}
```

Click ID will be captured correctly either way.
