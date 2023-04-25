const createProductCart = (product, id) => {
    const retailerTypes = { "onDemand": "Get it now", "engraved": "Engraving Available", "shipping": "Get it Shipped" };
    const productContent = document.querySelector(`[liquid-id="${id}"]`);
    let productCard = document.createElement('a');
    productCard.href = `/pdp?id=${id}`;
    productCard.classList.add('product-card');

    productCard.innerHTML = `
             <div class="product-image" style='background-image: url(${product.images[0].slice(6,)})' ></div>
             <b>${product.name}</b>
             ${product.availability.map(av =>
        `<p class="product-availability">✓ ${retailerTypes[av]}</p>`
    ).join('')}
            `;
    productContent.append(productCard);
}

const liquidIdEls = document.querySelectorAll('[liquid-id]');
const groupingIds = [...liquidIdEls].map(el => el.getAttribute('liquid-id'));

(async () => {

    const liquid = await new Liquid({ clientId: '81751648f545a97274df4e2782d01a70' });
    window.liquid = liquid;

    setState({ name: 'grouping_ids', value: groupingIds || null });

    const products = await liquid.product({
        ids: groupingIds,
        shipAddress: '120 Nassau Street, Brooklyn, NY 11201, USA'
    });
    
    setState({ name: 'products', value: products || null });

    console.log("# products", products);

    groupingIds.forEach(groupingId => {
        const product = products[groupingId];
        createProductCart(product, groupingId);
    })
})();
