/*
 * app.js
 * Jeu de tic tac toe
 */


let cases = document.querySelectorAll(".case");
let replayBtn = document.querySelector("#replay");
let panneauMessage = document.querySelector("#message");
let ligneVictoireCanvas = document.querySelector("#ligne-victoire");


let joueurX = true; //premier joueur X
let gagnant = ''; //pas encore de gagnant
let jeuActif = true;
let delaiLigneVictoire = null;
const patrons = [ //les patrons gagnants
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8]
];


// Ajuste la résolution du canvas à sa taille affichée
const redimensionnerCanvas = function (canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
};

for (let boite of cases) {
    boite.active = true;
    const canvas = boite.querySelector("canvas");
    redimensionnerCanvas(canvas);
    boite.addEventListener("click", function () {
        if (boite.active) {
            redimensionnerCanvas(canvas); // au cas où la mise en page aurait changé
            if (joueurX) {
                boite.dataset.value = "X";
                animerSymbole(canvas, "x");
                joueurX = false;
            }
            else {
                boite.dataset.value = "O";
                animerSymbole(canvas, "o");
                joueurX = true;
            }
            boite.active = false;
            valide();
        }
    });
}

// Redessine le symbole (sans ré-animer) si la taille de la grille change
window.addEventListener("resize", function () {
    for (let boite of cases) {
        const canvas = boite.querySelector("canvas");
        redimensionnerCanvas(canvas);
        const ctx = canvas.getContext("2d");
        if (boite.dataset.value === "X") drawX(ctx, canvas, 1);
        else if (boite.dataset.value === "O") drawO(ctx, canvas, 1);
    }
});


const valide = function () {
    for (let patron of patrons) {
        let val1 = cases[patron[0]].dataset.value;
        let val2 = cases[patron[1]].dataset.value;
        let val3 = cases[patron[2]].dataset.value;

        if (val1 &&
            val1 === val2 &&
            val1 === val3) {
            jeuActif = false;
            afficheMessage(`Le gagnant est ${val1}`);
            delaiLigneVictoire = setTimeout(() => traceLigneSurPatron(patron), 900);
            for (let boite of cases) {
                boite.active = false;
            }
        }
    }
    if (!jeuActif) return;
    if ([...cases].every((boite) => boite.active === false)) {
        jeuActif = false;
        afficheMessage("Partie nulle");
    }
};



//Vide les cases
const videCases = function () {
    clearTimeout(delaiLigneVictoire);
    for (let boite of cases) {
        delete boite.dataset.value;
        const canvas = boite.querySelector("canvas");
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }
    ligneVictoireCanvas.getContext("2d").clearRect(0, 0, ligneVictoireCanvas.width, ligneVictoireCanvas.height);
};

// Trace une ligne du centre de la 1ère case au centre de la 3e case du patron gagnant
const traceLigneSurPatron = function (patron) {
    const rectGrille = document.querySelector("#grille").getBoundingClientRect();
    const centreCase = function (index) {
        const rect = cases[index].getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - rectGrille.left,
            y: rect.top + rect.height / 2 - rectGrille.top
        };
    };
    const p1 = centreCase(patron[0]);
    const p2 = centreCase(patron[2]);
    animerLigneVictoire(ligneVictoireCanvas, p1.x, p1.y, p2.x, p2.y);
};

//Affiche message
const afficheMessage = function (msg) {
    panneauMessage.innerText = msg;
};

//Jouer encore
replayBtn.addEventListener("click", function () {
    videCases();
    afficheMessage("");
    joueurX = true;
    jeuActif = true;
    for (let boite of cases) {
        boite.active = true;
    }
});

//changement de joueur après chaque tour
const Changejoueur = function () {
    if (joueurX === false) {
        player.classList.toggle("visible");
    }
};

