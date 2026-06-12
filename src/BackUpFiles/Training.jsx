import { useState } from 'react'

const Training = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='space-y-5'>
      <div>
        <h1 class="bg-gradient-to-l from-red-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Premium products for modern shoppers
        </h1>

        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent">
          Woosho Marketplace
        </h1>

        <h2 className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-green-500 bg-clip-text text-transparent">
          Flash Deals
        </h2>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent">
          Shop smarter with Woosho
        </h1>

        <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent">
          Discover your next favorite product
        </h1>

        <p className="line-clamp-2">
          This is a very long product description that should only show two lines before being cut off.
        </p>

        <div className="max-w-sm rounded-2xl border p-4">
          <h3 className="text-lg font-bold line-clamp-1">
            Apple iPhone 15 Pro Max Natural Titanium 256GB
          </h3>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            A powerful smartphone with premium titanium design, excellent camera performance, and long battery life.
          </p>
        </div>

        <p className="truncate">
          Apple iPhone 15 Pro Max Natural Titanium 256GB
        </p>

        <p className="truncate">
          Very long text here
        </p>

        <p className="truncate">
          Very long text here
        </p>

        <p className="w-48 truncate">
          Very long text here
        </p>

        <div className="group rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-xl">
          <div className="aspect-square rounded-2xl bg-gray-100"></div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 truncate">
              Verified Seller
            </p>

            <h3 className="mt-1 text-base font-black text-gray-950 line-clamp-2">
              Premium Wireless Noise Cancelling Headphones With Deep Bass
            </h3>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Designed for long listening sessions with soft cushions, fast charging, and clean studio-quality sound.
            </p>

            <p className="mt-3 text-lg font-black bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              ₦85,000
            </p>
          </div>
        </div>


        <p className={expanded ? "line-clamp-none" : "line-clamp-3"}>
          This is a long product description that can expand when the user clicks read more.
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-bold text-blue-600"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>
    </div>
  )
}

export default Training
