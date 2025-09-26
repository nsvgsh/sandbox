# Telegram postback manual

To enable **S2S tracking** when working with a **Telegram bot** , you can use the following
approach:

## 1. Setting Up Target URL in PropellerAds

In **PropellerAds** , set the **Target URL** to link to the bot with a start parameter. For
example:
https://t.me/bot_name/?start=required_parameters_here

## 2. Parameter Format Restrictions

The start parameter can include the following characters:
✅ **A-Z, a-z, 0-9, _ and -** (underscore and hyphen).
❌ The **maximum length is 64 characters**.
⚠ If other characters are used or the length is exceeded, the bot will not process the value
and will return an error.

## 3. Passing Unique Click ID for Postbacks

For sending postbacks back to **PropellerAds** , it is crucial to pass a **unique click ID**
(SUBID) in the **Target URL** :
https://t.me/bot_name/?start=${SUBID}


## 4. Adding Additional Tracking Tokens

You can also include **other PropellerAds tokens** useful for analytics. Just make sure the
total length does not exceed the limit.
For example:
https://t.me/bot_name/?start=${SUBID}_{campaignid}_{zoneid}_prop

## 5. Processing Parameters on the Bot's Server

On the **bot's server** , handle the incoming parameters received via start. Store them in a
**database** as separate values, using _ (underscore) as the **delimiter**.
So, if the structure is:
start=${SUBID}_{campaignid}_{zoneid}_prop
Then the database will store **four separate parameters** for each click that enters the bot:
● ${SUBID}
● {campaignid}
● {zoneid}
● Network title

## 6. Sending Postbacks from the Bot's Server

Finally, set up the bot's server to send a **postback** to **PropellerAds** when the bot triggers a
**conversion event**.
This setup ensures proper tracking and attribution when using a **Telegram bot** for
campaigns with **PropellerAds**. 🚀


## Example of Bot Configuration:
If the bot's backend is in PHP, the code for sending a request to us will look something like this:
```
$PostbackURL =
"http://ad.propellerads.com/conversion.php?aid=123123123&pid=&tid=123123123&visitor_id
=";
// https://t.me/bot_name/?start=${SUBID}_{campaignid}_{zoneid}_prop
$params = explode('_', $startParam);
$visitorId = isset($params[0])? $params[0] : null;
$network = isset($params[3])? $params[3] : null;
if ($network === 'prop') {
$url = $PostbackURL. urlencode($visitorId);
file_get_contents($url);
}
```


