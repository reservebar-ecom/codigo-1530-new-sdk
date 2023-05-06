const createProductCart = (product, id) => {

    if(product){
        const address = getState('address');
        const productContent = document.querySelector(`[liquid-id="${id}"]`);
        productContent.innerHTML = '';
        let productCard = document.createElement('a');
        const baseURL = 'product';
        productCard.href = baseURL + `?groupingId=${id}`;
        productCard.classList.add('product-card');

        const prices = product?.variants?.map(variant =>
            variant.retailers.map(retailer =>
                parseFloat(retailer.price)
            )
        )[0];

        const minimumPrice = prices ?  Math.min(...prices) : '';
        
        productHTML = `
                 <div class="product-image" style='background-image: url(${product?.images[0].slice(6,)})' ></div>
                 <b>${product?.name}</b>
                 ${address ?
                ` 
                        ${product?.variants?.length === 0 ? '<p class="product-unavailable">Unavailable Product</p>' : ''}
                        <h3 class="product-price">$ ${minimumPrice}</h3>
                `
                :
                `<p class="product-no-address">Insert Address to Check Availability</p>`
            }
                `;
    
        productCard.innerHTML = productHTML;
        productContent.append(productCard);
    }
}

(async () => {
    const liquid = await new Liquid({ clientId: 'eefe7f3c5f2323e30fd42ea2e8091d09', env: 'staging' });
    window.liquid = liquid;

    const liquidIdEls = document.querySelectorAll('[liquid-id]');
    const groupingIds = [...liquidIdEls].map(el => el.getAttribute('liquid-id'));
    setState({ name: 'grouping_ids', value: [...new Set(groupingIds)] || null });

    window.dispatchEvent(new Event('address'));
})();

// PRODUCTS Event Listener
window.addEventListener('products', async function (e) {
    const products = getState('products');
    const groupingIds = getState('grouping_ids');

    groupingIds.forEach((groupingId, index) => {
        const product = products[index];
        createProductCart(product, groupingId);
    })
});
