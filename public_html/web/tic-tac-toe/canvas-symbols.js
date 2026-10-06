/*
 * canvas-symbols.js
 * Dessin animé de X et O avec effet crayon
 */

// Fenêtres [début, fin] en ms de chaque trait, calées sur les sons (assets/son)
const synchroSons = {
    x: [[210, 680], [980, 1280]],                               // Croix-son_01 : 2 traits séparés par une pause
    o: [[200, 1100]],                                           // Rond-son_01 : un seul trait continu
    grille: [[60, 360], [680, 900], [1050, 1250], [1370, 1560]], // Grille_01 : 4 traits
    ligne: [[0, 500]]                                            // Ligne_01 : à caler sur le son une fois ajouté
};

// Avancement (0 à 1) d'un trait à l'instant donné
function avancementTrait(temps, [debut, fin]) {
    return Math.min(Math.max((temps - debut) / (fin - debut), 0), 1);
}

// Horloge en ms : suit la position de lecture du son quand il joue,
// sinon (son bloqué ou pas encore démarré) le temps écoulé depuis le lancement
function creerHorloge(audio) {
    const debut = performance.now();
    return function () {
        if (audio && !audio.paused && audio.currentTime > 0) return audio.currentTime * 1000;
        return performance.now() - debut;
    };
}

// Dessine une croix qui s'anime progressivement (progress: 0 à 1)
function drawX(ctx, canvas, progress, variationDepart = {}) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const marge = w * 0.2;
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    const debutPremiereX = marge + (variationDepart.premiereX || 0);
    const debutPremiereY = marge + (variationDepart.premiereY || 0);
    const debutSecondeX = w - marge + (variationDepart.secondeX || 0);
    const debutSecondeY = marge + (variationDepart.secondeY || 0);

    // progress : [avancement 1ère diagonale, avancement 2ème diagonale], ou un nombre global
    // (1ère diagonale sur la 1ère moitié, 2ème diagonale sur la 2ème moitié)
    const [t1, t2] = Array.isArray(progress)
        ? progress
        : [Math.min(progress * 2, 1), Math.max((progress - 0.5) * 2, 0)];

    const amplitudeT1 = 6 + (1 - Math.min(t1 * 2, 1)) * 6;
    dessinerTraitAvecJitter(ctx, debutPremiereX, debutPremiereY, w - marge, h - marge, t1, amplitudeT1);

    const amplitudeT2 = 6 + (1 - Math.min(t2 * 2, 1)) * 6;
    dessinerTraitAvecJitter(ctx, debutSecondeX, debutSecondeY, marge, h - marge, t2, amplitudeT2);
}

// Dessine un rond qui s'anime progressivement
function drawO(ctx, canvas, progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const rayon = w * 0.28;
    ctx.strokeStyle = "#0051FF";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    const nbPoints = 60;
    const pointsAAfficher = Math.round(nbPoints * progress);
    ctx.beginPath();
    for (let i = 0; i <= pointsAAfficher; i++) {
        // angle du cercle + léger tremblement aléatoire pour l'effet crayon
        const angle = -Math.PI / 2 + (i / nbPoints) * Math.PI * 2;
        const tremblement = (Math.random() - 0.5) * (rayon * 0.06);
        const x = cx + Math.cos(angle) * (rayon + tremblement);
        const y = cy + Math.sin(angle) * (rayon + tremblement);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

// Trace une portion (0 à 1) d'une ligne droite avec un tremblement doux façon crayon
function dessinerTraitAvecJitter(ctx, x1, y1, x2, y2, t, amplitude = 4, nbPoints = 20) {
    if (t <= 0) return;

    const pointsAAfficher = Math.round(nbPoints * t);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const longueur = Math.hypot(dx, dy) || 1;
    const nx = -dy / longueur; // normale au trait, pour décaler le tremblement perpendiculairement
    const ny = dx / longueur;

    let tremblementPrecedent = 0; // lissage du tremblement pour éviter l'effet zigzag

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    for (let i = 1; i <= pointsAAfficher; i++) {
        const ratio = i / nbPoints;
        const x = x1 + dx * ratio;
        const y = y1 + dy * ratio;

        const variation = (Math.random() - 0.5) * amplitude;
        tremblementPrecedent = tremblementPrecedent * 0.75 + variation * 0.25;

        ctx.lineTo(x + nx * tremblementPrecedent, y + ny * tremblementPrecedent);
    }
    ctx.stroke();
}

// Lance l'animation d'un symbole ("x" ou "o") sur un canvas donné, synchronisée sur son son
function animerSymbole(canvas, type, audio) {
    const ctx = canvas.getContext("2d");
    const horloge = creerHorloge(audio);
    const traits = synchroSons[type];
    const fonctionDessin = type === "x" ? drawX : drawO;
    const variationDepart = type === "x" ? {
        premiereX: (Math.random() - 0.5) * canvas.width * 0.12,
        premiereY: (Math.random() - 0.5) * canvas.height * 0.12,
        secondeX: (Math.random() - 0.5) * canvas.width * 0.12,
        secondeY: (Math.random() - 0.5) * canvas.height * 0.12
    } : {};

    function frame() {
        const temps = horloge();
        const avancements = traits.map((trait) => avancementTrait(temps, trait));
        fonctionDessin(ctx, canvas, type === "x" ? avancements : avancements[0], variationDepart);
        if (avancements[avancements.length - 1] < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// Dessine progressivement les quatre lignes de la grille avec le même effet crayon
function dessinerGrille(ctx, canvas, progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#013D63";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";

    const lignes = [
        [w / 3, 0, w / 3, h],
        [w * 2 / 3, 0, w * 2 / 3, h],
        [0, h / 3, w, h / 3],
        [0, h * 2 / 3, w, h * 2 / 3]
    ];

    for (let index = 0; index < lignes.length; index++) {
        // progress : avancement de chaque ligne (tableau), ou un nombre global
        const progressionLigne = Array.isArray(progress)
            ? progress[index]
            : Math.min(Math.max((progress - index * 0.18) / 0.4, 0), 1);
        const [x1, y1, x2, y2] = lignes[index];
        dessinerTraitAvecJitter(ctx, x1, y1, x2, y2, progressionLigne, 4, 40);
    }
}

// Lance le dessin animé de la grille, synchronisé sur son son
function animerGrille(canvas, audio) {
    const ctx = canvas.getContext("2d");
    const horloge = creerHorloge(audio);

    function frame() {
        const temps = horloge();
        const avancements = synchroSons.grille.map((trait) => avancementTrait(temps, trait));
        dessinerGrille(ctx, canvas, avancements);
        if (avancements[avancements.length - 1] < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

// Trace une ligne animée façon crayon qui raye le patron gagnant
function animerLigneVictoire(canvas, x1, y1, x2, y2, audio) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#013D63";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    // prolonge la ligne de 15% de chaque côté pour bien dépasser les cases de début/fin
    const dx = x2 - x1;
    const dy = y2 - y1;
    const longueur = Math.hypot(dx, dy) || 1;
    const ux = dx / longueur;
    const uy = dy / longueur;
    const prolongement = longueur * 0.15;
    const debutX = x1 - ux * prolongement;
    const debutY = y1 - uy * prolongement;
    const finX = x2 + ux * prolongement;
    const finY = y2 + uy * prolongement;

    const horloge = creerHorloge(audio);
    function frame() {
        const progress = avancementTrait(horloge(), synchroSons.ligne[0]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dessinerTraitAvecJitter(ctx, debutX, debutY, finX, finY, progress, 2, 80);
        if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}