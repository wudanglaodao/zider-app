import { redirectWithSearchParams } from "@/app/_lib/redirect-with-search-params";

export const dynamic = "force-dynamic";

type LegacyWixPrintOpsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyWixPrintOpsPage({ searchParams }: LegacyWixPrintOpsPageProps) {
  redirectWithSearchParams("/plug-in/printops/wix", await searchParams);
}
