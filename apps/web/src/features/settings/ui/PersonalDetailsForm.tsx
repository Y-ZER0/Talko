"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAccount } from "../context/AccountContext";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStatusField } from "./ProfileStatusField";

const personalDetailsSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50),
  username: z.string().min(1, "Username is required").max(30).regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, hyphens, underscores"),
  location: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
  about: z.string().max(240).optional(),
  status: z.string().max(120).optional(),
});

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  displayName: string;
  username: string;
  email: string;
  location?: string;
  website?: string;
  about?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  userId: string;
  isOnline?: boolean;
  onSubmit: (data: PersonalDetailsFormData) => Promise<void>;
}

const ABOUT_MAX_LENGTH = 240;

export function PersonalDetailsForm({
  displayName,
  username,
  email,
  location = "",
  website = "",
  about = "",
  avatarUrl,
  coverUrl,
  userId,
  isOnline = false,
  onSubmit,
}: PersonalDetailsFormProps) {
  const { setHasUnsavedChanges, registerSaveHandler } = useAccount();

  const methods = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      displayName,
      username,
      location,
      website,
      about,
      status: "",
    },
  });

  const { handleSubmit, watch, formState: { isDirty, isValid } } = methods;

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  useEffect(() => {
    registerSaveHandler(handleSubmit(onSubmit));
  }, [handleSubmit, onSubmit, registerSaveHandler]);

  return (
    <FormProvider {...methods}>
      <ProfileHeader
        displayName={displayName}
        username={username}
        userId={userId}
        avatarUrl={avatarUrl}
        coverUrl={coverUrl}
        isOnline={isOnline}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-surface rounded-2xl p-6">
          <h3 className="text-base font-semibold text-text m-0 mb-1">
            Personal details
          </h3>
          <p className="text-sm text-text-muted m-0 mb-6">
            This information is visible to people you chat with.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Display Name"
              icon="@"
              name="displayName"
            />
            <FormField
              label="Username"
              icon="@"
              name="username"
            />
            <FormField
              label="Email"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
              name="email"
              disabled
            />
            <FormField
              label="Location"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
              name="location"
              placeholder="Milan, IT"
            />
          </div>

          <div className="mt-4">
            <FormField
              label="Website"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              }
              name="website"
              placeholder="elena.studio"
            />
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-medium text-text-muted tracking-label uppercase mb-2">
              About
            </label>
            <div className="relative">
              <textarea
                {...methods.register("about")}
                rows={4}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl font-sans text-base text-text resize-y outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 box-border"
              />
              <span className="absolute bottom-2 right-3 font-mono text-[11px] text-text-muted">
                {watch("about")?.length || 0} / {ABOUT_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  name: string;
  disabled?: boolean;
  placeholder?: string;
}

function FormField({ label, icon, name, disabled = false, placeholder }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-text-muted tracking-label uppercase mb-2">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-text-muted flex items-center pointer-events-none">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          className="w-full py-3 pl-9 pr-4 bg-surface border border-border rounded-xl font-sans text-base text-text outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed box-border"
        />
      </div>
    </div>
  );
}
