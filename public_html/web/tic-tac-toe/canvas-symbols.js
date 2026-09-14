/*
 * canvas-symbols.js
 * Dessin animé de X et O avec effet crayon
 */

// Dessine une croix qui s'anime progressivement (progress: 0 à 1)
function drawX(ctx, canvas, progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const marge = w * 0.2;
    ctx.strokeStyle = "#C0392B";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    // 1ère diagonale sur la 1ère moitié de l'animation, 2ème diagonale sur la 2ème moitié
    const t1 = Math.min(progress * 2, 1);
    dessinerTraitAvecJitter(ctx, marge, marge, w - marge, h - marge, t1);

    const t2 = Math.max((progress - 0.5) * 2, 0);
    dessinerTraitAvecJitter(ctx, w - marge, marge, marge, h - marge, t2);
}

// Dessine un rond qui s'anime progressivement
function drawO(ctx, canvas, progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const rayon = w * 0.28;
    ctx.strokeStyle = "#2E86C1";
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

// Lance l'animation d'un symbole ("x" ou "o") sur un canvas donné
function animerSymbole(canvas, type, duree = 500) {
    const ctx = canvas.getContext("2d");
    const debut = performance.now();
    const fonctionDessin = type === "x" ? drawX : drawO;

    function frame(maintenant) {
        const progress = Math.min((maintenant - debut) / duree, 1);
        fonctionDessin(ctx, canvas, progress);
        if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// Trace une ligne animée façon crayon qui raye le patron gagnant
function animerLigneVictoire(canvas, x1, y1, x2, y2, duree = 500) {
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

    const debut = performance.now();
    function frame(maintenant) {
        const progress = Math.min((maintenant - debut) / duree, 1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dessinerTraitAvecJitter(ctx, debutX, debutY, finX, finY, progress, 2, 80);
        if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}