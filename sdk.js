const setState = ({ name, value }) => {
    window.localStorage.setItem(`_liquid_${name}`, JSON.stringify(value));
    window.dispatchEvent(new Event(name));
}

const getState = (name) => {
    const strValue = window.localStorage.getItem(`_liquid_${name}`);
    return JSON.parse(strValue)
}

const showLoader = () => {
    const loader = document.querySelector('#loader');
    loader.classList.add('active');
}

const hideLoader = () => {
    const loader = document.querySelector('#loader');
    loader.classList.remove('active');
}