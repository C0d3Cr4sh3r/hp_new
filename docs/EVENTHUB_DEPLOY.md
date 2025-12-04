EventHub (external) deployment
=================================

This project (`hp_new`) integrates an external EventHub CMS. The site expects the environment variable `NEXT_PUBLIC_EVENTHUB_URL` to point to the EventHub deployment (e.g. a Vercel URL).

When you deploy EventHub to Vercel follow these steps:

1. Deploy the `eventhub_client/cms-portal` to Vercel (see `eventhub_client/cms-portal/DEPLOYMENT.md`).
2. Copy the resulting URL (for example `https://eventhub-cms-yourname.vercel.app`).
3. In the `hp_new` deployment environment (Vercel, server, etc.) add an environment variable:

   NEXT_PUBLIC_EVENTHUB_URL=https://eventhub-cms-yourname.vercel.app

4. Restart `hp_new` so the navigation picks up the new URL.

Notes
- The code already supports falling back to internal `/eventhub` routes when the env var is not set.
- In production it's recommended to use the same domain or a subdomain to avoid cross-site cookie issues if you plan to share authentication.

