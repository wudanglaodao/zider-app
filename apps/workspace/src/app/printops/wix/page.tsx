import { redirectWithSearchParams } from "@/app/_lib/redirect-with-search-params";

export const dynamic = "force-dynamic";

type LegacyPrintOpsWixPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyPrintOpsWixPage({ searchParams }: LegacyPrintOpsWixPageProps) {
  redirectWithSearchParams("/plug-in/printops/wix", await searchParams);
}
