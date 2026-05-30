import { createWixAccessToken } from "./oauth";

const defaultWorkspaceUrl = "https://workspace.zider.ink";

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
          scriptUrl: `${getWorkspaceUrl()}/widget/interactive-custom-cursor/embed.js?instanceId=${encodeURIComponent(instanceId)}`,
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

function getWorkspaceUrl() {
  return (process.env.ZIDER_WORKSPACE_URL?.trim() || defaultWorkspaceUrl).replace(/\/$/, "");
}
