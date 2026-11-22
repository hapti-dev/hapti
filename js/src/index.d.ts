export type Status = 'queued' | 'paused' | 'running' | 'waiting' | 'succeeded' | 'failed' | 'blocked' | 'incomplete' | 'needs_person' | 'cancelled';

export interface FileIn { name: string; base64?: string; url?: string }

export interface TaskInput {
  url: string;
  goal: string;
  data?: Record<string, unknown>;
  user?: string;
  output?: Record<string, unknown>;
  files?: FileIn[];
  locale?: string;
  answer_language?: string;
  country?: string;
  proxy?: boolean;
  level?: 'standard' | 'reinforced';
  max_steps?: number;
  max_seconds?: number;
  max_price_cents?: number;
  approval?: 'required' | 'mandate';
  accounts?: string[];
  keep_session?: boolean;
  mailbox?: boolean;
  learn?: boolean;
  recipe?: string;
  webhook?: string;
}

export interface Pending { type: 'question' | 'approval'; key?: string; text: string; action_url: string | null }

export interface Task<T = unknown> {
  id: string;
  object: 'task';
  mode: 'live' | 'test';
  status: Status;
  level: string;
  price_cents: number;
  starting_price_cents: number;
  billed: boolean;
  user: string | null;
  url: string;
  goal: string;
  batch: string | null;
  schedule: string | null;
  pending: Pending | null;
  learn: boolean;
  used_recipe: string | null;
  recipe_chosen: 'automatic' | 'given' | null;
  recipe: string | null;
  result: { answer: string; data?: T | null; output_error?: string[]; downloads?: string[]; final_url?: string | null; replay?: { replayed: number; total: number; stopped: string | null } | null; [k: string]: unknown } | null;
  usage: { steps: number; model_calls?: number; seconds?: number; [k: string]: unknown } | null;
  files: { name: string; url: string }[];
  created_at: string;
  finished_at: string | null;
}

export interface Estimate { object: 'estimate'; level: string; currency: 'usd'; recipe: string | null; based_on: string; typical_actions: number | null; likely_cents: number; at_most_cents: number | null; minimum_cents: number; charged: string }

export interface Batch { id: string; object: 'batch'; mode: string; name: string | null; total: number; done: number; counts: Record<Status, number>; billed_cents: number; created_at: string; finished_at: string | null; cancelled: boolean }

export interface BatchInput { name?: string; webhook?: string; tasks?: TaskInput[]; template?: Partial<TaskInput>; items?: Partial<TaskInput>[] }

export interface Schedule { id: string; object: 'schedule'; name: string | null; every: string | null; cron: string | null; timezone: string; paused: boolean; next_run_at: string | null; until: string | null; runs: number; last_task: string | null; last_run_at: string | null; last_error: string | null; task: TaskInput; created_at: string }

export interface ScheduleInput { task: TaskInput; every?: string; cron?: string; timezone?: string; name?: string; start_at?: string; run_now?: boolean; until?: string }

export interface Step { seq?: number; at?: string; type: string; summary?: string; action?: unknown; status?: string }
export type StreamEvent<T = unknown> = { event: 'task'; data: Task<T>; id: string | null } | { event: 'step'; data: Step; id: string | null } | { event: 'screenshot'; data: { n: number; url: string }; id: string | null } | { event: 'done'; data: { id: string; status: Status }; id: string | null } | { event: string; data: unknown; id: string | null };
export interface StreamOptions { signal?: AbortSignal; lastEventId?: string; reconnect?: boolean }
export interface TaskFilters { status?: Status | Status[]; user?: string; q?: string; since?: string; until?: string; template?: string; batch?: string }
export interface Page<T> { object: 'list'; data: T[]; has_more: boolean; next_cursor: string | null; total: number }
export interface HaptiEvent<T = unknown> { id: string; object: 'event'; type: string; api_version: string | null; created_at: string; mode: 'test' | 'live'; data: T }
export interface WebhookEndpoint { id: string; object: 'webhook_endpoint'; url: string; events: string[]; description: string | null; enabled: boolean; disabled_reason: 'manual' | 'failing' | null; disabled_at: string | null; failing_since: string | null; last_success_at: string | null; headers: Record<string, string>; previous_secret_expires_at: string | null; mode: 'test' | 'live'; secret?: string; secret_hint?: string; created_at: string; last_7_days?: { deliveries: number; failed: number; last_at: string | null } }
export interface WebhookDelivery { id: string; event: string; task: string; endpoint: string | null; url: string; state: 'pending' | 'retrying' | 'delivered' | 'failed'; status: number | null; attempts: number; ms: number | null; response: string | null; body?: unknown }
export interface WaitOptions<T = unknown> { onWaiting?: (pending: Pending, task: Task<T>) => unknown | Promise<unknown>; onStep?: (step: Step) => unknown | Promise<unknown>; live?: boolean; every?: number; timeoutMs?: number; signal?: AbortSignal; idempotencyKey?: string }

