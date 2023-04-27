const getVariantRetailers = (variant) => {

    const retailerTypes = ["onDemand", "engraved", "shipping"];
    const variantRetailers = retailerTypes.map(type => {
        return variant.retailers.filter(e => e.type == type).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
    }).filter(e => e);

    const variantRetailersUniqueID = [...new Set(variantRetailers.map(v => v.id))].map(id => variantRetailers.find(v => v.id == id));

    return variantRetailersUniqueID
}

const quantitySelectorHTML = ({ product, variantId, isActive }) => {
    const variants = product.variants.map(variant => variant.retailers).flat();
    const variant = variants.find(variant => variant.id == variantId)
    const inStockQuantity = variant.inStock;

    return `
    <select class="qty-selector uk-button ${isActive && 'enabled'}" variant-id="${variantId}">
        ${[...Array(inStockQuantity).keys()].map(index =>
        `<option value="${index + 1}">${index + 1}</option>`
    ).join('')}
    </select>
    `
}

const handleSizeSelector = (selectedSize) => {
    const sizeVariants = document.querySelectorAll('.variant');
    [...sizeVariants].forEach(sizeVariant => {

        // Change image to match the one corresponding the size
        const product = getState('product');
        const productVariant = product.variants.find(e => e.size == selectedSize)
        if (productVariant.images[0]) {
            document.querySelector('#product-img').src = productVariant.images[0];
        }

        // Select the corresponding retailers for Size
        const size = sizeVariant.getAttribute('size');
        sizeVariant.classList.remove('enabled');

        if (size == selectedSize) {
            sizeVariant.classList.add('enabled');

            // Click on the first retailer
            const firstRetailerInput = sizeVariant.querySelector('.variant-id');
            firstRetailerInput.click();

            // Make the block color as selected
            const firstRetailer = sizeVariant.querySelector('.variant-option');
            firstRetailer.classList.add('selected')

            // Allow only the corresponding Quantity Selector
            const variantId = firstRetailerInput.value;
            [...document.querySelectorAll('.qty-selector')].forEach(qtySelector => {

                if (qtySelector.getAttribute('variant-id') == variantId) {
                    qtySelector.classList.add('enabled');
                } else {
                    qtySelector.classList.remove('enabled');
                }
            });
        }
    });
}

const renderPDP = (product) => {

    const pdp = document.querySelector('#pdp');

    if (product) {
        const variants = product.variants;
        const typeMap = {
            onDemand: 'Get it Now',
            shipping: 'Get it Shipped',
            engraved: 'Get it Shipped ( Optional Engraving)'
        }

        document.querySelector('#variants').innerHTML = variants.map((variant, index) => {
            let variantRetailers = getVariantRetailers(variant);
            return `
                  <div class="variant ${index == 0 && 'enabled'}" size="${variant.size}">
                    ${variantRetailers.map((retailer, i) =>
                `
                    <div class="variant-option ${index==0 && i==0 ? 'selected' : ''}">
                        <div>
                            <h5>${typeMap[retailer.type]}</h5>
                            <input class="variant-id" name="variant-${index}" type="radio" value="${retailer.id}" id="${retailer.id}" engraving="${retailer.type == 'engraved'}" ${i == 0 ? 'checked' : ''}/>
                            <label for="${retailer.id}">
                                ${retailer.name}
                            </label>
                            <p class="retailer-delivery-expectation">
                                <small>${retailer.deliveryExpectation}</small>
                            </p>
                        </div>
                        <span>$${retailer.price}</span>
                    </div>
            `
            ).join('')
                }
                  </div>
                  `}
        ).join('');

        document.querySelector('#product-description').innerHTML = product.descriptionHtml;
        document.querySelector('#product-name').innerText = product.name;
        const productVariant = product.variants[0];
        const productRetailer = productVariant.retailers[0];
        document.querySelector('#product-img').src = `${productVariant.images[0] || product.images[0]}`;

        document.querySelector('#size-selector').innerHTML = product.variants.map(variant =>
            `<option value="${variant.size}">${variant.size}</option>`
        ).join('');

        document.querySelector('#qty-selector-container').innerHTML =
            product.variants.map((variant, variantIndex) => {
                let variantRetailers = getVariantRetailers(variant);
                return variantRetailers.map((retailer, retailerIndex) =>
                    quantitySelectorHTML({
                        product: product,
                        variantId: retailer.id,
                        isActive: (variantIndex == 0 && retailerIndex == 0)
                    })
                ).join('')
            }
            ).join('');

        // Add to Cart
        document.querySelector('#atc').onclick = async () => {
            await addToCart();
        };

        // On Variant ID input change
        const variantIdInputs = [...document.querySelectorAll('.variant-id')];
        variantIdInputs.forEach(variantIdInput => {
            variantIdInput.onchange = (e) => {
                variantIdInputs.forEach(el => el.closest('.variant-option').classList.remove('selected'));
                variantIdInput.closest('.variant-option').classList.add('selected');
            }
        });

        // Show or hide engraving for first variant
        const hasEngraving = productRetailer.type == 'engraved';
        const engravingElement = document.querySelector('#engraving');
        if (hasEngraving) {
            engravingElement.classList.add('active');
        } else {
            engravingElement.classList.remove('active');
        }

        // On variant id block click
        const variantIdBlocks = [...document.querySelectorAll('.variant-option')];
        [...variantIdBlocks].forEach(variantIdBlock =>
            variantIdBlock.onclick = (e) => {

                // Select the child input
                variantIdBlock.querySelector('input').click();

                // Show or hide engraving
                const hasEngraving = variantIdBlock.querySelector('input').getAttribute('engraving') == 'true';
                if (hasEngraving) {
                    engravingElement.classList.add('active');
                } else {
                    engravingElement.classList.remove('active');
                }

                // Show corresponding quantity selector
                [...document.querySelectorAll('.qty-selector')].forEach(qtySelector => {
                    const variantId = qtySelector.getAttribute('variant-id');
                    const equivalentInput = document.querySelector(`input[value="${variantId}"]`);
                    const variantOption = equivalentInput.closest('.variant');

                    if (equivalentInput.checked && variantOption.classList.value.includes('enabled')) {
                        qtySelector.classList.add('enabled');
                    } else {
                        qtySelector.classList.remove('enabled');
                    }
                })
            }
        )
    }
}

