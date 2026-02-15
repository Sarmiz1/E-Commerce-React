import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductName from "../Components/ContainerComponents/ProductName";
import ProductPrice from "../Components/ContainerComponents/ProductPrice";
import ProductRating from "../Components/ContainerComponents/ProductRating";
import ProductImageContainer from "../Components/ContainerComponents/ProductImageContainer";
import AddToCart from "../Components/ContainerComponents/AddToCart";
import { postData } from "../../../api/postData";
import cartContext from "../../../Context/cartContext"; 


vi.mock("../../../api/postData", () => ({
  postData: vi.fn()
}));

describe('HomePage Component', () => {
  let product = {
    keywords:["socks","sports","apparel"],
    id:"e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image:"images/products/athletic-cotton-socks-6-pairs.jpg",
    name:"Black and Gray Athletic Cotton Socks - 6 Pairs",
    rating:{
      stars:4.5,
      count:87
    },
    priceCents:1090,
    createdAt:"2026-02-09T08:54:47.802Z",
    updatedAt:"2026-02-09T08:54:47.802Z"
  }

  let mockLoadCart = vi.fn()

  beforeEach(() => {
    product = {
    keywords:["socks","sports","apparel"],
    id:"e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image:"images/products/athletic-cotton-socks-6-pairs.jpg",
    name:"Black and Gray Athletic Cotton Socks - 6 Pairs",
    rating:{
      stars:4.5,
      count:87
    },
    priceCents:1090,
    createdAt:"2026-02-09T08:54:47.802Z",
    updatedAt:"2026-02-09T08:54:47.802Z"
  }

  mockLoadCart = vi.fn()
  })

  it('Displays the product name Correctly', () => {

    render(<ProductName productName={product.name}/>)

    expect(
      screen.getByText('Black and Gray Athletic Cotton Socks - 6 Pairs')
    ).toBeInTheDocument()
  })

  it('displays the product price Correctly', () => {
    render(<ProductPrice productPrice={product.priceCents} />)

    expect(
      screen.getByText('$10.90')
    ).toBeInTheDocument()
  })

  it('displays the product rating Correctly', () => {
    render(<ProductRating productRating={product.rating} />)

    expect(
      screen.getByText('87')
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('product-stars-image')
    ).toHaveAttribute('src', `images/ratings/rating-${product.rating.stars*10}.png`)
  })

  it('Displays the product image Correctly', () => {

    render(<ProductImageContainer productImage={product.image}/>)

    expect(
      screen.getByTestId('product-image')
    ).toHaveAttribute('src', 'images/products/athletic-cotton-socks-6-pairs.jpg')
  })

  it('Add a product to the Cart', async () => {


  render(
    <cartContext.Provider value={{ loadCart: mockLoadCart }}>
      <AddToCart productId={product.id} />
    </cartContext.Provider>
  )

  const user = userEvent.setup()
  await user.click(screen.getByTestId('add-to-cart-btn'))

  expect(postData).toHaveBeenCalledWith(
    '/api/cart-items',
    {
      productId: product.id,
      quantity: 1
    }
  )

  expect(mockLoadCart).toHaveBeenCalled()
})


})