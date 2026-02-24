import { Actions, ActionType } from "./actions";
import { httpClient } from "./httpClient";



interface ApiRequestOptions {
  method?: "GET" | "POST";
  params?: Record<string, any>;
  body?: Record<string, any> | any; // array veya nested objelere izin verir
}

const isBlobLike = (value: unknown): value is Blob =>
  typeof Blob !== "undefined" && value instanceof Blob;

const appendFormData = (fd: FormData, key: string, value: any) => {
  if (value === undefined || value === null) {
    return;
  }

  if (isBlobLike(value)) {
    fd.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    // Backend expects multipart file arrays with bracketed keys:
    // images[]=file1, images[]=file2
    if (value.every((item) => isBlobLike(item))) {
      const arrayKey = key.endsWith("[]") ? key : `${key}[]`;
      value.forEach((item) => fd.append(arrayKey, item));
      return;
    }

    value.forEach((item, index) => appendFormData(fd, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormData(fd, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  fd.append(key, String(value));
};

const normalizeAuthHeader = (token: string | null): string | null => {
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const readAuthToken = (): string | null => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const localToken = localStorage.getItem("authToken");
  if (localToken) {
    return localToken;
  }

  const cookieToken = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("authToken="))
    ?.split("=")[1];
  return cookieToken ? decodeURIComponent(cookieToken) : null;
};

const buildAuthRequiredResponse = <T = any>() =>
  ({
    success: false,
    code: "AUTH_REQUIRED",
    message: "Authentication required",
  } as T);

export class ApiService {
  private async postJsonAction<T = any>(
    action: ActionType,
    body: Record<string, any>,
    skipAuth = false
  ): Promise<T> {
    const token = readAuthToken();
    const execute = async (skip = false) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (!skip && token) {
        const authHeader = normalizeAuthHeader(token);
        if (authHeader) {
          headers.Authorization = authHeader;
        }
      }
      if (skip) {
        headers["X-Skip-Auth"] = "1";
      }
      const response = await httpClient.post("/", { action, ...body }, { headers });
      return response.data as T;
    };

    try {
      return await execute(skipAuth);
    } catch (error: any) {
      if (error?.response?.status === 401 && token && !skipAuth) {
        try {
          return await execute(true);
        } catch (retryError: any) {
          if (retryError?.response?.status === 401) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("cv:auth-required"));
            }
            return buildAuthRequiredResponse<T>();
          }
          throw retryError;
        }
      }
      if (error?.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cv:auth-required"));
        }
        return buildAuthRequiredResponse<T>();
      }
      throw error;
    }
  }

  private async postFormAction<T = any>(
    action: ActionType,
    buildForm: (form: FormData) => void,
    skipAuth = false
  ): Promise<T> {
    const token = readAuthToken();
    const execute = async (skip = false) => {
      const headers: Record<string, string> = {};
      if (!skip && token) {
        const authHeader = normalizeAuthHeader(token);
        if (authHeader) {
          headers.Authorization = authHeader;
        }
      }
      if (skip) {
        headers["X-Skip-Auth"] = "1";
      }
      const form = new FormData();
      form.append("action", action);
      buildForm(form);
      const response = await httpClient.post("/", form, { headers });
      return response.data as T;
    };

    try {
      return await execute(skipAuth);
    } catch (error: any) {
      if (error?.response?.status === 401 && token && !skipAuth) {
        try {
          return await execute(true);
        } catch (retryError: any) {
          if (retryError?.response?.status === 401) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("cv:auth-required"));
            }
            return buildAuthRequiredResponse<T>();
          }
          throw retryError;
        }
      }
      if (error?.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cv:auth-required"));
        }
        return buildAuthRequiredResponse<T>();
      }
      throw error;
    }
  }


  async checkNewNotifications(limit:number = 1,cursor:any = null){
    return this.call(Actions.CMD_USER_GET_NOTIFICATIONS, {
      method: "POST",
      body:{limit:limit,cursor:cursor}
    });
  }

  async handleGetVapidKey() {
    return this.call(Actions.CMD_GET_VAPID_PUBLIC_KEY, {
      method: "POST",
    });
  }

  async handleSetVapidSubscriptions(params:any) {
    return this.call(Actions.CMD_SET_VAPID_SUBSCRIBE, {
      method: "POST",
      body:params
    });
  }

  async handleRegister(user: Record<string, any>) {
    return this.call(Actions.AUTH_REGISTER, {
      method: "POST",
      body: user,
    });
  }

  async handleFetchPaymentMethods() {
    return this.call(Actions.CMD_PAYMENT_METHODS, {
      method: "POST",
    });
  }

  async handleCreatePost(data: Record<string, any>) {
    return this.call(Actions.POST_CREATE, {
      method: "POST",
      body: data,
    });
  }

  async handlePostDelete(postId : any){
    return this.call(Actions.CMD_POST_DELETE, {
      method: "POST",
      body: {post_id:postId},
    });
  }

  async handlePostLike(postId : any){
    return this.call(Actions.CMD_POST_LIKE, {
      method: "POST",
      body: {post_id:postId},
    });
  }

  async handlePostDislike(postId : any){
    return this.call(Actions.CMD_POST_DISLIKE, {
      method: "POST",
      body: {post_id:postId},
    });
  }

  async handlePostBanana(postId : any){
    return this.call(Actions.CMD_POST_BANANA, {
      method: "POST",
      body: {post_id:postId},
    });
  }

  async handlePostAddToBookmarks(postId : any){
    return this.call(Actions.CMD_POST_BOOKMARK, {
      method: "POST",
      body: {post_id:postId},
    });
  }

  async handlePostReport(postId : any,reason:any,description:any){
    return this.call(Actions.CMD_POST_REPORT, {
      method: "POST",
      body: {post_id:postId,reason:reason,description:description},
    });
  }

  async handleUserReport(userId : any,reason:any,description:any){
    return this.call(Actions.CMD_USER_REPORT, {
      method: "POST",
      body: {userId:userId,reason:reason,description:description},
    });
  }

  async handlePostView(postId : any){
    return this.call(Actions.CMD_POST_VIEW, {
      method: "POST",
      body: {post_id:postId},
    });
  }


  async handleSendTip(postId : any,amount:any){
    return this.call(Actions.CMD_POST_TIP, {
      method: "POST",
      body: {post_id:postId,amount:amount},
    });
  }


  async handleLogin(credentials: { nickname: string; password: string; location?: any }) {
    return this.call(Actions.AUTH_LOGIN, {
      method: "POST",
      body: credentials,
    });
  }

  async handleVote(credentials: { choice_id: string; weight?: number; rank?: number }) {
    const body: Record<string, any> = {
      choice_id: credentials.choice_id,
    };
    
    if (credentials.weight !== undefined && credentials.weight !== null) {
      body.weight = credentials.weight;
    }
    
    if (credentials.rank !== undefined && credentials.rank !== null) {
      body.rank = credentials.rank;
    }
    
    return this.call(Actions.CMD_POST_VOTE, {
      method: "POST",
      body: body,
    });
  }


  async fetchTimeline({ limit = 10, cursor = "" }: { limit?: number; cursor?: string }) {
    return this.call(Actions.POST_TIMELINE, {
      method: "POST",
      body: { limit, cursor }, // doğru değişkenler gönderiliyor
    });
  }

  async fetchVibes({ limit = 10, cursor = "" }: { limit?: number; cursor?: string }) {
    return this.call(Actions.POST_VIBES, {
      method: "POST",
      body: { limit, cursor },
    });
  }

  async fetchPost(postId: string) {
    return this.call(Actions.POST_FETCH, {
      method: "POST",
      body: { post_id: postId },
    });
  }

  async updateProfile(userData: Record<string, any>) {
    return this.call(Actions.CMD_UPDATE_USER_PROFILE, {
      method: "POST",
      body: userData,
    });
  }

  async fetchProfile(username?: string) {
    return this.call(Actions.USER_FETCH_PROFILE, {
      method: "GET",
      params: username ? { username } : {},
    });
  }

  async getUserInfo() {
    return this.call(Actions.CMD_AUTH_USER_INFO, {
      method: "POST",
      body: {},
    });
  }

  async updatePreferences(id: string, bit_index: number, enabled: boolean) {
    return this.call(Actions.CMD_USER_UPDATE_PREFERENCES, {
      method: "POST",
      body: {
        id: id,
        bit_index: bit_index,
        enabled: enabled,
      },
    });
  }

  async searchUserLookup(query: string) {
    return this.call<{
      users: Array<{
        id: string;
        username: string;
        displayname: string;
        avatar?: {
          file?: {
            url?: string;
          };
        };
      }>
    } | Array<{
      id: string;
      username: string;
      displayname: string;
      avatar?: {
        file?: {
          url?: string;
        };
      };
    }>>(Actions.CMD_SEARCH_LOOKUP_USER, {
      method: "POST",
      body: { query },
    });
  }

  async handleCreatePrivateChat(profile: { id?: string | number; public_id?: string | number }) {
    const rawTargets = [profile?.id, profile?.public_id].filter(
      (value): value is string | number => value !== undefined && value !== null && value !== ""
    );
    const targetIds = Array.from(new Set(rawTargets.map((value) => String(value))));

    if (targetIds.length === 0) {
      throw new Error("Missing target user id for chat creation");
    }

    const jsonCandidates: Array<Record<string, any>> = [];
    for (const targetId of targetIds) {
      jsonCandidates.push(
        { type: "private", participant_ids: [targetId] },
        { type: "private", participant_ids: [String(targetId)] },
        { type: "private", participant_ids: JSON.stringify([targetId]) },
        { type: "private", participant_id: targetId },
        { type: "private", user_id: targetId },
        { type: "private", target_user_id: targetId }
      );
    }

    let lastError: any = null;
    const parseChatId = (response: any) => response?.chat?.id || response?.data?.id || response?.id;

    for (const body of jsonCandidates) {
      try {
        const response = await this.postJsonAction<{
          chat?: { id?: string };
          data?: { id?: string };
          id?: string;
          success?: boolean;
          code?: string;
          message?: string;
        }>(Actions.CMD_CHAT_CREATE, body);
        if (response?.code === "AUTH_REQUIRED") {
          return response as any;
        }
        const chatId = parseChatId(response);
        if (chatId) {
          return { ...response, chat: { ...(response?.chat || {}), id: chatId } };
        }
      } catch (error: any) {
        lastError = error;
        if (error?.response?.status !== 400) {
          throw error;
        }
      }
    }

    // Some backend parsers only accept multipart with participant_ids[] style keys.
    for (const targetId of targetIds) {
      const formStrategies: Array<(form: FormData) => void> = [
        (form) => {
          form.append("type", "private");
          form.append("participant_ids[]", String(targetId));
        },
        (form) => {
          form.append("type", "private");
          form.append("participant_ids", String(targetId));
        },
        (form) => {
          form.append("type", "private");
          form.append("participant_ids[0]", String(targetId));
        },
      ];

      for (const strategy of formStrategies) {
        try {
          const response = await this.postFormAction<{
            chat?: { id?: string };
            data?: { id?: string };
            id?: string;
            success?: boolean;
            code?: string;
            message?: string;
          }>(Actions.CMD_CHAT_CREATE, strategy);
          if (response?.code === "AUTH_REQUIRED") {
            return response as any;
          }
          const chatId = parseChatId(response);
          if (chatId) {
            return { ...response, chat: { ...(response?.chat || {}), id: chatId } };
          }
        } catch (error: any) {
          lastError = error;
          if (error?.response?.status !== 400) {
            throw error;
          }
        }
      }
    }

    if (!lastError) {
      return buildAuthRequiredResponse<any>();
    }
    throw lastError;
  }



  async call<T = any>(
    action: ActionType,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const method = options.method ?? "GET";
    const token = readAuthToken();

    const execute = async (skipAuth = false) => {
      if (method === "GET") {
        const response = await httpClient.get("/", {
          params: { action, ...options.params },
          headers: skipAuth ? { "X-Skip-Auth": "1" } : undefined,
        });
        return response.data as T;
      }

      const body = options.body ?? {};
      const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

      let payload: any;
      if (isFormData) {
        body.append("action", action);
        payload = body;
      } else {
        const form = new FormData();
        form.append("action", action);
        Object.entries(body).forEach(([key, value]) => appendFormData(form, key, value));
        payload = form;
      }

      const headers: Record<string, string> = {};
      if (!skipAuth && token) {
        const authHeader = normalizeAuthHeader(token);
        if (authHeader) {
          headers.Authorization = authHeader;
        }
      }
      if (skipAuth) {
        headers["X-Skip-Auth"] = "1";
      }

      const response = await httpClient.post("/", payload, { headers });
      return response.data as T;
    };

    try {
      return await execute(false);
    } catch (error: any) {
      if (error?.response?.status === 401 && token) {
        // If a stale token breaks public endpoints, retry once without auth header.
        try {
          return await execute(true);
        } catch (retryError: any) {
          if (retryError?.response?.status === 401) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("cv:auth-required"));
            }
            return buildAuthRequiredResponse<T>();
          }
          throw retryError;
        }
      }
      if (error?.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cv:auth-required"));
        }
        return buildAuthRequiredResponse<T>();
      }
      if (error && typeof error === "object") {
        (error as any).action = action;
      }
      throw error;
    }
  }
}

export const api = new ApiService();
