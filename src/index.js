import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

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
        Notiflix.Notify.warning('Please enter a search query.');
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
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
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
                Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
            }
        }

        if (receivedDataArrayFromApi.length === 0 && page === 1) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return;
        }

        renderHits(receivedDataArrayFromApi);

        const totalLoaded = document.querySelectorAll('.photo-card').length;
        if (totalLoaded >= totalHits) {
            observer.disconnect();
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
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


