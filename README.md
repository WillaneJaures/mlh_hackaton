# mlh_hackaton

ATS Intelligence — Analyse et matching de CV par IA
ATS Intelligence est une application web qui aide à comparer un CV au format PDF avec une fiche de poste à l'aide d'un modèle d'intelligence artificielle Google Gemini. Elle extrait le texte du CV, l'envoie au backend Python pour analyse, puis affiche un rapport dans une interface React.
Important : cet outil est une aide à l'analyse. Il ne doit pas prendre seul une décision de recrutement ou de rejet. Les résultats doivent être vérifiés par une personne responsable du recrutement.

**Sommaire**
- Fonctionnalités
- Technologies
- Architecture
- Structure du projet
- Prérequis
- Installation
- Configuration
- Lancement en développement
- Utilisation
- API
- Dépannage
- Sécurité et confidentialité
- Limites connues
- Améliorations envisagées
- Contribution
- Licence

  
**Fonctionnalités**
- Saisie d'une fiche de poste et des compétences recherchées.
- Import d'un CV au format PDF depuis l'interface web.
- Extraction du texte du PDF avec pypdf.
- Envoi du texte et de la fiche de poste au modèle Gemini configuré.
- Génération d'un rapport en français contenant :
  - un score global de correspondance proposé par le modèle ;
  - une synthèse et une recommandation indicative ;
  - les compétences démontrées et correspondant au poste ;
  - les compétences manquantes ou non démontrées ;
  - des questions à poser pendant l'entretien.
- Interface React responsive avec formulaire de dépôt de CV et affichage du rapport.
- API REST Python réalisée avec FastAPI.
- Documentation interactive de l'API grâce à Swagger UI.
  
**Technologies**
Frontend
- React — construction de l'interface utilisateur.
- Vite — serveur de développement et outil de build.
- JavaScript et CSS.
Backend
- Python
- FastAPI — API REST.
- Uvicorn — serveur ASGI.
- Google Gen AI SDK — appel au modèle Gemini.
- pypdf — extraction de texte PDF.
- python-dotenv — chargement des variables d'environnement.
- python-multipart — réception des fichiers envoyés par formulaire.
  
**Architecture**
Utilisateur
    |
    v
Frontend React + Vite
    |  POST /api/analyze
    |  fiche de poste + fichier PDF
    v
Backend FastAPI
    |
    +--> Extraction du texte du PDF avec pypdf
    |
    +--> Construction du prompt d'analyse
    |
    v
API Google Gemini
    |
    v
Rapport d'analyse en français
    |
    v
Réponse JSON du backend
    |
    v
Affichage du rapport dans React
Le frontend et le backend sont deux applications distinctes. En développement, React tourne généralement sur http://localhost:5173 et FastAPI sur http://127.0.0.1:8000.

**Structure du projet**
Structure recommandée pour le dépôt :
ats-intelligence/
├── .gitignore
├── README.md
├── ats-intelligence-frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
└── ats-intelligence-backend/
    ├── main.py
    ├── .env.example
    └── requirements.txt
    
Certains fichiers peuvent varier selon la configuration locale. Ne versionnez pas node_modules/, .venv/, les fichiers .env contenant des secrets, les CV privés ou les données confidentielles.
Prérequis
Installez les outils suivants :
- Node.js et npm — utilisez une version compatible avec la version de Vite du projet.
- Python 3.10 ou une version compatible avec les dépendances installées.
- Une clé API Google Gemini disponible dans votre environnement Google AI.
- Git, pour cloner et versionner le projet.
Vérifiez les installations :
node -v
npm -v
python --version
git --version
Installation
1. Récupérer le projet
Après avoir cloné le dépôt :
git clone https://github.com/TON-UTILISATEUR/ats-intelligence.git
cd ats-intelligence
Remplacez l'URL par celle de votre dépôt GitHub.
2. Installer le frontend
cd ats-intelligence-frontend
npm install
cd ..
Le fichier package-lock.json doit être conservé dans Git afin de faciliter la reproduction de l'environnement.
3. Installer le backend
Depuis la racine du projet :
cd ats-intelligence-backend
python -m venv .venv
Activez l'environnement virtuel.

