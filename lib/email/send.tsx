import "server-only";

import { render } from "@react-email/render";
import nodemailer from "nodemailer";

import { env } from "@/lib/env";
import { NotificationEmail } from "@/lib/email/templates/notification-email";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined,
});

export type NotificationEmailPayload = {
  to: string;
  title: string;
  body?: string;
  actionLabel?: string;
  actionUrl?: string;
};

export async function sendNotificationEmail(payload: NotificationEmailPayload) {
  const html = await render(
    <NotificationEmail
      title={payload.title}
      body={payload.body}
      actionLabel={payload.actionLabel}
      actionUrl={payload.actionUrl}
    />,
  );

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: payload.to,
    subject: payload.title,
    html,
  });
}
