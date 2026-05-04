const fs = require('fs');

const p = 'src/Features/Orders/Tracking/TrackingPage.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'import { useNavigate, useSearchParams, useNavigation, useLoaderData } from "react-router-dom";',
  \`import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { OrderAPI } from "../../../api/orderApi";\`
);

c = c.replace(
  /  const navigation = useNavigation\(\);\n  const ordersLoading = navigation\.state === "loading";\n\n  \/\/ ── Orders from loader ────────────────────────────────────────────────────\n  const ordersData = useLoaderData\(\);\n  const orders = useMemo\(\(\) => ordersData \|\| \[\], \[ordersData\]\);/,
  \`  // ── Orders from hook ──────────────────────────────────────────────────────
  const { data: recentOrdersData, isLoading: ordersLoading } = useOrders();
  const orders = useMemo(() => recentOrdersData || [], [recentOrdersData]);\`
);

c = c.replace(
  /  \/\/ ── Derive tracked order ──────────────────────────────────────────────────\n  const trackedOrder = useMemo\(\(\) => {\n    if \(!trackedId \|\| !orders\.length\) return null;\n    const q = trackedId\.toLowerCase\(\);\n    return orders\.find\(\(o\) =>\n      o\.id\?\.toLowerCase\(\)\.includes\(q\) \|\|\n      \(o\.order_items \|\| \[\]\)\.some\(\(i\) => i\.products\?\.name\?\.toLowerCase\(\)\.includes\(q\)\)\n    \) \?\? null;\n  }, \[trackedId, orders\]\);/,
  \`  // ── Fetch specific order via TanStack Query ───────────────────────────────
  const { data: fetchedOrder, isLoading: isQueryLoading } = useQuery({
    queryKey: ['order', trackedId],
    queryFn: () => OrderAPI.getOrder(trackedId),
    enabled: !!trackedId,
    retry: false
  });

  // ── Derive tracked order ──────────────────────────────────────────────────
  const trackedOrder = useMemo(() => {
    if (fetchedOrder && fetchedOrder.id) return fetchedOrder;
    if (!trackedId || !orders.length) return null;
    const q = trackedId.toLowerCase();
    return orders.find((o) =>
      o.id?.toLowerCase().includes(q) ||
      (o.order_items || []).some((i) => i.products?.name?.toLowerCase().includes(q))
    ) ?? null;
  }, [fetchedOrder, trackedId, orders]);\`
);

c = c.replace('const notFound = trackedId && !isSearching && !trackedOrder;', 'const notFound = trackedId && !isSearching && !isQueryLoading && !trackedOrder;');

c = c.replace(
  /disabled=\{\!inputVal\.trim\(\) \|\| isSearching\}/g,
  'disabled={!inputVal.trim() || isSearching || isQueryLoading}'
);

c = c.replace(
  /\{isSearching \? <Spinner size=\{14\} \/> : <Ic\.Search style=\{\{ width: 14, height: 14 \}\} \/>\}/g,
  '{(isSearching || isQueryLoading) ? <Spinner size={14} /> : <Ic.Search style={{ width: 14, height: 14 }} />}'
);

c = c.replace(
  /\{isSearching \? "Scanning…" : "Track"\}/g,
  '{(isSearching || isQueryLoading) ? "Scanning…" : "Track"}'
);

c = c.replace(
  /\{isSearching && \(/g,
  '{(isSearching || isQueryLoading) && ('
);

c = c.replace(
  /\{notFound && \!isSearching && \(/g,
  '{notFound && !(isSearching || isQueryLoading) && ('
);

c = c.replace(
  /\{trackedOrder && \!isSearching && \(/g,
  '{trackedOrder && !(isSearching || isQueryLoading) && ('
);

c = c.replace(
  /\{\!trackedOrder && \!isSearching && <HowItWorks \/>\}/g,
  '{!trackedOrder && !(isSearching || isQueryLoading) && <HowItWorks />}'
);

fs.writeFileSync(p, c);
