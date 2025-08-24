
Docs For LLMs
Authentication
Source: https://dev.whop.com/api-reference/graphql/authentication

An overview of authentication methods for the Whop API

All calls on Whop are made on behalf of a user, and a company ID if applicable, as followed below.

<CodeGroup>
  ```javascript get-user.ts
  export const whopApi = WhopApi({
    appApiKey: process.env.WHOP_API_KEY ?? "fallback",
    onBehalfOfUserId: 'YOUR_USER_OR_AN_AGENT_USER',
    companyId: undefined,
  });

  // fetch another user

  await whopApi.FetchPublicUser({ userId: winningUser })
  ```
</CodeGroup>

You are able to make calls on behalf of any user using your app.


# Examples
Source: https://dev.whop.com/api-reference/graphql/examples



Here are some useful queries and their implementations to get you started in Next.JS, Swift, or Python:

### Get messages from a direct message feed

```graphql
query DmsFeedData($feedId: ID!, $postsLimit: Int!) {
  dmsFeedData(feedId: $feedId, postsLimit: $postsLimit) {
    posts {
      content
      user {
        username
        id
      }
    }
  }
}
```

### Get current user information

```graphql
query myCurrentUser {
  viewer {
    user {
      id
      username
      name
      email
    }
  }
}
```

### Send chat message

```graphql
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input)
}
```

### Create a forum post

```graphql
mutation CreateForumPost($input: CreateForumPostInput!) {
  createForumPost(input: $input) {
    # You can specify return fields here if needed
  }
}
```

### Get whops from discover

```graphql
query DiscoverySearch($query: String!) {
  discoverySearch(query: $query) {
    accessPasses {
      title
      route
      headline
      logo {
        sourceUrl
      }
    }
  }
}
```

## Implementation Examples

### Python (using requests)

```python
import requests

headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "x-on-behalf-of": "user_123",
    "x-company-id": "biz_123",
    "Content-Type": "application/json"
}

# Example: Fetching DMs
full_query = """query DmsFeedData($feedId: ID!, $postsLimit: Int!) {
    dmsFeedData(feedId: $feedId, postsLimit: $postsLimit) {
        posts {
            content
            user {
                username
                id
            }
        }
    }
}"""

payload = {
    "query": full_query,
    "variables": {
        "feedId": "your_feed_id",
        "postsLimit": 1
    }
}

response = requests.post(
    "https://api.whop.com/public-graphql",
    headers=headers,
    json=payload
)
response_json = response.json()
```

### Next.js (using Apollo Client)

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { gql } from "@apollo/client";

// Create HTTP link
const httpLink = createHttpLink({
  uri: "https://api.whop.com/public-graphql",
});

// Add auth headers
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer YOUR_API_KEY`,
      "x-on-behalf-of": "user_123",
      "x-company-id": "biz_123",
    },
  };
});

// Create Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Example: Discovery Search
const DISCOVERY_SEARCH = gql`
  query DiscoverySearch($query: String!) {
    discoverySearch(query: $query) {
      accessPasses {
        title
        route
        headline
        logo {
          sourceUrl
        }
      }
    }
  }
`;

// Usage
client
  .query({
    query: DISCOVERY_SEARCH,
    variables: { query: "search_term" },
  })
  .then((result) => console.log(result));
```

### Swift (using Apollo iOS)

```swift
import Apollo

// Configure Apollo Client
let url = URL(string: "https://api.whop.com/public-graphql")!

let store = ApolloStore()
let transport = RequestChainNetworkTransport(
    interceptorProvider: DefaultInterceptorProvider(store: store),
    endpointURL: url,
    additionalHeaders: [
        "Authorization": "Bearer YOUR_API_KEY",
        "x-on-behalf-of": "user_123",
        "x-company-id": "biz_123"
    ]
)

let client = ApolloClient(networkTransport: transport, store: store)

// Example: Get Current User
let getCurrentUser = """
query myCurrentUser {
  viewer {
    user {
      id
      username
      name
      email
    }
  }
}
"""

client.fetch(query: getCurrentUser) { result in
    switch result {
    case .success(let graphQLResult):
        print("Success! Result: \(graphQLResult)")
    case .failure(let error):
        print("Failure! Error: \(error)")
    }
}
```

These examples demonstrate basic usage of the Whop GraphQL API across different platforms. Remember to replace placeholder values (YOUR\_API\_KEY, user\_123, etc.) with your actual credentials.


# Rate Limits
Source: https://dev.whop.com/api-reference/graphql/rate-limits



## Overview

The Whop GraphQL API enforces rate limits to ensure fair usage and system stability.

## Current Limits

```http
10 requests per 10 seconds
```

## Query Complexity Limits

In addition to request rate limits, the GraphQL API enforces query complexity limits:

* **Max Complexity**: 1000
* **Max Depth**: 10

These limits help prevent overly complex or deeply nested queries that could impact performance.
If you encounter these errors, you'll need to break your requests into smaller queries.

Learn more about query complexity and depth here: [https://www.howtographql.com/advanced/4-security/](mdc:https:/www.howtographql.com/advanced/4-security)

## Handling Rate Limits

If you exceed the rate limit, the API will respond with a `429 Too Many Requests` status code.
When this happens, it's best to wait until the rate limit window resets before making additional requests.

## Best Practices

* Implement exponential backoff for retries
* Cache responses when possible
* Batch GraphQL operations into fewer requests


# Schema
Source: https://dev.whop.com/api-reference/graphql/schema



## Why GraphQL

GraphQL is an API interface (alternative to REST) that allows for rapid development and iterative changes to evolving objects.
Whop has built its core product and internal APIs using GraphQL for years, and is now exposing most of the same functionality
via a publicly accessible version.

## Available endpoints

You can explore all available queries and mutations using our Apollo OS explorer:

🔗 [GraphQL Explorer](mdc:https:/studio.apollographql.com/public/whop-public-gql/variant/current/explorer)

To make a call, you must pass the following headers:

```http
Authorization: Bearer YOUR_APP_API_KEY
x-on-behalf-of: user_1NqS34mOp24
x-company-id: biz_Nq4S34mfp59
Content-Type: application/json
```

| Header           | Description                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `Authorization`  | Get from [here](mdc:what-to-build/agentic-businesses#step-1%3A-create-your-app). Must be prefixed with "Bearer". |
| `x-on-behalf-of` | Specifies the User ID of the account you're making requests on behalf of.                                     |
| `x-company-id`   | Specifies the Biz ID to target the business of a user you are calling from.                                   |
| `Content-Type`   | Specifies the format of the request payload as JSON.                                                          |

#### Who can you make requests on behalf of?

Your app can make calls on behalf of users in three ways. Any of these methods grant full access to automating the user's account:

* The User is the original creator of the organization in which your app was created (Ex. your own User ID)
* The User is an Agent User created by the app [here](mdc:what-to-build/agentic-businesses#step-1%3A-create-your-app)
* The User has joined a whop that has installed your app

## API Capabilities

This GraphQL API provides **powerful** access to the entire Whop ecosystem, allowing developers to build sophisticated integrations and applications. Through the API, you can access and manipulate all core Whop functionality, including:

* User management
* Store and product handling
* Messages, forum posts, and live streams

## Development Status

> ⚠️ **Important Note**: This API is still under active development.

While we strive to maintain backward compatibility, some features may be added, modified, or removed

We recommend checking our changelog regularly for updates and announcements about API changes.


# Scopes
Source: https://dev.whop.com/api-reference/graphql/scopes

An overview of authorization scopes for the Whop API

When calling the Whop API on behalf of a user or a company you need to first obtain permissions to do so.

Obtain permission by either:

* **embedded apps** - setting your required scopes in your app's settings in the [Whop dashboard](mdc:https:/whop.com/dashboard/developer)
* **standalone apps** - using the `scopes` parameter when using [Whop OAuth](mdc:features/oauth-guide)

<Note>
  Once you have obtained permissions you can use your app's API key to make
  calls on behalf of the user or company.
</Note>

## Available scopes

* `read_user`: Read the user's basic details. This scope is required and will be automatically granted when users open embedded apps.


# Embed checkout (Public Beta)
Source: https://dev.whop.com/features/checkout-embed

Learn how to embed Whop's checkout flow on your website

Embedded checkout allows you to embed Whop's checkout flow on your own website in two easy steps. This allows you to offer your users a seamless checkout experience without leaving your website.

## React

### Step 1: Install the package

```bash
npm install @whop/react
```

### Step 2: Add the checkout element

```tsx
import { WhopCheckoutEmbed } from "@whop/react/checkout";

export default function Home() {
  return <WhopCheckoutEmbed planId="plan_XXXXXXXXX" />;
}
```

This component will now mount an iframe with the Whop checkout embed. Once the checkout is complete, the user will be redirected to the redirect url you specified in the settings on Whop.

You can configure the redirect url in your [whop's settings](mdc:https:/whop.com/dashboard/whops) or in your [company's settings](mdc:https:/whop.com/dashboard/settings/checkout) on the dashboard. If both are specified, the redirect url specified in the whop's settings will take precedence.

### Available properties

#### **`planId`**

**Required** - The plan id you want to checkout.

#### **`theme`**

**Optional** - The theme you want to use for the checkout.

Possible values are `light`, `dark` or `system`.

#### **`sessionId`**

**Optional** - The session id to use for the checkout.

This can be used to attach metadata to a checkout by first creating a session through the API and then passing the session id to the checkout element.

#### **`hidePrice`**

**Optional** - Turn on to hide the price in the embedded checkout form.

Defaults to `false`

#### **`fallback`**

**Optional** - The fallback content to show while the checkout is loading.

```tsx
<WhopCheckoutEmbed fallback={<>loading...</>} planId="plan_XXXXXXXXX" />
```

### Full example

```tsx
import { WhopCheckoutEmbed } from "@whop/react/checkout";

export default function Home() {
  return (
    <WhopCheckoutEmbed
      fallback={<>loading...</>}
      planId="plan_XXXXXXXXX"
      theme="light"
      hidePrice={false}
      sessionId="ch_XXXXXXXXX"
    />
  );
}
```

## Other websites

### Step 1: Add the script tag

To embed checkout, you need to add the following script tag into the `<head>` of your page:

```md
<script
  async
  defer
  src="https://js.whop.com/static/checkout/loader.js"
></script>
```

### Step 2: Add the checkout element

To create a checkout element, you need to include the following attribute on an element in your page:

```md
<div data-whop-checkout-plan-id="plan_XXXXXXXXX"></div>
```

This will now mount an iframe inside of the element with the plan id you provided. Once the checkout is complete, the user will be redirected to the redirect url you specified in the settings on Whop.

You can configure the redirect url in your [whop's settings](mdc:https:/whop.com/dashboard/whops) or in your [company's settings](mdc:https:/whop.com/dashboard/settings/checkout) on the dashboard. If both are specified, the redirect url specified in the whop's settings will take precedence.

### Available attributes

#### **`data-whop-checkout-plan-id`**

**Required** - The plan id you want to checkout.

> To get your plan id, you need to first create a plan in the **Manage Pricing** section on your whop page.

#### **`data-whop-checkout-theme`**

**Optional** - The theme you want to use for the checkout.

Possible values are `light`, `dark` or `system`.

```md
<div data-whop-checkout-theme="light" data-whop-checkout-plan-id="plan_XXXXXXXXX"></div>
```

#### **`data-whop-checkout-session-id`**

**Optional** - The session id to use for the checkout.

This can be used to attach metadata to a checkout by first creating a session through the API and then passing the session id to the checkout element.

```md
<div data-whop-checkout-session-id="ch_XXXXXXXXX" data-whop-checkout-plan-id="plan_XXXXXXXXX"></div>
```

#### **`data-whop-checkout-hide-price`**

**Optional** - Set to `true` to hide the price in the embedded checkout form.

Defaults to `false`

```md
<div data-whop-checkout-hide-price="true" data-whop-checkout-plan-id="plan_XXXXXXXXX"></div>
```

### Full example

```md
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width">
		<script
			async
			defer
  			src="https://js.whop.com/static/checkout/loader.js"
		></script>
		<title>Whop embedded checkout example</title>
		<style>
			div {
				box-sizing: border-box;
			}
			body {
				margin: 0
			}
		</style>
	</head>
	<body>
		<div
			data-whop-checkout-plan-id="plan_XXXXXXXXX"
			data-whop-checkout-session-id="ch_XXXXXXXXX"
			data-whop-checkout-theme="light"
			data-whop-checkout-hide-price="false"
			style="height: fit-content; overflow: hidden; max-width: 50%;"
		></div>
	</body>
</html>
```


# Login with Whop
Source: https://dev.whop.com/features/oauth-guide

Learn how to implement Whop OAuth in a stand-alone application.

## Intro

Use Whop OAuth to authenticate users in your web or iOS app.

<Note>
  This guide only covers the basic steps to implement Whop OAuth and does not cover best practices regarding the OAuth2 protocol. It is recommended to use a library to handle the OAuth2 flow.

  We are going to release a guide on how to implement Whop OAuth with auth.js soon.
</Note>

### Step 1: Create a Whop App and obtain secrets

1. Go to the [Whop Dashboard](mdc:https:/whop.com/dashboard/developer) and create a new app or select an existing one.

2. Add a redirect uri in your apps OAuth settings

   To test your app locally you can add a redirect uri on `http://localhost:{PORT}` but it is recommended to use https for production.

3. Copy the app id and api key and set them in your environment variables.

   Keep in mind that the api key is a secret and should not be shared with anyone. The app id is public and can be shared with anyone.

   ```.env
   NEXT_PUBLIC_WHOP_APP_ID=your-app-id
   WHOP_API_KEY=your-api-key
   ```

### Step 2: Initiate the OAuth flow

#### Setup the OAuth flow

To follow this guide you will need to install the `@whop/api` package from npm:

<CodeGroup>
  ```bash pnpm
  pnpm i @whop/api
  ```

  ```bash npm
  npm i @whop/api
  ```

  ```bash yarn
  yarn add @whop/api
  ```
</CodeGroup>

Start off by creating a route that will be hit by the user when they click the `Login with Whop` button:

```ts /api/oauth/init/route.ts
import { WhopServerSdk } from "@whop/api";

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
});

export function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/home";

  const { url, state } = whopApi.oauth.getAuthorizationUrl({
    // This has to be defined in the redirect uris outlined in step 1.2
    redirectUri: "http://localhost:3000/api/oauth/callback",
    // These are the authorization scopes you want to request from the user.
    scope: ["read_user"],
  });

  // The state is used to restore the `next` parameter after the user lands on the callback route.
  // Note: This is not a secure way to store the state and for demonstration purposes only.
  return Response.redirect(url, {
    headers: {
      "Set-Cookie": `oauth-state.${state}=${encodeURIComponent(
        next
      )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
    },
  });
}
```

<Note>
  Read more about available scopes [here](mdc:api-reference/graphql/scopes).
</Note>

#### Adding the `Login with Whop` button

Now continue by adding a link to your app that will initiate the `Login with Whop` flow:

```html
<a href="/api/oauth/init?next=/home">Login with Whop</a>
```

Upon clicking the link the user will be redirected to the Whop OAuth page and is prompted to authorize your app.

### Step 3: Exchange the code for a token

Upon successful authorization the user will be redirected to the redirect uri you specified in the query parameters with `code` and `state` query parameters:

```ts /api/oauth/callback/route.ts
import { WhopServerSdk } from "@whop/api";

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
});

