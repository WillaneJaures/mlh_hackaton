import io
import streamlit as st
from google import genai
from dotenv import load_dotenv
from pypdf import PdfReader


load_dotenv()

st.set_page_config(
    page_title="Recrutement AI - Matching CV & Poste",
    page_icon="🎯",
    layout="wide"
)

st.title("🎯 ATS Intelligence - Evaluation & Matching CV")
st.write("Comparez un CV au format PDF avec une fiche de poste pour obtenir une évaluation du profil et un score de correspondance.")

@st.cache_resource
def get_genai_client():
    return genai.Client()

client = get_genai_client()

def extract_text_from_pdf(uploaded_file) -> str:
    pdf_reader = PdfReader(io.BytesIO(uploaded_file.read()))
    extracted_text = ""
    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"
    return extracted_text.strip()


col1, col2 = st.columns(2)

with col1:
    st.subheader("1. Fiche de Poste (Job Description)")
    job_description = st.text_area(
        "Collez ici la fiche de poste ou les compétences requises :",
        height=300,
        placeholder="Recherchons un Data Engineer Sénior avec 3 ans d'expérience sur Spark, Python, Docker..."
    )

with col2:
    st.subheader("2. CV du Candidat")
    uploaded_file = st.file_uploader("Téléversez le CV du candidat (PDF)", type=["pdf"])

st.markdown("---")


if st.button("🚀 Évaluer la correspondance (Match)", type="primary"):
    if not job_description.strip():
        st.warning("Veuillez renseigner la fiche de poste.")
    elif uploaded_file is None:
        st.warning("Veuillez téléverser un CV au format PDF.")
    else:
        with st.spinner("Extraction et analyse du CV en cours..."):
            cv_text = extract_text_from_pdf(uploaded_file)

        if not cv_text:
            st.error("Impossible d'extraire le texte du fichier PDF. Vérifiez qu'il s'agit d'un PDF textuel.")
        else:
            with st.spinner("Gemma analyse la correspondance entre le CV et le poste..."):
                try:
                    prompt = f"""
                    Tu es un expert en recrutement technique et responsable d'un cabinet de recrutement.
                    Ta tâche est d'évaluer la correspondance entre un CV et une Fiche de Poste.

                    FICHE DE POSTE :
                    ---
                    {job_description}
                    ---

                    CV DU CANDIDAT :
                    ---
                    {cv_text}
                    ---

                    Fournis une évaluation structurée et impartiale en français sous le format suivant :

                    ### 🎯 SCORE GLOBAL DE MATCH : [Indique ici le pourcentage entre 0% et 100%]

                    ### 📊 Synthèse de l'évaluation
                    - **Recommandation finale** : [Sélectionné pour entretien / Réserve / Non retenu]
                    - **Résumé de l'adéquation** : (En 2-3 phrases)

                    ### ✅ Compétences validées
                    - Puces des compétences et expériences du CV qui correspondent parfaitement au poste.

                    ### ⚠️ Compétences manquantes ou lacunes
                    - Puces des compétences requises non trouvées ou insuffisamment démontrées.

                    ### ❓ Questions recommandées pour l'entretien
                    - 2 à 3 questions ciblées sur les points clés ou douteux du dossier.
                    """

                    response = client.models.generate_content(
                        model="gemma-4-26b-a4b-it",
                        contents=prompt,
                    )

                    st.markdown("## 📋 Résultats de l'analyse")
                    st.markdown(response.text)

                except Exception as e:
                    st.error(f"Erreur lors de l'appel à l'API : {e}")