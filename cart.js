const updateCartCountItems = (cart) => {
    if (cart) {
        const totalNumberElements = document.querySelectorAll('.cart-num-items');
        totalNumberElements.forEach(el => {
            el.innerHTML = cart?.itemCount;
        })
    }
}

const updateCartItem = async ({ variantId, quantity, engravingOptions }) => {

    const cart = getState('cart');
    const updatedCart = await liquid.cart({
        ...(cart && { id: cart.id }),
        cartItems: [
            {
                variantId: `${variantId}`,
                quantity: quantity,
                ...(engravingOptions && { options: engravingOptions })
            }
        ],
    });

    setState({ name: 'cart', value: updatedCart });
}

const deleteCartItem = async (variantId) => {
    await updateCartItem({ variantId, quantity: 0 });
}

const cartItemHTML = (cartItem) => {
    return `
            <img src="${cartItem.product.imageUrl}">
            <div class="cart-item-info">
                <div class="cart-item-top">
                    <h5>${cartItem.productGrouping.name}</h5>
                    <button class="remove-item" onclick="deleteCartItem(${cartItem.product.id})">✕</button>
                </div>
                <small>${cartItem.deliveryExpectation}</small>
                <small>${cartItem.product.volume.toUpperCase()} ${cartItem.product.containerType}</small> 
                <div class="cart-qty-wrapper"> 
                    <select onchange="updateCartItem({variantId: ${cartItem.product.id}, quantity: this.value})" name="qty" id="qty-${cartItem.identifier}">
                        ${[...Array(cartItem.product.inStock).keys()].map(index =>
        `<option value="${index + 1}" ${cartItem.quantity == index + 1 ? 'selected="selected"' : ''}>${index + 1}</option>`
    ).join('')
        }
                    </select>
                    $${cartItem.product.price}
                </div>
            </div>

            ${cartItem.itemOptions ?
            `<div class="cart-item-engraving"> 
                    <h5>Engraved Lines</h5>
                    <ul>     
                        ${Object.keys(cartItem.itemOptions).map(key => {
                if (key.includes('line') && cartItem.itemOptions[key]) {
                    return `<li>${cartItem.itemOptions[key]}</li>`
                }
                return ''
            }).join('')}
                    </ul>
                </div>`
            : ''
        }
        `
}

const updateCartDrawer = (cart) => {
    const cartDrawer = document.querySelector('#cart-items');
    cartDrawer.innerHTML = '';
    if (cart) {
        cart.cartItems.forEach(
            cartItem => {
                let newCartItem = document.createElement('div');
                newCartItem.classList.add('cart-item');
                newCartItem.innerHTML = cartItemHTML(cartItem);
                cartDrawer.append(newCartItem)
            }
        )
    }
}

const updateCartSubtotal = (cart) => {
    if (cart) {
        document.querySelector('#cart-subtotal').innerHTML = `$ ${cart.subtotal}`;
    }
}

const isCartOpen = () => {
    const isOpen = window.localStorage.getItem('_liquid_is_cart_open');
    return isOpen == 'true'
}

const openCart = () => {
    const cartDrawer = document.querySelector('#cart-container');
    cartDrawer.classList.add('open');
    cartDrawer.classList.remove('closed');
    setState({ name: 'cart_open', value: true });
}

const closeCart = () => {
    const cartDrawer = document.querySelector('#cart-container');
    cartDrawer.classList.remove('open');
    cartDrawer.classList.add('closed');
    setState({ name: 'cart_open', value: false });
}

const updateCartDependencies = (cart) => {
    updateCartCountItems(cart);
    updateCartDrawer(cart);
    updateCartSubtotal(cart);
}

const checkout = async () => {
    showLoader();
    const cart = getState('cart');
    const address = getState('address');
    const placeId = address.placeId;
    const addressObj = await liquid.address({ placeId: placeId });

    const checkoutObj = await liquid.checkout({
        cartId: cart.id,
        address: addressObj
    });

    window.location.href = checkoutObj.url;
    hideLoader();
}

// CART Event Listener
window.addEventListener('cart', function (e) {
    const cart = getState('cart');

    updateCartDependencies(cart);

    const isOpen = isCartOpen();
    if (!isOpen) {
        openCart()
    }
});


// Set onclick function 
document.querySelector('#close-cart').onclick = closeCart;
document.querySelector('#cart-backdrop').onclick = closeCart;
document.querySelector('#open-cart').onclick = () => {
    const cartDrawer = document.querySelector('#cart-container');
    const isCartOpen = getState('cart_open')

    if (isCartOpen) {
        closeCart();
    } else {
        openCart();
    }
}

document.querySelector('#checkout').onclick = async () => {
    await checkout()
}

// Load stored objects
let cart = getState('cart');
updateCartDependencies(cart);
