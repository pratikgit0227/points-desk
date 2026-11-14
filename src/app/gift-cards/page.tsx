import type { Metadata } from "next";
import Link from "next/link";
import { VoucherBurn, VoucherEarn } from "@/components/GiftCards";
import { MyCards } from "@/components/MyCards";
import { PageTransition } from "@/components/PageTransition";
import { GIFT_CHECKED } from "@/lib/data";
import { longDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gift vouchers and points",
  description: "Extra points for buying gift vouchers on SmartBuy, iShop and Amex ShopWise, with monthly caps, and whether spending points on vouchers beats transferring them.",
};

export default function GiftCardsPage() {
  return (
    <PageTransition>
      <main className="wrap">
        <div className="page-intro">
          <h1>Gift vouchers</h1>
          <p className="muted">
            Two questions: which card earns the most when you buy vouchers through the bank&apos;s portal, and are your points worth more as vouchers or as airline and hotel points? Researched {longDate(GIFT_CHECKED)} from bank pages and card blogs; each row shows its sources. Back to <Link href="/cards">Choose a card</Link>.
          </p>
        </div>
        <MyCards />
        <VoucherEarn />
        <VoucherBurn />
      </main>
    </PageTransition>
  );
}
