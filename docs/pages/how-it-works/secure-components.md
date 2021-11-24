---
id: "how-secure-components-work"
title: "Deep Dive into Secure Components"
sidebar_label: "Secure Components"
sidebar_position: 5
---
<!--
  ~ Copyright by LunaSec (owned by Refinery Labs, Inc)
  ~
  ~ Licensed under the Creative Commons Attribution-ShareAlike 4.0 International
  ~ (the "License"); you may not use this file except in compliance with the
  ~ License. You may obtain a copy of the License at
  ~
  ~ https://creativecommons.org/licenses/by-sa/4.0/legalcode
  ~
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
  ~
-->
#### Quick Into / TL;DR

When the browser mounts a LunaSec React element from `@lunasec/react-sdk`, such as `<SecureInput>`, it creates an iFrame that loads from the
`Dedicated Tokenizer`. This cross-domain iFrame on the page can only communicate with the SDK through secure Post Messages.  This is our
trusted environment to handle sensitive data. The SDK, running as part of your code
in the browser, sends the Secure Frame (iFrame) information it needs like styling information copied from your app, a token
to display if desired, any validations that need to run, etc.

:::tip Supported Frameworks
React is fully supported and a Vue SDK is in pre-alpha.  A generic web-component based SDK for use with any framework is on the roadmap.
:::
## iFrame based security
LunaSec makes it difficult for your front-end web application to leak sensitive data to somebody attacking it.
Even if somebody manages to hack your website and inject their own malicious Javascript code into it, they
aren't able to decrypt the sensitive data that your site displays. The only information that an attacker sees is an
opaque LunaSec Token.

But, while it's painful an attacker, it's easy for you to implement. You just swap out React elements like an `<input>`
with the LunaSec equivalent `<SecureInput>`.

Behind the scenes, those components create cross-origin `iFrames`.  The iFrames communicate with your application over a 
`postmessage` based communication system, implemented behind the scenes.  They copy and imitate the CSS styling of your page and
attempt to mimic other browser behaviors like focus/blur, in addition creating and retrieving Lunasec Tokens.

### Adding Secure Elements to your Application

Starting with React code like this:
```jsx title="normal-form.tsx"
import React from 'react';

export function renderInsecureComponent(props) {
  return (
    <form onSubmit={props.onSubmit}>
      <input type="text" value={props.value} onChange={props.onChange} name="ssn" />
      <input type="submit" />
    </form>
  );
}
```

You swap out elements dealing with sensitive data with drop-in replacements like this:
```tsx title="secure-form.tsx"
import React from 'react';
import {SecureForm, SecureInput} from '@lunasec/react-sdk';

// The returned output from SecureInput is now a token instead of the actual SSN.
// And, if a token is passed to this component, it will automatically be detokenized (or fail if the user is unauthorized).
export function renderSecureComponent(props) {
  return (
    <SecureForm onSubmit={props.onSubmit}>
      <SecureInput type="text" token={props.value} onChange={props.onChange} onError={props.onError} name="ssn" />
      <input type="submit" />
    </SecureForm>
  );
}
````

Now your application is protected against vulnerabilities like
[Cross-Site Scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) (XSS) automatically.

### User Experience
 
Simply replacing an `<input>` element with an `<iframe>` would result in your `<form>`
no longer functioning at all.

That's where LunaSec comes in. We've spent a _lot_ of time re-implementing the APIs of common HTML elements like
`<input>` in our Secure Components SDK. Components reserve CSS styling, lifecycle hooks like `onBlur`, and even perform validation on the data. 
It's designed to work 1:1 with existing apps to make migrating to LunaSec simple.  Our demo app shows `<SecureInput>`

### Why is splitting data across websites more secure?

As we've covered, LunaSec relies on the strong protections that web browsers use in order to isolate data on different websites.  The iFrame
that LunaSec creates is protected by a very strict CSP (content security policy).  

One of the main protections of the CSP is the
[Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). It's the functionality 
that prevents a random website from reading the data from another one, such as your bank or your email.

Maintaining the usefulness of the CSP in a large, real world application is difficult or sometimes downright impossible. 
In order to activate the strong protections granted by the Same-Origin Policy, LunaSec handles sensitive data only in that separate site (the iFrame).
Fortunately, subdomains count as 2 different domains, and that's what we'll use in our examples.

Let's imagine: 
One domain runs your application (`app.your-domain.com`).

The other runs the LunaSec "Secure Frame" (`secure-frame.your-second-domain.com`).

Under the hood of the LunaSec React SDK, you're actually embedding LunaSec into your application via an `<iframe>`.
Your application is then only interacting with LunaSec via a cross-origin `postMessage` call. `postMessage` is a
[secure API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) provided by your browser to make
cross-origin communication possible.