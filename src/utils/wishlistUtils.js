// utils/wishlistUtils.js

const WISHLIST_KEY = 'wishlist'

export const getWishlist = () => {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
}

export const isInWishlist = (id) => {
  const list = getWishlist()
  return list.some((item) => item._id === id)
}

export const addToWishlist = (product) => {
  const list = getWishlist()
  if (!list.some((item) => item._id === product._id)) {
    list.push(product)
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
  }
}

export const removeFromWishlist = (id) => {
  const list = getWishlist().filter((item) => item._id !== id)
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
}
