// utils/getOrCreateUserId.ts
export function getOrCreateUserId(): string {
    let userId = localStorage.getItem("user_uuid");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("user_uuid", userId);
    }
    return userId;
  }
  