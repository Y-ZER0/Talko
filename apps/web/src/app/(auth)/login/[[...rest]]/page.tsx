"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-text flex items-center justify-center mb-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-text m-0">Welcome back</h1>
        <p className="text-sm text-text-muted m-2">Sign in to continue to Talko</p>
      </div>

      <SignIn
        routing="path"
        path="/login"
        appearance={{
          elements: {
            rootBox: "bg-surface rounded-2xl p-6 border border-border",
            card: "bg-transparent shadow-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "bg-surface border border-border rounded-xl text-text font-sans text-sm font-medium py-2.5 px-4 normal-case hover:bg-surface-muted",
            socialButtonsBlockButtonText: "font-sans text-sm font-medium",
            dividerLine: "bg-border",
            dividerText: "text-text-muted text-xs font-sans",
            formFieldLabel: "font-mono text-xs font-medium text-text-muted tracking-label uppercase",
            formFieldInput: "bg-surface border border-border rounded-xl text-text font-sans text-base py-3 px-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10",
            formButtonPrimary: "bg-primary-500 rounded-full font-sans text-sm font-semibold py-3 px-6 normal-case hover:bg-primary-600",
            footerActionLink: "text-primary-500 font-sans text-sm font-medium hover:text-primary-600",
            identityPreviewEditButton: "text-primary-500",
            formResendCodeLink: "text-primary-500",
          },
        }}
      />
    </div>
  );
}
