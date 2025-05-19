<div align="center">
  <img src="assets/logo.svg" alt="CanvasToolkit Logo" width="128"/>
</div>
<h1 align="center">CanvasToolkit</h1>
<div align="center">
  <a href="https://nextjs.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Next.js-black?logo=next.js" alt="Next.js"></a>
  <a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://zod.dev/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Zod-000000?logo=zod&logoColor=white" alt="Zod"></a>
  <a href="https://developer.chrome.com/docs/extensions/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Chrome--Extension-blue?logo=google-chrome" alt="Chrome Extension"></a>
  <a href="https://supabase.io/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://stripe.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white" alt="Stripe"></a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://vercel.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Vercel-black?logo=vercel&logoColor=white" alt="Vercel"></a>
  <a href="https://www.framer.com/motion/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Framer%20Motion-black?logo=framer&logoColor=white" alt="Framer Motion"></a>
  <a href="https://openai.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white" alt="OpenAI"></a>
</div>

---

A student-focused Chrome extension and Next.js website that seamlessly integrates AI into Canvas LMS. Get real-time quiz assistance, automate workflows, and minimize intrusive monitoring.

---

## Product Links

-   **Website**: <a href="https://canvastoolkit.com" target="_blank">canvastoolkit.com</a>
-   **Chrome Extension:**

---

## Tech Stack

-   **Next.js**
-   **Tailwind CSS**
-   **Framer Motion**
-   **Zod**
-   **Chrome APIs** - Utilizes Manifest v3 features including scripting, content scripts, context menus, storage, and service workers.
-   **Stripe** - Handles payment processing, webhooks, and customer portal integration.
-   **Supabase** - Handles user authentication, stores user profiles (credits, subscription metadata), and runs an Edge Function proxy for securely calling the OpenRouter API.
-   **OpenRouter API** - Interfaces with models from OpenAI, Anthropic, Google, and Deepseek.
-   **JavaScript/HTML/CSS**

---

## Project Structure

```text
canvas-toolkit/
├── extension/
│   ├── manifest.json
│   ├── public/
│   └── src/
│       ├── background/
│       ├── content/
│       ├── lib/
│       ├── popup/
│       └── utils/
│
└── web/
    ├── package.json
    ├── public/images
    └── src/
        ├── app/
        │   ├── account/
        │   ├── api/
        │   ├── login/
        │   ├── privacy/
        │   ├── globals.css
        │   ├── layout.tsx
        │   └── page.tsx
        ├── components/
        ├── lib/
        └── utils/supabase
```

---

## Installation

1. **Clone the repo**

    ```bash
    git clone https://github.com/siddharthmr/canvastoolkit.git
    ```

2. **Install web app dependencies**

    ```bash
    cd web
    npm install
    ```

3. **Load the extension**

    - Open `chrome://extensions`
    - Enable **Developer mode**
    - Click **Load unpacked** and select the `extension/` folder

4. **Run the dashboard locally**

    ```bash
    npm run dev
    ```

---

## Configuration

1. Create a `.env.local` file in the `web/` directory.
2. Fill in your keys:

    ```ini
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

     STRIPE_SECRET_KEY=your-stripe-secret-key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key
     STRIPE_WEBHOOK_SECRET=your-webhook-secret

     NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
