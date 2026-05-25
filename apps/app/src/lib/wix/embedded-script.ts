import { createWixAccessToken } from "./oauth";

const defaultComponentsUrl = "https://components.zider.ink";

export async function installInteractiveCustomCursorEmbedScript(instanceId: string) {
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
          scriptUrl: `${getComponentsUrl()}/api/widgets/interactive-custom-cursor/embed.js?instanceId=${encodeURIComponent(instanceId)}`,
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

function getComponentsUrl() {
  return (process.env.ZIDER_COMPONENTS_URL?.trim() || defaultComponentsUrl).replace(/\/$/, "");
}