const addToCart = async () => {
    showLoader();
    const retailerOption = document.querySelector('div.variant.enabled');
    const variantId = retailerOption.querySelector('input:checked').value;
    const quantity = document.querySelector(`select.qty-selector.enabled`).value;
    const engravingOptions = document.querySelector('#engraving-checkbox').checked && getState('engraving');
    await updateCartItem({ variantId, quantity, engravingOptions });
    hideLoader();
}

const loadLiquid = async () => {

    // Initialize Liquid
    const liquid = await new Liquid({ clientId: '81751648f545a97274df4e2782d01a70' });
    window.liquid = liquid;

    // Grouping ID
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const groupingId = 'GROUPING-741422'; //urlParams.get('id'); TODO: change it later
    setState({ name: 'grouping_id', value: groupingId });

    // Address
    let address = { description: '120 Nassau Street, Brooklyn, NY 11201, USA' };// TODO: move to getState('address');

    // Get product
    const products = await liquid.product({
        ids: [groupingId],
        shipAddress: address.description
    });

    setState({ name: 'product', value: products[groupingId] });
}


// Initialize

// Load Liquid, Address and Product info
(async () => {
    showLoader();
    await loadLiquid();
    hideLoader();
})();

// Engraving
const engravingBody = document.querySelector('.engraving-body');
const engravingLines = document.querySelector('#engraving').querySelectorAll('input[type="text"]');
const engravingSave = document.querySelector('#engraving-save');
const engravingEdit = document.querySelector('#engraving-edit');
const engravingCancel = document.querySelector('#engraving-cancel');

document.querySelector('#engraving-checkbox').onchange = (e) => {
    if (e.target.checked) {
        engravingBody.classList.add('open')
    } else {
        engravingBody.classList.remove('open');
        setState({ name: 'engraving', value: { line1: '', line2: '', line3: '', line4: '' } });
        [...engravingLines].forEach(input => {
            input.value = '';
            input.readOnly = false;
        });
    }
}

engravingCancel.onclick = () => {
    engravingBody.classList.remove('open');
    document.querySelector('#engraving-checkbox').checked = false;
    setState({ name: 'engraving', value: { line1: '', line2: '', line3: '', line4: '' } });
    [...engravingLines].forEach(input => {
        input.value = '';
        input.readOnly = false;
    });
}

[...engravingLines].forEach(engravingLine => {
    engravingLine.oninput = () => {
        const engravingText = [...engravingLines].map(e => e.value.trim()).join(' ');

        if (!engravingSave.classList.value.includes('active') && engravingText) {
            engravingSave.disabled = false;
        }

        if (engravingText.trim().length == 0) {
            engravingSave.disabled = true;
        }
    }
});

engravingSave.onclick = () => {
    const engravingMap = new Map();
    [...engravingLines].forEach((input, index) => {
        input.readOnly = true;
        engravingMap.set(`line${index + 1}`, input.value);
    });
    engravingSave.disabled = true;
    engravingEdit.disabled = false;

    setState({ name: 'engraving', value: Object.fromEntries(engravingMap) })
}

engravingEdit.onclick = () => {
    [...document.querySelectorAll('.label-line')].forEach(labelLine =>
        labelLine.classList.remove('visible')
    );

    [...engravingLines].forEach(input => input.readOnly = false);
    engravingSave.disabled = false;
    engravingEdit.disabled = true;
}

 // PRODUCT Event Listener
 window.addEventListener('product', function (e) {
    const product = getState('product');
    renderPDP(product);
});   