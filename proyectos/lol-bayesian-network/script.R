# CARREGA LLIBRERIES
# bnlearn: naive.bayes(), hc(), bn.fit(), mb(), narcs(), nodes(), arcs(), BIC(), logLik()
library(bnlearn)

# gRain: as.grain(), compile(), setEvidence(), querygrain()
library(gRain)

# pROC: roc(), auc()
library(pROC)

# ggplot2: visualitzacions
library(ggplot2)

# tidyr: pivot_longer() per a plots
library(tidyr)

data <- read.csv("ranked_10min.csv")
cat("Dimensions originals:", nrow(data), "x", ncol(data), "\n")

#PREPROCESSAMENT I NETEJA DE DADES
# Filtratge per quantils 0.025–0.975 de les variables de visió
qblue <- quantile(data$blueWardsPlaced, probs = c(0.025, 0.975))
qred  <- quantile(data$redWardsPlaced,  probs = c(0.025, 0.975))

data2 <- data[
  data$blueWardsPlaced >= qblue[1] & data$blueWardsPlaced <= qblue[2] &
    data$redWardsPlaced  >= qred[1]  & data$redWardsPlaced  <= qred[2], ]

cat("Mida inicial:", nrow(data), "— Mida final:", nrow(data2), "\n")
cat("Observacions eliminades:", nrow(data) - nrow(data2),
    sprintf("(%.1f%%)\n", (nrow(data) - nrow(data2)) / nrow(data) * 100))

par(mfrow = c(1, 2))
hist(data2$blueWardsPlaced, breaks = 50, col = "skyblue",
     main = "blueWardsPlaced (post-neteja)", xlab = "")
hist(data2$redWardsPlaced,  breaks = 50, col = "salmon",
     main = "redWardsPlaced (post-neteja)",  xlab = "")
par(mfrow = c(1, 1))

vars_cont <- c("blueWardsDestroyed", "blueAssists", "blueTotalGold",
               "blueTotalExperience", "blueTotalMinionsKilled",
               "blueTotalJungleMinionsKilled", "blueKills", "blueDeaths",
               "redWardsDestroyed", "redAssists", "redTotalExperience",
               "redTotalMinionsKilled", "redTotalJungleMinionsKilled",
               "redKills", "redDeaths")

vars_disc_orig <- c("blueWins", "blueFirstBlood", "blueDragons", "blueHeralds",
                    "redDragons", "redHeralds")

towers_destroyed <- c("blueTowersDestroyed", "redTowersDestroyed")

data_disc <- data2[vars_disc_orig]

# Quantils (6 intervals) per a variables contínues generals
for (v in vars_cont) {
  nuevo_nombre <- paste0(v, "_disc")
  puntos_corte <- unique(quantile(data2[[v]],
                                  probs = seq(0, 1, length.out = 7),
                                  na.rm = TRUE))
  data_disc[[nuevo_nombre]] <- cut(data2[[v]],
                                   breaks = puntos_corte,
                                   include.lowest = TRUE,
                                   labels = FALSE)
}

# Torres: 3 categories (0, 1, ≥2)
for (v in towers_destroyed) {
  nuevo_nombre <- paste0(v, "_disc")
  data_disc[[nuevo_nombre]] <- ifelse(data2[[v]] >= 2, 2, data2[[v]])
}

# blueWardsPlaced i redWardsPlaced → KMeans (k=6)
set.seed(42)
discretize_kmeans_6 <- function(x, k = 6) {
  km <- kmeans(x, centers = k, nstart = 25, iter.max = 100)
  centres_sorted <- sort(km$centers)
  breaks_inner   <- sapply(1:(k - 1), function(i) mean(centres_sorted[i:(i + 1)]))
  breaks_final   <- c(-Inf, breaks_inner, Inf)
  cut(x, breaks = breaks_final, labels = 1:k, include.lowest = TRUE)
}

