export default function Card() {
  return (
    <div style={{ width: 300, padding: 20, border: "1px solid #ddd" }}
      className="mt-40"
    >
      <img src="https://via.placeholder.com/300x200" alt="" />
      <h3>Product Title</h3>
      <p>Product description goes here...</p>
    </div>
  );
}


export function CardSkeleton() {
  return (
    <div style={{ width: 300, padding: 20, border: "1px solid #ddd" }}
      className="mt-5 mb-40 animate-pulse">
      <div style={{ height: 200, background: "#eee", marginBottom: 10 }} />
      <div style={{ height: 20, background: "#eee", marginBottom: 10 }} />
      <div style={{ height: 15, background: "#eee", width: "80%" }} />
    </div>
  );
}