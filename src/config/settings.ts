import type { AppSettings } from "@/types";
import {
  APP_NAME,
  DEFAULT_FOLLOW_UP_DAYS,
  DISCLAIMER_TEXT,
  PRIVACY_NOTICE,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_NUMBER,
} from "./app";

/** Default app settings, editable in /admin/settings (mock mode keeps them in memory). */
export const DEFAULT_SETTINGS: AppSettings = {
  admin_display_name: "יובל",
  whatsapp_channel_url: WHATSAPP_CHANNEL_URL,
  default_whatsapp_number: WHATSAPP_NUMBER,
  disclaimer_text: DISCLAIMER_TEXT,
  privacy_notice: PRIVACY_NOTICE,
  default_follow_up_days: DEFAULT_FOLLOW_UP_DAYS,
  app_name: APP_NAME,
};
