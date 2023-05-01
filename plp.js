const createProductCart = (product, id) => {

    const address = getState('address');
    const retailerTypes = { "onDemand": "Get it now", "engraved": "Engraving Available", "shipping": "Get it Shipped" };
    const productContent = document.querySelector(`[liquid-id="${id}"]`);
    productContent.innerHTML = '';
    let productCard = document.createElement('a');
    const baseURL = '/product';
    productCard.href = baseURL + `?groupingId=${id}`;
    productCard.classList.add('product-card');

    productHTML = `
             <div class="product-image" style='background-image: url(${product.images[0].slice(6,)})' ></div>
             <b>${product.name}</b>
             ${address ?
                    ` 
                        ${product.availability.map(av =>
                        `<p class="product-availability">✓ ${retailerTypes[av]}</p>`
                    ).join('')}
                                ${product.availability.length === 0 ? '<p class="product-unavailable">Unavailable Product</p>' : ''}
                        `
                    :

                    `<p class="product-no-address">Insert Address to Check Availability</p>`
                }
            `;
            
    productCard.innerHTML = productHTML;
    productContent.append(productCard);
}

(async () => {
    const liquid = await new Liquid({ clientId: '81751648f545a97274df4e2782d01a70' });
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

    groupingIds.forEach(groupingId => {
        const product = products[groupingId];
        createProductCart(product, groupingId);
    })
});
