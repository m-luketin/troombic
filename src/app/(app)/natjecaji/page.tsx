import { fetchTedTenders } from "@/lib/ted-api";
import { NatjecajiView } from "@/components/natjecaji-view";

export default async function NatjecajiPage() {
  const result = await fetchTedTenders();
  return <NatjecajiView result={result} />;
}
