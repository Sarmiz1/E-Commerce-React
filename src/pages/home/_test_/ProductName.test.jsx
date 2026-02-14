import { it, expect, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductName from "../Components/ContainerComponents/ProductName";
import ProductPrice from "../Components/ContainerComponents/ProductPrice";
import ProductRating from "../Components/ContainerComponents/ProductRating";
import ProductImageContainer from "../Components/ContainerComponents/ProductImageContainer";


describe('HomePage Component', () => {
  const product = {
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

})