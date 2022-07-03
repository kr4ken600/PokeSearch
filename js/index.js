//Variables Globales (API)
var URL_SPECIES = null;
const URL_IMGS = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
var TYPE_SELECT = []; 

//Parametros de URL
const parametros = window.location.search;
const urlParams = new URLSearchParams(parametros);

const urlPage = urlParams.get('page') === null ? '1' : urlParams.get('page');
const urlName = urlParams.get('name') === null ? null : urlParams.get('name');
const urlType = urlParams.get('types') === null ? null : urlParams.get('types');

if(urlPage === '1'){
    URL_SPECIES = "https://pokeapi.co/api/v2/pokemon-species";
} else if(urlPage === '45') {
    URL_SPECIES = `https://pokeapi.co/api/v2/pokemon-species?offset=${(parseInt(urlPage)-1)*20}&limit=25`;
} else {
    URL_SPECIES = `https://pokeapi.co/api/v2/pokemon-species?offset=${(parseInt(urlPage)-1)*20}&limit=20`;
}

if(urlName !== null && urlName !== ''){
    URL_SPECIES = `https://pokeapi.co/api/v2/pokemon/${urlName.toLowerCase()}`;
}

if(urlType !== null){
    const pkCount = document.getElementById("pk_count");
    let count = 0;
    TYPE_SELECT = urlType.split("_");
    let pk_emblema = document.querySelectorAll(".pk-emblema");
    TYPE_SELECT.forEach(type => {
        pk_emblema.forEach(emblema => {
            if (emblema.dataset.type === type) {
                emblema.classList.add("pk-emblema-active");
            }
        })
    })
    fetch("https://pokeapi.co/api/v2/type")
        .then(data => data.json())
        .then(res => {
            TYPE_SELECT.forEach(type => {
                const url = res.results.filter(rst => rst.name === type);
                fetch(url[0].url)
                    .then(data => data.json())
                    .then(res => {
                        count += res.pokemon.length;
                        res.pokemon.forEach(pk => {
                            fetch(pk.pokemon.url)
                                .then(data => data.json())
                                .then(res => {
                                    if (res.id <= 905) {
                                        showData(res.id, res.name);
                                    }
                                })
                        });
                        pkCount.innerHTML = `Pokemones Encontrados: <span class="pk-count">${count}</span>`;
                    })
            })
            
        })
        .catch(error => console.error(error));
}

const pkCount = document.getElementById("pk_count");
//Peticiones HTTP
if (urlType === null) {
    fetch(URL_SPECIES)
    .then(data => data.json())
    .then(res => {
        const pkCount = document.getElementById("pk_count");
        pkCount.innerHTML = res.count !== undefined ? `Pokemones Registrados: <span class="pk-count">${res.count}</span>`  : 'Pokemones Encontrados: <span class="pk-count">1</span>';

        if(urlName === null){
            res.results.forEach(element => {
                showData(element.url.match(/(\d+)/g)[1], element.name);
            });
    
            showPages(res.previous, res.next);
        } else {
            showData(res.id, res.name);
        }
    })
    .catch(error => {
        console.error(error); 
        pkCount.innerHTML = "No se encontraron resultados";
    });
}

