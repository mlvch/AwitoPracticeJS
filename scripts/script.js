'use strict';

const dataBase = JSON.parse(localStorage.getItem('avito')) || [];
let counter = dataBase.length;
const modalAdd = document.querySelector('.modal__add'),
    addAd = document.querySelector('.add__ad'),
    modalBtnSubmit = document.querySelector('.modal__btn-submit'),
    modalSubmit = document.querySelector('.modal__submit'),
    catalog = document.querySelector('.catalog'),
    modalItem = document.querySelector('.modal__item'),
    modalBtnWarning = document.querySelector('.modal__btn-warning'),
    modalFileInput = document.querySelector('.modal__file-input'),
    modalFileBtn = document.querySelector('.modal__file-btn'),
    modalImageAdd = document.querySelector('.modal__image-add');

const modalImageItem = document.querySelector('.modal__image-item'),
    modalHeaderItem = document.querySelector('.modal__header-item'),
    modalStatusItem = document.querySelector('.modal__status-item'),
    modalDescriptionItem = document.querySelector('.modal__description-item'),
    modalCostItem = document.querySelector('.modal__cost-item');

const searchItem = document.querySelector('.search__input'),
    menuContainer = document.querySelector('.menu__container');

const textFileBtn = modalFileBtn.textContent;
const srcModalImg = modalImageAdd.src;
    
const elementsModalSubmit = [...modalSubmit.elements]   //спред оператор
    .filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit');

// console.log([...elementsModalSubmit]                        //спред оператор
//     .filter(elem => elem.tagName !== 'BUTTON'));  

//console.log(elementsModalSubmit);


//!!закрыть модалку на х или вне модалки
/*const closeModal = event => {
    const target = event.target;
    
    if (target.classList.contains('modal__close') || target === modalAdd || target === modalItem) {
        modalAdd.classList.add('hide');
        modalSubmit.reset();
        modalItem.classList.add('hide');
    }
}*/
/*
//закрытие модалки на х и на клик вне модалки
const closeModal = function(event) {
    const target = event.target;
    
    if (target.classList.contains('modal__close') || target === this) {
        this.classList.add('hide');
        if (this === modalAdd) modalSubmit.reset();        
    }
}

//закрытие модалки на ESC
const closeModalEscape = event => {
    if (event.code === 'Escape') {
        modalAdd.classList.add('hide');
        modalItem.classList.add('hide');
        document.removeEventListener('keydown', closeModalEscape);
    }
}
*/
const infoPhoto = [];  //находится в замыкании

const saveDB = () => localStorage.setItem('avito', JSON.stringify(dataBase));

const checkForm = () => {
    //заполнены ли ВСЕ поля и выдает true если да
    const validForm = elementsModalSubmit.every(elem => elem.value);
    modalBtnSubmit.disabled = !validForm;
    //тернарный оператор/условный оператор  
    modalBtnWarning.style.display = validForm ? 'none' : '';
}

const closeModal = event => {
    const target = event.target;    //!делигирование!
    
    if (target.closest('.modal__close') || target.classList.contains('modal') || event.code === 'Escape') {
        modalAdd.classList.add('hide');
        modalItem.classList.add('hide');
        document.removeEventListener('keydown', closeModal);
        modalSubmit.reset();
        modalImageAdd.src = srcModalImg;
        modalFileBtn.textContent = textFileBtn;
        checkForm();
    }
}
//рендерим карточки
const renderCard = (DB = dataBase) => {
    catalog.textContent = '';
    DB.forEach(item => {
        catalog.insertAdjacentHTML('beforeend', `
        <li class="card" data-id="${item.id}">
            <img class="card__image" src="data:img/jpg;base64,${item.image}" alt="test">
            <div class="card__description">
                <h3 class="card__header">${item.nameItem}</h3>
                <div class="card__price">${item.costItem} ₽</div>
            </div>
        </li>
        `);
    });
} 

searchItem.addEventListener('input', event => {
    const valueSearch = searchItem.value.trim().toLowerCase();

    if (valueSearch.length > 2) {
        const result = dataBase.filter(item => item.nameItem.toLowerCase().includes(valueSearch) || item.descriptionItem.toLowerCase().includes(valueSearch));
        renderCard(result);
        
    }
});

modalFileInput.addEventListener('change', event => {
    const target = event.target;
    const reader = new FileReader();
    const file = target.files[0];

    infoPhoto.filename = file.name;
    infoPhoto.size = file.size;

    reader.readAsBinaryString(file);

    reader.addEventListener('load', event => {
        if (infoPhoto.size < 200000) {
            modalFileBtn.textContent = infoPhoto.filename;
            infoPhoto.base64 = btoa(event.target.result);
            modalImageAdd.src = `data:img/jpg;base64,${infoPhoto.base64}`;
        } else {
            modalFileBtn.textContent = 'файл не должен превышать 200кб';
            modalFileInput.value = '';
            checkForm();
        }        
    });
});

modalSubmit.addEventListener('input', checkForm)

modalSubmit.addEventListener('submit', event => {
    event.preventDefault();    
    const itemObj = {};
    for (const elem of elementsModalSubmit) {
        itemObj[elem.name] = elem.value;
    }
    itemObj.id = counter++;
    itemObj.image = infoPhoto.base64;
    dataBase.push(itemObj);
    closeModal({target: modalAdd});  // т.к. ивент.таргет пустой, мы сразу задаем обьект со свойством таргет и значением модалки
    saveDB();
    renderCard();
});

//открыть модалку на кнопку подать обьявление
addAd.addEventListener('click', () => {
    modalAdd.classList.remove('hide');
    modalBtnSubmit.disabled = true;   //  БЛОКИРОВКА КНОПКИ
    document.addEventListener('keydown', closeModal);
});

//клик на карточку в каталог
catalog.addEventListener('click', event => {
    const target = event.target;
    const card = target.closest('.card')

    if (card) {
        //const item = dataBase[card.dataset.idItem];
        const item = dataBase.find(obj => obj.id === +card.dataset.id); 

        modalImageItem.src = `data:img/jpg;base64,${item.image}`
        modalHeaderItem.textContent = item.nameItem;
        modalStatusItem.textContent = item.status === 'new' ? 'Новый' : 'Б/У';
        modalDescriptionItem.textContent = item.descriptionItem;
        modalCostItem.textContent = item.costItem;

        modalItem.classList.remove('hide');
        document.addEventListener('keydown', closeModal);
    }
});

menuContainer.addEventListener('click', event => {
    const target = event.target;

    if (target.tagName === 'A') {
        const result = dataBase.filter(item => item.category === target.dataset.category);

        renderCard(result);
    }
});

modalAdd.addEventListener('click', closeModal);
modalItem.addEventListener('click', closeModal);

renderCard();


