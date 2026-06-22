// selecting html elements
const form = document.querySelector('#pokemon-form');
const input = document.querySelector('#pokemon-input');
const statusMessage = document.querySelector('#status');
const results = document.querySelector('#results');

// listen for the form being submitted
form.addEventListener('submit', function(event){
    // prevents page refresh when form is submitted
    event.preventDefault();
    // get the pokemon name from the input and converts to lowercase for the API to accept
    const pokemonName = input.value.trim().toLowerCase();
    // makes sure the user entered a pokemon name. its checking
    if (pokemonName === ""){
        statusMessage.textContent = "Please enter a Pokemon name.";
        return;
    }

    statusMessage.innerHTML = `
    <div class="loader-box">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
    <p>Searching for: ${pokemonName}...</p>
    `;
    // call the function that fetches pokemon data from the API
    getPokemon(pokemonName);
});

// async function to fetch the pokemon data from the API woo!
async function getPokemon(pokemonName)
{
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        // TEMP: keeps the loader on the screen for 1.2 seconds! 
        // this was just a test but 1200 was too long
        // await new Promise(resolve => setTimeout(resolve, 1200));

        // NEW: keeps the loader on the screen for 700ms instead.
        await new Promise(resolve => setTimeout(resolve, 700));

        // if the pokemon doesnt exist, it'll force an error
        if(!response.ok)
        {
            throw new Error("Pokemon not found, Sorry! :<");
        }

        const data = await response.json();

        // print the pokemon data in the console
        console.log(data)
        console.log(data.sprites.front_default);

        // this makes it to where any TYPE of pokemon, the name will be colored to that specific type!
        const typeColors = 
        {
            electric: "#f7d02c",
            fire: "#ee8130",
            water: "#6390f0",
            grass: "#7ac74c",
            psychic: "#f95587",
            ice: "#96d9d6",
            dark: "#705746",
            fairy: "#d685ad",
            ghost: "#735797",
            dragon: "#6f35fc",
            bug: "#a6b91a",
            normal: "#a8a77a",
            poison: "#a33ea1",
            ground: "#e2bf65",
            fighting: "#c22e28",
            rock: "#b6a136",
            steel: "#b7b7ce",
            flying: "#a98ff3"
        };

        const mainType = data.types[0].type.name;
        const nameColor = typeColors[mainType] || "#000000";

        // shows a status once the pokemon is found
        //statusMessage.textContent = `${data.name} found! Woo!`;

        // Shows a status message while also capitalizing things properly
        statusMessage.textContent = `${data.name.charAt(0).toUpperCase() + data.name.slice(1)} found! WOO!`;
        
        
        // this will display the name, type AND a picture of the pokemon!
        results.innerHTML = `
        <article class="pokemon-card">
            <h2 style="color: ${nameColor};">
                ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}
            </h2>
            <p>
                Type: ${data.types[0].type.name.charAt(0).toUpperCase() + data.types[0].type.name.slice(1)}
            </p>
            <img src="${data.sprites.front_default}" alt="${data.name}">


            <button class="details-button">Show Details</button>

            <div class="pokemon-details hidden">
                <p>Height: ${data.height}</p>
                <p>Weight: ${data.weight}</p>
                <p>Abilities: ${data.abilities.map(ability => ability.ability.name).join(", ")}</p>
            </div>
       </article>
        `;

        // makes the button work for details!
        const detailsButton = document.querySelector(".details-button");
        const pokemonDetails = document.querySelector(".pokemon-details");

        detailsButton.addEventListener("click", function() {
            pokemonDetails.classList.toggle("hidden");
            if (pokemonDetails.classList.contains("hidden"))
            {
                detailsButton.textContent = "Show Details";
            } else
            {
                detailsButton.textContent = "Hide Details";
            }
        });
    }
    catch (error)
    {
        console.error(error);

        // shows a error message
        statusMessage.textContent = "Pokemon not found. Please try again! Wompwomp :(";

        // clear old pokemon card if it fails
        results.innerHTML = "";
    }
    
}