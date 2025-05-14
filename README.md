# AI Chat Application

A full-featured AI-powered chat application built with Next.js, React Server Components, and Supabase. Leverage multiple LLM providers (OpenAI, Anthropic, Hugging Face, or custom models via LangChain) with streaming chat UI powered by the Vercel AI SDK.

## Features

* **Next.js App Router** for nested layouts and file-based routing.
* **React Server Components (RSCs), Suspense, and Server Actions** for efficient data fetching and UI rendering.
* **Streaming Chat UI** using the Vercel AI SDK.
* **Multiple Model Providers**: switch between OpenAI (default), Anthropic, Hugging Face, or your own LangChain integrations.
* **Edge Runtime–Ready** for low-latency responses.
* **Tailwind CSS** for utility-first styling, integrated with **shadcn/ui** components.
* **Radix UI** primitives for accessibility and headless component patterns.
* **Phosphor Icons** for crisp, customizable icons.
* **User Authentication** powered by Supabase Auth.
* **Chat History Persistence** in Supabase Postgres.

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) 18.x or higher
* [pnpm](https://pnpm.io/) (or npm/yarn)
* [Supabase CLI](https://supabase.com/docs/guides/cli)
* A Supabase project with Auth and Database enabled
* OpenAI, Anthropic, and/or Hugging Face API keys (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example env file and update values:

```bash
cp .env.example .env
```

Fill in the following variables in `.env`:

```ini
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_API_PROVIDER=openai         # or anthropic, hf
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
HF_API_KEY=your-huggingface-key
```

> **Note:** Never commit your `.env` file to version control.

### 4. Start Supabase Locally (Optional)

If you want to run Supabase locally:

```bash
npx supabase start
```

### 5. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Deployment

This application is optimized for deployment on Vercel (Edge runtime supported). Simply connect your GitHub repository to Vercel, set environment variables in the Vercel dashboard, and deploy.

## Customizing AI Models

By default, the project uses OpenAI `gpt-3.5-turbo`. To switch providers:

1. Change `AI_API_PROVIDER` in your `.env`.
2. Install any necessary SDKs or configure LangChain adapters in `lib/ai.ts`.
3. Adjust model parameters in `app/api/chat/route.ts`.

## UI Components

* Built-in UI primitives from **Radix UI** and **shadcn/ui**.
* Styled with **Tailwind CSS**.
* Icons courtesy of **Phosphor Icons**.

## Authors

* David laffey
* Contributed by the Next.js & Vercel teams and the open-source community

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.


