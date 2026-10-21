"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  CalendarDays,
  Check,
  Eye,
  Flame,
  MapPin,
  MessageSquare,
  Send,
  Share2,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
} from "lucide-react";

import {
  addRequestComment,
  deleteRequestComment,
  toggleRequestReaction,
  toggleRequestSupport,
} from "@/app/(site)/requests/community/actions";
import { Badge } from "@/components/ui";
import {
  EMPTY_REACTIONS,
  PRIORITY_TIER_META,
  REACTION_META,
  calculatePriorityScore,
  extractRequestPostcode,
  getPriorityTier,
} from "@/lib/community-utils";
import { formatDate, humanize, statusTone } from "@/lib/format";
import type {
  PublicRequest,
  ReactionCounts,
  ReactionKind,
  RequestComment,
} from "@/lib/types";

const STEPS = ["submitted", "under_review", "in_progress", "resolved"] as const;

const QUICK_COMMENT_PROMPTS = [
  "Confirmed on our section of the street — requires urgent attention.",
  "Still unresolved today; commuters and households are affected.",
  "Creates a nighttime safety hazard for pedestrians.",
] as const;

function ReactionIcon({
  kind,
  className = "",
}: {
  kind: ReactionKind;
  className?: string;
}) {
  if (kind === "urgent") return <Flame size={13} className={className} />;
  if (kind === "affected") return <Users size={13} className={className} />;
  if (kind === "safety")
    return <AlertTriangle size={13} className={className} />;
  return <Eye size={13} className={className} />;
}

type CommunityFeedCardProps = {
  request: PublicRequest;
  supported: boolean;
  isSignedIn: boolean;
  returnTo: string;
  rank?: number;
  defaultExpandedComments?: boolean;
  isDetailView?: boolean;
};

