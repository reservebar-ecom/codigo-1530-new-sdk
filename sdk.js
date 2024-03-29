
const showLoader = () => {
    const loader = document.querySelector('#loader');
    loader.classList.add('active');
}

const hideLoader = () => {
    const loader = document.querySelector('#loader');
    loader.classList.remove('active');
}

const setLiquid = async () => {
    const liquid = await Liquid({ clientId: '81751648f545a97274df4e2782d01a70' });
    window.liquid = liquid;
}

(async () => {
    await setLiquid();
})();

const setState = ({ name, value }) => {
    window.localStorage.setItem(`_liquid_${name}`, JSON.stringify(value));
    window.dispatchEvent(new Event(name));
}

const getState = (name) => {
    const strValue = window.localStorage.getItem(`_liquid_${name}`);
    return JSON.parse(strValue)
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const dateFormatter = (dateStr) => {
    const dateArray = dateStr.split('-');
    return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`
}

const customerPlacementMap = {
    'standard':'standard',
    'backOrder': 'back_order',
    'preSale': 'pre_sale'
};

const groups = {
    mezcal: {
        name: "Mezcal",
        ids: [
            "GROUPING-1726128",
            "GROUPING-1771516"
        ]
    },
    tequila: {
        name: "Tequila",
        ids:
            [
                "GROUPING-424817",
                "GROUPING-741422",
                "GROUPING-328527",
                "GROUPING-328528",
                "GROUPING-1345195",
                "GROUPING-1947546",
                "GROUPING-1978934",
                "GROUPING-1981432",
                "GROUPING-2055467",
                "GROUPING-2297417"
            ]
    },
    special_editions: {
        name: "Special Editions",
        ids: [
            "GROUPING-1978934",
            "GROUPING-1778478",
            "GROUPING-1293186",
            "GROUPING-1569334",
            "GROUPING-1781649",
            "GROUPING-1771605",
            "GROUPING-1723282",
            "GROUPING-1978934",
            "GROUPING-1981432",
            "GROUPING-2055467"
        ]
    },
    gifts: {
        name: "Gifts",
        ids: [
            "BUNDLE-200000071",
            "GROUPING-GIFTCARD-1973621"
        ]
    },
    all: {
        name: "All",
        ids: [
            "GROUPING-1726128",
            "GROUPING-1771516",
            "GROUPING-424817",
            "GROUPING-741422",
            "GROUPING-328527",
            "GROUPING-328528",
            "GROUPING-1345195",
            "GROUPING-1947546",
            "GROUPING-1978934",
            "GROUPING-1981432",
            "GROUPING-2055467",
            "GROUPING-2297417",
            "GROUPING-1778478",
            "GROUPING-1293186",
            "GROUPING-1569334",
            "GROUPING-1781649",
            "GROUPING-1771605",
            "GROUPING-1723282",
            "BUNDLE-200000071",
            "GROUPING-GIFTCARD-1973621"
        ]
    },
}

const engravingIcon = `<div class="engraving-icon-wrapper"><div title="Engraving Available" class="engraving-icon"><small>ENGRAVING </small><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ticket-detailed" viewBox="0 0 16 16">
<path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
<path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13Z"/>
</svg></div></div>`;

// Add ReCaptcha

const reCaptchaDiv = document.createElement('div');
reCaptchaDiv.innerHTML = `This site is protected by reCAPTCHA and the Google
<a href="https://policies.google.com/privacy">Privacy Policy</a> and
<a href="https://policies.google.com/terms">Terms of Service</a> apply.
`;
reCaptchaDiv.classList.add('recaptcha-div');
document.body.appendChild(reCaptchaDiv);