data_disc$blueWardsPlaced_disc <- discretize_kmeans_6(data2$blueWardsPlaced)
data_disc$redWardsPlaced_disc  <- discretize_kmeans_6(data2$redWardsPlaced)

cat("Distribució blueWardsPlaced_disc:\n"); print(table(data_disc$blueWardsPlaced_disc))
cat("\nDistribució redWardsPlaced_disc:\n");  print(table(data_disc$redWardsPlaced_disc))

# Preparació del data frame per a bnlearn (factors)
data_bn <- as.data.frame(lapply(data_disc, as.factor))
cat("\nDimensions data_bn:", nrow(data_bn), "x", ncol(data_bn), "\n")

# SELECCIÓ DE VARIABLES
set.seed(123)
k_mb      <- 15
indices_mb <- sample(1:nrow(data_bn))
folds_mb   <- cut(indices_mb, breaks = k_mb, labels = FALSE)
lista_mb   <- list()

for (i in 1:k_mb) {
  cat("Fold MB", i, "/", k_mb, "\n")
  dades_train_mb <- data_bn[folds_mb != i, ]
  dag_temp       <- hc(dades_train_mb)
  lista_mb[[i]]  <- mb(dag_temp, "blueWins")
}

totes_les_vars      <- unlist(lista_mb)
frequencia_features <- sort(table(totes_les_vars), decreasing = TRUE)

cat("\nFreqüència de les variables al Markov Blanket (sobre", k_mb, "folds):\n")
print(frequencia_features)

# Variables que apareixen en almenys 2 folds (estabilitat mínima)
features_mb <- names(frequencia_features[frequencia_features > 1])
nodes_mb    <- c("blueWins", features_mb)
cat("\nVariables seleccionades al MB:", paste(features_mb, collapse = ", "), "\n")
cat("Total nodes MB:", length(nodes_mb), "\n")


# CONSTRUCCIÓ I VALIDACIÓ DELS MODELS
set.seed(123)
k     <- 10
folds <- cut(sample(1:nrow(data_bn)), breaks = k, labels = FALSE)

# Funció per construir Augmented Naive Bayes
build_anb <- function(data_train, target) {
  nb_base <- naive.bayes(data_train, target)
  arcs_nb <- arcs(nb_base)
  hc(data_train, whitelist = arcs_nb)
}

model_names <- c("NB_Full", "ANB_Full", "NB_MB", "ANB_MB")

# Emmagatzemem probabilitats per fold (per als tests per parells)
preds_prob  <- setNames(vector("list", length(model_names)), model_names)
preds_fold  <- setNames(
  lapply(model_names, function(m) vector("list", k)),
  model_names
)
for (m in model_names) preds_prob[[m]] <- c()
reals      <- c()
reals_fold <- vector("list", k)

for (i in 1:k) {
  cat("Processant Fold", i, "de", k, "\n")
  train <- data_bn[folds != i, ]
  test  <- data_bn[folds == i, ]
  reals_fold[[i]] <- as.numeric(as.character(test$blueWins))
  reals <- c(reals, reals_fold[[i]])
  
  models_fold <- list(
    NB_Full  = naive.bayes(train, "blueWins"),
    ANB_Full = build_anb(train, "blueWins"),
    NB_MB    = naive.bayes(train[, nodes_mb], "blueWins"),
    ANB_MB   = build_anb(train[, nodes_mb],   "blueWins")
  )
  
  for (m_name in model_names) {
    m_struct  <- models_fold[[m_name]]
    m_nodes   <- nodes(m_struct)
    m_train_d <- train[, m_nodes]
    m_test_d  <- test[,  m_nodes]
    
    fit      <- bn.fit(m_struct, data = m_train_d, method = "bayes")
    junction <- compile(as.grain(fit))
    
    pred_fold <- sapply(1:nrow(m_test_d), function(j) {
      nodes_ev  <- setdiff(m_nodes, "blueWins")
      estats_ev <- as.character(unlist(m_test_d[j, nodes_ev]))
      tryCatch({
        ev <- setEvidence(junction, nodes = nodes_ev, states = estats_ev)
        querygrain(ev, nodes = "blueWins")$blueWins["1"]
      }, error = function(e) 0.5)
    })
    
    preds_fold[[m_name]][[i]] <- pred_fold
    preds_prob[[m_name]]      <- c(preds_prob[[m_name]], pred_fold)
  }
}

