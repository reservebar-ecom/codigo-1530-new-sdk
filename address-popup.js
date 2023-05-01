// Address Modal
const addressOpenButton = document.querySelector('#popup-open');
const addressCloseButton = document.querySelector('#popup-close');
const addressModal = document.querySelector('#popup');
const addressModalBg = document.querySelector('#popup-background');

const closeAddressModal = () => {
    addressModal.classList.remove('active');
}

const openAddressModal = () => {
    addressModal.classList.add('active');
}

addressOpenButton.onclick = () => {
    openAddressModal();
}

addressCloseButton.onclick = () => {
    closeAddressModal();
}

addressModalBg.onclick = () => {
    closeAddressModal();
}



// Address input
const addressInput = document.querySelector('#address-input');
const addressOptions = [...document.querySelectorAll('.address-option')];

const address = getState('address');
if (address) {
    addressInput.value = address.description;
    addressOpenButton.innerHTML = address.description;
} else {
    openAddressModal();
}

let isTypingAddress = false;

addressInput.oninput = async (e) => {
    if (!isTypingAddress) {
        isTypingAddress = true;
        await setTimeout(async () => {

            const addressSearch = e.target.value;
            if (addressSearch.trim()) {
                const addressSuggestions = await liquid.address({ search: addressSearch });

                // Clear previous suggestions
                addressOptions.forEach(addressOption => {
                    addressOption.innerHTML = '';
                    addressOption.classList.remove('visible');
                })

                // Include new suggestions
                addressSuggestions.forEach(
                    (addressSuggestion, index) => {
                        addressOptions[index].innerHTML = addressSuggestion.description;
                        addressOptions[index].id = addressSuggestion.placeId;
                        addressOptions[index].classList.add('visible');
                    });
            } else {
                addressOptions.forEach(el => el.classList.remove('visible'));
            }

            isTypingAddress = false;
        }, 800);
    }
}

addressOptions.forEach(addressOption => {
    addressOption.onclick = async () => {
        const addressDescription = addressOption.innerText;
        const addressPlaceId = addressOption.id;
        setState({
            name: 'address',
            value: {
                description: addressDescription,
                placeId: addressPlaceId
            }
        });
    }
});

// ADDRESS Event Listener
window.addEventListener('address', async function (e) {
    const address = getState('address');
    const addressInput = document.querySelector('#address-input');
    addressInput.value = address?.description || '';
    addressOpenButton.innerHTML = address?.description || 'Enter Delivery Address';

    const addressObj = await liquid.address({ placeId: address.placeId });
    const groupingIds = getState('grouping_ids');

    if(groupingIds){
        const products = await liquid.product({
            ids: groupingIds,
            latitude: addressObj.latitude,
            longitude: addressObj.longitude
        });
    
        setState({ name: 'products', value: products || null });
    }
    addressOptions.forEach(el => el.classList.remove('visible'));
    closeAddressModal();
});