export class HaptiError extends Error { status: number; type: string | null; reason: string | null; index: number | null }

export class Hapti {
  constructor(apiKey?: string, options?: { baseUrl?: string; retries?: number; fetch?: typeof fetch; version?: string });
  tasks: {
    create(task: TaskInput, options?: { idempotencyKey?: string }): Promise<Task>;
    get<T = unknown>(id: string): Promise<Task<T>>;
    list(options?: TaskFilters & { limit?: number; cursor?: string }): Promise<Page<Task>>;
    all(filters?: TaskFilters): AsyncGenerator<Task>;
    retry(id: string, options?: { idempotencyKey?: string }): Promise<Task>;
    stream<T = unknown>(id: string, options?: StreamOptions): AsyncGenerator<StreamEvent<T>>;
    answer(id: string, value: string, key?: string): Promise<Task>;
    cancel(id: string): Promise<Task>;
    approve(id: string, approve?: boolean, by?: string): Promise<Task>;
    estimate(task: TaskInput): Promise<Estimate>;
    proof(id: string): Promise<{ task: Task; events: Record<string, unknown>[]; screenshots: string[] }>;
    deleteProof(id: string): Promise<{ id: string; proof_deleted: boolean }>;
    dispute(id: string, reason: string): Promise<Record<string, unknown>>;
    file(id: string, name: string): Promise<Uint8Array>;
    wait<T = unknown>(id: string, options?: WaitOptions<T>): Promise<Task<T>>;
    run<T = unknown>(task: TaskInput, options?: WaitOptions<T>): Promise<Task<T>>;
  };
  batches: {
    create(batch: BatchInput): Promise<Batch>;
    get(id: string): Promise<Batch>;
    list(options?: { limit?: number }): Promise<{ object: 'list'; data: Batch[] }>;
    cancel(id: string): Promise<Batch & { cancelled_now: number }>;
    tasks(id: string, options?: { status?: Status }): AsyncIterable<Task>;
    wait(id: string, options?: { every?: number; signal?: AbortSignal }): Promise<Batch>;
  };
  schedules: {
    create(schedule: ScheduleInput): Promise<Schedule>;
    get(id: string): Promise<Schedule>;
    list(): Promise<{ object: 'list'; data: Schedule[] }>;
    pause(id: string): Promise<Schedule>;
    resume(id: string): Promise<Schedule>;
    delete(id: string): Promise<{ id: string; deleted: boolean }>;
    tasks(id: string): Promise<{ object: 'list'; data: Task[] }>;
  };
  users: {
    create(user: { id: string; name?: string; locale?: string; timezone?: string; mandate?: Record<string, unknown> }): Promise<Record<string, unknown>>;
    get(id: string): Promise<Record<string, unknown>>;
    update(id: string, user: { name?: string; locale?: string; timezone?: string }): Promise<Record<string, unknown>>;
    list(options?: { limit?: number }): Promise<{ object: 'list'; data: Record<string, unknown>[] }>;
    forget(id: string): Promise<{ forgotten: boolean }>;
    history(id: string): Promise<{ object: 'list'; data: Record<string, unknown>[] }>;
    forward(id: string, to: string): Promise<{ forward: { to: string; status: 'pending' | 'active'; set_by: string } }>;
    forwardStatus(id: string): Promise<{ forward: { to: string; status: 'pending' | 'active'; set_by: string } | null }>;
    stopForward(id: string): Promise<{ stopped: boolean }>;
    phone(id: string, country?: string): Promise<{ object: 'phone_number'; number: string; country: string; month_cents: number; paid_until: string }>;
    releasePhone(id: string): Promise<{ released: boolean }>;
    sms(id: string): Promise<{ object: 'list'; data: Record<string, unknown>[] }>;
    connectLink(id: string, options?: { accounts?: { account: string; origin: string; label?: string }[]; brand?: { name?: string; color?: string }; return_url?: string; expires_in?: number }): Promise<{ id: string; object: 'connect_link'; user: string; url: string; expires_at: string }>;
    revokeConnectLinks(id: string): Promise<{ revoked: number }>;
    setLimits(id: string, limits: { tasks_per_day?: number; cents_per_month?: number } | null): Promise<Record<string, unknown>>;
    usage(id: string, options?: { from?: string; to?: string }): Promise<{ object: 'user_usage'; user: string; tasks: Record<string, number>; success_rate: number | null; billed_tasks: number; billed_cents: number; limits: Record<string, number> | null }>;
    giveMandate(id: string, mandate: { scope: string; given_by: string; sites?: string[]; until?: string }): Promise<Record<string, unknown>>;
    revokeMandate(id: string): Promise<{ revoked: boolean }>;
    dropSession(id: string): Promise<{ deleted: boolean }>;
    putAccount(id: string, account: string, value: Record<string, unknown>): Promise<Record<string, unknown>>;
    accounts(id: string): Promise<{ object: 'list'; data: Record<string, unknown>[] }>;
    deleteAccount(id: string, account: string): Promise<{ deleted: boolean }>;
  };
  recipes: {
    list(): Promise<{ object: 'list'; data: Record<string, unknown>[] }>;
    get(id: string): Promise<Record<string, unknown>>;
    rename(id: string, name: string): Promise<Record<string, unknown>>;
    delete(id: string): Promise<{ deleted: boolean }>;
  };
  webhooks: {
    events(): Promise<{ object: 'list'; data: { type: string; description: string }[] }>;
    endpoints: {
      list(): Promise<{ object: 'list'; data: WebhookEndpoint[] }>;
      create(endpoint: { url: string; events?: string[]; description?: string; headers?: Record<string, string> }): Promise<WebhookEndpoint>;
      get(id: string): Promise<WebhookEndpoint>;
      update(id: string, endpoint: { url?: string; events?: string[]; description?: string | null; enabled?: boolean; headers?: Record<string, string> | null }): Promise<WebhookEndpoint>;
      delete(id: string): Promise<{ id: string; deleted: true }>;
      secret(id: string): Promise<string>;
      rollSecret(id: string, options?: { expiresInHours?: number }): Promise<WebhookEndpoint>;
      recover(id: string, options?: { since?: string }): Promise<{ object: 'recovery'; endpoint: string; since: string; resent: number }>;
      test(id: string): Promise<WebhookDelivery>;
    };
    deliveries(options?: { endpoint?: string; event?: string; state?: WebhookDelivery['state']; limit?: number; cursor?: string }): Promise<Page<WebhookDelivery>>;
    delivery(id: string): Promise<WebhookDelivery>;
    resend(id: string): Promise<WebhookDelivery>;
  };
  events(options?: StreamOptions): AsyncGenerator<StreamEvent>;
  eventLog: {
    list(options?: { type?: string; object?: string; since?: string; limit?: number; cursor?: string }): Promise<Page<HaptiEvent>>;
    get(id: string): Promise<HaptiEvent>;
    all(filters?: { type?: string; object?: string; since?: string }): AsyncGenerator<HaptiEvent>;
  };
  balance(): Promise<Record<string, unknown>>;
  usage(options?: { from?: string; to?: string }): Promise<Record<string, unknown>>;
  usageByUser(options?: { from?: string; to?: string }): Promise<{ object: 'list'; data: { user: string; billed_tasks: number; billed_cents: number }[] }>;
  static verifyWebhook(rawBody: string | Uint8Array, signatureHeader: string | null | undefined, secret: string | string[], options?: { toleranceSeconds?: number; now?: number }): Promise<boolean>;
}

export default Hapti;
