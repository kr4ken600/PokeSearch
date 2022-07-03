//Variables Globales (API)
var URL_POKEMON = null;
const URL_IMGS = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

//Parametros de URL
const parametros = window.location.search;
const urlParams = new URLSearchParams(parametros);
var urlID = urlParams.get('id') === null ? '' : urlParams.get('id');

//Peticiones HTTP
if(urlID !== '' || isInteger(parseInt(urlID))){
    URL_POKEMON = `https://pokeapi.co/api/v2/pokemon-species/${urlID}/`;
}

if(URL_POKEMON !== null){
    fetch(URL_POKEMON)
        .then(data => data.json())
        .then(res => {
            var result = res.flavor_text_entries.filter(element => element.language.name === 'es' );

            let flavor_text = null;
            
            if(result.length > 2 ) flavor_text = result[2].flavor_text;
            if(result.length > 1 ) flavor_text = result[1].flavor_text;

            showInfoIZQ(res.id, res.name, res.varieties[0].pokemon.url, flavor_text);
            showInfoDer(
                res.egg_groups, 
                res.growth_rate,
                res.habitat !== null ? res.habitat.url : null,
                res.is_legendary,
                res.is_mythical,
                res.evolution_chain);
        })
        .catch(error => console.error(error));
}

const showInfoIZQ = (id, name, status, text) => {
    // NOMBRE
    const pk_name = document.getElementById("pk-name");
    var number = '';
    if (id < 10) number = `00${id}`;
    else if(id >= 10 && id < 100) number = `0${id}`;
    else number = id;
    pk_name.innerText = `N.° ${number} ${name.toUpperCase()}`;

    // ESTADISTICAS
    fetch(status)
        .then(data => data.json())
        .then(res => {
            const pk_stats = document.getElementById("pk-stats");
            
            const stats = res.stats;

            stats.forEach(stat => {
                const group = document.createElement('div');
                group.className = "group";
                const h3Stat = document.createElement('h3');
                h3Stat.className = "text-center";
                h3Stat.innerText = getStat(stat.stat.name).stat;
                h3Stat.style.width = "180px";
                const h3Base = document.createElement('h3');
                h3Base.className = "text-center";
                h3Base.innerText = stat.base_stat;
                h3Base.style.width = "80px";

                //barra de progreso
                const progreso = document.createElement('div');
                progreso.className = "progress";

                const barra = document.createElement('div');
                barra.className = "bar";
                barra.style.backgroundColor = getStat(stat.stat.name).color;
                barra.style.width = `${stat.base_stat >= 100 ? "100" : stat.base_stat}%`;

                progreso.appendChild(barra);

                group.appendChild(h3Stat);
                group.appendChild(progreso);
                group.appendChild(h3Base);
                pk_stats.appendChild(group);
            });
            const elements = res.types;
            const pk_element = document.getElementById("pk-element");
            
            elements.forEach(element => {
                fetch(element.type.url)
                    .then(data => data.json())
                    .then(res => {
                        const type = res.names.filter(type => type.language.name === "es")[0].name;
                        const h3Type = document.createElement('h3');
                        h3Type.className = element.type.name;
                        h3Type.innerText = type.toUpperCase();
                        pk_element.appendChild(h3Type);
                    })
            })
        })
    
    // IMAGEN
    const pk_img = document.getElementById("pk-img");
    pk_img.src = parseInt(urlID) >= 899 ? '/imgs/null_two.png' : `${URL_IMGS}${urlID}.png`;
    pk_img.style.width = "50%";

    // TEXTO
    const pk_info = document.getElementById("pk-info");
    pk_info.innerText = text !== null ? text.replaceAll('\n', ' ') : "Sin Información";
}