Windows PowerShell :
.venv\Scripts\Activate.ps1
Linux / macOS / WSL :
source .venv/bin/activate
Installez les dépendances :
pip install fastapi uvicorn python-multipart google-genai python-dotenv pypdf
Pour enregistrer les dépendances de l'environnement dans requirements.txt :
pip freeze > requirements.txt
À l'avenir, elles pourront être installées avec :
pip install -r requirements.txt
Pour une installation reproductible, vérifiez et versionnez un requirements.txt propre correspondant aux dépendances réellement utilisées par le projet.

**Configuration**
Backend : clé API Gemini
Dans ats-intelligence-backend/, créez un fichier .env à partir de .env.example.

Exemple :
GEMINI_API_KEY=********************
GEMINI_MODEL=gemma-4-26b-a4b-it
- GEMINI_API_KEY : clé utilisée par le SDK Google Gen AI.
- GEMINI_MODEL : identifiant du modèle à utiliser. Le code fourni utilise cette valeur par défaut si la variable est absente.
Vérifiez que le modèle configuré est accessible et pris en charge par votre compte et l'API utilisée. Si nécessaire, remplacez-le par un modèle disponible. Ne partagez jamais le fichier .env et n'insérez jamais la clé API dans le frontend React.
Frontend : URL de l'API
Dans la version de base, l'URL de l'API est écrite directement dans src/App.jsx :
fetch("http://127.0.0.1:8000/api/analyze", {
  method: "POST",
  body: formData,
});
Si le projet est déployé ou si le backend utilise une autre adresse, mettez cette URL à jour. Une amélioration recommandée consiste à utiliser une variable de configuration telle que VITE_API_URL côté frontend. Les variables préfixées par VITE_ sont exposées au navigateur : n'y stockez aucun secret.
CORS
Le backend doit autoriser l'origine exacte utilisée par le frontend. En développement, la configuration peut inclure :
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

Terminal 1 — Backend FastAPI
cd ats-intelligence-backend
Activez l'environnement virtuel, si ce n'est pas déjà fait, puis exécutez :
uvicorn main:app --reload --port 8000
Adresses utiles :
- API : http://127.0.0.1:8000
- Documentation interactive Swagger : http://127.0.0.1:8000/docs
- Documentation ReDoc : http://127.0.0.1:8000/redoc

Adresses utiles :
- API : http://127.0.0.1:8000
- Documentation interactive Swagger : http://127.0.0.1:8000/docs
- Documentation ReDoc : http://127.0.0.1:8000/redoc
Terminal 2 — Frontend React
cd ats-intelligence-frontend
npm run dev
Ouvrez l'adresse indiquée par Vite, généralement :

http://localhost:5173

Pour arrêter un serveur, utilisez Ctrl + C dans son terminal.
Utilisation
1. Ouvrez l'interface React.
2. Collez la fiche de poste dans le champ prévu.
3. Importez un CV au format PDF.
4. Cliquez sur Lancer l'analyse.
5. Attendez la réponse de l'API.
6. Consultez le rapport renvoyé par le modèle.
7. Vérifiez les éléments du rapport avant toute décision de recrutement.
Pour tester directement le backend, ouvrez http://127.0.0.1:8000/docs, dépliez POST /api/analyze, cliquez sur Try it out, renseignez job_description, choisissez un fichier PDF dans cv, puis exécutez la requête.
API
GET /
Vérifie que l'API est accessible.

Exemple de réponse :
{
  "message": "ATS Intelligence API opérationnelle"
}
POST /api/analyze
Analyse un CV en fonction d'une fiche de poste.

Type de contenu : multipart/form-data
Champ	Type	Obligatoire	Description
job_description	Texte	Oui	Description du poste et compétences requises
cv	Fichier PDF	Oui	CV du candidat à analyser


Exemple de réponse réussie :
{
  "analysis": "## Score global de correspondance\n**75%**\n..."
}
Le champ analysis contient le rapport textuel produit par le modèle.

