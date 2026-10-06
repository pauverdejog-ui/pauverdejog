/* =====================================================================
   ENGLISH VERSION · only the texts. Everything else (logos, levels, links,
   files) comes from data.js. Lists follow the same order as in data.js.
   ===================================================================== */

window.SITE_EN = {

  perfil: { ubicacion: "Barcelona, Spain" },

  fondo: { credito: "Image: NASA, ESA, CSA and STScI · James Webb Space Telescope" },

  formacion: [
    { titulo: "BSc in Applied Statistics", centro: "Universitat Autònoma de Barcelona", periodo: "2023 – 2027" },
    { titulo: "BSc in Physics", centro: "UNED (distance learning)", periodo: "2025 – present" },
    { titulo: "Erasmus+ exchange", centro: "Linköping University · Sweden", periodo: "2026" },
    { titulo: "International Baccalaureate", centro: "Àgora Sant Cugat International School", periodo: "2020 – 2022" },
    { titulo: "Cambridge C1 Advanced", centro: "Official English certificate", periodo: "2026" }
  ],

  experiencia: [
    { puesto: "Organiser", lugar: "Barcelona Mathematics League", periodo: "2026 – present",
      detalle: "Organising and running the Mathematics League in Barcelona." },
    { puesto: "Private tutor", lugar: "Barcelona", periodo: "2022 – 2025",
      detalle: "Mathematics and physics lessons for upper secondary (bachillerato) students." },
    { puesto: "Volunteer (IB CAS programme)", lugar: "Barcelona", periodo: "2019 – 2022",
      detalle: "Activities for people with disabilities at the Centre d'Alt Rendiment (CAR) high-performance sports centre, and food collection for El Gran Recapte." }
  ],

  proyectos: [
    {
      titulo: "Higgs boson detection with graph neural networks",
      contexto: "UAB · Machine Learning II", equipo: "Individual",
      resumen:
        "Classification of proton–proton collisions (Higgs signal versus background) on one million " +
        "events from the HIGGS dataset. Each event is represented as a graph of six particles and " +
        "classified with an EdgeConv-based GNN, compared with a multilayer perceptron and against " +
        "the published XGBoost result on tabular data.",
      metricas: [
        ["0.857", "test AUC-ROC of the GNN"],
        ["+6.9", "AUC points over the MLP"],
        ["+42 %", "maximum statistical significance"]
      ],
      grafico: {
        titulo: "Test AUC-ROC (higher is better)",
        filas: [{ e: "MLP" }, { e: "XGBoost · published reference" }, { e: "GNN · EdgeConv" }],
        nota: "XGBoost reference at the same sample size (1 M events)."
      },
      pie: "Test ROC curves: the GNN (orange) outperforms the MLP (blue) across the whole range. Figure labels in Catalan, from the report."
    },
    {
      titulo: "Predicting League of Legends wins with Bayesian networks",
      contexto: "UAB · Complex Data Modelling", equipo: "With Pol Ortiz",
      resumen:
        "Bayesian classifiers that estimate the probability of winning from the state of the game at " +
        "minute 10 (9,131 high-ranked games). Naive Bayes and Augmented Naive Bayes are compared, with " +
        "structure learned by Hill-Climbing, Markov blanket feature selection, 10-fold cross-validation " +
        "and paired tests with Holm correction.",
      metricas: [
        ["0.189", "Brier score, the best-calibrated model"],
        ["0.794", "cross-validated AUC-ROC"],
        ["10", "variables after Markov blanket selection"]
      ],
      figura: "figura_en.png",
      grafico: {
        titulo: "Cross-validated Brier score (lower is better)",
        filas: [{ e: "Naive Bayes · all variables" }, { e: "Naive Bayes · Markov blanket" }, { e: "ANB · all variables" }, { e: "ANB · Markov blanket" }],
        nota: "The only model significantly better than all others (p < 0.001, Holm-corrected)."
      },
      pie: "Win probability estimated by the final model in four game situations."
    },
    {
      titulo: "Image classification with convolutional networks",
      contexto: "Linköping University · TSBB19", equipo: "Team of 5",
      resumen:
        "Controlled study of design choices in a CNN (GoalNet) on CIFAR-10: hyperparameters, " +
        "initialisation, normalisation (BatchNorm, GroupNorm, LayerNorm), ensembles, data augmentation " +
        "and mixup, and linear probing on CIFAR-10 and ImageNet64.",
      metricas: [
        ["84.9 %", "accuracy with an ensemble of 3 networks"],
        ["+4.5", "points over the mean individual network"],
        ["+3.1", "points with augmentation and mixup"]
      ],
      grafico: {
        titulo: "Test accuracy: mean network → ensemble of 3", leyenda: ["single network", "ensemble"],
        filas: [{ e: "No normalisation" }, { e: "BatchNorm" }, { e: "GroupNorm" }, { e: "LayerNorm" }],
        nota: "The unnormalised ensemble gains most because its networks make more diverse errors."
      },
      pie: "Input image and activation maps of the first convolutional layer."
    },
    {
      titulo: "Exoplanet detection with Kepler telescope data",
      contexto: "UAB · Machine Learning", equipo: "Team of 3",
      resumen:
        "Classification of 7,015 signals from NASA's Kepler telescope into confirmed exoplanets or " +
        "false positives. k-NN, SVM (linear and RBF kernels) and Random Forest are compared with " +
        "hyperparameter search, 10-fold cross-validation and paired tests; the feature importance of " +
        "the final model matches NASA's astrophysical vetting criteria.",
      metricas: [
        ["0.999", "AUC-ROC of the final Random Forest"],
        ["98.7 %", "test accuracy"],
        ["7,015", "Kepler signals classified"]
      ],
      grafico: {
        titulo: "Test AUC-ROC (higher is better)",
        filas: [{ e: "k-NN · k = 7" }, { e: "SVM · RBF kernel" }, { e: "Random Forest" }],
        nota: "Accuracy differences are not significant (paired tests, p > 0.05); Random Forest is chosen for interpretability."
      },
      pie: "Random Forest feature importance: the false-positive flags and the planetary radius dominate. Labels in Catalan, from the report."
    },
    {
      titulo: "Tracking a radiological contrast agent with linear mixed models",
      contexto: "UAB · Linear Models II", equipo: "Team of 4",
      resumen:
        "Longitudinal analysis of pixel intensity in images of ten dogs after injecting a contrast " +
        "agent. Linear mixed model with a random intercept per dog and a quadratic time trend, selected " +
        "with AIC and likelihood-ratio tests, with full diagnostics: normality, homoscedasticity, " +
        "AR(1) autocorrelation and Cook's distance.",
      metricas: [
        ["≈ 10 days", "until peak contrast intensity"],
        ["0.73", "conditional R² of the mixed model"],
        ["0.71", "intraclass correlation between dogs"]
      ],
      grafico: {
        titulo: "Variance in intensity explained (R²)",
        filas: [{ e: "Fixed effects only · marginal R²" }, { e: "With a random effect per dog · conditional R²" }],
        nota: "AIC: 977.7 with simple regression versus 888.2 with the mixed model."
      },
      pie: "Intensity per dog and side over time: the variability between dogs justifies the mixed model. Labels in Catalan, from the report."
    }
  ],

  areas: [
    {
      nombre: "Machine learning",
      resumen: "Supervised models, validation and metrics.",
      detalle:
        "Building, tuning and evaluating classification and regression models. Designing validation " +
        "schemes without data leakage, hyperparameter search, and choosing the metric that fits the " +
        "problem: discrimination, calibration or the cost of errors.",
      metodos: ["Logistic regression", "Ridge / Lasso / Elastic Net", "k-NN", "SVM (RBF kernel)", "Decision trees",
                "Random Forest", "Gradient boosting (XGBoost)", "Feature importance",
                "Stratified cross-validation", "AUC-ROC", "MCC", "Brier score", "F1"]
    },
    {
      nombre: "Deep learning",
      resumen: "MLPs, convolutional networks and graph networks.",
      detalle:
        "Designing and training neural networks in PyTorch, from multilayer perceptrons to CNNs for " +
        "computer vision and message-passing GNNs for relational data. Controlled studies of how each " +
        "design choice affects training and generalisation.",
      metodos: ["MLP", "CNN", "GNN · EdgeConv", "Message passing", "Kaiming / Xavier initialisation",
                "BatchNorm · GroupNorm · LayerNorm", "Adam / AdamW", "Dropout and weight decay",
                "Early stopping", "Data augmentation", "Mixup", "Ensembles", "Linear probing"]
    },
    {
      nombre: "Unsupervised learning",
      resumen: "Dimensionality reduction and clustering.",
      detalle:
        "Working with different dimensionality-reduction models and clustering methods, choosing the " +
        "right one for the structure of the data and validating the quality of the solution.",
      metodos: ["PCA", "Factor analysis", "MDS", "t-SNE", "k-means", "k-medoids",
                "Hierarchical clustering", "DBSCAN", "Gaussian mixtures (EM)", "Silhouette index"]
    },
    {
      nombre: "Probabilistic and Bayesian models",
      resumen: "Bayesian networks and Bayesian inference.",
      detalle:
        "Building Bayesian networks by combining domain knowledge with structure learning from data, " +
        "feature selection and exact inference. Bayesian inference to estimate parameters and " +
        "quantify uncertainty.",
      metodos: ["Naive Bayes", "Augmented Naive Bayes", "Hill-Climbing", "Markov blanket",
                "Junction tree", "BIC", "Prior and posterior distributions", "MCMC"]
    },
    {
      nombre: "Statistical inference",
      resumen: "Estimation, hypothesis testing and rigorous model comparison.",
      detalle:
        "Estimation and hypothesis-testing theory, applied to compare models rigorously while " +
        "controlling the error rate across multiple comparisons.",
      metodos: ["Maximum likelihood", "Sufficiency", "Cramér–Rao bound", "Confidence intervals",
                "Neyman–Pearson lemma", "Likelihood ratio", "Paired t-test", "Wilcoxon",
                "Shapiro–Wilk", "Holm–Bonferroni correction", "Bootstrap"]
    },
    {
      nombre: "Linear models and time series",
      resumen: "Regression, GLMs, mixed models and econometrics.",
      detalle:
        "Modelling relationships between variables with linear and generalised linear models, mixed " +
        "models for longitudinal data, assumption diagnostics, variable selection and time-series analysis.",
      metodos: ["Multiple linear regression", "GLM (logistic, Poisson)", "Linear mixed models", "REML", "Residual diagnostics",
                "Multicollinearity", "AIC / BIC", "Stationarity", "ARIMA", "Autocorrelation"]
    },
    {
      nombre: "Physics simulation",
      resumen: "Numerical and Monte Carlo methods for physical systems.",
      detalle:
        "Simulating physical systems through numerical integration of differential equations and " +
        "stochastic methods, paying attention to stability, conservation laws and numerical error.",
      metodos: ["Euler and Runge–Kutta", "Verlet", "Dynamical systems", "Finite differences",
                "Monte Carlo", "Metropolis algorithm", "NumPy / SciPy", "MATLAB"]
    },
    {
      nombre: "Signals, networks and big data",
      resumen: "Detection and estimation, complex networks and big data.",
      detalle:
        "Detecting and estimating signals in noise, analysing complex networks and working with " +
        "datasets of millions of records.",
      metodos: ["MVU estimator", "MMSE / MAP estimation", "Neyman–Pearson detection",
                "Centrality", "Community detection", "Random network models", "SQL"]
    }
  ],

  tecnologias: [
    {
      grupo: "Languages",
      items: [
        { uso: "Main language for machine learning and data analysis." },
        { uso: "Statistical modelling: bnlearn, gRain, tidyr, ggplot2, pROC." },
        { uso: "Object-oriented programming and algorithms." },
        { uso: "Numerical computing, signals and simulation." },
        { uso: "Queries, joins and aggregations." },
        { uso: "Scientific reports and technical documentation." }
      ]
    },
    {
      grupo: "Data science and machine learning",
      items: [
        { uso: "MLPs, CNNs and GNNs; custom training loops." },
        { uso: "Graph networks: EdgeConv and global pooling." },
        { uso: "Preprocessing, classical models and metrics." },
        { uso: "Gradient boosting for tabular data." },
        { uso: "Data cleaning and transformation." },
        { uso: "Vectorised computing and linear algebra." }
      ]
    },
    {
      grupo: "Data visualisation",
      items: [
        { uso: "Figures for scientific reports." },
        { uso: "Exploratory statistical visualisation." },
        { uso: "Statistical graphics in R." },
        { uso: "Interactive dashboards." },
        { uso: "Reports and dashboards." }
      ]
    },
    {
      grupo: "Tools",
      items: [
        { uso: "Version control." },
        { uso: "Repositories and collaboration." },
        { uso: "Reproducible environments." },
        { uso: "Terminal and development environments." },
        { uso: "Exploration and prototyping." },
        { uso: "GPU training." },
        { uso: "Python development." },
        { uso: "Analysis in R." }
      ]
    }
  ],

  idiomas: [
    { nombre: "Spanish", etiqueta: "Native" },
    { nombre: "Catalan", etiqueta: "Native" },
    { nombre: "English", etiqueta: "C1 · Cambridge" }
  ]
};