# Funció Brier Score
brier_score <- function(reals, probs) mean((reals - probs)^2)

# Funció F1
calc_f1 <- function(reals, probs) {
  preds <- ifelse(probs > 0.5, 1, 0)
  t     <- table(factor(preds, levels = c(0,1)), factor(reals, levels = c(0,1)))
  prec  <- t[2, 2] / sum(t[2, ])
  rec   <- t[2, 2] / sum(t[, 2])
  2 * prec * rec / (prec + rec)
}

# Mètriques per fold per a cada model
metriques_fold <- setNames(lapply(model_names, function(m) {
  sapply(1:k, function(i) {
    p  <- preds_fold[[m]][[i]]
    r  <- reals_fold[[i]]
    c(
      Accuracy = mean(ifelse(p > 0.5, 1, 0) == r),
      AUC      = as.numeric(auc(roc(r, p, quiet = TRUE))),
      Brier    = brier_score(r, p)
    )
  })
}), model_names)

# Resum global
results_list <- lapply(model_names, function(m) {
  p       <- preds_prob[[m]]
  acc     <- mean(ifelse(p > 0.5, 1, 0) == reals)
  roc_obj <- roc(reals, p, quiet = TRUE)
  f1      <- calc_f1(reals, p)
  brier   <- brier_score(reals, p)
  
  if (grepl("MB", m)) { d_final <- data_bn[, nodes_mb] } else { d_final <- data_bn }
  if (grepl("ANB", m)) { fs <- build_anb(d_final, "blueWins") } else { fs <- naive.bayes(d_final, "blueWins") }
  
  data.frame(
    Model    = m,
    Accuracy = round(acc * 100, 2),
    AUC      = round(auc(roc_obj), 4),
    Brier    = round(brier, 4),
    F1       = round(f1, 4),
    Arcs     = narcs(fs),
    BIC      = round(BIC(fs, d_final), 1),
    LogLik   = round(logLik(fs, d_final), 1)
  )
})

resum_final <- do.call(rbind, results_list)
rownames(resum_final) <- NULL
cat("\n========== RESUM FINAL DE MÈTRIQUES ==========\n")
print(resum_final)


# TESTS ESTADÍSTICS AMB CORRECCIÓ PER COMPARACIÓ MÚLTIPLE
cat("=== TEST DE SHAPIRO-WILK per mètrica ===\n")
metriques_noms <- c("Accuracy", "AUC", "Brier")

for (met in metriques_noms) {
  cat(sprintf("--- %s ---\n", met))
  for (m in model_names) {
    vals <- metriques_fold[[m]][met, ]
    sw   <- shapiro.test(vals)
    cat(sprintf("  %-10s  W = %.4f  p = %.4f %s\n",
                m, sw$statistic, sw$p.value,
                ifelse(sw$p.value > 0.05, "(NORMAL)", "(NO NORMAL)")))
  }
  cat("\n")
}

# Tots els parells possibles (6)
parells <- combn(model_names, 2, simplify = FALSE)

