const createProductCart = (product, id) => {

    const address = getState('address');
    const retailerTypes = { "onDemand": "Get it now", "engraved": "Engraving Available", "shipping": "Get it Shipped" };
    const productContent = document.querySelector(`[liquid-id="${id}"]`);
    productContent.innerHTML = '';
    let productCard = document.createElement('a');
    productCard.href = `/pdp?id=${id}`;
    productCard.classList.add('product-card');

    productCard.innerHTML = `
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
    productContent.append(productCard);
}

const liquidIdEls = document.querySelectorAll('[liquid-id]');
const groupingIds = [...liquidIdEls].map(el => el.getAttribute('liquid-id'));

// PRODUCTS Event Listener
window.addEventListener('products', async function (e) {
    const products = getState('products');
    const groupingIds = getState('grouping_ids');

    groupingIds.forEach(groupingId => {
        const product = products[groupingId];
        createProductCart(product, groupingId);
    })
});

(async () => {

    const liquid = await new Liquid({ clientId: '81751648f545a97274df4e2782d01a70' });
    window.liquid = liquid;

    setState({ name: 'grouping_ids', value: groupingIds || null });

    const address = getState('address');

    const products = await liquid.product({
        ids: groupingIds,
        shipAddress: '120 Nassau Street, Brooklyn, NY 11201, USA'
    });

    setState({ name: 'products', value: products || null });
})();
