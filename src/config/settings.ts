import type { AppSettings } from "@/types";
import {
  APP_NAME,
  DEFAULT_BONUS_AMOUNT,
  DEFAULT_FOLLOW_UP_DAYS,
  DISCLAIMER_TEXT,
  JOB_POST_ENDING,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_NUMBER,
} from "./app";

/** Default app settings, editable in /admin/settings (mock mode keeps them in memory). */
export const DEFAULT_SETTINGS: AppSettings = {
  app_name: APP_NAME,
  admin_display_name: "יובל",
  default_whatsapp_number: WHATSAPP_NUMBER,
  whatsapp_channel_url: WHATSAPP_CHANNEL_URL,
  default_job_post_ending: JOB_POST_ENDING,
  disclaimer_text: DISCLAIMER_TEXT,
  default_follow_up_days: DEFAULT_FOLLOW_UP_DAYS,
  default_bonus_amount: DEFAULT_BONUS_AMOUNT,
};
