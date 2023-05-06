const engravingIcon = `<div class="engraving-icon-wrapper"><div title="Engraving Available" class="engraving-icon"><small>ENGRAVING </small><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ticket-detailed" viewBox="0 0 16 16">
<path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
<path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13Z"/>
</svg></div></div>`;

const createProductCart = (product, id) => {

    if (product) {
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

        const minimumPrice = prices ? Math.min(...prices) : '';

        const hasEngraving = [...new Set(product.variants.map(variant => variant.availability).flat())].some(e => e == 'engraved');

        console.log(`>>`, hasEngraving);

        productHTML = `
              ${hasEngraving ? engravingIcon : ''}
                 <img src="${product?.images[0].slice(6,)}" style="width: 100%;" >
                 ${address ?
                ` 
                        ${product?.variants?.length === 0 ? '<p class="product-unavailable">Unavailable Product</p>' : ''}
                        <h3 class="product-price">$ ${minimumPrice}</h3>
                `
                :
                `<p class="product-no-address">Insert Address to Check Availability</p>`
            }
            <b>${product?.name}</b>
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
