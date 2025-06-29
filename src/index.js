import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '31233349-657dbeb08b09bae80b555b3c4';
const form = document.querySelector('#search-form');
const input = form.querySelector('input[name="searchQuery"]');
const button = form.querySelector('button[type="submit"]');
const gallery = document.querySelector('.gallery');


let currentDataFromApi = '';  
let currentPage = 1;
let totalHits = 0;
let observer;

let lightbox;

form.addEventListener('submit', onForm);

function onForm(e) {
    e.preventDefault();

    const writeToInput = input.value.trim();

    if (writeToInput === '') {
        alert('Заполните поле');
        return
    }
   
    currentDataFromApi = writeToInput;
    currentPage = 1;
    gallery.innerHTML = '';
    getDataFromApi(currentDataFromApi, currentPage);   

    form.reset();

    if (observer) observer.disconnect(); 
    createObserver();     
}
 
async function getDataFromApi(dataFromApi) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: KEY,
                q: dataFromApi,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
            }
        }
        );

        const receivedDataArrayFromApi = response.data.hits; 

        if (receivedDataArrayFromApi.length === 0) {
            alert('Sorry, there are no images matching your search query. Please try again.');
            return;
        }
         
        renderHits(receivedDataArrayFromApi);

        if (page > 1) {          
            const { height: cardHeight } = document
                .querySelector(".gallery")
                .firstElementChild.getBoundingClientRect();
           
            window.scrollBy({
                top: cardHeight * 2,
                behavior: "smooth",
            });
        }     
    } catch (error) {
        console.error(error);
    }
}

async function getDataFromApi(dataFromApi, page = 1) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: KEY,
                q: dataFromApi,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: page,
                per_page: 40,
            }
        });

        const receivedDataArrayFromApi = response.data.hits;

        if (page === 1) {
            totalHits = response.data.totalHits;
            if (totalHits > 0) {
                alert(`Hooray! We found ${totalHits} images.`);
            }
        }

        if (receivedDataArrayFromApi.length === 0 && page === 1) {
            alert('Sorry, there are no images matching your search query. Please try again.');
            return;
        }

        renderHits(receivedDataArrayFromApi);

        const totalLoaded = document.querySelectorAll('.photo-card').length;
        if (totalLoaded >= totalHits) {
            observer.disconnect();
            alert("We're sorry, but you've reached the end of search results.");
        }

    } catch (error) {
        console.error(error);
    }
}

function createMarkup(hits) {
    return hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `  
         <a class="gallery__item" href="${largeImageURL}">     
        <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>       
        </div>
        </a>
        `
    }).join('');
}

function renderHits(hits) {
    gallery.insertAdjacentHTML('beforeend', createMarkup(hits));

    // Обновляем или создаем lightbox
    if (!lightbox) {
        lightbox = new SimpleLightbox('.gallery a', {
            captionsData: 'alt',
            captionDelay: 250,
            close: false,
        });
    } else {
        lightbox.refresh();
    }
}

function createObserver() {
    const options = {
        root: null,
        rootMargin: '300px',
        threshold: 0,
    };

    observer = new IntersectionObserver(handleIntersect, options);
    const sentinel = document.querySelector('#sentinel');
    if (sentinel) observer.observe(sentinel);
}

function handleIntersect(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && currentDataFromApi !== '') {
            currentPage++;
            getDataFromApi(currentDataFromApi, currentPage);
        }
    });
}



/*** 11 ***/
// Сейчас пошагово добавим библиотеку SimpleLightbox в твой код, чтобы при клике на картинку открывалась её большая версия в модальном окне.Сделаем это по всем правилам: с импортами, обёрткой в ссылку и вызовом refresh() после каждой отрисовки.

// ✅ Шаг 1. Установи библиотеку через npm
// В терминале внутри твоего проекта выполни:
// npm install simplelightbox

// ✅ Шаг 2. Добавь импорты в index.js
// В самом верху файла, где у тебя импортируется axios, добавь:
// import SimpleLightbox from "simplelightbox";
// import "simplelightbox/dist/simple-lightbox.min.css";

// ✅ Шаг 3. Создай экземпляр lightbox
// Добавь после создания gallery:
// let lightbox = new SimpleLightbox('.gallery a');

// ✅ Шаг 4. Обнови функцию createMarkup
// Нужно обернуть каждую картинку в ссылку на большое изображение(largeImageURL).Полная обновлённая функция:
// function createMarkup(hits) {
//     return hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
//         return `
//       <a class="gallery__item" href="${largeImageURL}">
//         <div class="photo-card">
//           <img src="${webformatURL}" alt="${tags}" loading="lazy" />
//           <div class="info">
//             <p class="info-item"><b>Likes:</b> ${likes}</p>
//             <p class="info-item"><b>Views:</b> ${views}</p>
//             <p class="info-item"><b>Comments:</b> ${comments}</p>
//             <p class="info-item"><b>Downloads:</b> ${downloads}</p>
//           </div>
//         </div>
//       </a>
//     `;
//     }).join('');
// }
// 🔸 Каждая карточка теперь обёрнута в < a href = "..." >...</a > — это нужно для lightbox.

// ✅ Шаг 5. Добавь lightbox.refresh() в getDataFromApi
// Сразу после renderHits(hits) добавь:
// lightbox.refresh();
// 👉 Итого, вот этот участок будет выглядеть так:
// renderHits(hits);
// lightbox.refresh();
// if (page > 1) {
//     const { height: cardHeight } = document
//         .querySelector(".gallery")
//         .firstElementChild.getBoundingClientRect();

//     window.scrollBy({
//         top: cardHeight * 2,
//         behavior: "smooth",
//     });
// }
/*** 11 end ***/

/*** 12 start ***/
// Сейчас пошагово добавим библиотеку Notiflix для уведомлений в твоём проекте вместо alert(...) и console.log(...).Эта библиотека делает сообщения красивыми и удобными для пользователя.

// ✅ Шаг 1. Установи Notiflix
// В терминале проекта выполни:
// npm install notiflix
// // ✅ Шаг 2. Импортируй Notiflix в index.js
// В самом верху файла добавь:
// import Notiflix from 'notiflix';
// // ✅ Шаг 3. Замени alert и console.log на Notiflix.Notify
// Ниже — примеры замены прямо по твоему коду:
// 🔁 Вместо этого:
// alert('Sorry, there are no images matching your search query. Please try again.');
// 💡 Замени на:
// Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
// 🔁 Вместо:
// console.log('Заполните поле');
// 💡 Замени на:
// Notiflix.Notify.warning('Please enter a search query.');
// 🔁 После первого успешного запроса:
// Когда ты получаешь totalHits, можешь добавить:
// Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

// Пример внутри getDataFromApi:
// const totalHits = response.data.totalHits;

// if (page === 1) {
//     Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
// }
// 🔁 В конце загрузки всех изображений:
// Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
// ✅ Полезные стили
// Ты можешь не подключать отдельно CSS — Notiflix автоматически работает из коробки после npm install.
/*** 12 ***/