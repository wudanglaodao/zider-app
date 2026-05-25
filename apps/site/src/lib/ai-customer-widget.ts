const DEFAULT_WIDGET_SRC = "https://www.lopuo.work/widget.js";

export type AiCustomerWidgetConfig = {
  enabled: boolean;
  src: string;
  siteId: string;
  theme?: string;
  plugins?: string;
};

export function getAiCustomerWidgetConfig(): AiCustomerWidgetConfig {
  const enabled = process.env.AI_CUSTOMER_WIDGET_ENABLED !== "false";
  const siteId = process.env.AI_CUSTOMER_WIDGET_SITE_ID?.trim() ?? "";
  const src = process.env.AI_CUSTOMER_WIDGET_SRC?.trim() || DEFAULT_WIDGET_SRC;
  const theme = optionalValue(process.env.AI_CUSTOMER_WIDGET_THEME);
  const plugins = optionalValue(process.env.AI_CUSTOMER_WIDGET_PLUGINS);

  return {
    enabled: enabled && Boolean(siteId),
    src,
    siteId,
    theme,
    plugins,
  };
}

function optionalValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
