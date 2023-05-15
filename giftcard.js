const addToCart = async () => {
    showLoader();
    const retailerOption = document.querySelector('div.variant.enabled');
    if (retailerOption) {
        const variantId = retailerOption.querySelector('input:checked').value;
        const quantity = document.querySelector(`select.qty-selector.enabled`).value;
        const engravingOptions = document.querySelector('#engraving-checkbox').checked && getState('engraving');
        await updateCartItem({ variantId, quantity, engravingOptions });
    }
    hideLoader();
}


// Carousel
const prePopulateCarousel = () => {
    const carousel = document.querySelector('#pdp-carousel');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const group = urlParams.get('group');

    const productGrouping = document.createElement('div');
    productGrouping.classList.add('item');

    carousel.innerHTML = `${groups[group].ids.map(id => `
        <div liquid-id="${id}" class="item product-card"> 
            ${id}
        </div>
        `).join('')
        }`;
}


const carouselCard = (product, id) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const group = urlParams.get('group');
    const baseURL = 'product';

    if (product) {
        const address = getState('address');
        const id = product.id;
        const productCard = document.querySelector(`[liquid-id="${id}"].item`);
        const prices = product?.variants?.map(variant =>
            variant?.retailers?.map(retailer =>
                parseFloat(retailer.price)
            )
        )[0];

        console.log(product);

        const minimumPrice = prices ? Math.min(...prices) : '';
        const productHTML = `
                 <div class="product-backdrop">
                        <b>${product?.name}</b>
                        ${address ?
                ` 
                            ${product?.variants?.length === 0 ? '<p class="product-unavailable">Unavailable Product</p>' : ''}
                            <h3 class="product-price">$ ${minimumPrice}</h3>
                            `
                :
                `<p class="product-no-address">Insert Address to Check Availability</p>`
            }
                    <a class="el-content uk-button uk-button-default" target="_blank" href="${baseURL}?groupingId=${id}&group=${group}">
                        Buy Now
                    </a>
                 </div>
                `;

        productCard.style.backgroundImage = `url(${product?.images?.length ? product?.images[0].slice(6,) : ''})`;
        productCard.innerHTML = productHTML;
    }
}

const loadLiquid = async () => {

    // Pre-populate Carousel
    prePopulateCarousel();

    // Grouping IDs
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const groupingId = urlParams.get('groupingId');
    const group = urlParams.get('group');
    const groupingIdValues = groups[group].ids;

    setState({ name: 'grouping_id', value: groupingId });
    setState({ name: 'grouping_ids', value: groupingIdValues });

    // Dispatch Address Event
    window.dispatchEvent(new Event('address'));
}

// Initialize

// Load Liquid, Address and Product info
(async () => {
    showLoader();
    await loadLiquid();
    window.dispatchEvent(new Event('products'));
    hideLoader();
})();

const createGiftCardValue = (variant, index) => {
    const el = document.createElement('div');
    el.classList.add('giftcard-value');
    el.innerHTML = `
        <input type="radio" value="${variant.id}" id="value-${variant.id}" name="gitfcard-value" ${index==0?'checked':''}>
        <label for="value-${variant.id}">$${variant.price}0</label>
    `;

    return el;
}

// Render Gift Card
const renderGiftCard = (product) => {

    // Gift Card Values
    const giftcardValues = document.querySelector('#giftcard-values');
    product.variants.reverse().forEach((variant, i) => {
        const giftCardValue = createGiftCardValue(variant, i);
        giftcardValues.append(giftCardValue);
    });

    // Gift Card Image
    const giftcardImg = document.querySelector('#giftcard-img');
    giftcardImg.src = product.images[0];

    // Gift Card ATC
    const addGiftcard = document.querySelector('#add-giftcard');
    addGiftcard.addEventListener('click', async function(){
        const cart = getState('cart');
        const variantId = document.querySelector('input[name=gitfcard-value]:checked').value;
        if(!window.liquid){
            await setLiquid();
        }
        const updatedCart = await liquid.cart({
            ...(cart && { id: cart.id }),
            cartItems: [
                {
                    variantId: `${variantId}`,
                    quantity: 1,
                    options: {
                        message: 'Happy Bday',
                        recipients: 'lucas@email.com',
                        sender:'lucas',
                        sendDate:'01-01-2023'
                    }
                }
            ],
        });
    
        setState({ name: 'cart', value: updatedCart });
    });
}
 

// PRODUCT Event Listener
window.addEventListener('products', function (e) {
    const products = getState('products');
    products.forEach(product => carouselCard(product, product.id));

    const groupingId = getState('grouping_id');
    const product = products.find(product => product.id == groupingId);
    renderGiftCard(product);
});   