# Funció que executa el test adequat (t-test o Wilcoxon) i retorna el p-valor brut
test_parell <- function(vals1, vals2, millor_menor = FALSE) {
  sw1 <- shapiro.test(vals1)$p.value
  sw2 <- shapiro.test(vals2)$p.value
  if (sw1 > 0.05 & sw2 > 0.05) {
    # Ambdós normals → t-test aparellat
    if (millor_menor) {
      t.test(vals1, vals2, paired = TRUE, alternative = "less")$p.value
    } else {
      t.test(vals1, vals2, paired = TRUE, alternative = "greater")$p.value
    }
  } else {
    # Almenys un no normal → Wilcoxon aparellat
    if (millor_menor) {
      wilcox.test(vals1, vals2, paired = TRUE, alternative = "less")$p.value
    } else {
      wilcox.test(vals1, vals2, paired = TRUE, alternative = "greater")$p.value
    }
  }
}

# Per a cada mètrica, calculem tots els p-valors i apliquem Holm
for (met in metriques_noms) {
  cat(sprintf("\n=== Mètrica: %s ===\n", met))
  millor_menor <- (met == "Brier")  # Per Brier, menor és millor
  
  # Construïm la taula de comparacions
  taula <- do.call(rbind, lapply(parells, function(p) {
    m1   <- p[1]; m2 <- p[2]
    v1   <- metriques_fold[[m1]][met, ]
    v2   <- metriques_fold[[m2]][met, ]
    mean1 <- mean(v1); mean2 <- mean(v2)
    
    # El "model millor" és el que té major valor (o menor si Brier)
    if ((!millor_menor & mean1 >= mean2) | (millor_menor & mean1 <= mean2)) {
      m_bo  <- m1; m_pi  <- m2
      v_bo  <- v1; v_pi  <- v2
      me_bo <- mean1; me_pi <- mean2
    } else {
      m_bo  <- m2; m_pi  <- m1
      v_bo  <- v2; v_pi  <- v1
      me_bo <- mean2; me_pi <- mean1
    }
    
    p_brut <- test_parell(v_bo, v_pi, millor_menor = millor_menor)
    
    data.frame(
      Model_Millor = m_bo,
      Model_Pitjor = m_pi,
      Mitja_Millor = round(me_bo, 4),
      Mitja_Pitjor = round(me_pi, 4),
      p_brut       = p_brut
    )
  }))
  
  # Correcció Holm-Bonferroni sobre els 6 p-valors
  taula$p_Holm    <- p.adjust(taula$p_brut, method = "holm")
  taula$Sig_brut  <- ifelse(taula$p_brut  < 0.001, "***",
                            ifelse(taula$p_brut  < 0.01,  "**",
                                   ifelse(taula$p_brut  < 0.05,  "*", "ns")))
  taula$Sig_Holm  <- ifelse(taula$p_Holm  < 0.001, "***",
                            ifelse(taula$p_Holm  < 0.01,  "**",
                                   ifelse(taula$p_Holm  < 0.05,  "*", "ns")))
  
  print(taula, row.names = FALSE)
}


# MODEL FINAL: ANB_MB ENTRENAT AMB TOTES LES DADES

# Entrenament model final (ara sí amb els noms correctes)
anb_mb_final   <- build_anb(data_bn[, nodes_mb], "blueWins")
anb_mb_fit     <- bn.fit(anb_mb_final, data = data_bn[, nodes_mb], method = "bayes")
junction_final <- compile(as.grain(anb_mb_fit))

cat("Nodes del model final ANB_MB:\n")
cat(paste(nodes_mb, collapse = ", "), "\n")
cat("Nombre d'arcs:", narcs(anb_mb_final), "\n")

# NB Full
nb_full_final <- naive.bayes(data_bn, "blueWins")
graphviz.plot(nb_full_final, shape = "rectangle",
              highlight = list(nodes = nodes(nb_full_final),
                               fill = "aliceblue", col = "darkblue"),
              main = "NB Full")

# ANB Full
anb_full_final <- build_anb(data_bn, "blueWins")
graphviz.plot(anb_full_final, shape = "rectangle",
              highlight = list(nodes = nodes(anb_full_final),
                               fill = "aliceblue", col = "steelblue"),
              main = "ANB Full")

