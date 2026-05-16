import invoices from "@/data/invoices.json";
import { notFound } from "next/navigation";
import { InvoiceDetailView } from "@/components/invoice-detail-view";
import type { Invoice } from "@/lib/invoice-helpers";

export default async function InvoiceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const all = invoices as Invoice[];
  const inv = all.find((i) => i.id === id);
  if (!inv) notFound();
  return <InvoiceDetailView invoice={inv} />;
}
