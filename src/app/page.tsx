import { BalanceImport } from "@/components/BalanceImport";
import { FilterBar } from "@/components/FilterBar";
import { Header } from "@/components/Header";
import { LatestChange } from "@/components/LatestChange";
import { MyCards } from "@/components/MyCards";
import { Trips } from "@/components/Trips";
import { Wallets } from "@/components/Wallets";

/** My Wallet: your cards, what the points are worth, and where they can take you. */
export default function WalletPage() {
  return (
    <main className="wrap">
      <Header />
      <LatestChange />
      <MyCards />
      <BalanceImport />
      <FilterBar />
      <Wallets />
      <Trips />
    </main>
  );
}
