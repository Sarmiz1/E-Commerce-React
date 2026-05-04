import { AnimatePresence } from "framer-motion";
import CancelModal from "./Components/CancelModal";
import EmptyState from "./Components/EmptyState";
import FilterToolbar from "./Components/FilterToolbar";
import OrderDrawer from "./Components/OrderDrawer";
import OrdersGrid from "./Components/OrdersGrid";
import OrdersHero from "./Components/OrdersHero";
import OrdersPromo from "./Components/OrdersPromo";
import ResultsCount from "./Components/ResultsCount";
import StatsBar from "./Components/StatsBar";
import useOrdersPageController from "./Hooks/useOrdersPageController";
import { OR_STYLES } from "./Utils/ordersConstants";

export default function OrdersPage() {
  const {
    cancelTarget,
    closeDrawer,
    displayOrders,
    goToProducts,
    handleCancelClick,
    handleCancelConfirm,
    handleCancelDismiss,
    handleReorder,
    isCancelling,
    isLoading,
    openDrawer,
    orders,
    reorderLoading,
    resetFilters,
    search,
    selectedOrder,
    setSearch,
    setSort,
    setStatusFilter,
    showDrawer,
    sort,
    statusFilter,
  } = useOrdersPageController();

  const hasOrders = orders.length > 0;
  const hasResults = displayOrders.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <style>{OR_STYLES}</style>

      <OrdersHero isLoading={isLoading} ordersCount={orders.length} onShop={goToProducts} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {!isLoading && hasOrders ? <StatsBar orders={orders} /> : null}

        <FilterToolbar
          search={search}
          onSearch={setSearch}
          status={statusFilter}
          onStatus={setStatusFilter}
          sort={sort}
          onSort={setSort}
        />

        {!isLoading ? (
          <ResultsCount count={displayOrders.length} search={search} statusFilter={statusFilter} />
        ) : null}

        {!isLoading && !hasResults ? (
          <EmptyState
            statusFilter={statusFilter}
            search={search}
            onReset={resetFilters}
            onShop={goToProducts}
          />
        ) : (
          <OrdersGrid isLoading={isLoading} orders={displayOrders} onOpen={openDrawer} />
        )}

        {!isLoading && hasOrders ? <OrdersPromo onShop={goToProducts} /> : null}
      </div>

      <AnimatePresence>
        {showDrawer && selectedOrder ? (
          <OrderDrawer
            order={selectedOrder}
            onClose={closeDrawer}
            onCancel={handleCancelClick}
            onReorder={handleReorder}
            isCancelling={isCancelling}
            isReordering={reorderLoading}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {cancelTarget ? (
          <CancelModal
            onConfirm={handleCancelConfirm}
            onDismiss={handleCancelDismiss}
            isLoading={isCancelling}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
