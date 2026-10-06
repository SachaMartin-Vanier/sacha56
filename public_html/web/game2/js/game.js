/* PLATEFORME DE JEU */
// Créer le canevas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
document.querySelector("#gameBox").appendChild(canvas);

/* SPRITES */
// Image d'arrière-plan
let bgImage = new Image();
bgImage.src = "images/background.png";

// Estampe gagnant
let winImage = new Image();
winImage.src = "images/win.png";

// Image du joueur
let playerImage = new Image();
playerImage.src = "images/player.png";

// Image des goodies
let goodyImage = new Image();
goodyImage.src = "images/goody.png";

/* BOUCLE PRINCIPALE : MAIN */
const main = function () {
    if (checkWin()) {
        render("win"); //affichage gagnant vrai
    }
    else {
        //Pas encore gagné, jouer le jeu
        //déplacer le joueur
        if (player.x > 0 && player.x < canvas.width - player.width) {
            player.x += vX;
        }
        else {
            player.x -= vX;
            vX = -vX; //bounce
        }
        if (player.y > 0 && player.y < canvas.height - player.height) {
            player.y += vY
        }
        else {
            player.y -= vY;
            vY = -vY; //bounce
        }
        //vérifier les collisions
        for (let i in goodies) {
            if (checkCollision(player,goodies[i])) {
                goodies.splice(i,1);
            }
        }

        render();
        window.requestAnimationFrame(main);
    }
};

/* OBJETS GLOBAUX */
const player = {
    speed : 5, // mouvement en pixels par tick
    width: 32,
    height: 32
};

let goodies = []; // variable pour contenir les goddies, un array

// Variables de vitesse
let vX = 0;
let vY = 0;

/* CONTRÔLES */
// Gérer les commandes tactiles
addEventListener("touchstart", function (e) {
    if (e.target.id == "uArrow") { // HAUT
        vX = 0;
        vY = -player.speed;
    }
    else if (e.target.id == "dArrow") { // BAS
        vX = 0;
        vY = player.speed;
    }
    else if (e.target.id == "lArrow") { // GAUCHE
        vX = -player.speed;
        vY = 0;
    }
    else if (e.target.id == "rArrow") { //DROIT
        vX = player.speed;
        vY = 0;
    }
    else { // ARRÊT S’arrête si vous touchez ailleurs
        vX = 0;
        vY = 0;
    }
}, false);

// Gérer les commandes du clavier
addEventListener("keydown", function (e) {
    //Touches
    if (e.key == "ArrowUp") { // FLECHE HAUT
        vX = 0;
        vY = -player.speed;
    }
    if (e.key == "ArrowDown") { // FLECHE BAS
        vX = 0;
        vY = player.speed;
    }
    if (e.key == "ArrowLeft") { // FLECHE GAUCHE
        vX = -player.speed;
        vY = 0;
    }
    if (e.key == "ArrowRight") { // FLECHE DROITE
        vX = player.speed;
        vY = 0;
    }
    if (e.key == " ") { // ARRÊT barre d’espace
        vX = 0;
        vY = 0;
    }
}, false);

/* ÉTAT INITIAL : INIT */
const init = function () {
    //Mettre le joueur au centre
    player.x = (canvas.width - player.width) / 2;
    player.y = (canvas.height - player.height) / 2;

    // Mettre 3 goodies dans l’array
    goodies = [
        { width: 32, height: 32 }, // un goody
        { width: 32, height: 32 }, // deux goodies
        { width: 32, height: 32 }  // trois goodies
    ];

    //Placez des goodies à des endroits aléatoires
    for (let i in goodies) {
        goodies[i].x = (Math.random() * (canvas.width - goodies[i].width));
        goodies[i].y = (Math.random() * (canvas.height - goodies[i].height));
    }
    main(); //lancer la boucle
};

const render = function (s) {
    //Nettoyer l’écran/canvas sur chaque tic
    ctx.clearRect(0,0,canvas.width, canvas.height);

    if (s == "win") {  // statut: on a gagné, afficher le cadre gagnant
        ctx.fillStyle = "rgb(200,230,200)";  //vert pale
        ctx.fillRect(0,0,canvas.width, canvas.height);

        if (winImage.complete) {
            ctx.drawImage(winImage, (canvas.width - winImage.width)/2,
                (canvas.height - winImage.height)/2);
        }
    }
    else {  // sinon, afficher le jeu
        if (bgImage.complete) {
            ctx.fillStyle = ctx.createPattern(bgImage, 'repeat');
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        if (playerImage.complete) {
            ctx.drawImage(playerImage, player.x, player.y);
        }
        if (goodyImage.complete) {
            for (let i in goodies) {
                ctx.drawImage(goodyImage, goodies[i].x, goodies[i].y);
            }
        }
        //Label
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "14px monospace"; //peut être une fonte CSS
        ctx.fillText("Goodies restants : "+goodies.length, 32, 32);
    }
};

/* AUTRES FONCTIONS */
//Fonction générique pour vérifier les collisions
const checkCollision = function (obj1,obj2) {
    return (obj1.x < (obj2.x + obj2.width) &&
        (obj1.x + obj1.width) > obj2.x &&
        obj1.y < (obj2.y + obj2.height) &&
        (obj1.y + obj1.height) > obj2.y
    );
};

const checkWin = function () {
    if (goodies.length > 0) {
        return false;
    } else {
        return true;
    }
};

//Lancer le jeu
init();