const showInfoDer = (type, growth, habitat, legend, mythical, evolution) => {
    // TIPO DE POKEMON
    const pk_type = document.getElementById("pk-type");
    
    type.forEach(element => {
        
        fetch(element.url)
            .then(data => data.json())
            .then(res => {
                let class_type = getTypeClass(res.name);
                let names = res.names.filter(typeName => typeName.language.name === 'es');
                
                names.forEach(elementName => {
                    const h3Type = document.createElement('h3');
                    h3Type.innerText = elementName.name.toUpperCase();
                    h3Type.className = class_type;

                    pk_type.appendChild(h3Type);
               });
            })
            .catch(error => console.error(error));
    });   


    // TASA DE CRECIMIENTO
    const h3Growth = document.getElementById('pk-growth-txt');
    h3Growth.innerText = getGrowth(growth.name).toUpperCase();
    
    fetch(growth.url)
        .then(data => data.json())
        .then(res => {
            const pk_formula = document.getElementById("pk-formula");
            pk_formula.innerHTML = `Formula de exp: ${res.formula.replaceAll('\\','')}`;
        })
        .catch(error => console.error(error));

    // HABITAD
    const pk_habitad = document.getElementById("pk-habitad");
    if(habitat !== null){
        fetch(habitat)
            .then(data => data.json())
            .then(res => {
                let hbt = res.names.filter(element => element.language.name === 'es');
                pk_habitad.innerText = hbt[0].name.toUpperCase();
            })
            .catch(error => console.error(error));
    } else pk_habitad.innerText = "DESCONOCIDA";

    // LEGENDARIO
    const pk_legend = document.getElementById("pk-legend")
    pk_legend.innerText = legend ? "SI" : "NO";

    // MITICO
    const pk_mythical = document.getElementById("pk-mythical");
    pk_mythical.innerText = mythical ? "SI" : "NO";

    // CADENA EVOLUTIVA
    if(evolution !== null){
        fetch(evolution.url)
        .then(data => data.json())
        .then(res => {
            let pks = [];

            pks.push({ 
                name: res.chain.species.name, 
                nvl: "base",
                index: res.chain.species.url.match(/(\d+)/g)[1]
            });

            if(res.chain.evolves_to.length > 0){
                pks.push({ 
                    name: res.chain.evolves_to[0].species.name,
                    nvl: `Nvl ${res.chain.evolves_to[0].evolution_details[0].min_level}`,
                    index: res.chain.evolves_to[0].species.url.match(/(\d+)/g)[1]
                });

                if(res.chain.evolves_to[0].evolves_to.length > 0){
                    pks.push({ 
                        name: res.chain.evolves_to[0].evolves_to[0].species.name, 
                        nvl: `Nvl ${res.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level}`,
                        index: res.chain.evolves_to[0].evolves_to[0].species.url.match(/(\d+)/g)[1]
                    });
                }
            }
            const pk_evolution = document.getElementById("pk-evolution");
            
            pks.forEach(pk => {
                const col = document.createElement('div');
                col.className = "text-center pk-evolution-col";

                const h3Name = document.createElement('h3');
                h3Name.innerText = pk.name.toUpperCase();

                const img = document.createElement('img');
                img.className = "img-evolution";
                img.src = `${URL_IMGS}${pk.index}.png`;
                img.alt = `${pk.index}.png`;
                img.onclick = () => {
                    document.location.search = `id=${pk.index}`;
                }

                const h3Nvl = document.createElement('h3');
                h3Nvl.innerText = pk.nvl.toUpperCase();
                
                col.appendChild(h3Name);
                col.appendChild(img);
                col.appendChild(h3Nvl);

                pk_evolution.appendChild(col);
            })

            
        })
        .catch(error => console.error(error));
    }
}

const getTypeClass = (type) => {
    if(type === "monster") return "monster";
    if(type === "water1") return "water";
    if(type === "water2") return "ice";
    if(type === "water3") return "water";
    if(type === "bug") return "bug";
    if(type === "flying") return "flying";
    if(type === "ground") return "ground";
    if(type === "fairy") return "fairy";
    if(type === "plant") return "plant";
    if(type === "humanshape") return "humanshape";
    if(type === "mineral") return "mineral";
    if(type === "indeterminate") return "indeterminate";
    if(type === "ditto") return "ditto";
    if(type === "dragon") return "dragon";
    if(type === "no-eggs") return "no-eggs";
}

const getGrowth = (growth) => {
    if(growth === 'slow') return 'Lento';
    if(growth === 'medium') return 'Medio';
    if(growth === 'fast') return 'Rapido';
    if(growth === 'medium-slow') return 'Medio Lento';
    if(growth === 'slow-then-very-fast') return 'Lento, luego rapido';
    if(growth === 'fast-then-very-slow') return 'Rapido, luego lento';
}

const getStat = (stat) => {
    stat = stat.toUpperCase();
    if(stat === "HP") return { stat: "PS", color: "green" };
    if(stat === "ATTACK") return { stat: "ATAQUE", color: "red"};
    if(stat === "DEFENSE") return { stat: "DEFENSA", color: "yellow"};
    if(stat === "SPECIAL-ATTACK") return { stat: "ATAQUE ESPECIAL", color: "blue"};
    if(stat === "SPECIAL-DEFENSE") return { stat: "DEFENSA ESPECIAL", color: "aqua"};
    if(stat === "SPEED") return { stat: "VELOCIDAD", color: "orange"};
}

const title = document.getElementById("title");
title.style.cursor = "pointer";
title.addEventListener('click', () => {
    window.location.href = "index.html";
})