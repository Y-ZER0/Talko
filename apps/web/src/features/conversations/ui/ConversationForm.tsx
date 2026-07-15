"use client";

import { type ReactNode } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import type { CreateConversationRequest } from "../services/conversation.service";
import type { CreateConversationResponseDto } from "@repo/shared";

const directMessageSchema = z.object({
  participantId: z.string().min(1, "User ID is required").trim(),
});

const groupChatSchema = z.object({
  groupName: z
    .string()
    .min(1, "Group name is required")
    .max(50, "Group name must be 50 characters or less")
    .trim(),
  participantIds: z.string().min(1, "At least one participant is required").trim(),
});

type DirectMessageFormData = z.infer<typeof directMessageSchema>;
type GroupChatFormData = z.infer<typeof groupChatSchema>;

const inputClass =
  "w-full px-4 py-3 bg-surface border border-border rounded-xl font-sans text-base text-text placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: { message?: string };
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium text-text-muted tracking-label uppercase mb-2"
      >
        {label}
      </label>
      {children}
      {error?.message && (
        <p className="mt-1 text-xs text-danger">{error.message}</p>
      )}
    </div>
  );
}

function FormActions({
  onCancel,
  isPending,
}: {
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2.5 rounded-full text-sm font-medium text-text-muted hover:bg-surface-muted transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 rounded-full bg-primary-500 text-text-inverse font-semibold text-sm hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating..." : "Start"}
      </button>
    </div>
  );
}

function DirectMessageForm({
  onCreated,
  onClose,
  mutate,
  isPending,
  error,
}: {
  onCreated: (id: string) => void;
  onClose: () => void;
  mutate: UseMutateFunction<CreateConversationResponseDto, Error, CreateConversationRequest>;
  isPending: boolean;
  error: Error | null;
}) {
  const methods = useForm<DirectMessageFormData>({
    resolver: zodResolver(directMessageSchema),
    defaultValues: { participantId: "" },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = (data: DirectMessageFormData) => {
    mutate(
      { type: "direct", participantId: data.participantId },
      {
        onSuccess: (result) => {
          onCreated(result.id);
          onClose();
          methods.reset();
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="User ID" htmlFor="participant-id" error={errors.participantId}>
          <input
            id="participant-id"
            type="text"
            placeholder="Enter user ID..."
            {...register("participantId")}
            className={inputClass}
          />
        </FormField>

        {error && <p className="text-danger text-sm mb-4">{error.message}</p>}

        <FormActions onCancel={onClose} isPending={isPending} />
      </form>
    </FormProvider>
  );
}

function GroupChatForm({
  onCreated,
  onClose,
  mutate,
  isPending,
  error,
}: {
  onCreated: (id: string) => void;
  onClose: () => void;
  mutate: UseMutateFunction<CreateConversationResponseDto, Error, CreateConversationRequest>;
  isPending: boolean;
  error: Error | null;
}) {
  const methods = useForm<GroupChatFormData>({
    resolver: zodResolver(groupChatSchema),
    defaultValues: { groupName: "", participantIds: "" },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = (data: GroupChatFormData) => {
    const ids = data.participantIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) return;

    mutate(
      { type: "group", participantIds: ids, groupName: data.groupName },
      {
        onSuccess: (result) => {
          onCreated(result.id);
          onClose();
          methods.reset();
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Group Name" htmlFor="group-name" error={errors.groupName}>
          <input
            id="group-name"
            type="text"
            placeholder="Enter group name..."
            {...register("groupName")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Participant IDs (comma-separated)"
          htmlFor="participant-ids"
          error={errors.participantIds}
        >
          <input
            id="participant-ids"
            type="text"
            placeholder="user-id-1, user-id-2..."
            {...register("participantIds")}
            className={inputClass}
          />
        </FormField>

        {error && <p className="text-danger text-sm mb-4">{error.message}</p>}

        <FormActions onCancel={onClose} isPending={isPending} />
      </form>
    </FormProvider>
  );
}

export { DirectMessageForm, GroupChatForm };
