import PageErrorFallback from "../../../Components/PageErrorFallback";

export default function BuyerDashboardFallback(props) {
  return (
    <PageErrorFallback
      {...props}
      title="Buyer dashboard unavailable"
      message="We could not load your buyer dashboard. Try again, or return home while the issue is resolved."
    />
  );
}
