import { createWixAccessToken } from "./oauth";

export async function installInteractiveCustomCursorEmbedScript(instanceId: string) {
  const appUrl = process.env.NEXT_PUBLIC_ZIDER_APP_URL ?? process.env.ZIDER_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_ZIDER_APP_URL or ZIDER_APP_URL");
  }

  const { accessToken } = await createWixAccessToken(instanceId);
  const endpoint = "https://www.wixapis.com/apps/v1/scripts";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        parameters: {
          scriptUrl: `${appUrl.replace(/\/$/, "")}/api/widgets/interactive-custom-cursor/embed.js?platform=wix&instanceId=${encodeURIComponent(instanceId)}`,
        },
      },
    }),
  });
  const payload = await response.text();

  if (!response.ok) {
    throw new Error(`Wix embed script install failed: ${response.status} ${payload}`);
  }

  return payload;
}
