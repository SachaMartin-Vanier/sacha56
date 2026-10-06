/*
 * app.js
 * Jeu de tic tac toe
 */


let cases = document.querySelectorAll(".case");
let replayBtn = document.querySelector("#replay");
let panneauMessage = document.querySelector("#message");
let ecranFin = document.querySelector("#ecran-fin");
let ecranAttente = document.querySelector("#ecran-attente");
let jouerBtn = document.querySelector("#jouer");
let ligneVictoireCanvas = document.querySelector("#ligne-victoire");
let grille = document.querySelector("#grille");
let grilleDessinCanvas = document.querySelector("#grille-dessin");
let joueurs = document.querySelectorAll(".player");
let audioAmbiance = document.querySelector("#audio-ambiance");
let audioRond = document.querySelector("#audio-rond");
let audioCroix = document.querySelector("#audio-croix");
let audioGrille = document.querySelector("#audio-grille");
let audioLigne = document.querySelector("#audio-ligne");
let audioVictoire = document.querySelector("#audio-victoire");
let audioErreur = document.querySelector("#audio-erreur");


let joueurX = true; //premier joueur X
let gagnant = ''; //pas encore de gagnant
let jeuActif = true;
let partieCommencee = false;
let delaiLigneVictoire = null;
let delaiEcranFin = null;
const delaiAvantLigneVictoire = 1500; // après la fin du dessin du dernier symbole (croix : 1280 ms)
const dureeLigneVictoire = synchroSons.ligne[0][1]; // fin du trait de la ligne gagnante (canvas-symbols.js)
const delaiApresLigneVictoire = 500;
const jouerSon = function (audio) {
    audio.currentTime = 0;
    const lecture = audio.play();
    if (lecture) lecture.catch(() => {});
};

// Ambiance : plus basse pour laisser entendre le crayon, et bouclée à la fin du son
// (le fichier se termine par ~7 s de silence qui couperaient la boucle)
const volumeAmbiance = 0.2;
const finSonAmbiance = 12.9; // en secondes
audioAmbiance.volume = volumeAmbiance;
audioAmbiance.addEventListener("timeupdate", function () {
    if (audioAmbiance.currentTime >= finSonAmbiance) audioAmbiance.currentTime = 0;
});
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

grille.dataset.currentPlayer = "x";

const actualiserJoueur = function () {
    const joueurActif = joueurX ? "x" : "o";

    for (let joueur of joueurs) {
        joueur.classList.remove("visible");
    }

    const panneauJoueurActif = document.querySelector(`.player[data-player="${joueurActif}"]`);
    if (panneauJoueurActif) {
        panneauJoueurActif.classList.add("visible");
    }
};

actualiserJoueur();


// Ajuste la résolution du canvas à sa taille affichée
const redimensionnerCanvas = function (canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
};

redimensionnerCanvas(grilleDessinCanvas);

for (let boite of cases) {
    boite.active = true;
    const canvas = boite.querySelector("canvas");
    redimensionnerCanvas(canvas);
    boite.addEventListener("click", function () {
        if (boite.dataset.value && jeuActif && partieCommencee) {
            jouerSon(audioErreur); // case déjà remplie
        }
        else if (boite.active && partieCommencee) {
            redimensionnerCanvas(canvas); // au cas où la mise en page aurait changé
            if (joueurX) {
                boite.dataset.value = "X";
                jouerSon(audioCroix);
                animerSymbole(canvas, "x", audioCroix);
                joueurX = false;
            }
            else {
                boite.dataset.value = "O";
                jouerSon(audioRond);
                animerSymbole(canvas, "o", audioRond);
                joueurX = true;
            }
            grille.dataset.currentPlayer = joueurX ? "x" : "o";
            actualiserJoueur();
            boite.active = false;
            valide();
        }
    });
}

// Redessine le symbole (sans ré-animer) si la taille de la grille change
window.addEventListener("resize", function () {
    redimensionnerCanvas(grilleDessinCanvas);
    dessinerGrille(grilleDessinCanvas.getContext("2d"), grilleDessinCanvas, 1);
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
            delaiLigneVictoire = setTimeout(() => traceLigneSurPatron(patron), delaiAvantLigneVictoire);
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
    jouerSon(audioLigne);
    jouerSon(audioVictoire);
    animerLigneVictoire(ligneVictoireCanvas, p1.x, p1.y, p2.x, p2.y, audioLigne);
};

//Affiche message
const afficheMessage = function (msg) {
    panneauMessage.innerText = msg;
    panneauMessage.classList.remove("message-x", "message-o", "message-bounce");

    if (msg.includes("X")) {
        panneauMessage.classList.add("message-x");
    }
    else if (msg.includes("O")) {
        panneauMessage.classList.add("message-o");
    }

    clearTimeout(delaiEcranFin);
    if (msg) {
        delaiEcranFin = setTimeout(
            () => {
                ecranFin.classList.add("visible");
                panneauMessage.classList.add("message-bounce");
            },
            delaiAvantLigneVictoire + dureeLigneVictoire + delaiApresLigneVictoire
        );
    }
    else {
        ecranFin.classList.remove("visible");
    }
};

//Jouer encore
jouerBtn.addEventListener("click", function () {
    ecranAttente.classList.remove("visible");
    partieCommencee = true;
    jouerSon(audioAmbiance);
    jouerSon(audioGrille);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        dessinerGrille(grilleDessinCanvas.getContext("2d"), grilleDessinCanvas, 1);
    }
    else {
        animerGrille(grilleDessinCanvas, audioGrille);
    }
});

replayBtn.addEventListener("click", function () {
    clearTimeout(delaiEcranFin);
    audioVictoire.pause();
    ecranFin.classList.remove("visible");
    videCases();
    afficheMessage("");
    joueurX = true;
    grille.dataset.currentPlayer = "x";
    actualiserJoueur();
    jeuActif = true;
    for (let boite of cases) {
        boite.active = true;
    }
});