# NB MB  ← ara sí definit
nb_mb_final <- naive.bayes(data_bn[, nodes_mb], "blueWins")
graphviz.plot(nb_mb_final, shape = "rectangle",
              highlight = list(nodes = nodes(nb_mb_final),
                               fill = "lightyellow", col = "darkblue"),
              main = "NB MB (Markov Blanket)")

# ANB MB ← MODEL FINAL
graphviz.plot(anb_mb_final, shape = "rectangle",
              highlight = list(nodes = nodes(anb_mb_final),
                               fill = "lightgreen", col = "darkgreen"),
              main = "ANB MB (Model Final Seleccionat ★)")


# prob_victoria 
prob_victoria <- function(junction, evidences) {
  nodes_ev  <- names(evidences)
  estats_ev <- as.character(unlist(evidences))
  tryCatch({
    ev  <- setEvidence(junction, nodes = nodes_ev, states = estats_ev)
    res <- querygrain(ev, nodes = "blueWins")$blueWins
    cat(sprintf("  P(blueWins=1 | evidència) = %.4f\n", res["1"]))
    cat(sprintf("  P(blueWins=0 | evidència) = %.4f\n\n", res["0"]))
    invisible(res)
  }, error = function(e) {
    cat("  ERROR en la inferència:", conditionMessage(e), "\n\n")
    invisible(NULL)
  })
}


# ESTUDI DE CASOS
## Cas 1: Equip Blau Dominant
cat("=== CAS 1: Equip Blau Dominant ===\n")
cat("  Or blau molt alt (n6), Exp alta (n5), Morts blaves molt baixes (n1)\n")
cat("  Drac: Sí / Torre vermella destruïda (1) / Exp vermella baixa (n2)\n\n")
ev1 <- list(
  blueTotalGold_disc        = "6",
  blueTotalExperience_disc  = "5",
  blueDeaths_disc           = "1",
  blueDragons               = "1",
  redTowersDestroyed_disc   = "1",
  redTotalExperience_disc   = "2"
)
prob_victoria(junction_final, ev1)

## Cas 2: Bon Farm Sense Objectius
cat("=== CAS 2: Bon Farm però Sense Objectius ===\n")
cat("  Or blau per sobre (n4), Morts blaves baixes (n2), Sense dracs ni torres\n\n")
ev2 <- list(
  blueTotalGold_disc        = "4",
  blueDeaths_disc           = "2",
  blueDragons               = "0",
  redHeralds                = "0",
  redTowersDestroyed_disc   = "0",
  redTotalExperience_disc   = "3"
)
prob_victoria(junction_final, ev2)

## Cas 3: Equip Blau en Desavantatge
cat("=== CAS 3: Equip Blau en Desavantatge ===\n")
cat("  Or baix (n2), Exp baixa (n2), Morts molt altes (n6)\n")
cat("  Vermell: Drac + Herald + Torre\n\n")
ev3 <- list(
  blueTotalGold_disc        = "2",
  blueTotalExperience_disc  = "2",
  blueDeaths_disc           = "6",
  blueDragons               = "0",
  redHeralds                = "1",
  redTowersDestroyed_disc   = "1",
  redTotalExperience_disc   = "5"
)
prob_victoria(junction_final, ev3)

## Cas 4: Avantatge Parcial (Drac + Or Igualat)
cat("=== CAS 4: Avantatge Parcial — Drac Blau, Or Similar ===\n")
cat("  Gold i Exp similars (n4), Morts neutres (n3), Drac blau: Sí\n\n")
ev4 <- list(
  blueTotalGold_disc        = "4",
  blueTotalExperience_disc  = "4",
  blueDeaths_disc           = "3",
  blueDragons               = "1",
  redTowersDestroyed_disc   = "0",
  redTotalExperience_disc   = "4"
)
prob_victoria(junction_final, ev4)
prob_victoria(junction_final, ev4)