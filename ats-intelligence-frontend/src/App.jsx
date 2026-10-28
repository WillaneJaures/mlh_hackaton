
import { useState } from "react";
import "./App.css";

// URL du backend FastAPI.
// En production, Vercel utilisera la variable VITE_API_URL.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://project2-nu-lilac.vercel.app"
).replace(/\/+$/, "");

const response = await fetch(`${API_URL}/api/analyze`, {
  method: "POST",
  body: formData,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [cv, setCv] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      setCv(null);
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setCv(null);
      setError("Veuillez sélectionner un fichier PDF valide.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setCv(null);
      setError("Le CV ne doit pas dépasser 10 Mo.");
      event.target.value = "";
      return;
    }

    setCv(selectedFile);
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    setError("");
    setAnalysis("");

    if (!jobDescription.trim()) {
      setError("Veuillez saisir une fiche de poste.");
      return;
    }

    if (!cv) {
      setError("Veuillez importer le CV du candidat au format PDF.");
      return;
    }

    if (!API_URL) {
      setError(
        "L'adresse de l'API n'est pas configurée. Vérifiez VITE_API_URL."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription.trim());
      formData.append("cv", cv);

      const endpoint = `${API_URL}/api/analyze`;

      console.info("URL de l'API :", API_URL);
      console.info("Envoi de la requête :", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const responseText = await response.text();

        throw new Error(
          response.ok
            ? "Le serveur a renvoyé une réponse inattendue."
            : `Erreur HTTP ${response.status}. ${responseText.slice(0, 200)}`
        );
      }

      if (!response.ok) {
        const detail = data?.detail;

        throw new Error(
          typeof detail === "string"
            ? detail
            : `Le serveur a renvoyé une erreur HTTP ${response.status}.`
        );
      }

      if (typeof data?.analysis !== "string" || !data.analysis.trim()) {
        throw new Error(
          "La réponse du serveur ne contient pas le rapport d'analyse."
        );
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Erreur pendant l'analyse :", err);

      if (err instanceof TypeError) {
        setError(
          "Impossible de joindre l'API. Vérifiez l'URL du backend, " +
            "la configuration CORS et la disponibilité du serveur. " +
            "Consultez F12 > Console et F12 > Network pour plus de détails."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inattendue est survenue."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#accueil">
          <span className="brand-icon">A</span>
          <span>
            ATS<span className="brand-light"> Intelligence</span>
          </span>
        </a>

        <nav>
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#analyse">Analyser un CV</a>
        </nav>

        <a className="nav-button" href="#analyse">
          Commencer →
        </a>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-badge">
            <span className="status-dot"></span>
            INTELLIGENCE ARTIFICIELLE &amp; RECRUTEMENT
          </div>

          <h1>
            Le bon candidat.
            <br />
            <span>Le bon poste.</span>
          </h1>

          <p className="hero-description">
            Analysez les CV et identifiez les compétences qui
            correspondent réellement à vos offres d'emploi
            grâce à l'intelligence artificielle.
          </p>

          <a className="primary-button" href="#analyse">
            Analyser une candidature <span>↗</span>
          </a>

          <div className="hero-benefits">
            <span>✓ Analyse des compétences</span>
            <span>✓ Score de correspondance</span>
            <span>✓ Résultats détaillés</span>
          </div>
        </section>

        <section className="analysis-section" id="analyse">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESPACE DE RECRUTEMENT</span>
              <h2>Analysez votre candidature</h2>
              <p>
                Fournissez les informations nécessaires pour
                lancer l'évaluation.
              </p>
            </div>

            <span className="step-indicator">ÉTAPE 01 / 02</span>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-grid">
              <div className="panel">
                <div className="panel-heading">
                  <span className="panel-icon">01</span>
                  <div>
                    <h3>Fiche de poste</h3>
                    <p>Les critères recherchés</p>
                  </div>
                </div>

                <label htmlFor="job">Description du poste</label>

                <textarea
                  id="job"
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(event.target.value)
                  }
                  placeholder="Décrivez le poste, les missions, les compétences techniques et les qualifications requises..."
                  rows={11}
                  required
                />

                <div className="field-footer">
                  <span>Compétences, expérience, formation...</span>
                  <span>{jobDescription.length} caractères</span>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <span className="panel-icon">02</span>
                  <div>
                    <h3>CV du candidat</h3>
                    <p>Le document à évaluer</p>
                  </div>
                </div>

                <label htmlFor="cv-upload">Importer un document</label>

                <label className="upload-zone" htmlFor="cv-upload">
                  <span className="upload-icon">↑</span>

                  <strong>
                    {cv ? cv.name : "Déposez votre CV ici"}
                  </strong>

                  <span>
                    {cv
                      ? `${(cv.size / 1024).toFixed(0)} Ko`
                      : "ou cliquez pour parcourir vos fichiers"}
                  </span>

                  <span className="file-format">PDF · 10 Mo maximum</span>

                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>

                {cv && (
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => {
                      setCv(null);
                      const input = document.getElementById("cv-upload");
                      if (input) input.value = "";
                    }}
                  >
                    Retirer le CV
                  </button>
                )}

                <div className="upload-note">
                  <span>🔒</span>
                  <p>
                    Le CV sera transmis au serveur pour l'analyse.
                    Évitez les données personnelles non nécessaires.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="submit-row">
              <p>
                <span className="status-dot"></span>
                Analyse assistée par IA
              </p>

              <button
                className="primary-button submit-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Analyse en cours..." : "Lancer l'analyse →"}
              </button>
            </div>
          </form>
        </section>

        {analysis && (
          <section className="results-section">
            <span className="eyebrow">RAPPORT D'ANALYSE</span>
            <h2>Résultats de l'évaluation</h2>

            <p className="results-note">
              Analyse générée par IA. Les conclusions doivent
              être vérifiées par un recruteur.
            </p>

            <article className="results-card">
              <pre>{analysis}</pre>
            </article>
          </section>
        )}

        <section className="how-section" id="fonctionnement">
          <span className="eyebrow">SIMPLE &amp; RAPIDE</span>
          <h2>Comment ça fonctionne ?</h2>

          <div className="how-grid">
            <article className="how-card">
              <span>01</span>
              <h3>Décrivez le poste</h3>
              <p>
                Indiquez les missions et les compétences recherchées.
              </p>
            </article>

            <article className="how-card">
              <span>02</span>
              <h3>Importez le CV</h3>
              <p>
                Ajoutez le document PDF du candidat à analyser.
              </p>
            </article>

            <article className="how-card">
              <span>03</span>
              <h3>Consultez le rapport</h3>
              <p>
                Examinez les correspondances, les lacunes
                et les questions d'entretien proposées.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#accueil">
          <span className="brand-icon">A</span>
          <span>
            ATS<span className="brand-light"> Intelligence</span>
          </span>
        </a>

        <span>
          © 2026 · Analyse assistée par intelligence artificielle
        </span>
      </footer>
    </div>
  );
}

export default App;
