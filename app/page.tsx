import { getSnapshot } from "@/lib/snapshot";
import { FactoryPage } from "@/components/factory/FactoryPage";

export const revalidate = 60;

export default async function Page() {
  const snap = await getSnapshot();
  return <FactoryPage snap={snap} />;
}