export function CommunityFeedCard({
  request,
  supported: initialSupported,
  isSignedIn,
  returnTo,
  rank,
  defaultExpandedComments = false,
  isDetailView = false,
}: CommunityFeedCardProps) {
  const [supported, setSupported] = useState(initialSupported);
  const [supportCount, setSupportCount] = useState(request.support_count ?? 0);
  const [reactions, setReactions] = useState<ReactionCounts>(
    request.reactions ?? { ...EMPTY_REACTIONS },
  );
  const [myReactions, setMyReactions] = useState<ReactionKind[]>(
    request.my_reactions ?? [],
  );
  const [comments, setComments] = useState<RequestComment[]>(
    request.comments ?? [],
  );
  const [commentCount, setCommentCount] = useState(
    request.comment_count ?? (request.comments?.length ?? 0),
  );
  const [commentsOpen, setCommentsOpen] = useState(
    defaultExpandedComments || (request.comments?.length ?? 0) > 0,
  );

  // Comment composer state
  const [commentBody, setCommentBody] = useState("");
  const [isMeToo, setIsMeToo] = useState(true);
  const [showFirstName, setShowFirstName] = useState(false);
  const [commentPostcode, setCommentPostcode] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    text: string;
    loginUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [isPendingSupport, startSupportTransition] = useTransition();
  const [pendingReaction, setPendingReaction] = useState<ReactionKind | null>(
    null,
  );
  const [submittingComment, setSubmittingComment] = useState(false);

  const { cleanDescription, postcode: extractedPostcode } =
    extractRequestPostcode(request.description);

  const livePriorityScore = calculatePriorityScore(
    supportCount,
    reactions,
    commentCount,
  );
  const livePriorityTier = getPriorityTier(livePriorityScore);
  const tierMeta = PRIORITY_TIER_META[livePriorityTier];

  const status = request.status ?? "submitted";
  const stepIndex =
    status === "closed"
      ? STEPS.length - 1
      : Math.max(0, STEPS.indexOf(status as (typeof STEPS)[number]));

  const nextThreshold = tierMeta.nextThreshold;
  const progressPercent = nextThreshold
    ? Math.min(100, Math.round((livePriorityScore / nextThreshold) * 100))
    : 100;

  function handleSupportToggle() {
    setFeedback(null);
    if (!isSignedIn) {
      setFeedback({
        tone: "error",
        text: "Sign in to endorse this request and raise its dispatch priority.",
        loginUrl: `/login?next=${encodeURIComponent(returnTo)}`,
      });
      return;
    }

    const formData = new FormData();
    formData.set("id", request.id);
    formData.set("return_to", returnTo);
    formData.set("count", String(supportCount));

    startSupportTransition(async () => {
      const res = await toggleRequestSupport(null, formData);
      if (res?.ok) {
        setSupported(Boolean(res.supported));
        if (typeof res.count === "number") {
          setSupportCount(res.count);
        }
      } else if (res?.message) {
        setFeedback({ tone: "error", text: res.message });
      }
    });
  }

  async function handleReactionToggle(kind: ReactionKind) {
    setFeedback(null);
    if (!isSignedIn) {
      setFeedback({
        tone: "error",
        text: "Sign in to log a civic signal and escalate this request.",
        loginUrl: `/login?next=${encodeURIComponent(returnTo)}`,
      });
      return;
    }

    setPendingReaction(kind);
    try {
      const res = await toggleRequestReaction({
        requestId: request.id,
        reaction: kind,
        returnTo,
      });

      if (res.requiresAuth && res.loginUrl) {
        setFeedback({
          tone: "error",
          text: res.message || "Sign in required.",
          loginUrl: res.loginUrl,
        });
        return;
      }

      if (res.ok && res.reactions && res.myReactions) {
        setReactions(res.reactions);
        setMyReactions(res.myReactions);
      } else if (res.message) {
        setFeedback({ tone: "error", text: res.message });
      }
    } finally {
      setPendingReaction(null);
    }
  }

  async function handleAddComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    if (!isSignedIn) {
      setFeedback({
        tone: "error",
        text: "Sign in to add a field note or corroborate this issue.",
        loginUrl: `/login?next=${encodeURIComponent(returnTo)}`,
      });
      return;
    }

    if (commentBody.trim().length < 2) {
      setFeedback({
        tone: "error",
        text: "Please enter a brief field note (at least 2 characters).",
      });
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await addRequestComment({
        requestId: request.id,
        body: commentBody,
        isMeToo,
        postcode: commentPostcode || null,
        showFirstName,
        returnTo,
      });

      if (res.requiresAuth && res.loginUrl) {
        setFeedback({
          tone: "error",
          text: res.message || "Sign in required.",
          loginUrl: res.loginUrl,
        });
        return;
      }

      if (res.ok && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setCommentCount((prev) => prev + 1);
        if (isMeToo && !myReactions.includes("affected")) {
          setMyReactions((prev) => [...prev, "affected"]);
          setReactions((prev) => ({
            ...prev,
            affected: (prev.affected || 0) + 1,
          }));
        }
        setCommentBody("");
        setCommentPostcode("");
        setFeedback({
          tone: "success",
          text: "Field corroboration logged (+2 Priority Pts).",
        });
      } else if (res.message) {
        setFeedback({ tone: "error", text: res.message });
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const res = await deleteRequestComment({
      commentId,
      requestId: request.id,
    });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/requests/community/${request.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: request.subject,
          text: `Endorse this community request on REACH: ${request.subject}`,
          url: shareUrl,
        });
        return;
      }
    } catch {
      // Fallback to clipboard copy
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard errors
    }
  }

  const areaTitle = request.jurisdiction_name
    ? `${request.jurisdiction_name} Resident`
    : "Verified Resident";

  return (
    <article className="group relative rounded-2xl border border-slate-200/90 bg-white transition-colors duration-200 hover:border-slate-300">
      <div className="grid sm:grid-cols-[76px_1fr]">
        {/* Left Tactile Endorsement & Priority Rail (Desktop) */}
        <div className="hidden flex-col items-center justify-between border-r border-slate-100 bg-slate-50/50 py-5 sm:flex">
          <div className="flex flex-col items-center gap-2">
            {typeof rank === "number" && (
              <span
                className={`font-mono text-[11px] font-bold tabular-nums tracking-wider ${
                  rank <= 3 ? "text-brand-700" : "text-slate-400"
                }`}
              >
                #{String(rank).padStart(2, "0")}
              </span>
            )}

            <button
              type="button"
              onClick={handleSupportToggle}
              disabled={isPendingSupport}
              aria-pressed={supported}
              title={
                supported
                  ? "Withdraw endorsement"
                  : "Endorse this request (+3 Priority Pts)"
              }
              className={`flex w-13 flex-col items-center justify-center rounded-xl border py-2.5 transition active:scale-[0.97] disabled:opacity-50 ${
                supported
                  ? "border-brand-700 bg-brand-700 text-white shadow-2xs"
                  : "border-slate-200/90 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-800"
              }`}
            >
              <ArrowUp
                size={16}
                strokeWidth={2.5}
                className={
                  supported ? "text-white" : "text-slate-500 group-hover:text-brand-700"
                }
              />
              <span className="mt-0.5 font-mono text-xs font-bold tabular-nums">
                {supportCount}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  supported ? "text-brand-100" : "text-slate-400"
                }`}
              >
                {supported ? "Backed" : "Back"}
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-xs font-bold tabular-nums text-ink">
              {livePriorityScore}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              PTS
            </span>
          </div>
        </div>

        {/* Right Editorial Docket Column */}
        <div className="min-w-0 p-5 sm:p-6">
          {/* Top Docket Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {typeof rank === "number" && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-slate-700 sm:hidden">
                  #{String(rank).padStart(2, "0")}
                </span>
              )}

              {request.reference_no && (
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-tight text-slate-700">
                  {request.reference_no}
                </span>
              )}

              <span className="font-semibold text-ink">{areaTitle}</span>

              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>

              <span className="inline-flex items-center gap-1 text-slate-500">
                <CalendarDays size={12} className="text-slate-400" />
                {formatDate(request.created_at)}
              </span>

              {request.category && (
                <>
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                    <Tag size={12} className="text-brand-700" />
                    {request.category}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-tight ${tierMeta.badgeClass}`}
                title={tierMeta.description}
              >
                <span
                  className={`size-1.5 rounded-full ${tierMeta.dotClass}`}
                />
                <span className="font-mono tabular-nums">
                  {tierMeta.code} · {livePriorityScore} PTS
                </span>
                <span className="hidden opacity-75 md:inline">
                  ({tierMeta.shortLabel})
                </span>
              </span>

              <Badge tone={statusTone(request.status)}>
                {humanize(request.status, "Submitted")}
              </Badge>
            </div>
          </div>

          {/* Issue Headline & Controlled-Measure Body */}
          <div className="mt-3">
            {isDetailView ? (
              <h1 className="max-w-[46ch] text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {request.subject}
              </h1>
            ) : (
              <h2 className="max-w-[54ch] text-lg font-bold tracking-tight text-ink sm:text-xl">
                <Link
                  href={`/requests/community/${request.id}`}
                  className="transition-colors hover:text-brand-700"
                >
                  {request.subject}
                </Link>
              </h2>
            )}

            {cleanDescription && (
              <p
                className={`mt-2 max-w-[68ch] whitespace-pre-line text-sm leading-relaxed text-slate-600 ${
                  isDetailView ? "" : "line-clamp-3"
                }`}
              >
                {cleanDescription}
              </p>
            )}

            {/* Location & Verified NIPOST Postcode Strip */}
            {(request.jurisdiction_name || extractedPostcode) && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                {request.jurisdiction_name && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <MapPin size={12} className="text-brand-700" />
                    {request.jurisdiction_name}
                  </span>
                )}

                {extractedPostcode && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/60 px-2.5 py-1 text-xs">
                    <ShieldCheck size={13} className="text-brand-700" />
                    <span className="font-medium text-brand-900">
                      NIPOST L1:
                    </span>
                    <span className="font-mono font-bold tracking-wider text-ink">
                      {extractedPostcode}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Unified Telemetry Bar: Priority Threshold + Office Resolution Track */}
          <div className="mt-4 grid gap-4 rounded-xl border border-slate-200/70 bg-[#FAF9F5] p-3.5 sm:grid-cols-2 sm:gap-6">
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold uppercase tracking-wider text-slate-500">
                  Escalation Threshold
                </span>
                <span className="font-mono font-semibold tabular-nums text-ink">
                  {nextThreshold
                    ? `${livePriorityScore} / ${nextThreshold} PTS`
                    : `${livePriorityScore} PTS · MAX`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/90">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${tierMeta.barClass}`}
                  style={{ width: `${Math.max(6, progressPercent)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold uppercase tracking-wider text-slate-500">
                  Office Resolution
                </span>
                <span className="font-mono font-semibold text-brand-800">
                  {stepIndex + 1}/4 · {humanize(status)}
                </span>
              </div>
              <ol className="mt-2 grid grid-cols-4 gap-1.5" aria-label="Resolution progress">
                {STEPS.map((step, idx) => {
                  const reached = idx <= stepIndex;
                  return (
                    <li key={step} title={humanize(step)}>
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          reached ? "bg-brand-600" : "bg-slate-200"
                        }`}
                      />
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Interactive Signal Toolbar: Mobile Back Button + 4 Civic Signals + Field Notes + Share */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Mobile Endorse Button (Desktop uses Left Rail) */}
              <button
                type="button"
                onClick={handleSupportToggle}
                disabled={isPendingSupport}
                aria-pressed={supported}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50 sm:hidden ${
                  supported
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-500"
                }`}
              >
                <ArrowUp size={13} strokeWidth={2.5} />
                <span>{supported ? "Backed" : "Back"}</span>
                <span className="font-mono font-bold tabular-nums">
                  {supportCount}
                </span>
              </button>

              {/* 4 Civic Signal Buttons */}
              {(Object.keys(REACTION_META) as ReactionKind[]).map((kind) => {
                const meta = REACTION_META[kind];
                const count = reactions[kind] ?? 0;
                const active = myReactions.includes(kind);
                const busy = pendingReaction === kind;

                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => handleReactionToggle(kind)}
                    disabled={busy}
                    aria-pressed={active}
                    title={meta.description}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
                      active
                        ? meta.activeClass
                        : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-ink"
                    }`}
                  >
                    <ReactionIcon
                      kind={kind}
                      className={active ? "text-current" : "text-slate-400"}
                    />
                    <span>{meta.shortLabel}</span>
                    {count > 0 && (
                      <span
                        className={`font-mono text-[11px] font-bold tabular-nums ${
                          active ? "text-current opacity-90" : "text-ink"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Field Notes Toggle & Share */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCommentsOpen((prev) => !prev)}
                aria-expanded={commentsOpen}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition ${
                  commentsOpen
                    ? "border-ink bg-ink text-white"
                    : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
                }`}
              >
                <MessageSquare size={13} />
                <span className="font-mono font-bold tabular-nums">
                  {commentCount}
                </span>
                <span>{commentCount === 1 ? "Note" : "Notes"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                title="Copy link to share with neighbours"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-brand-700" />
                    <span className="text-brand-800">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Inline Feedback / Auth Banner */}
          {feedback && (
            <div
              role="alert"
              aria-live="polite"
              className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium ${
                feedback.tone === "success"
                  ? "border-brand-200 bg-brand-50/80 text-brand-900"
                  : "border-amber-200 bg-amber-50/80 text-amber-900"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <AlertCircle size={14} />
                {feedback.text}
              </span>
              {feedback.loginUrl && (
                <Link
                  href={feedback.loginUrl}
                  className="rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Sign in →
                </Link>
              )}
            </div>
          )}

          {/* Expandable Field Corroboration Log (Comments) */}
          {commentsOpen && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Field Corroboration Log ({commentCount})
                </h3>
                <span className="font-mono text-[11px] text-slate-400">
                  +2 Priority Pts per resident note
                </span>
              </div>

              {comments.length > 0 ? (
                <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
                  {comments.map((comment) => (
                    <li key={comment.id} className="relative text-xs">
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 -left-[19.5px] size-2 rounded-full border border-white bg-slate-300"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-ink">
                            {comment.author_label}
                          </span>
                          {comment.area_name && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              {comment.area_name}
                            </span>
                          )}
                          {comment.is_me_too && (
                            <span className="inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800 ring-1 ring-brand-200/80">
                              <Users size={10} />
                              Affects my street
                            </span>
                          )}
                          {comment.postcode && (
                            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink">
                              {comment.postcode}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                          <span>{formatDate(comment.created_at)}</span>
                          {comment.is_mine && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Remove field note"
                              className="text-slate-400 transition hover:text-red-600"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-1 max-w-[65ch] whitespace-pre-line leading-relaxed text-slate-700">
                        {comment.body}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2.5 text-xs text-slate-500">
                  No field notes logged yet. Confirm if this issue affects your
                  street or add context for the inspection team.
                </p>
              )}

              {isSignedIn ? (
                <form
                  onSubmit={handleAddComment}
                  className="mt-4 rounded-xl border border-slate-200/90 bg-[#FAF9F5] p-3"
                >
                  <div className="flex flex-wrap items-center gap-1.5 pb-2.5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Quick fill:
                    </span>
                    {QUICK_COMMENT_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setCommentBody(prompt)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-ink"
                      >
                        {prompt.slice(0, 40)}…
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Log a field note or confirm street impact..."
                      maxLength={1000}
                      aria-label="Log a field note on this request"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={commentPostcode}
                      onChange={(e) =>
                        setCommentPostcode(e.target.value.toUpperCase())
                      }
                      placeholder="NIPOST code (optional)"
                      maxLength={20}
                      aria-label="Optional NIPOST postcode"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs font-semibold text-ink uppercase placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-brand-600 focus:outline-none sm:w-40"
                    />
                    <button
                      type="submit"
                      disabled={
                        submittingComment || commentBody.trim().length < 2
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Send size={12} />
                      <span>{submittingComment ? "Saving..." : "Log Note"}</span>
                    </button>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-600">
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isMeToo}
                        onChange={(e) => setIsMeToo(e.target.checked)}
                        className="size-3.5 rounded border-slate-300 accent-brand-700"
                      />
                      <span>Affects my street too (+2 PTS)</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={showFirstName}
                        onChange={(e) => setShowFirstName(e.target.checked)}
                        className="size-3.5 rounded border-slate-300 accent-brand-700"
                      />
                      <span>Display my first name</span>
                    </label>
                  </div>
                </form>
              ) : (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-[#FAF9F5] px-3.5 py-2.5 text-xs">
                  <span className="text-slate-600">
                    Sign in with your resident account to corroborate this issue
                    or log a street update.
                  </span>
                  <Link
                    href={`/login?next=${encodeURIComponent(returnTo)}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Sign in →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
