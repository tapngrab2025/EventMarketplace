import { createHash, createHmac } from "crypto";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Email is not configured. Set ${name}.`);
  return value;
};

const hash = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");
const hmac = (key: Buffer | string, value: string) => createHmac("sha256", key).update(value, "utf8").digest();

const getSignatureKey = (secret: string, date: string, region: string) => {
  const dateKey = hmac(`AWS4${secret}`, date);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "ses");
  return hmac(serviceKey, "aws4_request");
};

/** Sends a transactional email through the AWS SES Query API using Signature V4. */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const region = getRequiredEnv("AWS_REGION");
  const accessKeyId = getRequiredEnv("AWS_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("AWS_SECRET_ACCESS_KEY");
  const from = getRequiredEnv("EMAIL_FROM");
  const host = `email.${region}.amazonaws.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const body = new URLSearchParams({
    Action: "SendEmail",
    Version: "2010-12-01",
    Source: from,
    "Destination.ToAddresses.member.1": message.to,
    "Message.Subject.Data": message.subject,
    "Message.Subject.Charset": "UTF-8",
    "Message.Body.Text.Data": message.text,
    "Message.Body.Text.Charset": "UTF-8",
    "Message.Body.Html.Data": message.html,
    "Message.Body.Html.Charset": "UTF-8",
  }).toString();
  const contentType = "application/x-www-form-urlencoded; charset=utf-8";
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-date:${amzDate}`,
    ...(sessionToken ? [`x-amz-security-token:${sessionToken}`] : []),
  ].join("\n") + "\n";
  const signedHeaders = sessionToken
    ? "content-type;host;x-amz-date;x-amz-security-token"
    : "content-type;host;x-amz-date";
  const credentialScope = `${dateStamp}/${region}/ses/aws4_request`;
  const canonicalRequest = ["POST", "/", "", canonicalHeaders, signedHeaders, hash(body)].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", getSignatureKey(secretAccessKey, dateStamp, region))
    .update(stringToSign, "utf8")
    .digest("hex");

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "X-Amz-Date": amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (sessionToken) headers["X-Amz-Security-Token"] = sessionToken;

  const response = await fetch(`https://${host}/`, { method: "POST", headers, body });
  if (!response.ok) {
    throw new Error(`Dispatch email could not be sent (${response.status}): ${await response.text()}`);
  }
}
