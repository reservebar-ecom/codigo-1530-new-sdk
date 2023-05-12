const prePopulateCards = () => {
    const plpEl = document.querySelector('#plp');
    Object.keys(groups).forEach(group => {
        const groupHeader = document.createElement('h2');
        groupHeader.innerText = groups[group].name;
        groupHeader.classList.add('collection-card-heading');

        const productGrouping = document.createElement('div');
        productGrouping.classList.add('product-grouping');
        const baseURL = 'product';

        productGrouping.innerHTML = `${groups[group].ids.map(id => `
            <a liquid-id="${id}" 
            href="${baseURL}?groupingId=${id}&group=${group}" 
            class="product-card">
           </a>
            `).join('')
            }`;

        plpEl.append(groupHeader);
        plpEl.append(productGrouping);
    });
}

const createProductCart = (product, id) => {

    if (product) {
        const address = getState('address');
        const productCards = document.querySelectorAll(`[liquid-id="${id}"]`);

        const prices = product?.variants?.map(variant =>
            variant?.retailers?.map(retailer =>
                parseFloat(retailer.price)
            )
        )[0];

        const minimumPrice = prices ? Math.min(...prices) : '';

        const hasEngraving = [...new Set(product.variants.map(variant => variant.availability).flat())].some(e => e == 'engraved');

        const productHTML = `
                 <img src="${product?.images?.length ? product?.images[0].slice(6,) : ''}" style="width: 100%;" >
                 ${hasEngraving ? engravingIcon : ''}
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

        [...productCards].forEach(productCard =>{
            productCard.innerHTML = productHTML;
        })
    }
}

(async () => {
    prePopulateCards();

    const liquid = await Liquid({ clientId: '81751648f545a97274df4e2782d01a70' });
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
        const product = products.find(p => p.id == groupingId);
        createProductCart(product, groupingId);
    })
});
