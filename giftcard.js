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
    const el = document.createElement('option');
    el.innerHTML = `
        <option value="${variant.id}">$${variant.price}0</option>
    `;

    return el;
}

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ) != null;
  };

const validateGiftCardInputs = () => {
    const isRecipientEmailValid = validateEmail(document.querySelector('#giftcard-recipients').value);
    const isSenderNameValid = document.querySelector('#giftcard-sender').value.length > 0;
    const isGiftCardValid = isRecipientEmailValid && isSenderNameValid;

    if(isGiftCardValid){
        document.querySelector('#giftcard-atc').disabled = false;
    }else{
        document.querySelector('#giftcard-atc').disabled = true;
    }
}

// Render Gift Card
const renderGiftCard = (product) => {

    // Gift Card Values
    const giftcardValues = document.querySelector('#giftcard-values');

    console.log(product);
    product?.variants?.reverse().forEach((variant, i) => {
        giftcardValues.innerHTML += `
        <option value="${variant.id}">$${variant.price}0</option>
    `;
    });

    // Gift Card Image
    const giftcardImg = document.querySelector('#giftcard-img');
    giftcardImg.src = product?.images[0] || '';

    // Pre-set date as today
    document.getElementById('giftcard-sendDate').valueAsDate = new Date();

    // Validate Gift Card Inputs
    document.querySelector('#giftcard-recipients').addEventListener('input', function(){
        validateGiftCardInputs();
    });

    document.querySelector('#giftcard-sender').addEventListener('input', function(){
        validateGiftCardInputs();
    });


    // Gift Card ATC
    const addGiftCard = document.querySelector('#giftcard-atc');
    addGiftCard.addEventListener('click', async function(){

        showLoader();

        const cart = getState('cart');

        const variantId = document.querySelector('#giftcard-values').value;
        const message = document.querySelector('#giftcard-message').value;
        const sender = document.querySelector('#giftcard-sender').value;
        const sendDate = document.querySelector('#giftcard-sendDate').value;
        const recipients = document.querySelector('#giftcard-recipients').value;

        if(!window.liquid){
            await setLiquid();
        }

        const updatedCart = await liquid.cart({
            ...(cart && { id: cart.id }),
            cartItems: [
                {
                    variantId: variantId,
                    quantity: 1,
                    options: {
                        message: message,
                        recipients: [recipients],
                        sender: sender,
                        sendDate: sendDate
                    }
                }
            ],
        });
    
        setState({ name: 'cart', value: updatedCart });
        hideLoader();
    });
}
 
// PRODUCT Event Listener
window.addEventListener('products', function (e) {
    const products = getState('products');
    // products?.forEach(product => carouselCard(product, product.id));

    const groupingId = getState('grouping_id');
    const product = products?.find(product => product.id == groupingId);
    
    renderGiftCard(product);
});   