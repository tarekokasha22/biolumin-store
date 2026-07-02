"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";

type Person = { nameAr: string; nameEn: string; cityAr: string; cityEn: string };
type Product = { nameAr: string; nameEn: string; image: string | null };
type Activity = { person: Person; product: Product; actionKey: string; minutesAgo: number };

// Intentionally excludes "bought" — the toast surfaces soft interest signals
// (viewing / adding to bag), never a completed purchase.
const ACTIONS = ["viewing", "added", "favorited"];

export function LiveActivityToast() {
  const t = useTranslations("activity");
  const tp = useTranslations("product");
  const locale = useLocale();
  const pathname = usePathname();
  const [pool, setPool] = useState<{ people: Person[]; products: Product[] } | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [show, setShow] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const visible = pathname === "/" || pathname === "/shop" || pathname.startsWith("/shop/");

  useEffect(() => {
    if (!visible) return;
    fetch("/api/activity-feed")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.people?.length && data?.products?.length && setPool(data))
      .catch(() => {});
  }, [visible]);

  useEffect(() => {
    if (!pool || !visible) return;

    const cycle = () => {
      const person = pool.people[Math.floor(Math.random() * pool.people.length)];
      const product = pool.products[Math.floor(Math.random() * pool.products.length)];
      const actionKey = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const minutesAgo = 2 + Math.floor(Math.random() * 15);
      setActivity({ person, product, actionKey, minutesAgo });
      setShow(true);
      timers.current.push(
        setTimeout(() => {
          setShow(false);
          timers.current.push(setTimeout(cycle, 18000 + Math.random() * 12000));
        }, 4500),
      );
    };

    timers.current.push(setTimeout(cycle, 6000));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pool, visible]);

  if (!visible || !activity) return null;
  const isAr = locale === "ar";
  const name = isAr ? activity.person.nameAr : activity.person.nameEn;
  const city = isAr ? activity.person.cityAr : activity.person.cityEn;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-58 flex justify-center px-3.5">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-[410px] items-center gap-2.5 rounded-[14px] border border-champagne/22 bg-[rgba(18,18,21,.97)] p-2.5 shadow-[0_12px_36px_-10px_rgba(0,0,0,.7)]"
          >
            {activity.product.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activity.product.image} alt="" className="h-12 w-10 flex-none rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1 leading-[1.35]">
              <div className="font-body truncate text-[12.5px] text-ivory">
                <strong className="font-semibold">{name}</strong> {t(activity.actionKey)}
              </div>
              <div className="font-body mt-0.5 text-[10.5px] text-ivory/50">
                {city} · {t("minutesAgo", { count: activity.minutesAgo })}
              </div>
            </div>
            <span className="font-body flex-none text-[9px] tracking-[0.06em] text-aqua">✓ {tp("verified")}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