const showPages = (previous, next) => {
    const pages = document.getElementById("pages");

    const btnInit = document.createElement('button');
    btnInit.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon><ion-icon name="chevron-back-outline"></ion-icon>';
    btnInit.addEventListener('click', () => {
        document.location.search = `page=1`
    });

    const btnPrev = document.createElement('button');
    btnPrev.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon>';
    btnPrev.addEventListener('click', () => {
        document.location.search = `page=${parseInt(urlPage)-1}`
    });

    const btnEnd = document.createElement('button');
    btnEnd.innerHTML = '<ion-icon name="chevron-forward-outline"></ion-icon><ion-icon name="chevron-forward-outline"></ion-icon>';
    btnEnd.addEventListener('click', () => {
        document.location.search = `page=45`
    });

    const btnNext = document.createElement('button');
    btnNext.innerHTML = '<ion-icon name="chevron-forward-outline"></ion-icon>';
    btnNext.addEventListener('click', () => {
        document.location.search = `page=${parseInt(urlPage)+1}`
    });

    const btn1 = document.createElement('button');
    btn1.innerText = parseInt(urlPage);
    btn1.className = "active-page";
    btn1.addEventListener('click', () => {
        document.location.search = `page=${btn1.innerText}`
    })
    const btn2 = document.createElement('button');
    btn2.innerText = parseInt(urlPage)+1;
    btn2.addEventListener('click', () => {
        document.location.search = `page=${btn2.innerText}`
    })
    const btn3 = document.createElement('button');
    btn3.innerText = parseInt(urlPage)+2;
    btn3.addEventListener('click', () => {
        document.location.search = `page=${btn3.innerText}`
    })
    const btn4 = document.createElement('button');
    btn4.innerText = parseInt(urlPage)+10 < 45 ? parseInt(urlPage)+10 : "45";
    btn4.addEventListener('click', () => {
        document.location.search = `page=${btn4.innerText}`
    })

    if(previous !== null && next !== null){
        pages.appendChild(btnInit);
        pages.appendChild(btnPrev);
        pages.appendChild(btn1);
        pages.appendChild(btn2);
        if(parseInt(urlPage) < 44) pages.appendChild(btn3);
        if(parseInt(urlPage) < 43) pages.appendChild(btn4);
        pages.appendChild(btnNext);
        pages.appendChild(btnEnd);
    } else if(previous !== null){
        pages.appendChild(btnInit);
        pages.appendChild(btnPrev);
        pages.appendChild(btn1);
        if(parseInt(urlPage) < 45){
            pages.appendChild(btn2);
            pages.appendChild(btn3);
            pages.appendChild(btn4);
        }
    } else if(next !== null){
        pages.appendChild(btn1);
        pages.appendChild(btn2);
        pages.appendChild(btn3);
        pages.appendChild(btn4);
        pages.appendChild(btnNext);
        pages.appendChild(btnEnd);
    }
}


const showData = (index, name) => {
    const pk_data_cont = document.getElementById("pk_data_cont");
    
    const pk_data = document.createElement('div');
    pk_data.classList.add("pk-data-cont");
    pk_data.onclick = () =>{
        window.location.href = `search.html?id=${index}`;
    };
    
    const group = document.createElement('div');
    group.classList.add("group");

    const img = document.createElement('img');
    img.src =  parseInt(index) >= 899 ? '/imgs/null.png' : `${URL_IMGS}${index}.png`;
    img.style.marginRight = "5px"
    img.alt = `${index}.png`;
    
    const h4N = document.createElement('h4');
    let noPK = '';
    if(index < 10) noPK = `N.° 00${index}`;
    else if(index >= 100 ) noPK = `N.° ${index}`;
    else noPK = `N.° 0${index}`;
    h4N.innerText = noPK;

    group.appendChild(img);
    group.appendChild(h4N);

    const h4Name = document.createElement('h4');
    h4Name.innerText = name.toUpperCase();
    h4Name.style.width = "500px";
    h4Name.className = "text-center";

    const imgIco = document.createElement('img');
    imgIco.src = "imgs/pokeball.svg";
    imgIco.width = "50px";
    imgIco.classList.add("pk-icon-ball");

    pk_data.appendChild(group);
    pk_data.appendChild(h4Name);
    pk_data.appendChild(imgIco);

    pk_data_cont.appendChild(pk_data);
}

const pk_search = document.getElementById("pk-search");
const pk_btn_search = document.getElementById("pk-btn-search");
pk_btn_search.onclick = () => {
    if(pk_search.value !== '' || pk_search.value !== null){
        window.location.search = `name=${pk_search.value}`;
    }
}

const pk_btn_filter = document.getElementById("pk-btn-filter");
pk_btn_filter.onclick = () => {
    const pk_filter_container = document.getElementById("pk-filter-container");
    pk_filter_container.classList.toggle("show-filter");
}


const pk_emblema = document.querySelectorAll(".pk-emblema");

function activeEmblema() {
    this.classList.toggle('pk-emblema-active');
    if (TYPE_SELECT.indexOf(this.dataset.type) === 0) {
        TYPE_SELECT = TYPE_SELECT.filter(type => type !== this.dataset.type);
    } else TYPE_SELECT.push(this.dataset.type);
}



pk_emblema.forEach(emblema => emblema.addEventListener('click', activeEmblema));

const pk_change_filter = document.getElementById("pk-change-filter");
const pk_clear_filter = document.getElementById("pk-clear-filter");

pk_change_filter.onclick = () => {
    if (TYPE_SELECT.length > 0) {
        var type = "";
        for (let i = 0; i < TYPE_SELECT.length; i++) {
            TYPE_SELECT.length - i === 1 ? type += `${TYPE_SELECT[i]}` : type += `${TYPE_SELECT[i]}_`;
        }
        window.location.search = "types="+type;
    }
}

pk_clear_filter.onclick = () => {
    if (TYPE_SELECT.length > 0) {
        TYPE_SELECT = [];
    }
    window.location.href = "index.html";
}