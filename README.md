# 📘 Documentation du module xcraft-core-subst

## Aperçu

Le module `xcraft-core-subst` est une bibliothèque utilitaire pour le framework Xcraft qui permet de gérer les substitutions de lecteurs sous Windows. Il offre une solution pour contourner les limitations de longueur de chemin sous Windows en montant temporairement des chemins longs sur des lettres de lecteur.

## Structure du module

- **Subst** : Classe principale pour gérer les substitutions de lecteurs
- **wrap** : Fonction utilitaire pour exécuter du code avec un chemin substitué
- **wrapTmp** : Fonction utilitaire pour créer des copies temporaires dans un répertoire avec un chemin court

## Fonctionnement global

Le module fonctionne principalement sur Windows pour résoudre le problème des chemins trop longs (> 260 caractères). Il utilise la commande `subst` de Windows pour associer un chemin à une lettre de lecteur, permettant ainsi d'accéder à des fichiers avec des chemins très longs via un chemin plus court.

Sur les systèmes non-Windows, le module est inactif et retourne simplement les chemins d'origine sans modification.

## Exemples d'utilisation

### Utilisation de base avec Subst

```javascript
const {Subst} = require('xcraft-core-subst');

// Dans une fonction async/await
async function example() {
  const subst = new Subst('/chemin/tres/long/vers/un/dossier', resp);
  const drive = await subst.mount();

  try {
    // Utiliser le lecteur monté (ex: 'z:')
    // ...
  } finally {
    // Toujours démonter le lecteur après utilisation
    await subst.umount();
  }
}
```

### Utilisation avec la fonction wrap

```javascript
const {wrap} = require('xcraft-core-subst');

// Dans une fonction async/await
async function example() {
  const result = await wrap(
    '/chemin/tres/long/vers/un/fichier.txt',
    resp,
    async (err, shortPath) => {
      if (err) {
        throw err;
      }
      // shortPath est maintenant quelque chose comme 'z:/fichier.txt'
      return await faireQuelqueChoseAvecLeFichier(shortPath);
    }
  );
}
```

### Utilisation avec wrapTmp

```javascript
const {wrapTmp} = require('xcraft-core-subst');

function example() {
  const {dest, unwrap} = wrapTmp('/chemin/source', 'dossier-temp', resp);

  try {
    // Utiliser les fichiers dans dest
    // ...
  } finally {
    // Nettoyer les fichiers temporaires
    unwrap(() => {
      console.log('Nettoyage terminé');
    });
  }
}
```

## Interactions avec d'autres modules

- **[xcraft-core-platform]** : Utilisé pour détecter le système d'exploitation
- **[xcraft-core-process]** : Utilisé pour exécuter des commandes système
- **[xcraft-core-etc]** : Utilisé pour charger la configuration Xcraft
- **gigawatts** (watt) : Utilisé pour la gestion asynchrone

## Détails des sources

### `index.js`

Ce fichier contient la classe principale `Subst` qui gère la substitution de lecteurs sous Windows. La classe offre les méthodes suivantes :

- **constructor(location, resp)** : Initialise une nouvelle instance avec le chemin à substituer
- **mount()** : Monte le chemin sur une lettre de lecteur (commence par 'z' et descend si nécessaire)
- **umount()** : Démonte la lettre de lecteur précédemment montée

La classe utilise les commandes Windows `net use` et `subst` pour vérifier et effectuer les substitutions.

### `lib/wrap.js`

Ce fichier fournit une fonction utilitaire qui :

1. Prend un chemin de fichier
2. Monte le répertoire contenant ce fichier sur une lettre de lecteur
3. Exécute une fonction de callback avec le nouveau chemin court
4. Démonte la lettre de lecteur une fois terminé

C'est une façon élégante d'utiliser temporairement un chemin substitué sans avoir à gérer manuellement le montage/démontage.

### `lib/wrap-tmp.js`

Ce fichier fournit une fonction qui :

1. Vérifie si la configuration Xcraft a des répertoires temporaires différents pour le système et pour les lecteurs
2. Si c'est le cas, copie les fichiers du chemin source vers un emplacement temporaire avec un chemin plus court
3. Retourne le nouveau chemin et une fonction pour nettoyer les fichiers temporaires

Cette fonction est utile pour travailler avec des fichiers qui doivent être accessibles via un chemin court, mais sans modifier l'emplacement d'origine.

### `eslint.config.js`

Ce fichier contient la configuration ESLint pour le module, définissant les règles de style de code et les plugins utilisés pour le développement.

## Configuration avancée

Le module utilise la configuration Xcraft pour déterminer les emplacements des répertoires temporaires :

- **tempRoot** : Répertoire temporaire standard
- **tempDriveRoot** : Répertoire temporaire pour les lecteurs substitués

Ces valeurs sont configurées dans le fichier de configuration Xcraft.

_Cette documentation a été mise à jour automatiquement._

[xcraft-core-platform]: https://github.com/Xcraft-Inc/xcraft-core-platform
[xcraft-core-process]: https://github.com/Xcraft-Inc/xcraft-core-process
[xcraft-core-etc]: https://github.com/Xcraft-Inc/xcraft-core-etc