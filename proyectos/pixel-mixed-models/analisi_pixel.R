# =====================================================================
# Anàlisi del dataset Pixel amb models lineals mixtos
# Models Lineals II · Grau en Estadística Aplicada (UAB)
# Codi de l'annex de l'informe (informe.pdf)
# =====================================================================

# ---- A.1 Preparació de l'entorn i càrrega de dades ----
library(lme4)
library(lmerTest)
library(MuMIn)
library(lmtest)
library(car)
library(influence.ME)
library(nlme)
library(ggplot2)
library(gridExtra)

df <- read.csv("Pixel.csv")
# El dataset també està disponible al paquet nlme:
# df <- as.data.frame(nlme::Pixel)
df$Dog <- as.factor(df$Dog)

# ---- A.2 Exploració estadística inicial ----
cat("Resum estadistic de la variable pixel:\n")
print(summary(df$pixel))

# ---- A.3 Anàlisi descriptiva i visualització ----
cat("\nTaula de frequencies (Dog vs Side):\n")
print(table(df$Dog, df$Side))

p1 <- ggplot(df, aes(x = pixel)) +
  geom_histogram(aes(y = after_stat(density)), bins = 15, fill = "#69b3a2",
                 color = "white") +
  geom_density(alpha = 0.2, fill = "#404080") +
  labs(title = "Distribucio de la Intensitat", x = "Pixel", y = "Densitat") +
  theme_minimal()

p2 <- ggplot(df, aes(x = day, y = pixel, group = interaction(Dog, Side),
                     color = as.factor(Dog))) +
  geom_line(alpha = 0.6) +
  geom_point() +
  facet_wrap(~ Side) +
  labs(title = "Evolucio temporal de la intensitat per Gos i Costat",
       x = "Dies post-injeccio", y = "Intensitat (pixel)", color = "Gos") +
  theme_minimal()

p3 <- ggplot(df, aes(x = Side, y = pixel, fill = Side)) +
  geom_boxplot() +
  labs(title = "Intensitat segons el Costat", x = "Costat", y = "Intensitat") +
  theme_minimal() +
  scale_fill_brewer(palette = "Set2")

p4 <- ggplot(df, aes(x = day, y = pixel)) +
  geom_point(alpha = 0.3) +
  geom_smooth(method = "loess", color = "red") +
  labs(title = "Tendencia mitjana de la intensitat en el temps",
       x = "Dia", y = "Pixel") +
  theme_minimal()

grid.arrange(p1, p3, p4, ncol = 1)
print(p2)

# ---- A.4 Propostes de models i comparació ----
m0_ols <- lm(pixel ~ day + I(day^2) + Side, data = df)
m1_int <- lmer(pixel ~ day + I(day^2) + Side + (1 | Dog), data = df, REML = FALSE)
m2_slp <- lmer(pixel ~ day + I(day^2) + Side + (1 + day | Dog), data = df, REML = FALSE)

print(anova(m1_int, m2_slp))

r2_m1 <- r.squaredGLMM(m1_int)
print(r2_m1)

m1_no_side <- lmer(pixel ~ day + I(day^2) + (1 | Dog), data = df, REML = FALSE)
print(anova(m1_no_side, m1_int))

m_final <- m2_slp

# ---- A.5 Verificació d'hipòtesis i diagnòstic ----
# 1. Extracció de residus i valors ajustats
residus <- resid(m_final)
ajustats <- predict(m_final)

# 2. Gràfic de linealitat (residus vs ajustats)
png("diag_linealitat.png", width = 800, height = 600)
plot(ajustats, residus, pch = 19, col = "steelblue",
     main = "Residus vs Valors Ajustats", xlab = "Ajustats", ylab = "Residus")
abline(h = 0, col = "red", lwd = 2)
dev.off()

# 3. Gràfic de normalitat (QQ-plot)
png("diag_normalitat.png", width = 800, height = 600)
qqnorm(residus, pch = 19, col = "darkgreen")
qqline(residus, col = "red", lwd = 2)
dev.off()

# 4. Tests estadístics de validesa
cat("\n--- TEST DE NORMALITAT (Shapiro-Wilk) ---\n")
print(shapiro.test(residus))

cat("\n--- TEST D'HOMOCEDASTICITAT (Breusch-Pagan) ---\n")
m_aux <- lm(residus^2 ~ day + I(day^2) + Side, data = df)
print(bptest(m_aux))

cat("\n--- TEST D'INDEPENDENCIA (Durbin-Watson) ---\n")
print(dwtest(m_aux))

cat("\n--- MULTICOL·LINEALITAT (VIF) ---\n")
print(vif(m_final))

# Estructura de correlació temporal AR(1)
m_final_nlme <- lme(pixel ~ day + I(day^2) + Side,
                    random = ~ 1 | Dog,
                    data = df,
                    method = "REML")

m_ar1 <- update(m_final_nlme, correlation = corAR1(form = ~ 1 | Dog))

print(anova(m_final_nlme, m_ar1))

res <- residuals(m_final_nlme, type = "normalized")
n <- length(res)
df_lag <- data.frame(res_t_minus_1 = res[1:(n - 1)], res_t = res[2:n])

ggplot(df_lag, aes(x = res_t_minus_1, y = res_t)) +
  geom_point(color = "steelblue", alpha = 0.6, size = 2.5) +
  geom_smooth(method = "lm", color = "firebrick", fill = "gray80") +
  labs(title = "Analisi d'Autocorrelacio Temporal (Lag-1)",
       subtitle = "Relacio entre residus consecutius",
       x = expression(paste("Residu en el temps ", t - 1)),
       y = expression(paste("Residu en el temps ", t))) +
  theme_light() +
  geom_vline(xintercept = 0, linetype = "dotted") +
  geom_hline(yintercept = 0, linetype = "dotted")

# ---- A.6 Anàlisi d'influència ----
est_influencia <- influence(m_final, group = "Dog")
cooks_d <- cooks.distance(est_influencia)

df_cook <- data.frame(Dog = rownames(cooks_d), CooksD = as.numeric(cooks_d))
n_gossos <- length(unique(df$Dog))
threshold <- 4 / n_gossos

ggplot(df_cook, aes(x = Dog, y = CooksD, fill = CooksD > threshold)) +
  geom_bar(stat = "identity", color = "black") +
  geom_hline(yintercept = threshold, linetype = "dashed", color = "red") +
  scale_fill_manual(values = c("steelblue", "firebrick")) +
  labs(title = "Distancia de Cook per Subjecte (Gossos)",
       subtitle = paste("Llindar:", round(threshold, 3)),
       x = "Identificador del Gos", y = "Distancia de Cook") +
  theme_minimal()
