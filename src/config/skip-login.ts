import { userInfoStore } from "@/stores/user-info";

const MOCK_TOKEN = "skip-login-local-token";

const MOCK_USER = {
  name: "本地预览（跳过登录）",
  userId: 1,
  phone: "",
};

/** 环境变量 VITE_SKIP_LOGIN=true 时启用：无需后端即可进入主界面 */
export function isSkipLoginMode(): boolean {
  return import.meta.env.VITE_SKIP_LOGIN === "true";
}

/** 写入本地会话，供路由守卫与展示使用 */
export function applySkipLoginSession(): void {
  const user = userInfoStore();
  user.changeUserInfo(MOCK_USER);
  user.updateToken(MOCK_TOKEN);
}
