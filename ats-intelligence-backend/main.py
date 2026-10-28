
import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pypdf import PdfReader

load_dotenv()

app = FastAPI(title="ATS Intelligence API")

# Autoriser le frontend React en développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mlh-hackaton-nju3.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Le client est initialisé côté serveur
client = genai.Client()


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))

    return "\n".join(
        page.extract_text() or ""
        for page in reader.pages
    ).strip()


@app.get("/")
def home():
    return {"message": "ATS Intelligence API opérationnelle"}


@app.post("/api/analyze")
async def analyze_cv(
    job_description: str = Form(...),
    cv: UploadFile = File(...),
):
    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="La fiche de poste est obligatoire."
        )

    if cv.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Veuillez envoyer un fichier PDF."
        )

    pdf_bytes = await cv.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=400,
            detail="Le fichier PDF est vide."
        )

    try:
        cv_text = extract_text_from_pdf(pdf_bytes)

        if not cv_text:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Impossible d'extraire le texte du PDF. "
                    "Le fichier est peut-être scanné."
                )
            )

        prompt = f"""
Tu es un assistant d'analyse de candidatures techniques.

Compare objectivement le CV avec la fiche de poste.
Base ton évaluation uniquement sur les informations fournies.
Ne déduis pas les compétences à partir de caractéristiques
personnelles ou protégées du candidat.

FICHE DE POSTE :
{job_description}

CV DU CANDIDAT :
{cv_text}

Réponds en français avec les sections suivantes :

## Score global de correspondance
Un pourcentage de 0 à 100, accompagné d'une justification.

## Synthèse de l'évaluation
- Recommandation indicative
- Résumé de l'adéquation

## Compétences validées
Les compétences démontrées dans le CV.

## Compétences manquantes ou non démontrées
Les exigences non retrouvées dans le CV.

## Questions d'entretien
Trois questions ciblées pour vérifier les points importants.
"""

        response = client.models.generate_content(
            model=os.getenv(
                "GEMINI_MODEL",
                "gemma-4-26b-a4b-it"
            ),
            contents=prompt,
        )

        return {
            "analysis": response.text or
            "Le modèle n'a retourné aucun texte."
        }

    except HTTPException:
        raise

    except Exception as exc:
        # Les détails techniques restent dans les logs du serveur.
        print(f"Erreur pendant l'analyse : {exc}")
        raise HTTPException(
            status_code=500,
            detail="Une erreur est survenue pendant l'analyse."
        )