export function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    // redirect to error page
    return Response.redirect("/oauth/error?error=missing_code");
  }

  if (!state) {
    // redirect to error page
    return Response.redirect("/oauth/error?error=missing_state");
  }

  const stateCookie = request.headers
    .get("Cookie")
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith(`oauth-state.${state}=`));

  if (!stateCookie) {
    // redirect to error page
    return Response.redirect("/oauth/error?error=invalid_state");
  }

  // exchange the code for a token
  const authResponse = await whopApi.oauth.exchangeCode({
    code,
    redirectUri: "http://localhost:3000/api/oauth/callback",
  });

  if (!authResponse.ok) {
    return Response.redirect("/oauth/error?error=code_exchange_failed");
  }

  const { access_token } = authResponse.tokens;

  // Restore the `next` parameter from the state cookie set in the previous step.
  const next = decodeURIComponent(stateCookie.split("=")[1]);
  const nextUrl = new URL(next, "http://localhost:3000");

  // This is an example, you should not store the plain user auth token in a cookie in production.

  // After setting the cookie you can now identify the user by reading the cookie when the user visits your website.
  return Response.redirect(nextUrl.toString(), {
    headers: {
      "Set-Cookie": `whop_access_token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
    },
  });
}
```

## Implementing with authentication frameworks

### Auth.js (coming soon)

We will release an extensive guide on how to implement Whop OAuth with auth.js soon.


# Payments and payouts
Source: https://dev.whop.com/features/payments-and-payouts

Use the API to collect payment from users or payout users.

## Collecting Payments

First, create the charge on the server using the Whop API. Then you can either:

1. Open a modal in your app using the iframe SDK (recommended)
2. Redirect the user to Whop's checkout page

### 1. Create the charge on the server

> This step will create a charge on the server and return the inAppPurchase object required for the next step.

On the server, use the [chargeUser](mdc:sdk/api/payments/charge-user) method to create a charge:

```typescript app/api/charge/route.ts
import { whopApi } from "@/lib/whop-api";

export async function POST(request: Request) {
  try {
    const { userId, experienceId } = await request.json();

    const result = await whopApi.chargeUser({
      input: {
        amount: 100,
        currency: "usd",
        userId: userId,
        // metadata is information that you'd like to receive later about the payment.
        metadata: {
          creditsToPurchase: 1,
          experienceId: experienceId,
        },
      },
    });

    if (!result.chargeUser?.inAppPurchase) {
      throw new Error("Failed to create charge");
    }

    return Response.json(result.chargeUser.inAppPurchase);
  } catch (error) {
    console.error("Error creating charge:", error);
    return Response.json({ error: "Failed to create charge" }, { status: 500 });
  }
}
```

### 2. Confirm the payment on the client

> In this step the user will be prompted to confirm the previously created charge in a modal.

<Warning>
  This function requires the iFrame SDK to be initialized. See [**iFrame
  Overview**](/sdk/iframe-setup) for more information.
</Warning>

Use the iframe SDK to open a payment modal:

<CodeGroup>
  ```tsx React
  "use client";
  import { useIframeSdk } from "@whop/react";

  export default function PaymentButton({
    userId,
    experienceId,
  }: {
    userId: string;
    experienceId: string;
  }) {
    const iframeSdk = useIframeSdk();
    
    const [receiptId, setReceiptId] = useState<string>();
    const [error, setError] = useState<string>();
    
    async function handlePurchase() {
      try {
        // 1. Create charge on server
        const response = await fetch("/api/charge", {
          method: "POST",
          body: JSON.stringify({ userId, experienceId }),
        });
        
        if (response.ok) {
          const inAppPurchase = await response.json();
          // 2. Open payment modal
          const res = await iframeSdk.inAppPurchase(inAppPurchase);
          
          if (res.status === "ok") {
            setReceiptId(res.data.receipt_id);
            setError(undefined);
          } else {
            setReceiptId(undefined);
            setError(res.error);
          }
        } else {
          throw new Error("Failed to create charge");
        }
      } catch (error) {
        console.error("Purchase failed:", error);
        setError("Purchase failed");
      }
    }
    
    return <button onClick={handlePurchase}>Purchase Plan</button>;
  }
  ```

  ```tsx Vanilla JS
  import { iframeSdk } from "@/lib/iframe-sdk";

  const paymentButton = document.querySelector("button#payment-button");
  const receiptElement = document.querySelector("span#receiptContainer");
  const errorElement = document.querySelector("span#errorContainer");

  function setError(error?: string) {
    if (errorElement instanceof HTMLSpanElement) {
      errorElement.textContent = error ?? "";
    }
  }

  function setReceiptId(receiptId?: string) {
    if (receiptElement instanceof HTMLSpanElement) {
      receiptElement.textContent = receiptId ?? "";
    }
  }

  if (paymentButton instanceof HTMLButtonElement) {
    paymentButton.addEventListener(
      "click",
      async function onPaymentButtonClick() {
        const userId = this.dataset.userId;
        const experienceId = this.dataset.experienceId;
        if (!userId || !experienceId) {
          throw new Error("Missing userId or experienceId");
        }

        try {
          // 1. Create charge on server
          const response = await fetch("/api/charge", {
            method: "POST",
            body: JSON.stringify({ userId, experienceId }),
          });

          if (response.ok) {
            const inAppPurchase = await response.json();
            // 2. Open payment modal
            const res = await iframeSdk.inAppPurchase(inAppPurchase);

            if (res.status === "ok") {
              setReceiptId(res.data.receipt_id);
              setError(undefined);
            } else {
              setReceiptId(undefined);
              setError(res.error);
            }
          } else {
            throw new Error("Failed to create charge");
          }
        } catch (error) {
          console.error("Purchase failed:", error);
          setError("Purchase failed");
        }
      }
    );
  }
  ```
</CodeGroup>

## Sending Payouts

You can send payouts to any user using their Whop username. The funds will be transferred from your company's ledger account.

### Transfer Funds

```typescript
import { whopApi } from "@/lib/whop-api";

async function sendPayout(
  companyId: string,
  recipientUsername: string,
  amount: number
) {
  // 1. Get your company's ledger account
  const experience = await whopApi.getExperience({ experienceId });
  const companyId = experience.experience.company.id;
  const ledgerAccount = await whopApi.getCompanyLedgerAccount({ companyId });

  // 2. Pay the recipient
  await whopApi.payUser({
    input: {
      amount: amount,
      currency: "usd",
      // Username or ID or ledger account ID of the recipient user
      destinationId: recipientUsername,
      // Your company's ledger account ID that can be retrieve from whopApi.getCompanyLedgerAccount()
      ledgerAccountId: ledgerAccount.company?.ledgerAccount.id!,
      // Optional transfer fee in percentage
      transferFee: ledgerAccount.company?.ledgerAccount.transferFee,
    },
  });
}
```


# Create forum post
Source: https://dev.whop.com/features/post-to-feed

Create a forum and a post using the API

## Overview

To post in a forum, you must:

1. Find or create a *Forum Experience*
2. Create a *Forum Post* inside the *Forum Experience*

<Info>
  If you already know what forum experience you want to post in, you can skip
  step 1, and use the experience ID directly in step 2.
</Info>

***

## Find or create a forum experience

A forum post must be created within a **Forum Experience**.
The `findOrCreateForum` method will find an existing forum experience with the specified name,
or create a new one with all the specified options

```typescript
 const newForum = await whopApi.withUser("YOUR_AGENT_USER_ID").findOrCreateForum({
    input: {
      experienceId: experienceId,
      name: "Dino game results",
      whoCanPost: "admins",
		// optional:
		// expiresAt: Date.now() + 24 * 60 * 60 * 1000,
		// price: {
        // baseCurrency: "usd",
        // initialPrice: 100,
      // }
    },
  });
```

> This will create the forum in the same whop as the supplied experience.

***

## Create a forum post.

Once you have the `experienceId` from the above, use it to create a post.

### Basic Forum Post

```ts
const forumPost = await whopApi
  .withUser("YOUR_AGENT_USER_ID")
  .createForumPost({
    input: {
      forumExperienceId: newForum.createForum?.id,
      title: "Welcome!",
      content: "Excited to kick things off in our new forum 🎉",
    },
  });
```

* `withUser()`: ID of the user posting
* `forumExperienceId`: The ID of the target forum
* `title` and `content`: Main post body. *(title is optional)*

### Forum post with advanced options

This demonstrates a rich post using all features:

```ts
const forumPost = await whopApi
  .withUser("YOUR_AGENT_USER_ID")
  .createForumPost({
    input: {
      forumExperienceId: "exp_XXXXXX",
      // Visible even before purchase.
      title: "Big Launch + Community Poll!",
      // Visible only after purchase
      content: "Hidden content unless purchased. 🔒",
      // Add media to the post.
      // Learn how to upload in the upload-media section
      attachments: [
        {
          directUploadId: "XXXXXXXXXXXXXXXXXXXXXXXXXX",
        },
      ],

      // Do not send a notification to everyone about this post.
      isMention: false,

      // Lock the content and attachments behind a
      // one time purchase in the price + currency.
      paywallAmount: 9.99,
      paywallCurrency: "usd",

      // Add a poll to the post.
      poll: {
        options: [
          { id: "1", text: "New Product Features" },
          { id: "2", text: "Exclusive AMA" },
          { id: "3", text: "Member Giveaways" },
        ],
      },
    },
  });
```


# Send push notification
Source: https://dev.whop.com/features/send-push-notification

Send a push notification to a user or a group of users.

```typescript
import { whopApi } from "@/lib/whop-api";

const input = {
  experienceId: "exp_XYZ", // Or userId to send to one specific user.
  title: "Important Update",
  message: "Your new content is now available!",
  // url: "https://example.com/new-content" If blank (recommended, users will be brought to your app view.)
};


const success = (await whopApi.sendNotification({input})).sendNotification;

if (success) {
	console.log("Notification sent successfully.");
} else {
	console.log("Failed to send notification or it's being processed.");
}

```


# Subscriptions
Source: https://dev.whop.com/features/subscriptions

Gate your app behind a subscription or one-time purchase

## Setup your access pass on the dashboard.

1. Go to the your [app's dashboard](mdc:https:/whop.com/dashboard/developer).
2. Select the access passes tab and create an access pass. Give it a name like "My App Premium"
3. Create a pricing plan for the access pass by clicking the "Add Pricing" button from the table row.
4. After creating the pricing plan, copy the plan id from the 3 dot menu in the pricing plan card.
5. Also copy the access pass id from the 3 dot menu in the access pass table row.

<Info>
  We recommend storing the access pass id and plan id in environment variables
  for your app. Eg:

  ```bash
  NEXT_PUBLIC_PREMIUM_ACCESS_PASS_ID="prod_XXXXXXXX"
  NEXT_PUBLIC_PREMIUM_PLAN_ID="plan_XXXXXXXX"
  ```
</Info>

## Check if users have access

When a user makes a request to your app, you can easily check if they have access using the whop api.

```typescript
const hasAccess = await whopApi.checkIfUserHasAccessToAccessPass({
  accessPassId: process.env.NEXT_PUBLIC_PREMIUM_ACCESS_PASS_ID, // from step 5 above.
  userId: userId,
});
```

If a user does not have access, you can [prompt them to purchase](mdc:#collect-payment-from-users) or show a lite "free" version of the app to upsell them.

## Collect payment from users

<Warning>
  This function requires the iFrame SDK to be initialized. See [**iFrame
  Overview**](/sdk/iframe-setup) for more information.
</Warning>

Use the iframe sdk to collect payment from users. This will show a whop native payment modal in which the user can confirm their purchase.

<CodeGroup>
  ```tsx React
  "use client";
  import { useIframeSdk } from "@whop/react";

  export default function GetAccessButton() {
    const iframeSdk = useIframeSdk();
    
    const [receiptId, setReceiptId] = useState<string>();
    const [error, setError] = useState<string>();
    
    async function handlePurchase() {
      try {
  		const res = await iframeSdk.inAppPurchase({ planId: process.env.NEXT_PUBLIC_PREMIUM_PLAN_ID });
  		
  		if (res.status === "ok") {
  			setReceiptId(res.data.receipt_id);
  			setError(undefined);
  		} else {
  			setReceiptId(undefined);
  			setError(res.error);
  		}
      } catch (error) {
        console.error("Purchase failed:", error);
        setError("Purchase failed");
      }
    }
    
    return <button onClick={handlePurchase}>Get Access</button>;
  }
  ```

  ```tsx Vanilla JS
  import { iframeSdk } from "@/lib/iframe-sdk";

  const getAccessButton = document.querySelector("button#get-access-button");
  const receiptElement = document.querySelector("span#receiptContainer");
  const errorElement = document.querySelector("span#errorContainer");

  function setError(error?: string) {
    if (errorElement instanceof HTMLSpanElement) {
      errorElement.textContent = error ?? "";
    }
  }

  function setReceiptId(receiptId?: string) {
    if (receiptElement instanceof HTMLSpanElement) {
      receiptElement.textContent = receiptId ?? "";
    }
  }

  if (getAccessButton instanceof HTMLButtonElement) {
    getAccessButton.addEventListener(
      "click",
      async function onGetAccessButtonClick() {
        try {
          const res = await iframeSdk.inAppPurchase({
            planId: process.env.NEXT_PUBLIC_PREMIUM_PLAN_ID,
          });

          if (res.status === "ok") {
            setReceiptId(res.data.receipt_id);
            setError(undefined);
          } else {
            setReceiptId(undefined);
            setError(res.error);
          }
        } catch (error) {
          console.error("Purchase failed:", error);
          setError("Purchase failed");
        }
      }
    );
  }
  ```
</CodeGroup>

# Upload media
Source: https://dev.whop.com/features/upload-media

Use Whop to upload images, videos, audio, and other files.

### Client-Side: Set up the Image Upload Component

First, create a component to handle image uploads. This example uses `react-dropzone` for the file upload interface.

```typescript
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

function ImageUploader() {
  // Set up state for the image file and preview
  const [image, setImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    const objectUrl = image?.preview;
    if (objectUrl) {
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [image?.preview]);

  // Handle file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8">
      <input {...getInputProps()} />
      {image?.preview ? (
        <img src={image.preview} alt="Preview" className="max-w-full h-auto" />
      ) : (
        <p>Drag & drop an image here, or click to select</p>
      )}
    </div>
  );
}
```

### Server-Side: Handle File Uploads

Create an API route to handle the file upload using the Whop SDK:

```typescript
import { verifyUserToken, whopApi } from "@/lib/whop-api";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const headersList = await headers();
    const userToken = await verifyUserToken(headersList);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the file from the request
    const file = await request.blob();
    
    // Upload to Whop
    const response = await whopApi.uploadAttachment({
      file: new File([file], `upload-${Date.now()}.png`, {
        type: "image/png",
      }),
      record: "forum_post", // or other record types
    });

    // The response includes the directUploadId and URL
    return NextResponse.json({
      success: true,
      attachmentId: response.directUploadId,
      url: response.attachment.source.url
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
```

### Using Uploaded Media

After uploading, you can use the attachment ID in various Whop features. For example, to create a forum post with the uploaded image (server-side):

```typescript
const createForumPost = async (attachmentId: string) => {
  const post = await whopApi.createForumPost({
    input: {
      forumExperienceId: "your-forum-id",
      content: "Check out this image!",
      attachments: [
        { directUploadId: attachmentId }
      ]
    }
  });

  return post;
}
```

### Supported File Types

The Whop API supports the following file types for upload:

* Images: `.jpg`, `.jpeg`, `.png`, `.gif`
* Videos: `.mp4`, `.mov`
* Documents: `.pdf`

### Best Practices

1. **File Size**: Keep uploads under 100MB for optimal performance
2. **Image Optimization**: Consider using libraries like `sharp` for image processing before upload
3. **Error Handling**: Implement proper error handling on both client and server
4. **Clean Up**: Remember to clean up any preview URLs to prevent memory leaks
5. **Security**: Always verify user authentication before handling uploads
6. **Progress Tracking**: Consider implementing upload progress tracking for better UX

### Complete Example

Here's a complete example showing both client and server integration:

```typescript
// app/components/MediaUploader.tsx (Client)
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function MediaUploader() {
  const [image, setImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!image?.file) return;
    
    setIsUploading(true);
    try {
      // Send to your API route
      const formData = new FormData();
      formData.append("file", image.file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      // Clear the form after successful upload
      setImage(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8">
        <input {...getInputProps()} />
        {image?.preview ? (
          <img src={image.preview} alt="Preview" className="max-w-full h-auto" />
        ) : (
          <p>Drag & drop an image here, or click to select</p>
        )}
      </div>

      {image && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}
```

This implementation provides a complete media upload solution with:

* Drag and drop interface
* File preview
* Upload handling
* Progress states
* Error handling
* Automatic cleanup


# Webhooks
Source: https://dev.whop.com/features/webhooks

Use webhooks to get notified when specific events happen relating to your app.

Access your webhooks from the app detail screen in your [dashboard](mdc:https:/whop.com/dashboard/developer).


# Connect to websocket
Source: https://dev.whop.com/features/websocket-guide

Learn how to implement real-time features using Whop's websocket API

You can connect to the websocket from your client side frontend code running in the iFrame.

## Client Setup

### React

When using react, it is recommended to use the `WhopWebsocketProvider` provider from the `@whop/react` package to connect to the websocket.

1. Mount the `WhopWebsocketProvider` provider:

   ```tsx app/layout.tsx
   import { WhopWebsocketProvider } from "@whop/react";
   import { handleAppMessage } from "@/lib/handle-websocket-message";

   export default function Layout({ children }: { children: React.ReactNode }) {
     return (
       <WhopWebsocketProvider
         // optional, you can join a specific experience channel (ie, the one you are currently viewing).
         joinExperience="exp_XXXX"
         // optional, you can join a custom channel.
         joinCustom="some_custom_channel"
         // optional, a callback that is called when an app message is received. you can also use the `useOnWebsocketMessage` hook to handle messages.
         onAppMessage={handleAppMessage}
       >
         {children}
       </WhopWebsocketProvider>
     );
   }
   ```

2. Handle app messages:

   ```tsx lib/handle-websocket-message.tsx
   export function handleAppMessage(message: proto.common.AppMessage) {
     console.log("Received app message:", message);

     // message.isTrusted is true if and only if the message was sent from your server with your private app API key.

     // message.json is the JSON string you sent from your server / client.

     // if you sent the message from the client using websocket.broadcast,
     // message.fromUserId will include the user id of the user who sent the message.
   }

   // You can also handle messages using the `useOnWebsocketMessage` hook.
   export function MyNestedReactComponent() {
     const [state, setState] = useState<string>("");
     useOnWebsocketMessage((message) => {
       setState(message.json);
     });
     return <div>{state}</div>;
   }
   ```

3. Handle connection status changes:

   ```tsx
   import { useWebsocketStatus } from "@whop/react";

   // inside of a component
   const connectionStatus = useWebsocketStatus();
   ```

### Other frameworks

Alternatively, you can create the websocket client using the `@whop/api` package in any framework.

1. Create the websocket client:

   ```typescript
   import { WhopClientSdk } from "@whop/api";

   const whopApi = WhopClientSdk();

   const websocket = whopApi.websocketClient({
     joinExperience: "exp_XXXX", // optional, you can join a specific experience channel (ie, the one you are currently viewing).
     joinCustom: "some_custom_channel", // optional, you can join a custom channel.
   });
   ```

2. Add event handlers for messages:

   ```typescript
   websocket.on("appMessage", (message) => {
     console.log("Received custom message:", message);

     // message.isTrusted is true if and only if the message was sent from your server with your private app API key.

     // message.json is the JSON string you sent from your server / client.

     // if you sent the message from the client using websocket.broadcast,
     // message.fromUserId will include the user id of the user who sent the message.
   });
   ```

3. Handle connection status changes:

   ```typescript
   websocket.on("connectionStatus", (status) => {
     console.log("Websocket Status Updated:", status);
   });

   websocket.on("connect", () => {
     console.log("Websocket Connected");
   });

   websocket.on("disconnect", () => {
     console.log("Websocket Disconnected");
   });
   ```

4. Connect to the websocket and start receiving events:

   ```typescript
   websocket.connect();
   ```

5. *Optional:* Disconnect from the websocket:

   ```typescript
   websocket.disconnect();
   ```

## Send messages from the client

You can send messages from the client to the server by using the `websocket.broadcast` or `useBroadcastWebsocketMessage` function.

1. Create a websocket client as above.

2. Send a custom message via websocket.

<CodeGroup>
  ```tsx React
  import { useBroadcastWebsocketMessage } from "@whop/react";

  export function SendMessageExample() {
    const broadcast = useBroadcastWebsocketMessage();

    function sendMessage () {
       broadcast({
          message: JSON.stringify({ hello: "world" }),
          target: "everyone",
       });
    }

    return <button onClick={sendMessage}>Send Message</button>
  }

  ```

  ```typescript Other frameworks
  // make sure you are connected by calling `websocket.connect()`

  websocket.broadcast({
    message: JSON.stringify({ hello: "world" }),
    target: "everyone",
  });
  ```
</CodeGroup>

<Note>
  The target field is the same as the one you would pass to
  `whopApi.sendWebsocketMessage` on the server.
</Note>

## Send messages from your server

You can broadcast trusted websocket messages from your server to connected clients by using the `whopApi.sendWebsocketMessage` function.

1. Construct an instance of the whop server sdk and pass your API key:

   ```typescript
   import { WhopServerSdk } from "@whop/api";

   const whopApi = WhopServerSdk({
     appApiKey: process.env.WHOP_API_KEY,
   });
   ```

2. Send a custom string message via websocket.

   ```typescript
   // Send to all users currently on your app across all experiences / views.
   whopApi.sendWebsocketMessage({
     message: JSON.stringify({ hello: "world" }),
     target: "everyone",
   });

   // send to all users currently on this experience
   // (only works if the experience belongs to your app)
   whopApi.sendWebsocketMessage({
     message: JSON.stringify({ hello: "world" }),
     target: { experience: "exp_XXXX" },
   });

   // create a custom channel that your websocket client can subscribe to.
   // Only works if when connecting on the client, you pass the same custom channel name.
   whopApi.sendWebsocketMessage({
     message: JSON.stringify({ hello: "world" }),
     target: { custom: "some_custom_channel" },
   });

   // send to a specific user on your app
   whopApi.sendWebsocketMessage({
     message: JSON.stringify({ hello: "world" }),
     target: { user: "user_XXXX" },
   });
   ```

## Receive messages on your server

<Info>
  Before you start, make sure you are using NodeJS 22.4 or higher, or Bun to run
  your server.
</Info>

Use the server websocket API to receive events such as chat messages as forum posts for a particular user on your server.
You can use these events to build real-time apps such as chat bots and AI-agents that react to events on the platform.

1. Construct (or reuse) an instance of the whop server sdk and pass your API key:

   ```typescript
   import { WhopServerSdk } from "@whop/api";

   const whopApi = WhopServerSdk({
     appApiKey: process.env.WHOP_API_KEY,
   });
   ```

2. Create your websocket client and add handlers for messages / status changes:

   ```typescript
   const websocket = whopApi
     // Pass the user id of the user you want to receive events for
     .withUser("user_v9KUoZvTGp6ID")
     // Construct the websocket client
     .websocketClient();
   ```

3. Add event handlers for messages:

   ```typescript
   websocket.on("message", (message) => {
     console.log("Received Message:", message);

     const chatMessage = message.feedEntity?.dmsPost;
     if (chatMessage) {
       // handle the chat message
     }

     const forumPost = message.feedEntity?.forumPost;
     if (forumPost) {
       // handle the forum post
     }
   });
   ```

4. Add event handlers for status changes (same as client API):

   ```typescript
   websocket.on("connectionStatus", (status) => {
     console.log("Websocket Status Updated:", status);
   });

   // Or you can also listen to the connect and disconnect events:
   websocket.on("connect", () => {
     console.log("Websocket Connected");
   });

   websocket.on("disconnect", () => {
     console.log("Websocket Disconnected");
   });
   ```

5. Connect to the websocket and start receiving events:

   ```typescript
   websocket.connect();
   ```

6. *Optional:* Disconnect from the websocket:

   ```typescript
   websocket.disconnect();
   ```


# Get an API key
Source: https://dev.whop.com/get-api-key

All requests to Whop APIs are managed using a secure API key.

1. Go to [https://whop.com/dashboard/developer/](mdc:https:/whop.com/dashboard/developer).
2. Click the Create App button.
3. Give your app a name and click the Create button.
4. Copy the API key from the `Environment variables` section and use it in your code.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/whop/how-to-videos/how-to-make-app-and-get-keys.gif" alt="How to create an app and get API keys" />
</Frame>

### Company API (deprecated) -- V2 and V5

Legacy. Old system for when you want to automate your own creator account or sync payments/crm data to your internal systems.


# Getting started
Source: https://dev.whop.com/getting-started



1. Clone our Next.js app template:

   <CodeGroup>
     ```bash Next.js
     npx create-next-app@latest whop-app -e https://github.com/whopio/whop-nextjs-app-template
     ```
   </CodeGroup>

2. Install packages:

   <CodeGroup>
     ```bash pnpm
     pnpm i
     ```

     ```bash npm
     npm i
     ```

     ```bash yarn
     yarn i
     ```
   </CodeGroup>

3. Run the app locally:

   <CodeGroup>
     ```bash pnpm
     pnpm dev
     ```

     ```bash npm
     npm run dev
     ```

     ```bash yarn
     yarn dev
     ```
   </CodeGroup>

Now open [http://localhost:3000](mdc:http:/localhost:3000) and follow the directions on the page.

<CardGroup cols={2}>
  <Card title="View our tutorials" href="/tutorials" icon="book-open" color="#16a34a">
    Step-by-step guides to help you get started building with Whop.
  </Card>

  <Card title="SDK Reference" href="/sdk" icon="code" color="#16a34a">
    View available functions from our API to make calls in your app.
  </Card>
</CardGroup>


# Introduction
Source: https://dev.whop.com/introduction

Build Whop apps and sell them into Whop communities with thousands of members.

# What are Whop Apps?

A Whop app is a web app that can be embedded into a whop community. These apps can be installed by any Whop creator through our [app store](mdc:https:/whop.com/discover/app-store). As the developer, you can charge for the app using several options offered by our Whop SDK. Our Whop SDK makes it easy to leverage the infrastructure of whop, to build full-blown apps in hours, not weeks.

# Examples of apps

* [AI image generator](mdc:https:/whop.com/apps/app_KHqcozSfEGNyhl/install)
* [Pay-to-play game](mdc:https:/whop.com/apps/app_scKdeUGhiBtYPr/install)
* [Chat bot](mdc:https:/whop.com/apps/app_3rqpGo1tsmPDHg/install)
* [AI car customizer](mdc:https:/whop.com/apps/app_S42iB0COVVUVwO/install)

# Why build Whop apps?

## Distribution

You will be placed in the Whop App Store. The app store is visited by thousands of creators who are looking to offer more value to their communities. You focus on building the best app you can, and we will handle getting you customers.

## Authentication

Zero authentication required. Since your app is embedded into a whop, we handle all user authentication for you. You have access to a load of user information via the Whop SDK.

## Payments

Tap into the power of Whop's payment system. Accept payment with extremely low effort.

### Explore how to collect payments

<AccordionGroup>
  <Accordion title="Transaction fees">
    Enable in-app purchases and take a transaction fee on each sale. For example, selling game credits, running a watch marketplace, or letting creators sell custom t-shirts.
  </Accordion>

  <Accordion title="Installation fee">
    Charge a one-time installation fee of \$5000 and let Whop creators offer your app as a free benefit for joining their community.
  </Accordion>

  <Accordion title="Per seat">
    Charge \$1 per member inside of a whop and let creators offer your app as a free benefit for joining their community
  </Accordion>

  <Accordion title="Monthly subscription">
    Charge Whop creators \$300 per month to let their members use your app freely.
  </Accordion>

  <Accordion title="Affiliate commission">
    Let whop creators sell your app inside their community for \$29/month and earn a referral fee for every customer they bring you.
  </Accordion>
</AccordionGroup>

## Get started

<CardGroup cols={2}>
  {" "}

  <Card title="View our tutorials" href="/tutorials" icon="book-open" color="#16a34a">
    Step-by-step guides to help you get started building with Whop.
  </Card>

  <Card title="Clone our starter template" href="/getting-started" icon="code" color="#16a34a">
    Clone our starter template to get started building your app.
  </Card>
</CardGroup>


# Install our MCP
Source: https://dev.whop.com/mcp

Learn how to install our MCP.

You can install our MCP by runnning this command:

```bash
npx mint-mcp add whop
```

This provides you with a ready-to-use MCP server with knowledge of our docs.


# Get Access Pass
Source: https://dev.whop.com/sdk/api/access-passes/get-access-pass

Fetches an access pass based on the ID or the route

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getAccessPass({
	// The ID or route of the access pass to fetch.
	accessPassId: "prod_XXXXXXXX" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Fetches an access pass based on the ID or the route
	accessPass: {
		// The internal ID of the public access pass.
		id: "xxxxxxxxxxx",

		// The title of the access pass. Use for Whop 4.0.
		title: "some string",

		// A short description of what the company offers or does.
		shortenedDescription: "some string",

		// Whether this product is Whop verified.
		verified: true,

		// This access pass will/will not be displayed publicly.
		visibility:
			"archived" /* Valid values: archived | hidden | quick_link | visible */,

		// The route of the access pass.
		route: "some string",

		// The number of active users for this access pass.
		activeUsersCount: 10,

		// The logo for the access pass.
		logo: {
			// The original URL of the attachment, such as a direct link to S3. This should
			// never be displayed on the client and always passed to an Imgproxy transformer.
			sourceUrl: "some string",
		},

		// The banner image for the access pass.
		bannerImage: {
			// The original URL of the attachment, such as a direct link to S3. This should
			// never be displayed on the client and always passed to an Imgproxy transformer.
			sourceUrl: "some string",
		},

		// The headline of the access pass.
		headline: "some string",

		// A short type of the company that this access pass belongs to.
		company: {
			// The ID (tag) of the company.
			id: "xxxxxxxxxxx",

			// The title of the company.
			title: "some string",
		},

		// The average of all reviews for this access pass.
		reviewsAverage: 10,

		// The user that owns the access pass (company owner).
		ownerUser: {
			// The internal ID of the user.
			id: "xxxxxxxxxxx",

			// The name of the user from their Whop account.
			name: "some string",

			// The username of the user from their Whop account.
			username: "some string",

			// The user's profile picture
			profilePicture: {
				// The original URL of the attachment, such as a direct link to S3. This should
				// never be displayed on the client and always passed to an Imgproxy transformer.
				sourceUrl: "some string",
			},

			// Whether or not the user's phone is verified
			phoneVerified: true,

			// The city the user is from.
			city: "some string",

			// The country the user is from.
			country: "some string",
		},
	},
};

```

# Get Attachment
Source: https://dev.whop.com/sdk/api/attachments/get-attachment

Returns the attachment

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getAttachment({
	// The ID of the attachment
	id: "xxxxxxxxxxx" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Returns the attachment
	attachment: {
		// The ID of the attachment
		id: "xxxxxxxxxxx",

		// A signed ID of the attachment to directly query the attachment
		signedId: "xxxxxxxxxxx",

		// Whether the attachment has been analyzed
		analyzed: true,

		// The size of the file in bytes
		byteSizeV2: "9999999",

		// The name of the file
		filename: "some string",

		// The attachment's content type (e.g., image/jpg, video/mp4)
		contentType: "some string",

		// The source of the attachment
		source: {
			// The URL to access the attachment
			url: "some string",
		},

		// The blurhash of the image
		blurhash: "some string",

		// The height of the video
		height: 10,

		// The width of the video
		width: 10,

		// The aspect ratio of the video
		aspectRatio: 10,

		// The preview of the video
		preview: {
			// The URL to access the attachment
			url: "some string",
		},

		// The duration of the audio in seconds
		duration: 10,

		// The URL of the waveform for the audio
		waveformUrl: "some string",
	},
};

```


# Process Attachment
Source: https://dev.whop.com/sdk/api/attachments/process-attachment



```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.processAttachment({
	input: {
		// The ID returned by the direct upload mutation
		directUploadId: "some string" /* Required! */,

		// The type of media to analyze
		mediaType:
			"audio" /* Valid values: audio | image | other | video */ /* Required! */,

		// The parts of the multipart upload
		multipartParts: [
			{
				// The ETag of the part
				etag: "some string" /* Required! */,

				// The part number of the part
				partNumber: 10 /* Required! */,
			},
		],

		// The ID returned by the direct upload mutation
		multipartUploadId: "some string",
	},
});

```

Example output:

```typescript
const response = {
	// Analyze a file attachment
	mediaAnalyzeAttachment: true,
};

```


# Upload Media
Source: https://dev.whop.com/sdk/api/attachments/upload-media



```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.uploadMedia({
	input: {
		// The size of the file in bytes
		byteSize: 10,

		// The size of the file in bytes
		byteSizeV2: "9999999",

		// The checksum of the file
		checksum: "some string" /* Required! */,

		// The content type of the file
		contentType: "some string",

		// The filename of the file
		filename: "some string" /* Required! */,

		// The metadata of the file
		metadata: { any: "json" },

		// Whether or not to use multipart upload. The file must be larger than 5MB
		multipart: true,

		// The type of record to attach the file to
		record:
			"abuse_report" /* Valid values: abuse_report | access_pass | app | automated_messages_config | bot | bounty | bounty_submission | competition_prize | content_reward_campaign | content_reward_submission | dispute | dms_post | experience | forum_post | resolution_event_upload | review | review_report | user */ /* Required! */,
	},
});

```

Example output:

```typescript
const response = {
	// Directly upload a file to the platform
	mediaDirectUpload: {
		// The signed ID of the blob
		id: "xxxxxxxxxxx",

		// The headers for the upload
		headers: { any: "json" },

		// The URL to upload the blob
		uploadUrl: "some string",

		// The multipart upload ID
		multipartUploadId: "some string",

		// The URLs for the parts of the multipart upload
		multipartUploadUrls: [
			{
				// The part number of the part
				partNumber: 10,

				// The url to upload the part
				url: "some string",
			},
		],
	},
};

```


# Check If User Has Access To Access Pass
Source: https://dev.whop.com/sdk/api/authentication/check-if-user-has-access-to-access-pass

Check if the user has access to a Whop resource

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.checkIfUserHasAccessToAccessPass({
	// The ID of the access pass
	accessPassId: "prod_XXXXXXXX" /* Required! */,

	// The ID of the user
	userId: "user_XXXXXXXX",
});

```

Example output:

```typescript
const response = {
	// Check if the user has access to a Whop resource
	hasAccessToAccessPass: {
		// Whether the user has access to the resource
		hasAccess: true,

		// The permission level of the user
		accessLevel: "admin" /* Valid values: admin | customer | no_access */,
	},
};

```


# Check If User Has Access To Company
Source: https://dev.whop.com/sdk/api/authentication/check-if-user-has-access-to-company

Check if the user has access to a Whop resource

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.checkIfUserHasAccessToCompany({
	// The ID of the company
	companyId: "biz_XXXXXXXX" /* Required! */,

	// The ID of the user
	userId: "user_XXXXXXXX",
});

```

Example output:

```typescript
const response = {
	// Check if the user has access to a Whop resource
	hasAccessToCompany: {
		// Whether the user has access to the resource
		hasAccess: true,

		// The permission level of the user
		accessLevel: "admin" /* Valid values: admin | customer | no_access */,
	},
};

```


# Check If User Has Access To Experience
Source: https://dev.whop.com/sdk/api/authentication/check-if-user-has-access-to-experience

Check if the user has access to a Whop resource

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.checkIfUserHasAccessToExperience({
	// The ID of the experience
	experienceId: "exp_XXXXXXXX" /* Required! */,

	// The ID of the user
	userId: "user_XXXXXXXX",
});

```

Example output:

```typescript
const response = {
	// Check if the user has access to a Whop resource
	hasAccessToExperience: {
		// Whether the user has access to the resource
		hasAccess: true,

		// The permission level of the user
		accessLevel: "admin" /* Valid values: admin | customer | no_access */,
	},
};

```


# Get Current User
Source: https://dev.whop.com/sdk/api/authentication/get-current-user

Returns the current user and company.

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getCurrentUser();

```

Example output:

```typescript
const response = {
	// Returns the current user and company.
	viewer: {
		// The user the viewer is in scope of.
		user: {
			// The internal ID of the user
			id: "xxxxxxxxxxx",

			// The email address of the user
			email: "some string",

			// The name of the user
			name: "some string",

			// The Whop username for this user
			username: "some string",

			// The user's profile picture
			profilePicture: {
				// The original URL of the attachment, such as a direct link to S3. This should
				// never be displayed on the client and always passed to an Imgproxy transformer.
				sourceUrl: "some string",
			},

			// The user's bio
			bio: "some string",

			// Whether or not the user's phone is verified
			phoneVerified: true,

			// The user's banner image
			bannerImage: "some string",

			// The timestamp of when the user was created
			createdAt: 1716931200,

			// The day of the user's date of birth
			dateOfBirthDay: 10,

			// The month of the user's date of birth
			dateOfBirthMonth: 10,

			// The year of the user's date of birth
			dateOfBirthYear: 10,

			// The user's ledger account.
			ledgerAccount: {
				// The ID of the LedgerAccount.
				id: "xxxxxxxxxxx",

				// The fee for transfers, if applicable.
				transferFee: 10,

				// The balances associated with the account.
				balanceCaches: {
					// A list of nodes.
					nodes: [
						{
							// The amount of the balance.
							balance: 10,

							// The amount of the balance that is pending.
							pendingBalance: 10,

							// The currency of the balance.
							currency:
								"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,
						},
					],
				},
			},
		},
	},
};

```


# List Experiences
Source: https://dev.whop.com/sdk/api/authentication/list-experiences

Fetch a company

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.listExperiences({
	after: "pageInfo.endCursor",

	first: 10,

	accessPassId: "prod_XXXXXXXX",

	appId: "app_XXXXXXXX",

	onAccessPass: true,

	// ID of the company, either the tag (biz_xxx) or the page route (whop-dev)
	companyId: "biz_XXXXXXXX" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Fetch a company
	company: {
		// All of the experiences connected to the company.
		experiencesV2: {
			// A list of nodes.
			nodes: [
				{
					// The ID of the experience
					id: "xxxxxxxxxxx",

					// The name of the experience
					name: "some string",

					// A short description of the experience
					description: "some string",

					// The image for the experience interface
					logo: {
						// Image url with requested image resolution.
						sourceUrl: "some string",
					},

					// The interface of the experience
					app: {
						// The ID of the app
						id: "xxxxxxxxxxx",

						// The name of the app
						name: "some string",

						// The icon for the app. This icon is shown on discovery, on the product page, on
						// checkout, and as a default icon for the experiences.
						icon: {
							// The original URL of the attachment, such as a direct link to S3. This should
							// never be displayed on the client and always passed to an Imgproxy transformer.
							sourceUrl: "some string",
						},
					},
				},
			],

			// Information to aid in pagination.
			pageInfo: {
				// When paginating forwards, are there more items?
				hasNextPage: true,

				// When paginating forwards, the cursor to continue.
				endCursor: "some string",
			},

			// The total number of items in this connection.
			totalCount: 10,
		},
	},
};

```


# Find Or Create Chat
Source: https://dev.whop.com/sdk/api/chats/find-or-create-chat



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.findOrCreateChat({
	input: {
		// The ID of the access pass (whop) to attach the chat experience to. It looks like prod_xxxx.
		accessPassId: "prod_XXXXXXXX",

		// The ID of an existing experience. If supplied, this new chat experience will
		// be attached to the first access pass (whop) of this experience. It looks like exp_xxxx.
		experienceId: "exp_XXXXXXXX",

		// The expiration date of the chat experience to be created. After this timestamp, the experience disappears.
		expiresAt: 1716931200,

		// The name of the chat experience to be created, shown to users in the UI.
		name: "some string" /* Required! */,

		// The upsell plan details to add for the chat experience. This allows you to
		// require paid access for the chat within the whop.
		price: {
			// The base currency of the upsell.
			baseCurrency:
				"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,

			// An array of custom field objects.
			customFields: [
				{
					// The type of the custom field.
					fieldType: "text" /* Valid values: text */ /* Required! */,

					// The ID of the custom field (if being updated)
					id: "xxxxxxxxxxx",

					// The name of the custom field.
					name: "some string" /* Required! */,

					// The order of the field.
					order: 10,

					// The placeholder value of the field.
					placeholder: "some string",

					// Whether or not the field is required.
					required: true,
				},
			],

			// The interval at which the plan charges (expiration plans).
			expirationDays: 10,

			// The price of the upsell.
			initialPrice: 10,

			// The method of release for the upsell.
			releaseMethod: "buy_now" /* Valid values: buy_now | raffle | waitlist */,
		},

		// This is who is allowed to send messages inside the chat. Select 'admin' if you
		// only want the team members to message, or select 'everyone' if any member of
		// the whop can send messages.
		whoCanPost: "admins" /* Valid values: admins | everyone */,
	},
});

```

Example output:

```typescript
const response = {
	// Creates a new chat experience. If an existing chat experience with the same
	// name on the whop already exists, it will be returned instead.
	createChat: {
		// The unique ID representing this experience
		id: "xxxxxxxxxxx",

		// Use this link to directly take users to the experience
		link: "some string",
	},
};

```


# List Messages From Chat
Source: https://dev.whop.com/sdk/api/chats/list-messages-from-chat

Fetch feed posts for the current user

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.listMessagesFromChat({
	// The ID of the experience to fetch posts from
	chatExperienceId: "exp_XXXXXXXX",
});

```

Example output:

```typescript
const response = {
	// Fetch feed posts for the current user
	feedPosts: {
		// List of posts
		posts: [
			{
				// The unique identifier for the entity
				id: "xxxxxxxxxxx",

				// The time the entity was created (in milliseconds since Unix epoch)
				createdAt: "9999999",

				// The time the entity was last updated (in milliseconds since Unix epoch)
				updatedAt: "9999999",

				// The text content of the message
				content: "some string",

				// The rich content of the message
				richContent: "some string",

				// Whether the entity has been deleted
				isDeleted: true,

				// The attachments to this message
				attachments: [
					{
						// The ID of the attachment
						id: "xxxxxxxxxxx",

						// The attachment's content type (e.g., image/jpg, video/mp4)
						contentType: "some string",

						// The original URL of the attachment, such as a direct link to S3. This should
						// never be displayed on the client and always passed to an Imgproxy transformer.
						sourceUrl: "some string",
					},
				],

				// Whether the message has been edited
				isEdited: true,

				// Whether this message is pinned
				isPinned: true,

				// Whether everyone was mentioned in this message
				isEveryoneMentioned: true,

				// The IDs of the users mentioned in this message
				mentionedUserIds: ["xxxxxxxxxxx"],

				// The type of post
				messageType:
					"automated" /* Valid values: automated | regular | system */,

				// The ID of the message this is replying to, if applicable
				replyingToPostId: "xxxxxxxxxxx",

				// The number of times this message has been viewed
				viewCount: 10,

				// The user who sent this message
				user: {
					// The internal ID of the user.
					id: "xxxxxxxxxxx",

					// The name of the user from their Whop account.
					name: "some string",

					// The username of the user from their Whop account.
					username: "some string",

					// The user's profile picture
					profilePicture: {
						// The original URL of the attachment, such as a direct link to S3. This should
						// never be displayed on the client and always passed to an Imgproxy transformer.
						sourceUrl: "some string",
					},

					// Whether or not the user's phone is verified
					phoneVerified: true,

					// The city the user is from.
					city: "some string",

					// The country the user is from.
					country: "some string",
				},
			},
		],
	},
};

```


# Send Message To Chat
Source: https://dev.whop.com/sdk/api/chats/send-message-to-chat



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.sendMessageToChat({
	experienceId: "exp_XXXXXXXX" /* Required! */,

	message: "some string" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Sends a message to a user
	sendMessage: "some string",
};

```


# Get Waitlist Entries For Company
Source: https://dev.whop.com/sdk/api/companies/get-waitlist-entries-for-company

Fetch a company

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getWaitlistEntriesForCompany({
	// ID of the company, either the tag (biz_xxx) or the page route (whop-dev)
	companyId: "biz_XXXXXXXX" /* Required! */,

	after: "pageInfo.endCursor",

	before: "pageInfo.startCursor",

	first: 10,

	last: 10,
});

```

Example output:

```typescript
const response = {
	// Fetch a company
	company: {
		// The creator dashboard table for the company
		creatorDashboardTable: {
			// Entries
			entries: {
				// A list of nodes.
				nodes: [
					{
						// The status of the entry.
						status: "any" /* Valid values: any | approved | denied | pending */,

						// The name of the raffle/waitlist.
						name: "some string",

						// Responses collected from the user when submitting their entry.
						customFieldResponses: [
							{
								// The question asked by the custom field
								question: "some string",

								// The response a user gave to the specific question or field.
								answer: "some string",
							},
						],

						// The plan the entry is connected to.
						plan: {
							// The internal ID of the plan.
							id: "xxxxxxxxxxx",
						},

						// The user who created the entry.
						user: {
							// The internal ID of the user.
							id: "xxxxxxxxxxx",

							// The username of the user from their Whop account.
							username: "some string",

							// The user's profile picture
							profilePicture: {
								// The original URL of the attachment, such as a direct link to S3. This should
								// never be displayed on the client and always passed to an Imgproxy transformer.
								sourceUrl: "some string",
							},
						},
					},
				],

				// Information to aid in pagination.
				pageInfo: {
					// When paginating forwards, are there more items?
					hasNextPage: true,

					// When paginating backwards, are there more items?
					hasPreviousPage: true,

					// When paginating backwards, the cursor to continue.
					startCursor: "some string",

					// When paginating forwards, the cursor to continue.
					endCursor: "some string",
				},

				// The total number of items in this connection.
				totalCount: 10,
			},
		},
	},
};

```


# List Direct Message Conversations
Source: https://dev.whop.com/sdk/api/direct-messages/list-direct-message-conversations

Fetch direct message or group chats for the current user. Experimental, don't use in production yet.

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.listDirectMessageConversations({
	// The `last_post_sent_at` timestamp to fetch channels before
	beforeTimestamp: "9999999",

	// Maximum number of channels to return
	limit: 10,

	// Filter by user or group name, e.g. 'Jack' or 'Fight Club'
	query: "some string",

	// Filter by status (accepted, requested, etc.)
	status: "accepted" /* Valid values: accepted | hidden | requested */,

	// Filter by unread status (true or false)
	unread: true,
});

```

Example output:

```typescript
const response = {
	// Fetch direct message or group chats for the current user. Experimental, don't use in production yet.
	myDmsChannelsV2: [
		{
			// The timestamp when the channel was created
			createdAt: 1716931200,

			// The unique identifier of the channel, e.g. 'feed_12345'
			id: "xxxxxxxxxxx",

			// Whether or not the channel is pinned to the top of the list
			isPinned: true,

			// The custom name of the DM channel, if any
			customName: "some string",

			// Whether or not the channel is a group chat
			isGroupChat: true,

			// List of members for the channel
			feedMembers: [
				{
					// The username of the user e.g. 'jacksmith01'
					username: "some string",

					// The unique identifier of the member resource, e.g. 'feed_member_12345'
					id: "xxxxxxxxxxx",
				},
			],

			// Whether or not the channel has unread posts
			isUnread: true,

			// Last post in the channel
			lastMessage: {
				// The text content of the post
				content: "some string",

				// The ID of the user who sent this message, e.g. 'user_12345'
				userId: "xxxxxxxxxxx",
			},
		},
	],
};

```


# Send Direct Message To User
Source: https://dev.whop.com/sdk/api/direct-messages/send-direct-message-to-user



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.sendDirectMessageToUser({
	toUserIdOrUsername: "xxxxxxxxxxx" /* Required! */,

	message: "some string" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Sends a message to a user
	sendMessage: "some string",
};

```


# Get Experience
Source: https://dev.whop.com/sdk/api/experiences/get-experience

Fetch an experience.

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getExperience({
	// The ID of the experience
	experienceId: "exp_XXXXXXXX" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Fetch an experience.
	experience: {
		// The unique ID representing this experience
		id: "xxxxxxxxxxx",

		// The written name of the description.
		name: "some string",

		// A short written description of what is being offered
		description: "some string",

		// The logo for the experience.
		logo: {
			// The original URL of the attachment, such as a direct link to S3. This should
			// never be displayed on the client and always passed to an Imgproxy transformer.
			sourceUrl: "some string",
		},

		// The experience interface for this experience.
		app: {
			// The ID of the app
			id: "xxxxxxxxxxx",

			// The name of the app
			name: "some string",

			// The icon for the app. This icon is shown on discovery, on the product page, on
			// checkout, and as a default icon for the experiences.
			icon: {
				// The original URL of the attachment, such as a direct link to S3. This should
				// never be displayed on the client and always passed to an Imgproxy transformer.
				sourceUrl: "some string",
			},
		},

		// The company that owns this experience.
		company: {
			// The ID (tag) of the company.
			id: "xxxxxxxxxxx",

			// The title of the company.
			title: "some string",
		},

		// The upsell type for the experience, if any.
		upsellType:
			"after_checkout" /* Valid values: after_checkout | before_checkout | only_in_whop */,

		// The upsell plan for the experience, if any.
		upsellPlan: {
			// The internal ID of the plan.
			id: "xxxxxxxxxxx",

			// The respective currency identifier for the plan.
			baseCurrency:
				"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,

			// The price a person has to pay for a plan on the renewal purchase.
			rawRenewalPrice: 10,

			// The price a person has to pay for a plan on the initial purchase.
			rawInitialPrice: 10,

			// How much the user has to pay on the first payment.
			initialPriceDue: 10,

			// When the plan was created.
			createdAt: 1716931200,

			// When the plan was last updated.
			updatedAt: 1716931200,

			// The interval at which the plan charges (renewal plans).
			billingPeriod: 10,

			// The number of free trial days added before a renewal plan.
			trialPeriodDays: 10,

			// The interval at which the plan charges (expiration plans).
			expirationDays: 10,

			// Limits/doesn't limit the number of units available for purchase.
			unlimitedStock: true,

			// The description of the Plan as seen by the customer on the checkout page.
			paymentLinkDescription: "some string",

			// This is the release method the business uses to sell this plan.
			releaseMethod: "buy_now" /* Valid values: buy_now | raffle | waitlist */,

			// The number of units available for purchase.
			stock: 10,

			// Shows or hides the plan from public/business view.
			visibility:
				"archived" /* Valid values: archived | hidden | quick_link | visible */,

			// Indicates if the plan is a one time payment or recurring.
			planType: "one_time" /* Valid values: one_time | renewal */,
		},
	},
};

```

# List Users For Experience
Source: https://dev.whop.com/sdk/api/experiences/list-users-for-experience

Fetch an experience.

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.listUsersForExperience({
	// The ID of the experience
	experienceId: "exp_XXXXXXXX" /* Required! */,

	after: "pageInfo.endCursor",

	before: "pageInfo.startCursor",

	direction: "asc" /* Valid values: asc | desc */,

	first: 10,

	searchQuery: "some string",
});

```

Example output:

```typescript
const response = {
	// Fetch an experience.
	publicExperience: {
		// The users that have access to this experience. This field will return nil if
		// you aren't authorized to view this experience's users. You must have a
		// membership or be a team member for the experience to view the user list.
		users: {
			// A list of nodes.
			nodes: [
				{
					// The internal ID of the user.
					id: "xxxxxxxxxxx",

					// The username of the user from their Whop account.
					username: "some string",

					// The user's profile picture
					profilePicture: {
						// The original URL of the attachment, such as a direct link to S3. This should
						// never be displayed on the client and always passed to an Imgproxy transformer.
						sourceUrl: "some string",
					},
				},
			],

			// Information to aid in pagination.
			pageInfo: {
				// When paginating forwards, the cursor to continue.
				endCursor: "some string",

				// When paginating forwards, are there more items?
				hasNextPage: true,

				// When paginating backwards, are there more items?
				hasPreviousPage: true,
			},

			// The total number of items in this connection.
			totalCount: 10,
		},
	},
};

```


# Create Forum Post
Source: https://dev.whop.com/sdk/api/forums/create-forum-post



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.createForumPost({
	input: {
		// The access pass (whop) to create this post in (leave empty if providing a
		// forum experience ID). This will look like prod_xxxx.
		accessPassId: "prod_XXXXXXXX",

		// The attachments for this post, such as videos or images.
		attachments: [
			{
				// This ID should be used the first time you upload an attachment. It is the ID
				// of the direct upload that was created when uploading the file to S3 via the
				// mediaDirectUpload mutation.
				directUploadId: "xxxxxxxxxxx",

				// The ID of an existing attachment object. Use this when updating a resource and
				// keeping a subset of the attachments. Don't use this unless you know what you're doing.
				id: "xxxxxxxxxxx",
			},
		],

		// The content of the post. This is the main body of the post. Hidden if paywalled.
		content: "some string" /* Required! */,

		// The ID of the forum experience to send the message in. (leave empty if
		// creating a new experience). This will look like exp_xxxx.
		forumExperienceId: "some string",

		// This is used to determine if the post should be sent as a 'mention'
		// notification to all of the users who are in the experience. This means that
		// anyone with 'mentions' enabled will receive a notification about this post.
		isMention: true,

		// The ID of the parent post, if applicable (Used when making a comment)
		parentId: "post_XXXXXXXX",

		// The amount to paywall this post by. A paywalled post requires the user to purchase it in order to view its content.
		paywallAmount: 10,

		// The currency to paywall this post by. A paywalled post requires the user to purchase it in order to view its content.
		paywallCurrency:
			"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,

		// Whether the post should be pinned
		pinned: true,

		// The poll for this post. A poll lets you collect responses to a multiple choice question.
		poll: {
			// The options for the poll. Must have sequential IDs starting from 1
			options: [
				{
					// Sequential ID for the poll option (starting from '1')
					id: "some string" /* Required! */,

					// The text of the poll option
					text: "some string" /* Required! */,
				},
			] /* Required! */,
		},

		// The title of the post. Visible if paywalled.
		title: "some string",
	},
});

```

Example output:

```typescript
const response = {
	// Creates a forum post
	createForumPost: {
		// The unique identifier for the entity
		id: "xxxxxxxxxxx",

		// The time the entity was created (in milliseconds since Unix epoch)
		createdAt: "9999999",

		// The time the entity was last updated (in milliseconds since Unix epoch)
		updatedAt: "9999999",

		// The text content of the forum post
		content: "some string",

		// The rich content of the forum post
		richContent: "some string",

		// Whether the entity has been deleted
		isDeleted: true,

		// The attachments to this message
		attachments: [
			{
				// The ID of the attachment
				id: "xxxxxxxxxxx",

				// The attachment's content type (e.g., image/jpg, video/mp4)
				contentType: "some string",

				// The original URL of the attachment, such as a direct link to S3. This should
				// never be displayed on the client and always passed to an Imgproxy transformer.
				sourceUrl: "some string",
			},
		],

		// Whether the forum post has been edited
		isEdited: true,

		// Whether this forum post is pinned
		isPinned: true,

		// The IDs of the users mentioned in this forum post
		mentionedUserIds: ["xxxxxxxxxxx"],

		// The ID of the parent forum post, if applicable
		parentId: "xxxxxxxxxxx",

		// The number of times this message has been viewed
		viewCount: 10,

		// The user who created this forum post
		user: {
			// The internal ID of the user.
			id: "xxxxxxxxxxx",

			// The name of the user from their Whop account.
			name: "some string",

			// The username of the user from their Whop account.
			username: "some string",

			// The user's profile picture
			profilePicture: {
				// The original URL of the attachment, such as a direct link to S3. This should
				// never be displayed on the client and always passed to an Imgproxy transformer.
				sourceUrl: "some string",
			},

			// Whether or not the user's phone is verified
			phoneVerified: true,

			// The city the user is from.
			city: "some string",

			// The country the user is from.
			country: "some string",
		},
	},
};

```


# Find Or Create Forum
Source: https://dev.whop.com/sdk/api/forums/find-or-create-forum



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.findOrCreateForum({
	input: {
		// The ID of the access pass (whop) to attach the experience to. It looks like prod_xxxx.
		accessPassId: "prod_XXXXXXXX",

		// The ID of an existing experience. If supplied, this new forum experience will
		// be attached to the first access pass (whop) of this experience. It looks like exp_xxxx.
		experienceId: "exp_XXXXXXXX",

		// The expiration date of the experience to be created. After this timestamp, the experience is deleted.
		expiresAt: 1716931200,

		// The name of the forum experience to be created, shown to the user on the UI.
		name: "some string" /* Required! */,

		// The upsell plan details to add for the forum experience. This allows you to
		// require paid access for the forum within the whop.
		price: {
			// The base currency of the upsell.
			baseCurrency:
				"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,

			// An array of custom field objects.
			customFields: [
				{
					// The type of the custom field.
					fieldType: "text" /* Valid values: text */ /* Required! */,

					// The ID of the custom field (if being updated)
					id: "xxxxxxxxxxx",

					// The name of the custom field.
					name: "some string" /* Required! */,

					// The order of the field.
					order: 10,

					// The placeholder value of the field.
					placeholder: "some string",

					// Whether or not the field is required.
					required: true,
				},
			],

			// The interval at which the plan charges (expiration plans).
			expirationDays: 10,

			// The price of the upsell.
			initialPrice: 10,

			// The method of release for the upsell.
			releaseMethod: "buy_now" /* Valid values: buy_now | raffle | waitlist */,
		},

		// This is who is allowed to create posts inside the forum. Select 'admin' if you
		// only want the team members to post, or select 'everyone' if any member of the
		// whop can post. Default value is 'admins'.
		whoCanPost: "admins" /* Valid values: admins | everyone */,
	},
});

```

Example output:

```typescript
const response = {
	// Creates a new forum experience. If an existing forum experience with the same
	// name on the whop already exists, it will be returned instead.
	createForum: {
		// The unique ID representing this experience
		id: "xxxxxxxxxxx",

		// Use this link to directly take users to the experience
		link: "some string",
	},
};

```


# List Forum Posts From Forum
Source: https://dev.whop.com/sdk/api/forums/list-forum-posts-from-forum

Fetch feed posts for the current user

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.listForumPostsFromForum({
	// The ID of the experience to fetch posts from
	experienceId: "exp_XXXXXXXX" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Fetch feed posts for the current user
	feedPosts: {
		// List of posts
		posts: [
			{
				// The unique identifier for the entity
				id: "xxxxxxxxxxx",

				// The time the entity was created (in milliseconds since Unix epoch)
				createdAt: "9999999",

				// The time the entity was last updated (in milliseconds since Unix epoch)
				updatedAt: "9999999",

				// The text content of the forum post
				content: "some string",

				// The rich content of the forum post
				richContent: "some string",

				// Whether the entity has been deleted
				isDeleted: true,

				// The attachments to this message
				attachments: [
					{
						// The ID of the attachment
						id: "xxxxxxxxxxx",

						// The attachment's content type (e.g., image/jpg, video/mp4)
						contentType: "some string",

						// The original URL of the attachment, such as a direct link to S3. This should
						// never be displayed on the client and always passed to an Imgproxy transformer.
						sourceUrl: "some string",
					},
				],

				// Whether the forum post has been edited
				isEdited: true,

				// Whether this forum post is pinned
				isPinned: true,

				// The IDs of the users mentioned in this forum post
				mentionedUserIds: ["xxxxxxxxxxx"],

				// The ID of the parent forum post, if applicable
				parentId: "xxxxxxxxxxx",

				// The number of times this message has been viewed
				viewCount: 10,

				// The user who created this forum post
				user: {
					// The internal ID of the user.
					id: "xxxxxxxxxxx",

					// The name of the user from their Whop account.
					name: "some string",

					// The username of the user from their Whop account.
					username: "some string",

					// The user's profile picture
					profilePicture: {
						// The original URL of the attachment, such as a direct link to S3. This should
						// never be displayed on the client and always passed to an Imgproxy transformer.
						sourceUrl: "some string",
					},

					// Whether or not the user's phone is verified
					phoneVerified: true,

					// The city the user is from.
					city: "some string",

					// The country the user is from.
					country: "some string",
				},
			},
		],
	},
};

```


# Send Push Notification
Source: https://dev.whop.com/sdk/api/notifications/send-push-notification



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.sendPushNotification({
	input: {
		// The ID of the company team to send the notification to
		companyTeamId: "biz_XXXXXXXX",

		// The content of the notification
		content: "some string" /* Required! */,

		// The ID of the experience to send the notification to
		experienceId: "exp_XXXXXXXX",

		// An external ID for the notification
		externalId: "some string",

		// Whether the notification is a mention
		isMention: true,

		// The link to open when the notification is clicked
		link: "some string",

		// The ID of the user sending the notification
		senderUserId: "user_XXXXXXXX",

		// The subtitle of the notification
		subtitle: "some string",

		// The title of the notification
		title: "some string" /* Required! */,

		// The IDs of the users to send the notification to.
		userIds: ["xxxxxxxxxxx"],
	},
});

```

Example output:

```typescript
const response = {
	// Sends a notification to an experience or company team
	sendNotification: true,
};

```


# Charge User
Source: https://dev.whop.com/sdk/api/payments/charge-user



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.chargeUser({
	input: {
		// The affiliate code to use for the checkout session
		affiliateCode: "some string",

		// The amount to charge the user
		amount: 10 /* Required! */,

		// The currency to charge in
		currency:
			"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */ /* Required! */,

		// The description of the charge. Maximum 200 characters.
		description: "some string",

		// Additional metadata for the charge
		metadata: { any: "json" },

		// The URL to redirect the user to after the checkout session is created
		redirectUrl: "some string",

		// The ID of the user to charge
		userId: "user_XXXXXXXX" /* Required! */,
	},
});

```

Example output:

```typescript
const response = {
	// Charges a user for a specified amount
	chargeUser: {
		// The status of the charge attempt
		status: "needs_action" /* Valid values: needs_action | success */,

		// The checkout session if additional action is needed
		inAppPurchase: {
			// The ID of the checkout session
			id: "xxxxxxxxxxx",

			// The ID of the plan to use for the checkout session
			planId: "xxxxxxxxxxx",
		},
	},
};

```


# Get Company Ledger Account
Source: https://dev.whop.com/sdk/api/payments/get-company-ledger-account

Fetch a company

<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getCompanyLedgerAccount({
	// ID of the company, either the tag (biz_xxx) or the page route (whop-dev)
	companyId: "biz_XXXXXXXX" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Fetch a company
	company: {
		// The ledger account for the company.
		// Roles: owner
		ledgerAccount: {
			// The ID of the LedgerAccount.
			id: "xxxxxxxxxxx",

			// The fee for transfers, if applicable.
			transferFee: 10,

			// The balances associated with the account.
			balanceCaches: {
				// A list of nodes.
				nodes: [
					{
						// The amount of the balance.
						balance: 10,

						// The amount of the balance that is pending.
						pendingBalance: 10,

						// The currency of the balance.
						currency:
							"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,
					},
				],
			},
		},
	},
};

```


# Get User Ledger Account
Source: https://dev.whop.com/sdk/api/payments/get-user-ledger-account

Returns the current user and company.

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getUserLedgerAccount();

```

Example output:

```typescript
const response = {
	// Returns the current user and company.
	viewer: {
		// The user the viewer is in scope of.
		user: {
			// The user's ledger account.
			ledgerAccount: {
				// The ID of the LedgerAccount.
				id: "xxxxxxxxxxx",

				// The fee for transfers, if applicable.
				transferFee: 10,

				// The balances associated with the account.
				balanceCaches: {
					// A list of nodes.
					nodes: [
						{
							// The amount of the balance.
							balance: 10,

							// The amount of the balance that is pending.
							pendingBalance: 10,

							// The currency of the balance.
							currency:
								"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */,
						},
					],
				},
			},
		},
	},
};

```


# Pay User
Source: https://dev.whop.com/sdk/api/payments/pay-user



<Note>This operation is only available on the server.</Note>

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.payUser({
	input: {
		// The amount to withdraw
		amount: 10 /* Required! */,

		// The currency that is being withdrawn.
		currency:
			"aed" /* Valid values: aed | all | amd | ape | ars | aud | bam | bgn | bhd | bob | brl | bsd | cad | chf | clp | cop | crc | czk | dkk | dop | dzd | egp | etb | eth | eur | gbp | ghs | gmd | gtq | gyd | hkd | huf | idr | ils | inr | jmd | jod | jpy | kes | khr | krw | kwd | lkr | mad | mdl | mga | mkd | mnt | mop | mur | mxn | myr | nad | ngn | nok | nzd | omr | pen | php | pkr | pln | pyg | qar | ron | rsd | rub | rwf | sar | sek | sgd | thb | tnd | try | ttd | twd | tzs | usd | uyu | uzs | vnd | xcd | xof | zar */ /* Required! */,

		// The ID of the destination (either a User tag, Bot tag, or LedgerAccount tag)
		destinationId: "xxxxxxxxxxx" /* Required! */,

		// The feed identifier to notify of the transfer.
		feedId: "feed_XXXXXXXX",

		// The feed type to notify of the transfer.
		feedType:
			"chat_feed" /* Valid values: chat_feed | dms_feed | forum_feed | livestream_feed | universal_post | user */,

		// A unique key to ensure idempotence. Use a UUID or similar.
		idempotenceKey: "some string" /* Required! */,

		// The ledger account id to transfer from.
		ledgerAccountId: "ldgr_XXXXXXXX" /* Required! */,

		// Notes for the transfer. Maximum of 50 characters.
		notes: "some string",

		// The reason for the transfer.
		reason:
			"bounty_payout" /* Valid values: bounty_payout | content_reward_fixed_payout | content_reward_payout | content_reward_return | creator_to_creator | creator_to_user | pool_top_up | team_member_payout | user_to_creator | user_to_user | wadmin_transferred_funds */,

		// The fee that the client thinks it is being charged for the transfer. Used to verify the fee.
		transferFee: 10,
	},
});

```

Example output:

```typescript
const response = {
	// Transfers funds between ledger accounts
	transferFunds: true,
};

```


# Get User
Source: https://dev.whop.com/sdk/api/users/get-user

Fetch a specific user.

```typescript
import { whopApi } from "@/lib/whop-api";

const result = await whopApi.getUser({
	// ID of the user by tag or the username.
	userId: "user_XXXXXXXX" /* Required! */,
});

```

Example output:

```typescript
const response = {
	// Fetch a specific user.
	publicUser: {
		// The internal ID of the user.
		id: "xxxxxxxxxxx",

		// The name of the user from their Whop account.
		name: "some string",

		// The username of the user from their Whop account.
		username: "some string",

		// The user's profile picture
		profilePicture: {
			// The original URL of the attachment, such as a direct link to S3. This should
			// never be displayed on the client and always passed to an Imgproxy transformer.
			sourceUrl: "some string",
		},

		// The city the user is from.
		city: "some string",

		// The country the user is from.
		country: "some string",

		// The user's bio
		bio: "some string",

		// Whether or not the user's phone is verified
		phoneVerified: true,

		// The user's banner image
		banner: {
			// The original URL of the attachment, such as a direct link to S3. This should
			// never be displayed on the client and always passed to an Imgproxy transformer.
			sourceUrl: "some string",
		},

		// When the user was created.
		createdAt: 1716931200,
	},
};

```


# Open External Links
Source: https://dev.whop.com/sdk/external-url

Open external links from within the iFrame

If you want to open external links from within the iFrame, you can use the `openExternalLinks` function. This will close your app and move to a new website.

## Usage

<Warning>
  This function requires the iFrame SDK to be initialized. See [**iFrame
  Overview**](/sdk/iframe-setup) for more information.
</Warning>

<CodeGroup>
  ```javascript React
  "use client";
  import { useIframeSdk } from "@whop/react";

  export default function Home() {
  	const iframeSdk = useIframeSdk();
  	
  	function openLink() {
  		iframeSdk.openExternalUrl({ url: "https://google.com" });
  	}
  	
  	return <button onClick={openLink}>Click me to open Google</button>;
  }
  ```

  ```javascript Vanilla JS
  import { iframeSdk } from "@/lib/iframe-sdk";

  const navigationButtonElement = document.querySelector("button");

  if (navigationButtonElement) {
    navigationButtonElement.addEventListener("click", () => {
      iframeSdk.openExternalUrl({ url: "https://google.com" });
    });
  }
  ```
</CodeGroup>

## User Profiles

If you want to display a whop user profile, you can use the `openExternalUrl` method
and pass their profile page link which looks like `https://whop.com/@username`.

The whop app will intercept this and instead display a modal containing their user profile.

<CodeGroup>
  ```javascript React
  "use client";
  import { useIframeSdk } from "@whop/react";

  export default function Home() {
  	const iframeSdk = useIframeSdk();
  	
  	function openLink() {
  		iframeSdk.openExternalUrl({ url: "https://whop.com/@j" });
  	}
  	
  	return <button onClick={openLink}>Click me to open Google</button>;
  }
  ```

  ```javascript Vanilla JS
  import { iframeSdk } from "@/lib/iframe-sdk";

  const navigationButtonElement = document.querySelector("button");

  if (navigationButtonElement) {
    navigationButtonElement.addEventListener("click", () => {
      iframeSdk.openExternalUrl({ url: "https://whop.com/@j" });
    });
  }
  ```
</CodeGroup>

<Info>
  You can also use a user ID instead of username. The final link should look
  like this: `https://whop.com/@user_XXXXXXXX`
</Info>

# Getting Started
Source: https://dev.whop.com/sdk/iframe-setup

Getting started with the Whop iFrame SDK

Whop apps are embedded into the site using iFrames. This SDK provides a type-safe way for you to communicate with the Whop application using a request/response style API powered by `window.postMessage`.

Since this package relies on `window.postMessage`, it only works in **Client Components**.

### Relevant Packages

* `@whop/iframe` - The main package for the iframe SDK.
* `@whop/react` - A React wrapper for Whop Apps including helpers for the iframe SDK.

***

## Setup

The main function exported from the `@whop/iframe` package is the `createSdk` function. When called, this function sets up a listener for messages from the main Whop site, using `window.on('message', ...)`. It is also exposed through the `WhopIframeSdkProvider` component from `@whop/react`.

### React

If you're using React, it is recommended to use the `WhopIframeSdkProvider` component from `@whop/react` to provide the iframe SDK to all child components.

<CodeGroup>
  ```javascript Step 1: Mount provider in root layout
  // app/layout.tsx
  import { WhopIframeSdkProvider } from "@whop/react";

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode,
  }) {
    return (
      <html lang="en">
        <body>
          <WhopIframeSdkProvider>{children}</WhopIframeSdkProvider>
        </body>
      </html>
    );
  }
  ```

  ```javascript Step 2: Consume the iframe SDK in a component
  // components/example.tsx
  import { useIframeSdk } from "@whop/react";

  export const Example = () => {
    const iframeSdk = useIframeSdk();

    return (
      <button
        onClick={() => iframeSdk.openExternalUrl({ url: "https://example.com" })}
      >
        Open External URL
      </button>
    );
  };
  ```
</CodeGroup>

### Other Frameworks

For other frameworks, you can use the `createSdk` function from `@whop/iframe` to create an instance of the iframe SDK.

<CodeGroup>
  ```javascript Step 1: Create the iframe SDK instance
  // lib/iframe-sdk.ts
  import { createSdk } from "@whop/iframe";

  export const iframeSdk = createSdk({
    appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  });
  ```

  ```javascript Step 2: Use the iframe SDK instance
  // index.ts
  import { iframeSdk } from "@/lib/iframe-sdk";

  const navigationButtonElement = document.querySelector("button");

  if (navigationButtonElement) {
    navigationButtonElement.addEventListener("click", () => {
      iframeSdk.openExternalUrl({ url: "https://example.com" });
    });
  }
  ```
</CodeGroup>

***

<Check>We have now setup the SDK and iFrame.</Check>


# Installation
Source: https://dev.whop.com/sdk/installation

Getting started developing an App on Whop

We recommend you use our TS SDK to build your app. It's a wrapper around our GraphQL API. We have hand-crafted SDK functions that make it easy to use our API.

<CodeGroup>
  ```bash pnpm
  pnpm install @whop/api && pnpm install -D @whop-apps/dev-proxy
  ```

  ```bash npm
  npm install @whop/api && npm install -D @whop-apps/dev-proxy
  ```

  ```bash yarn
  yarn add @whop/api && yarn add -D @whop-apps/dev-proxy
  ```
</CodeGroup>

***


# Local development
Source: https://dev.whop.com/sdk/local-development

Run your local setup inside of a Whop iFrame with the Whop proxy

If you are building a Whop app inside of our website, you can use this proxy to run your local setup inside of a Whop iFrame. You can use this proxy with any application written in any language, not just javascript.

### Install

<CodeGroup>
  ```bash pnpm
  pnpm add @whop-apps/dev-proxy
  ```

  ```bash npm
  npm install @whop-apps/dev-proxy
  ```

  ```bash yarn
  yarn add @whop-apps/dev-proxy
  ```
</CodeGroup>

### Run

<CodeGroup>
  ```bash pnpm
  pnpm whop-proxy
  ```

  ```bash npm
  npm run whop-proxy
  ```

  ```bash yarn
  yarn whop-proxy
  ```
</CodeGroup>

<Note>
  If you are using **NPM**, you need to add `"whop-proxy": "whop-proxy"` to
  the **scripts** section of your `package.json` file.
</Note>

### If you are running a running any app with a `pnpm dev` script:

<Note>
  If you are using **NPM**, you need to add `"whop-proxy": "whop-proxy"` to
  the **scripts** section of your `package.json` file.
</Note>

<CodeGroup>
  ```bash pnpm
  pnpm whop-proxy
  ```

  ```bash npm
  npm run whop-proxy
  ```

  ```bash yarn
  yarn whop-proxy
  ```
</CodeGroup>

### If you are running an app that does not have a `pnpm dev` script, for example, a Ruby on Rails app on port 3001:

<CodeGroup>
  ```bash pnpm
  pnpm whop-proxy --proxyPort=3000 --upstreamPort=3001 --command="sleep 3d"
  ```

  ```bash npm
  npm whop-proxy --proxyPort=3000 --upstreamPort=3001 --command="sleep 3d"
  ```

  ```bash yarn
  yarn whop-proxy --proxyPort=3000 --upstreamPort=3001 --command="sleep 3"
  ```
</CodeGroup>

### Configure

The proxy can be configured using the following command line options:

```bash
Usage: pnpm whop-proxy [options]

Options:

--proxyPort <port>      The port the proxy should listen on (3000 by default)
--upstreamPort <port>   The port the upstream server is listening on (set automatically by default)
--npmCommand <command>  The npm command to run to start the upstream server (dev by default)
--command <command>     The command to run to start the upstream server (npm run dev by default)
```


# Retrieve current user
Source: https://dev.whop.com/sdk/retrieve-current-user

Retrieve the public profile information for the currently logged in user

<CodeGroup>
  ```javascript Next.js
  // app/experiences/[experienceId]/page.tsx

  import { whopApi } from "@/lib/whop-api";
  import { headers } from "next/headers";

  const headersList = await headers();

  // Extract the user ID (this will extract the user ID from the headers for you)
  const { userId } = await verifyUserToken(headersList);

  // Load the user's public profile information
  const user = (await whopApi.retrieveUser({userId: userId})).publicUser;

  console.log(user);
  ```
</CodeGroup>

### Not using the Whop TS SDK?

<Accordion title="How to authenticate users in other languages">
  In order to retrieve the current user's ID, you need to decrypt a JWT token that is stored in the `x-whop-user-token` header. `VerifyUserToken` is a helper function in our TS SDK that decodes the JWT token and returns the user's ID.

  If are using a different framework and do not have access to the Typescript Whop SDK, you will need to implement your own JWT decoding logic. Here is an example of how to do this in Ruby on Rails:

  ```ruby Ruby on Rails
  require 'jwt'
  require 'openssl'

  # This is a static public key that is used to decode the JWT token
  # You can put this into your application
  JWT_PEM = <<~PEM.freeze
    -----BEGIN PUBLIC KEY-----
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErz8a8vxvexHC0TLT91g7llOdDOsN
    uYiGEfic4Qhni+HMfRBuUphOh7F3k8QgwZc9UlL0AHmyYqtbhL9NuJes6w==
    -----END PUBLIC KEY-----
  PEM

  # In your controller
  user_token = request.headers["x-whop-user-token"]
  return if user_token.blank?

  key = OpenSSL::PKey::EC.new(JWT_PEM)
  payload, _header = JWT.decode user_token, key, true, {
    iss: "urn:whopcom:exp-proxy",
    verify_iss: true,
    algorithm: "ES256"
  }

  jwt_app_id = payload["aud"]

  # WARNING! You must set the WHOP_APP_ID environment variable in your application.
  # This looks like app_xxxx.
  return if jwt_app_id != ENV.fetch("WHOP_APP_ID")

  jwt_user_id = payload["sub"]
  ```
</Accordion>


# Validate access
Source: https://dev.whop.com/sdk/validate-access

Use this API to ensure users have access to use your app

Validate access to an embedded web app:

<CodeGroup>
  ```javascript Next.js
  import { whopApi } from "@/lib/whop-api";
  import { verifyUserToken } from "@whop/api";
  import { headers } from "next/headers";

  // The headers contains the user token
  const headersList = await headers();

  // The experienceId is a path param
  // This can be configured in the Whop Dashboard, when you define your app
  const { experienceId } = await params;

  // The user token is in the headers
  const { userId } = await verifyUserToken(headersList);


  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  if (!result.hasAccessToExperience.hasAccess) {
    return <div>You do not have access to this experience</div>;
  }

  // Either: 'admin' | 'customer' | 'no_access';
  // 'admin' means the user is an admin of the whop, such as an owner or moderator
  // 'customer' means the user is a common member in this whop
  // 'no_access' means the user does not have access to the whop
  const { accessLevel } = result.hasAccessToExperience;

  if (accessLevel === "admin") {
    return <div>You are an admin of this experience</div>;
  }

  if (accessLevel === "customer") {
    return <div>You are a customer of this experience</div>;
  }

  return <div>You do not have access to this experience</div>
  ```
</CodeGroup>


# Set up the API client
Source: https://dev.whop.com/sdk/whop-api-client

We provide a TS client that makes it super easy to use our API. We highly recommend you use this client.

Our SDK makes it simple to use our API. It's a wrapper around our GraphQL API with pre-built functions for all of our endpoints. The endpoints are outlined in the SDK reference section of our docs.

### Install

<CodeGroup>
  ```bash pnpm
  pnpm add @whop-apps/sdk
  ```

  ```bash npm
  npm install @whop-apps/sdk
  ```

  ```bash yarn
  yarn add @whop-apps/sdk
  ```
</CodeGroup>

### Setup your client

Create a new file that instantiates the client and exports it. We recommend putting this file at `lib/whop-api.ts`.

This file reads your ENV keys, which can be found on your app developer page on the Whop dashboard.

```ts
import { WhopServerSdk, makeUserTokenVerifier } from "@whop/api";

export const whopApi = WhopServerSdk({
  // Add your app api key here - this is required.
  // You can get this from the Whop dashboard after creating an app in the "API Keys" section.
  appApiKey: process.env.WHOP_API_KEY ?? "fallback",

  // This will make api requests on behalf of this user.
  // This is optional, however most api requests need to be made on behalf of a user.
  // You can create an agent user for your app, and use their userId here.
  // You can also apply a different userId later with the `withUser` function.
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,

  // This is the companyId that will be used for the api requests.
  // When making api requests that query or mutate data about a company, you need to specify the companyId.
  // This is optional, however if not specified certain requests will fail.
  // This can also be applied later with the `withCompany` function.
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "fallback",
  dontThrow: true,
});
```

### Example usage

The rest of the examples in this section will use this client and import it from `lib/whop-api.ts`.

Here is an example

```ts
import { whopApi } from "./lib/whop-api";

const user = await whopApi.getCurrentUser();
```