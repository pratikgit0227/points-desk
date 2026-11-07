import { BalanceImport } from "@/components/BalanceImport";
import { BookingFinder } from "@/components/BookingFinder";
import { CardPicker } from "@/components/CardPicker";
import { FilterBar } from "@/components/FilterBar";
import { GuideDialog } from "@/components/GuideDialog";
import { Header } from "@/components/Header";
import { Matrix } from "@/components/Matrix";
import { Notes } from "@/components/Notes";
import { StoreProvider } from "@/components/store";
import { Trips } from "@/components/Trips";
import { ValueEditor } from "@/components/ValueEditor";
import { Wallets } from "@/components/Wallets";

export default function Home() {
  return (
    <StoreProvider>
      <div className="wrap">
        <Header />
        <BookingFinder />
        <BalanceImport />
        <FilterBar />
        <Wallets />
        <CardPicker />
        <Trips />
        <Matrix />
        <ValueEditor />
        <Notes />
      </div>
      <GuideDialog />
    </StoreProvider>
  );
}
