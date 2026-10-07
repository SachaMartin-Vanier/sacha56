// Bouton FR / EN : affiche les textes de la langue choisie et la garde en mémoire
const racine = document.documentElement;

const lireLangue = () => {
    try {
        return localStorage.getItem("langue");
    } catch (e) {
        return null;
    }
};

const appliquerLangue = (langue) => {
    racine.lang = langue;
    bouton.setAttribute("aria-checked", langue === "en" ? "true" : "false");
    try {
        localStorage.setItem("langue", langue);
    } catch (e) {
        // stockage indisponible : la langue ne sera pas retenue
    }
};

const bouton = document.createElement("button");
bouton.type = "button";
bouton.className = "lang-toggle";
bouton.setAttribute("role", "switch");
bouton.setAttribute("aria-label", "English / Français");
bouton.innerHTML = '<span class="lang-thumb" aria-hidden="true"></span>'
    + '<span class="lang-option" aria-hidden="true">FR</span>'
    + '<span class="lang-option" aria-hidden="true">EN</span>';
bouton.addEventListener("click", () => {
    appliquerLangue(racine.lang === "fr" ? "en" : "fr");
});
document.body.prepend(bouton);

appliquerLangue(lireLangue() === "en" ? "en" : "fr");
