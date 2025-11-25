import { writable } from 'svelte/store';

const initial = typeof localStorage !== 'undefined'
	? JSON.parse(localStorage.getItem('svt_cart') || '[]')
	: [];

export const cartItems = writable(initial);

cartItems.subscribe((v) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('svt_cart', JSON.stringify(v));
	}
});

export function addItem(product) {
	cartItems.update((items) => {
		const idx = items.findIndex((i) => i.product_id === product.id);
		if (idx >= 0) {
			const copy = [...items];
			copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
			return copy;
		}
		return [...items, { product_id: product.id, name: product.name, price: product.retail_price, img_url: product.img_url, qty: 1 }];
	});
}

export function removeItem(productId) {
	cartItems.update((items) => items.filter((i) => i.product_id !== productId));
}

export function setQty(productId, qty) {
	cartItems.update((items) => items.map((i) => (i.product_id === productId ? { ...i, qty } : i)));
}

export function clearCart() {
	cartItems.set([]);
}


