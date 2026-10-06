/* =====================================================================
   VERSIÓ EN CATALÀ · només els textos. La resta (logos, nivells, enllaços,
   fitxers) ve de data.js. Les llistes segueixen el mateix ordre que data.js.
   ===================================================================== */

window.SITE_CA = {

  perfil: { ubicacion: "Barcelona, Espanya" },

  fondo: { credito: "Imatge: NASA, ESA, CSA i STScI · Telescopi James Webb" },

  formacion: [
    { titulo: "Grau en Estadística Aplicada", centro: "Universitat Autònoma de Barcelona", periodo: "2023 – 2027" },
    { titulo: "Grau en Física", centro: "UNED", periodo: "2025 – actualitat" },
    { titulo: "Erasmus+", centro: "Linköping University · Suècia", periodo: "2026" },
    { titulo: "Batxillerat Internacional", centro: "Àgora Sant Cugat International School", periodo: "2020 – 2022" },
    { titulo: "Cambridge C1 Advanced", centro: "Certificat oficial d'anglès", periodo: "2026" }
  ],

  experiencia: [
    { puesto: "Organitzador", lugar: "Lliga Matemàtica de Barcelona", periodo: "2026 – actualitat",
      detalle: "Organització i dinamització de la Lliga Matemàtica a Barcelona." },
    { puesto: "Professor particular", lugar: "Barcelona", periodo: "2022 – 2025",
      detalle: "Classes de matemàtiques i física per a estudiants de batxillerat." },
    { puesto: "Voluntariat (programa CAS del BI)", lugar: "Barcelona", periodo: "2019 – 2022",
      detalle: "Preparació d'activitats per a persones amb discapacitat al Centre d'Alt Rendiment (CAR) i recollida d'aliments al Gran Recapte d'Aliments." }
  ],

  proyectos: [
    {
      titulo: "Detecció del bosó de Higgs amb xarxes de grafs",
      contexto: "UAB · Aprenentatge Automàtic II", equipo: "Individual",
      resumen:
        "Classificació de col·lisions protó–protó (senyal de Higgs davant de fons) sobre un milió " +
        "d'esdeveniments del dataset HIGGS. Cada esdeveniment es representa com un graf de sis " +
        "partícules i es classifica amb una GNN basada en EdgeConv, comparada amb un perceptró " +
        "multicapa i amb el resultat publicat d'XGBoost en dades tabulars.",
      metricas: [
        ["0.857", "AUC-ROC de la GNN en test"],
        ["+6.9", "punts d'AUC respecte del MLP"],
        ["+42 %", "de significança estadística màxima"]
      ],
      grafico: {
        titulo: "AUC-ROC en test (com més alt, millor)",
        filas: [{ e: "MLP" }, { e: "XGBoost · referència publicada" }, { e: "GNN · EdgeConv" }],
        nota: "Referència d'XGBoost amb la mateixa mida de mostra (1 M d'esdeveniments)."
      },
      pie: "Corbes ROC en test: la GNN (taronja) supera el MLP (blau) en tot el rang."
    },
    {
      titulo: "Predicció de victòria al League of Legends amb xarxes bayesianes",
      contexto: "UAB · Modelització de Dades Complexes", equipo: "Amb Pol Ortiz",
      resumen:
        "Classificadors bayesians que estimen la probabilitat de victòria a partir de l'estat de la " +
        "partida al minut 10 (9.131 partides de rang alt). Es comparen Naive Bayes i Augmented Naive " +
        "Bayes amb estructura apresa per Hill-Climbing i selecció de variables per Markov blanket, amb " +
        "validació creuada de 10 folds i tests aparellats amb correcció de Holm.",
      metricas: [
        ["0.189", "Brier score, el model més ben calibrat"],
        ["0.794", "AUC-ROC en validació creuada"],
        ["10", "variables després de la selecció per Markov blanket"]
      ],
      grafico: {
        titulo: "Brier score en validació creuada (com més baix, millor)",
        filas: [{ e: "Naive Bayes · totes les variables" }, { e: "Naive Bayes · Markov blanket" }, { e: "ANB · totes les variables" }, { e: "ANB · Markov blanket" }],
        nota: "L'únic model significativament millor que tots els altres (p < 0.001 amb correcció de Holm)."
      },
      figura: "figura_ca.png",
      pie: "Probabilitat de victòria que estima el model final en quatre situacions de partida."
    },
    {
      titulo: "Classificació d'imatges amb xarxes convolucionals",
      contexto: "Linköping University · TSBB19", equipo: "Equip de 5",
      resumen:
        "Estudi controlat de decisions de disseny en una CNN (GoalNet) sobre CIFAR-10: " +
        "hiperparàmetres, inicialització, normalització (BatchNorm, GroupNorm, LayerNorm), ensembles, " +
        "data augmentation i mixup, i linear probing a CIFAR-10 i ImageNet64.",
      metricas: [
        ["84.9 %", "de precisió amb un ensemble de 3 xarxes"],
        ["+4.5", "punts sobre la mitjana individual"],
        ["+3.1", "punts amb augmentation i mixup"]
      ],
      grafico: {
        titulo: "Precisió en test: mitjana de les xarxes → ensemble de 3", leyenda: ["xarxa individual", "ensemble"],
        filas: [{ e: "Sense normalització" }, { e: "BatchNorm" }, { e: "GroupNorm" }, { e: "LayerNorm" }],
        nota: "L'ensemble sense normalització guanya més perquè les seves xarxes cometen errors més diferents."
      },
      pie: "Imatge d'entrada i mapes d'activació de la primera capa convolucional."
    },
    {
      titulo: "Detecció d'exoplanetes amb dades del telescopi Kepler",
      contexto: "UAB · Aprenentatge Automàtic", equipo: "Equip de 3",
      resumen:
        "Classificació de 7.015 senyals del telescopi Kepler de la NASA en exoplanetes confirmats o " +
        "falsos positius. Es comparen k-NN, SVM (nucli lineal i RBF) i Random Forest amb cerca " +
        "d'hiperparàmetres, validació creuada de 10 folds i tests aparellats; la importància de les " +
        "variables del model final coincideix amb els criteris astrofísics de la NASA.",
      metricas: [
        ["0.999", "AUC-ROC del Random Forest final"],
        ["98.7 %", "de precisió en test"],
        ["7.015", "senyals de Kepler classificats"]
      ],
      grafico: {
        titulo: "AUC-ROC en test (com més alt, millor)",
        filas: [{ e: "k-NN · k = 7" }, { e: "SVM · nucli RBF" }, { e: "Random Forest" }],
        nota: "Les diferències de precisió no són significatives (tests aparellats, p > 0.05); es tria Random Forest per interpretabilitat."
      },
      pie: "Importància de les variables del Random Forest: dominen els indicadors de fals positiu i el radi planetari."
    },
    {
      titulo: "Evolució d'un contrast radiològic amb models lineals mixtos",
      contexto: "UAB · Models Lineals II", equipo: "Equip de 4",
      resumen:
        "Anàlisi longitudinal de la intensitat de píxel en imatges de deu gossos després d'injectar " +
        "un agent de contrast. Model lineal mixt amb intercepte aleatori per gos i tendència quadràtica " +
        "en el temps, seleccionat amb AIC i tests de raó de versemblances, i diagnosi completa: " +
        "normalitat, homoscedasticitat, autocorrelació AR(1) i distància de Cook.",
      metricas: [
        ["≈ 10 dies", "fins a la intensitat màxima del contrast"],
        ["0.73", "R² condicional del model mixt"],
        ["0.71", "correlació intraclasse entre gossos"]
      ],
      grafico: {
        titulo: "Variabilitat de la intensitat explicada (R²)",
        filas: [{ e: "Només efectes fixos · R² marginal" }, { e: "Amb efecte aleatori per gos · R² condicional" }],
        nota: "AIC: 977.7 amb regressió simple davant de 888.2 amb el model mixt."
      },
      pie: "Intensitat per gos i costat al llarg del temps: la variabilitat entre gossos justifica el model mixt."
    }
  ],

  areas: [
    {
      nombre: "Aprenentatge automàtic",
      resumen: "Models supervisats, validació i mètriques.",
      detalle:
        "Construcció, ajust i avaluació de models de classificació i regressió. Disseny d'esquemes de " +
        "validació sense fuites d'informació, cerca d'hiperparàmetres i elecció de la mètrica segons " +
        "el problema: discriminació, calibratge o cost dels errors.",
      metodos: ["Regressió logística", "Ridge / Lasso / Elastic Net", "k-NN", "SVM (nucli RBF)", "Arbres de decisió",
                "Random Forest", "Gradient boosting (XGBoost)", "Importància de variables",
                "Validació creuada estratificada", "AUC-ROC", "MCC", "Brier score", "F1"]
    },
    {
      nombre: "Deep learning",
      resumen: "MLP, xarxes convolucionals i xarxes de grafs.",
      detalle:
        "Disseny i entrenament de xarxes neuronals amb PyTorch, des de perceptrons multicapa fins a " +
        "CNN per a visió per computador i GNN amb pas de missatges per a dades relacionals. Estudi " +
        "controlat de l'efecte de cada decisió de disseny sobre l'entrenament i la generalització.",
      metodos: ["MLP", "CNN", "GNN · EdgeConv", "Message passing", "Inicialització Kaiming / Xavier",
                "BatchNorm · GroupNorm · LayerNorm", "Adam / AdamW", "Dropout i weight decay",
                "Early stopping", "Data augmentation", "Mixup", "Ensembles", "Linear probing"]
    },
    {
      nombre: "Aprenentatge no supervisat",
      resumen: "Reducció de dimensionalitat i clustering.",
      detalle:
        "Capacitat per treballar amb diferents models de reducció de dimensionalitat i mètodes " +
        "d'agrupament, triant l'adequat segons l'estructura de les dades i validant la qualitat de " +
        "la solució obtinguda.",
      metodos: ["PCA", "Anàlisi factorial", "MDS", "t-SNE", "k-means", "k-medoids",
                "Clustering jeràrquic", "DBSCAN", "Mescles gaussianes (EM)", "Índex de silueta"]
    },
    {
      nombre: "Models probabilístics i bayesians",
      resumen: "Xarxes bayesianes i inferència bayesiana.",
      detalle:
        "Construcció de xarxes bayesianes combinant coneixement del domini i aprenentatge d'estructura " +
        "a partir de dades, selecció de variables i inferència exacta. Inferència bayesiana per " +
        "estimar paràmetres i quantificar la incertesa.",
      metodos: ["Naive Bayes", "Augmented Naive Bayes", "Hill-Climbing", "Markov blanket",
                "Junction tree", "BIC", "Distribucions a priori i a posteriori", "MCMC"]
    },
    {
      nombre: "Inferència estadística",
      resumen: "Estimació, contrastos i comparació rigorosa de models.",
      detalle:
        "Teoria de l'estimació i del contrast d'hipòtesis, i la seva aplicació pràctica per comparar " +
        "models amb rigor, controlant l'error en fer comparacions múltiples.",
      metodos: ["Màxima versemblança", "Suficiència", "Fita de Cramér–Rao", "Intervals de confiança",
                "Lema de Neyman–Pearson", "Raó de versemblances", "t aparellat", "Wilcoxon",
                "Shapiro–Wilk", "Correcció de Holm–Bonferroni", "Bootstrap"]
    },
    {
      nombre: "Models lineals i sèries temporals",
      resumen: "Regressió, GLM, models mixtos i econometria.",
      detalle:
        "Modelització de relacions entre variables amb models lineals i lineals generalitzats, models " +
        "mixtos per a dades longitudinals, diagnosi de supòsits, selecció de variables i anàlisi de " +
        "sèries temporals.",
      metodos: ["Regressió lineal múltiple", "GLM (logística, Poisson)", "Models lineals mixtos", "REML", "Diagnosi de residus",
                "Multicol·linealitat", "AIC / BIC", "Estacionarietat", "ARIMA", "Autocorrelació"]
    },
    {
      nombre: "Simulació física",
      resumen: "Mètodes numèrics i Monte Carlo per a sistemes físics.",
      detalle:
        "Simulació de sistemes físics mitjançant integració numèrica d'equacions diferencials i mètodes " +
        "estocàstics, amb atenció a l'estabilitat, la conservació de magnituds i l'error numèric.",
      metodos: ["Euler i Runge–Kutta", "Verlet", "Sistemes dinàmics", "Diferències finites",
                "Monte Carlo", "Algorisme de Metropolis", "NumPy / SciPy", "MATLAB"]
    },
    {
      nombre: "Senyals, xarxes i grans dades",
      resumen: "Detecció i estimació, xarxes complexes i Big Data.",
      detalle:
        "Detecció i estimació de senyals en presència de soroll, anàlisi de xarxes complexes i treball " +
        "amb conjunts de dades de milions de registres.",
      metodos: ["Estimador MVU", "Estimació MMSE / MAP", "Detecció de Neyman–Pearson",
                "Centralitat", "Detecció de comunitats", "Models de xarxa aleatòria", "SQL"]
    }
  ],

  tecnologias: [
    {
      grupo: "Llenguatges",
      items: [
        { uso: "Llenguatge principal per a machine learning i anàlisi de dades." },
        { uso: "Modelització estadística: bnlearn, gRain, tidyr, ggplot2, pROC." },
        { uso: "Programació orientada a objectes i algorismes." },
        { uso: "Càlcul numèric, senyals i simulació." },
        { uso: "Consultes, unions i agregacions." },
        { uso: "Informes científics i documentació tècnica." }
      ]
    },
    {
      grupo: "Ciència de dades i machine learning",
      items: [
        { uso: "MLP, CNN i GNN; bucles d'entrenament propis." },
        { uso: "Xarxes de grafs: EdgeConv i pooling global." },
        { uso: "Preprocessament, models clàssics i mètriques." },
        { uso: "Gradient boosting per a dades tabulars." },
        { uso: "Neteja i transformació de dades." },
        { uso: "Càlcul vectoritzat i àlgebra lineal." }
      ]
    },
    {
      grupo: "Visualització de dades",
      items: [
        { uso: "Figures per a informes científics." },
        { uso: "Visualització estadística exploratòria." },
        { uso: "Gràfics estadístics en R." },
        { uso: "Dashboards interactius." },
        { uso: "Informes i quadres de comandament." }
      ]
    },
    {
      grupo: "Eines",
      items: [
        { uso: "Control de versions." },
        { uso: "Repositoris i treball col·laboratiu." },
        { uso: "Entorns reproduïbles." },
        { uso: "Terminal i entorns de desenvolupament." },
        { uso: "Exploració i prototipatge." },
        { uso: "Entrenament amb GPU." },
        { uso: "Desenvolupament en Python." },
        { uso: "Anàlisi en R." }
      ]
    }
  ],

  idiomas: [
    { nombre: "Castellà", etiqueta: "Nadiu" },
    { nombre: "Català", etiqueta: "Nadiu" },
    { nombre: "Anglès", etiqueta: "C1 · Cambridge" }
  ]
};
