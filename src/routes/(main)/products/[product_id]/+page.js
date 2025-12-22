import { api_get } from '$lib/index.js';
import { PHX_HTTP_PROTOCOL, PHX_ENDPOINT } from '$lib/constants';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	const url = PHX_HTTP_PROTOCOL + PHX_ENDPOINT;
	const product_id = params.product_id;
    console.log('product id', product_id)
	
	try {
		// Fetch product details and related data
		const [allProductsRes, categoriesRes] = await Promise.all([
			api_get(url, { scope: 'datatable', model: 'MerchantProduct', limit: 100 }).catch(() => []),
			api_get(url, { scope: 'ecommerce_categories' }).catch(() => [])
		]);
		
		const allProducts = (allProductsRes?.data && Array.isArray(allProductsRes.data)) ? allProductsRes.data : [];
		const categories = Array.isArray(categoriesRes) ? categoriesRes : [];
		
		// Find the product by ID
		const product = allProducts.find(p => p.id == product_id) || null;

		// Fetch merchant profile (contact + wallet) for barter process
		const merchant =
			product?.merchant_id != null
				? await api_get(url, { scope: 'merchant_profile', merchant_id: product.merchant_id }).catch(
						() => null
					)
				: null;
		
		// Get related products (same category or random if no category match)
		let relatedProducts = [];
		if (product && product.category_id) {
			relatedProducts = allProducts
				.filter(p => p.id != product.id && p.category_id === product.category_id)
				.slice(0, 3);
		}
		
		// If not enough related products, fill with random products
		if (relatedProducts.length < 3) {
			const randomProducts = allProducts
				.filter(p => p.id != product?.id)
				.slice(0, 3 - relatedProducts.length);
			relatedProducts = [...relatedProducts, ...randomProducts];
		}
		
		// Get category name for breadcrumb
		const category = categories.find(c => c.id === product?.category_id);
		console.log('product prep', product) ;
		return {
			product: product || null,
			merchant: merchant || null,
			relatedProducts: relatedProducts.slice(0, 3),
			category: category || null
		};
	} catch (error) {
		console.error('Error loading product:', error);
		return {
			product: null,
			merchant: null,
			relatedProducts: [],
			category: null
		};
	}
}