Codes d'erreur courants :
- 200 — requête traitée avec succès.
- 400 — fiche de poste vide, fichier vide ou type de fichier refusé par la validation du backend.
- 422 — erreur de validation de la requête ou texte impossible à extraire du PDF.
- 500 — erreur lors du traitement ou de l'appel au modèle.
Les codes et messages exacts peuvent dépendre de la version du code et des validations présentes.
Dépannage
Failed to fetch dans React
Vérifiez les points suivants :
1. FastAPI est démarré sur le port 8000.
2. Le frontend appelle la bonne URL de l'API.
3. Le navigateur utilise une origine autorisée par CORS.
4. Consultez les onglets Console et Network des outils de développement du navigateur.
5. Testez http://127.0.0.1:8000/docs pour vérifier que FastAPI est accessible.
Un statut 200 OK dans les logs FastAPI confirme que le backend a répondu à cette requête, mais il faut également vérifier la réponse reçue et affichée par le navigateur.
Erreur de clé API ou de modèle
- Vérifiez que le fichier .env se trouve dans le dossier backend et qu'il contient GEMINI_API_KEY.
- Redémarrez le serveur après toute modification de configuration.
- Vérifiez que la clé est valide, que l'API est activée et que les quotas ne sont pas dépassés.
- Vérifiez que GEMINI_MODEL correspond à un modèle disponible pour votre API.
Le texte du PDF est vide
Certains PDF sont des scans ou des images plutôt que des documents textuels. pypdf ne réalise pas de reconnaissance optique de caractères (OCR). Pour ces fichiers, une solution OCR devra être ajoutée.
Le navigateur ne peut pas accéder au backend
Assurez-vous que les deux serveurs sont lancés. Si vous utilisez Docker, WSL, un téléphone ou un autre ordinateur, localhost et 127.0.0.1 peuvent désigner un environnement différent. Adaptez alors l'adresse de l'API et les règles réseau/CORS.

**Sécurité et confidentialité**
Les CV peuvent contenir des informations personnelles sensibles. Avant de mettre l'application à disposition d'utilisateurs :
- Ne publiez jamais de CV réels, de clés API ou de fichiers .env dans GitHub.
- Informez les utilisateurs de la finalité du traitement et des services auxquels les données sont transmises.
- Définissez une durée de conservation et une procédure de suppression des CV et rapports.
- Limitez l'accès aux fichiers et aux résultats ; utilisez HTTPS en production.
- Ajoutez des contrôles côté serveur sur la taille, le type réel et le contenu des fichiers.
- Prévoyez des limites de requêtes, une gestion des erreurs et une surveillance des coûts API.
- N'envoyez au modèle que les données nécessaires à l'analyse.
- Évaluez les biais, la qualité et la cohérence des résultats.
- Gardez une supervision humaine : le score généré n'est pas une mesure objective garantie et ne doit pas servir seul à écarter un candidat.
La validation du type MIME côté navigateur n'est pas suffisante pour sécuriser l'upload. Le backend doit également vérifier le fichier et appliquer une limite de taille.
Limites connues
- L'analyse dépend de la qualité du texte extrait du PDF.
- Les PDF scannés nécessitent un traitement OCR supplémentaire.
- Le rapport est renvoyé sous forme de texte Markdown et n'est pas encore entièrement structuré en champs de données.
- Le score est généré par le modèle ; il n'est pas un score statistique calibré ou une probabilité de réussite professionnelle.
- Le stockage permanent des candidats et des analyses n'est pas inclus dans la version de base.
- L'authentification et la gestion des rôles ne sont pas incluses dans la version de base.
- Les performances, quotas et coûts dépendent du modèle et du service Gemini utilisés.

  
Améliorations envisagées
- Retourner un objet JSON structuré avec score, justification, compétences validées, lacunes et questions.
- Afficher le score dans un graphique circulaire et présenter les résultats dans des cartes dédiées.
- Ajouter une authentification et des rôles recruteur/administrateur.
- Ajouter un historique des analyses avec une base de données.
- Permettre la suppression des CV et des rapports.
- Ajouter l'OCR pour les PDF scannés.
- Ajouter des tests unitaires et d'intégration pour le backend et le frontend.
- Mettre en place un déploiement sécurisé avec HTTPS, configuration par environnement et journalisation.
- Ajouter des garde-fous pour limiter les biais et faciliter la revue humaine.
Contribution
Les contributions et suggestions sont les bienvenues.
1. Forkez le dépôt.
2. Créez une branche : git checkout -b feature/ma-fonctionnalite.
3. Effectuez vos modifications et ajoutez des tests si possible.
4. Vérifiez que les secrets et données personnelles ne sont pas inclus.
5. Soumettez une Pull Request décrivant les changements.
