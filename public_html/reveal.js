// Apparition des cartes au défilement, en cascade (100 / 220 / 340 ms)
const cartes = document.querySelectorAll("body > div");

const afficher = (entrees, observateur) => {
    entrees.forEach((entree) => {
        if (entree.isIntersecting) {
            entree.target.classList.add("is-visible");
            observateur.unobserve(entree.target);
        }
    });
};

if ("IntersectionObserver" in window) {
    const observateur = new IntersectionObserver(afficher, { threshold: 0.15 });
    cartes.forEach((carte, index) => {
        carte.classList.add("reveal");
        if (index < 3) {
            carte.classList.add("reveal-" + (index + 1));
            // le délai ne doit servir qu'à l'apparition, pas au survol
            carte.addEventListener("transitionend", () => {
                carte.classList.remove("reveal-" + (index + 1));
            }, { once: true });
        }
        observateur.observe(carte);
    });
}
