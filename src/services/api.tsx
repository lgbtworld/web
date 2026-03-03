import { Actions, ActionType } from "./actions";
import { httpClient } from "./httpClient";



interface ApiRequestOptions {
  method?: "GET" | "POST";
  params?: Record<string, any>;
  body?: Record<string, any> | any; // array veya nested objelere izin verir
}

export class ApiService {


  async fetchMetadata(url : any) {
    return this.call(Actions.CMD_LINK_METADATA, {
      method: "POST",
      body:{url:url}
    });
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
    console.log("handleCreatePost", data)
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

  async fetchPlace(publicId: string) {
    return this.call(Actions.CMD_PLACE_FETCH, {
      method: 'POST',
      body: { public_id: publicId },
    });
  }

    async fetchNearbyPlaces(latitude: number | null, longitude: number | null, cursor: string | null = null,distance: string | null = null, limit: number | null = null) {
    return this.call(Actions.CMD_PLACE_FETCH, {
      method: 'POST',
      body: { latitude: latitude, longitude: longitude, cursor: cursor,distance:distance, limit: limit },
    });
  }

  async fetchPlacesCategories (cursor: string | null = null, limit: number | null = null) {
    return this.call(Actions.CMD_PLACE_CATEGORIES, {
      method: 'POST',
      body: {limit:limit,cursor:cursor},
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


  async deleteChatForMe(chatId: string) {
    return this.call(Actions.CMD_DELETE_CHAT_FOR_USER, {
      method: "POST",
      body: { chat_id: chatId },
    });
  }

  async deleteChatForAll(chatId: string){
    return this.call(Actions.CMD_DELETE_CHAT_FOR_ALL, {
      method: "POST",
      body: { chat_id: chatId },
    });
  }

  async deleteMessageForMe(chatId:string, messageId:string){
    return this.call(Actions.CMD_DELETE_MESSAGE_FOR_USER, {
      method: "POST",
      body: { chat_id: chatId,message_id:messageId },
    });
  }

  async deleteMessageForAll(chatId:string, messageId:string){
    return this.call(Actions.CMD_DELETE_MESSAGE_FOR_ALL, {
      method: "POST",
      body: { chat_id: chatId,message_id:messageId },
    });
  }


  async clearChatHistoryForMe(chatId:string){
    return this.call(Actions.CMD_CLEAR_CHAT_HISTORY_FOR_USER, {
      method: "POST",
      body: { chat_id: chatId },
    });
  }

  async clearChatHistoryForAll(chatId:string){
    return this.call(Actions.CMD_CLEAR_CHAT_HISTORY_FOR_ALL, {
      method: "POST",
      body: { chat_id: chatId },
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



  async call<T = any>(
    action: ActionType,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const method = options.method ?? "GET";

    console.log("GIDEN DATA", options)

    if (method === "GET") {
      const response = await httpClient.get("/", {
        params: { action, ...options.params },
      });
      return response.data.data as T;
    }
    const token = localStorage.getItem("authToken"); // direkt al

    const response = await httpClient.post("/", {
      action: action,    // opsiyonel, backend handlePacket için
      ...options.body, // body tek objeye sarılıyor
    }, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": token,
      }
    });


    return response.data.data as T;
  }
}

export const api = new ApiService();