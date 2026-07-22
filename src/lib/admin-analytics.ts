import "server-only";
import { prisma } from "./prisma";

// ── Revenue & Order Stats ────────────────────────────────────────────────────

export async function getOverviewStats() {
  try {
    const [orders, products, subscribers] = await Promise.all([
      prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
      prisma.product.findMany({ select: { status: true } }),
      prisma.subscriber.count(),
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const nonCancelledOrders = orders.filter((o) => o.status !== "CANCELLED");
    const thisMonthOrders = nonCancelledOrders.filter((o) => o.createdAt >= thirtyDaysAgo);
    const lastMonthOrders = nonCancelledOrders.filter(
      (o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo,
    );

    const totalRevenue = nonCancelledOrders.reduce((s, o) => s + o.total, 0);
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.total, 0);
    const revenueChange =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
          ? 100
          : 0;

    const totalOrders = orders.length;
    const thisMonthOrderCount = orders.filter((o) => o.createdAt >= thirtyDaysAgo).length;
    const lastMonthOrderCount = orders.filter(
      (o) => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo,
    ).length;
    const ordersChange =
      lastMonthOrderCount > 0
        ? ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100
        : thisMonthOrderCount > 0
          ? 100
          : 0;

    const availableProducts = products.filter((p) => p.status === "AVAILABLE").length;
    const totalProducts = products.length;
    const soldProducts = products.filter((p) => p.status === "SOLD").length;

    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const avgOrderValue =
      nonCancelledOrders.length > 0
        ? Math.round(totalRevenue / nonCancelledOrders.length)
        : 0;

    return {
      totalRevenue,
      thisMonthRevenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalOrders,
      thisMonthOrderCount,
      ordersChange: Math.round(ordersChange * 10) / 10,
      availableProducts,
      totalProducts,
      soldProducts,
      pendingOrders,
      avgOrderValue,
      subscribers,
    };
  } catch {
    return {
      totalRevenue: 0,
      thisMonthRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      thisMonthOrderCount: 0,
      ordersChange: 0,
      availableProducts: 0,
      totalProducts: 0,
      soldProducts: 0,
      pendingOrders: 0,
      avgOrderValue: 0,
      subscribers: 0,
    };
  }
}

// ── Daily Revenue (for chart) ────────────────────────────────────────────────

export async function getDailyRevenue(days = 30) {
  const map: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    });

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (key in map) map[key] += o.total;
    }
  } catch {
    // Return zeroed map on database error
  }

  return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
}

// ── Order Status Distribution ────────────────────────────────────────────────

export async function getOrderStatusCounts() {
  const result: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  try {
    const orders = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    for (const o of orders) result[o.status] = o._count.id;
  } catch {
    // Return empty counts on error
  }
  return result;
}

// ── Geographic Breakdown ─────────────────────────────────────────────────────

export async function getGeographicBreakdown() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { governorate: true, total: true },
    });

    const map: Record<string, { count: number; revenue: number }> = {};
    for (const o of orders) {
      if (!map[o.governorate]) map[o.governorate] = { count: 0, revenue: 0 };
      map[o.governorate].count++;
      map[o.governorate].revenue += o.total;
    }

    return Object.entries(map)
      .map(([governorate, data]) => ({ governorate, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } catch {
    return [];
  }
}

// ── Top Products by Revenue ──────────────────────────────────────────────────

export async function getTopProducts(limit = 5) {
  try {
    const items = await prisma.orderItem.findMany({
      include: {
        product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
        order: { select: { status: true } },
      },
    });

    const map: Record<
      string,
      { nameEn: string; nameAr: string; revenue: number; unitsSold: number; image: string | null }
    > = {};

    for (const item of items) {
      if (item.order.status === "CANCELLED") continue;
      if (!map[item.productId]) {
        map[item.productId] = {
          nameEn: item.nameEn,
          nameAr: item.nameAr,
          revenue: 0,
          unitsSold: 0,
          image: item.product.images[0]?.url ?? null,
        };
      }
      map[item.productId].revenue += item.priceAtPurchase;
      map[item.productId].unitsSold++;
    }

    return Object.entries(map)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ── Recent Orders Feed ───────────────────────────────────────────────────────

export async function getRecentOrders(limit = 8) {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        customerName: true,
        total: true,
        status: true,
        paymentMethod: true,
        governorate: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });
  } catch {
    return [];
  }
}

// ── Payment Method Breakdown ─────────────────────────────────────────────────

export async function getPaymentMethodStats() {
  const map: Record<string, { count: number; revenue: number }> = {
    COD: { count: 0, revenue: 0 },
    MANUAL_TRANSFER: { count: 0, revenue: 0 },
    PAYMOB: { count: 0, revenue: 0 },
  };
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { paymentMethod: true, total: true },
    });

    for (const o of orders) {
      if (!map[o.paymentMethod]) map[o.paymentMethod] = { count: 0, revenue: 0 };
      map[o.paymentMethod].count++;
      map[o.paymentMethod].revenue += o.total;
    }
  } catch {
    // Return empty map on error
  }
  return map;
}

// ── Subscriber Growth (last 30 days) ────────────────────────────────────────

export async function getSubscriberGrowth(days = 14) {
  const map: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    map[d.toISOString().slice(0, 10)] = 0;
  }

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const subscribers = await prisma.subscriber.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    for (const s of subscribers) {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (key in map) map[key]++;
    }
  } catch {
    // Return empty growth on error
  }

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}
