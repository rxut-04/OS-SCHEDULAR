"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2, ArrowLeft, ChevronRight,
  Brain, Layers, BarChart2, Target, Cpu,
  MessageSquare, Eye, Zap, Database, Network, Shield,
} from "lucide-react";

const P = "var(--alg-primary)";
const S = "var(--alg-secondary)";
const PU = "#7c3aed";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-black mt-8 mb-3" style={{ color: PU }}>{children}</h2>;
}
function P1({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-neutral-700 leading-relaxed mb-3">{children}</p>;
}
function InfoBox({ title, children, color = PU }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="my-4 p-4 rounded-xl border-l-4 bg-purple-50" style={{ borderColor: color }}>
      <p className="font-bold text-sm mb-1" style={{ color: PU }}>{title}</p>
      <div className="text-sm text-neutral-700 leading-relaxed">{children}</div>
    </div>
  );
}
function WarnBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-xl border-l-4 bg-yellow-50 border-yellow-400">
      <p className="font-bold text-sm mb-1 text-yellow-800">{title}</p>
      <div className="text-sm text-neutral-700 leading-relaxed">{children}</div>
    </div>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-xl overflow-x-auto my-3 leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-sm">
        <thead>
          <tr style={{ background: PU }}>
            {headers.map(h => <th key={h} className="text-white font-bold px-4 py-2.5 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-purple-50/40"}>
              {row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-neutral-700 border-b border-gray-100" dangerouslySetInnerHTML={{ __html: cell }} />)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-1.5 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-base text-neutral-700">
          <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-purple-500" />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}
function CardGrid({ items }: { items: { title: string; body: string; color?: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
      {items.map(({ title, body, color }) => (
        <div key={title} className="p-4 rounded-xl border" style={{ background: (color || PU) + "10", borderColor: (color || PU) + "40" }}>
          <p className="font-black text-sm mb-1" style={{ color: color || PU }}>{title}</p>
          <p className="text-xs text-neutral-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UNIT DATA
═══════════════════════════════════════════════════════════════ */
const UNITS = [
  /* ─── UNIT 1: ML FUNDAMENTALS ─────────────────────────────── */
  {
    unit: "Unit 1 · ML Fundamentals",
    icon: <Brain className="h-4 w-4" />,
    topics: [
      {
        title: "What is Machine Learning?",
        content: (<>
          <P1><strong>Machine Learning (ML)</strong> is the science of getting computers to act without being explicitly programmed. Instead of writing rules, we feed examples and let the algorithm discover the patterns.</P1>
          <InfoBox title="Arthur Samuel (1959)">
            "Machine learning is the field of study that gives computers the ability to learn without being explicitly programmed."
          </InfoBox>
          <SectionTitle>Three Learning Paradigms</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {[
              { emoji: "🎓", title: "Supervised", body: "Learn from labelled (input, label) pairs. Goal: predict label for new inputs.", eg: "Classification, Regression" },
              { emoji: "🔍", title: "Unsupervised", body: "Find hidden structure in unlabelled data. No predefined answer.", eg: "Clustering, Dim. Reduction" },
              { emoji: "🎮", title: "Reinforcement", body: "Agent learns by acting in environment and receiving reward signals.", eg: "Game AI, Robotics, Trading" },
            ].map(({ emoji, title, body, eg }) => (
              <div key={title} className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50">
                <p className="text-2xl mb-1">{emoji}</p>
                <p className="font-black text-sm mb-1" style={{ color: PU }}>{title} Learning</p>
                <p className="text-xs text-neutral-600 mb-2">{body}</p>
                <p className="text-xs font-semibold text-purple-600">e.g. {eg}</p>
              </div>
            ))}
          </div>
          <SectionTitle>The ML Pipeline</SectionTitle>
          <div className="flex flex-wrap gap-2 my-3">
            {["Data Collection","→","EDA","→","Preprocessing","→","Feature Engineering","→","Model Selection","→","Training","→","Evaluation","→","Deployment","→","Monitoring"].map((s,i) => (
              s==="→"
                ? <span key={i} className="text-neutral-400 self-center font-bold">→</span>
                : <div key={s} className="px-2.5 py-1.5 rounded-lg text-xs font-bold border-2 border-purple-200 bg-purple-50 text-purple-700">{s}</div>
            ))}
          </div>
          <SectionTitle>Key Terminology</SectionTitle>
          <Table headers={["Term","Definition"]} rows={[
            ["Feature (X)","An individual measurable property of the data (column in a table)"],
            ["Label / Target (y)","The output we want to predict"],
            ["Training set","Data used to fit the model parameters"],
            ["Validation set","Data used to tune hyperparameters and detect overfitting during training"],
            ["Test set","Data held out entirely — only used for final evaluation"],
            ["Hyperparameter","Configuration set before training (learning rate, depth, k in KNN)"],
            ["Parameter","Values learned by the model during training (weights, biases)"],
            ["Epoch","One full pass over the entire training dataset"],
            ["Batch","Subset of training data processed per gradient update"],
          ]} />
        </>),
      },
      {
        title: "Bias, Variance & Regularisation",
        content: (<>
          <P1>Every model's error decomposes into bias, variance, and irreducible noise. Understanding this tradeoff is the foundation of model selection and regularisation strategy.</P1>
          <SectionTitle>Error Decomposition</SectionTitle>
          <Code>{`Expected MSE = Bias² + Variance + Irreducible Noise

Bias²     = (E[ŷ] - y)²          # systematic error from wrong assumptions
Variance  = E[(ŷ - E[ŷ])²]       # error from sensitivity to training data
Noise     = Var(ε)                 # irreducible — inherent in the data`}</Code>
          <Table headers={["Condition","Bias","Variance","Training Error","Test Error","Fix"]} rows={[
            ["Underfitting","High","Low","High","High","More complex model; more features; less regularisation"],
            ["Good Fit","Low","Low","Medium","Medium ≈ Train","—"],
            ["Overfitting","Low","High","Very Low","Much Higher","Regularisation; more data; simpler model; dropout"],
          ]} />
          <SectionTitle>Regularisation Techniques</SectionTitle>
          <Table headers={["Technique","Added to Loss","Effect","When"]} rows={[
            ["L1 (Lasso)","λΣ|wᵢ|","Drives some weights exactly to 0 → sparse model","Feature selection; interpretability"],
            ["L2 (Ridge)","λΣwᵢ²","Shrinks all weights smoothly toward 0","Correlated features; multicollinearity"],
            ["Elastic Net","λ₁Σ|wᵢ| + λ₂Σwᵢ²","Combines L1 sparsity + L2 stability","Best of both when unsure"],
            ["Dropout","Randomly zero neurons (prob p) per pass","Prevents co-adaptation; implicit ensemble","Neural networks"],
            ["Early Stopping","Stop when val loss plateaus","Prevents training too long","NNs; gradient boosting"],
            ["Data Augmentation","Generate synthetic samples","Increases effective dataset size","Image, audio, text"],
          ]} />
          <SectionTitle>Cross-Validation</SectionTitle>
          <P1>Cross-validation provides a robust estimate of how well a model generalises to unseen data without sacrificing too much training data.</P1>
          <Code>{`# k-Fold Cross-Validation (k=5)
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100)
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")

# Stratified k-Fold (preserves class proportions — use for imbalanced data)
from sklearn.model_selection import StratifiedKFold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`}</Code>
        </>),
      },
      {
        title: "Feature Engineering & Selection",
        content: (<>
          <P1><strong>Feature engineering</strong> is often the most impactful step in the ML pipeline — better features beat better algorithms. It requires domain knowledge and creativity.</P1>
          <SectionTitle>Feature Scaling</SectionTitle>
          <Table headers={["Method","Formula","When to Use"]} rows={[
            ["Min-Max Normalisation","x' = (x−min)/(max−min) → [0,1]","Neural networks; when bounded range needed"],
            ["Z-score Standardisation","x' = (x−μ)/σ → mean=0, std=1","PCA; SVM; when assuming normal distribution"],
            ["Robust Scaling","x' = (x−median)/IQR","When outliers present — IQR is resistant to them"],
            ["Log Transform","x' = log(1+x)","Right-skewed data (income, word counts)"],
            ["Box-Cox Transform","More general power transformation","Makes distribution more Gaussian"],
          ]} />
          <SectionTitle>Encoding Categorical Features</SectionTitle>
          <Table headers={["Method","When","Code"]} rows={[
            ["One-Hot Encoding","Nominal categories (no order); low cardinality","pd.get_dummies(df['color'])"],
            ["Label Encoding","Ordinal categories (size: S&lt;M&lt;L&lt;XL)","LabelEncoder().fit_transform(y)"],
            ["Target Encoding","High-cardinality categoricals (zip code, city)","Replace category with mean of target"],
            ["Frequency Encoding","High-cardinality without target leakage","Replace with category count/frequency"],
          ]} />
          <SectionTitle>Feature Selection Methods</SectionTitle>
          <CardGrid items={[
            { title: "Filter Methods", body: "Score each feature independently using statistical tests (correlation, chi-squared, ANOVA F-score, mutual information). Fast; no model needed.", color: "#10b981" },
            { title: "Wrapper Methods", body: "<strong>RFE (Recursive Feature Elimination)</strong> — train model, remove weakest feature, repeat. Finds optimal subset but expensive.", color: "#3b82f6" },
            { title: "Embedded Methods", body: "Feature selection is built into model training. L1 regularisation drives weights to 0. Tree feature_importance_ ranks features.", color: "#f59e0b" },
            { title: "Permutation Importance", body: "Randomly shuffle one feature at a time; measure performance drop. Model-agnostic; reliable for non-linear models.", color: "#8b5cf6" },
          ]} />
          <SectionTitle>Handling Missing Data</SectionTitle>
          <Code>{`import pandas as pd
from sklearn.impute import SimpleImputer, KNNImputer

df['age'].fillna(df['age'].median(), inplace=True)  # median imputation
df.dropna(subset=['critical_col'], inplace=True)     # drop if critical

# KNN Imputation (uses neighbour similarity)
knn = KNNImputer(n_neighbors=5)
X_imputed = knn.fit_transform(X)

# Missing indicator — tell the model which values were imputed
df['age_missing'] = df['age'].isna().astype(int)`}</Code>
        </>),
      },
    ],
  },

  /* ─── UNIT 2: SUPERVISED LEARNING ─────────────────────────── */
  {
    unit: "Unit 2 · Supervised Learning",
    icon: <Target className="h-4 w-4" />,
    topics: [
      {
        title: "Linear & Logistic Regression",
        content: (<>
          <SectionTitle>Linear Regression</SectionTitle>
          <P1>Fits a hyperplane to predict a continuous output. Assumes a linear relationship between features and target.</P1>
          <Code>{`Model:  ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ  =  wᵀx + b
Loss:   MSE = (1/n) Σᵢ (yᵢ − ŷᵢ)²

# Solution 1 — Normal Equation (closed-form, no iteration):
w = (XᵀX)⁻¹ Xᵀy        # O(p³) — slow for many features
# Solution 2 — Gradient Descent:
w ← w − η · ∂MSE/∂w = w − η · (2/n) Xᵀ(Xw − y)`}</Code>
          <InfoBox title="When Linear Regression Fails">
            Fails when: (1) relationship is non-linear, (2) features are highly correlated (multicollinearity), (3) outliers dominate (use robust regression or Huber loss), (4) target has a bounded range (use logistic or Poisson regression).
          </InfoBox>
          <SectionTitle>Logistic Regression (Classification)</SectionTitle>
          <Code>{`# Binary Classification
p(y=1|x) = σ(wᵀx + b)    where σ(z) = 1 / (1 + e⁻ᶻ)

# Decision rule:
ŷ = 1  if p ≥ 0.5  (threshold adjustable for precision/recall tradeoff)
ŷ = 0  otherwise

# Loss — Binary Cross-Entropy (Log Loss):
L = -(1/n) Σ [yᵢ log(p̂ᵢ) + (1−yᵢ) log(1−p̂ᵢ)]

# Multiclass — Softmax + Categorical Cross-Entropy:
p(y=k|x) = e^(wₖᵀx) / Σⱼ e^(wⱼᵀx)
L = -(1/n) Σᵢ Σₖ yᵢₖ log(p̂ᵢₖ)`}</Code>
          <Table headers={["Aspect","Linear Regression","Logistic Regression"]} rows={[
            ["Output","Continuous value (−∞ to +∞)","Probability (0 to 1)"],
            ["Activation","Identity (no squashing)","Sigmoid / Softmax"],
            ["Loss","MSE / MAE","Binary / Categorical Cross-Entropy"],
            ["Task","Regression","Classification"],
          ]} />
        </>),
      },
      {
        title: "K-Nearest Neighbours & Naive Bayes",
        content: (<>
          <SectionTitle>K-Nearest Neighbours (KNN)</SectionTitle>
          <P1>KNN is a non-parametric, lazy learner — it stores all training data and classifies a new point by majority vote of its K nearest neighbours.</P1>
          <Code>{`# Classification: ŷ = majority class among K nearest points
# Regression:    ŷ = mean of K nearest neighbours' values

Distance metrics:
  Euclidean:  d(x,z) = √Σ(xᵢ−zᵢ)²     # default; sensitive to scale
  Manhattan:  d(x,z) = Σ|xᵢ−zᵢ|         # L1 — robust to outliers
  Minkowski:  d(x,z) = (Σ|xᵢ−zᵢ|ᵖ)^(1/p) # generalization (p=2→Euclidean)
  Cosine:     1 − (x·z)/(‖x‖‖z‖)         # text/NLP — direction matters`}</Code>
          <Table headers={["K Value","Behaviour","Bias/Variance"]} rows={[
            ["K=1","Perfectly fits training data; very sensitive to noise","Low bias, high variance"],
            ["K=n","Predicts majority class for everything","High bias, zero variance"],
            ["Optimal K","Cross-validate; typically √n as starting point","Balanced"],
          ]} />
          <WarnBox title="KNN Weaknesses">
            (1) Feature scaling is mandatory — large-range features dominate distance. (2) Slow at prediction — O(n·d) per query for brute-force search. (3) Curse of dimensionality — distances become meaningless in high dimensions.
          </WarnBox>
          <SectionTitle>Naive Bayes Classifier</SectionTitle>
          <P1>Naive Bayes applies Bayes' theorem with the <em>naive</em> assumption that features are conditionally independent given the class.</P1>
          <Code>{`Bayes' Theorem:
P(y|x) = P(x|y) · P(y) / P(x)

Naive assumption: P(x|y) = Πᵢ P(xᵢ|y)   # features independent given class

Decision rule: ŷ = argmax_y [log P(y) + Σᵢ log P(xᵢ|y)]

Variants:
  Gaussian NB    — features are continuous with normal distribution
  Multinomial NB — integer feature counts (e.g., word counts in text)
  Bernoulli NB   — binary features (word present/absent)`}</Code>
          <InfoBox title="Despite the 'Naive' Assumption">
            Naive Bayes works surprisingly well for text classification (spam detection, sentiment). It is fast, highly scalable, works well with small datasets, and handles many features efficiently.
          </InfoBox>
        </>),
      },
      {
        title: "Decision Trees & Ensemble Methods",
        content: (<>
          <P1>Decision trees recursively partition the feature space by asking binary questions, building an interpretable tree of decisions.</P1>
          <SectionTitle>Splitting Criteria</SectionTitle>
          <Table headers={["Criterion","Formula","Used In"]} rows={[
            ["Gini Impurity","G = 1 − Σpᵢ² (0 = pure, 0.5 = max impurity for 2 classes)","CART (sklearn default)"],
            ["Entropy / Info Gain","H = −Σpᵢ log₂pᵢ; IG = H(parent) − ΣweightedH(children)","ID3, C4.5"],
            ["Variance Reduction","Var(parent) − weighted Var(children)","Regression trees"],
          ]} />
          <Code>{`# Pruning — prevent overfitting
from sklearn.tree import DecisionTreeClassifier

# Pre-pruning (growth constraints):
tree = DecisionTreeClassifier(
    max_depth=5,           # limit tree depth
    min_samples_split=20,  # min samples to split a node
    min_samples_leaf=10,   # min samples in a leaf
    max_features='sqrt',   # consider √p features at each split
)

# Post-pruning (cost-complexity):
tree = DecisionTreeClassifier(ccp_alpha=0.01)  # higher = more pruning`}</Code>
          <SectionTitle>Random Forest</SectionTitle>
          <P1>An ensemble of <em>decorrelated</em> decision trees. Two sources of randomness: (1) bootstrapped training samples (bagging), (2) random feature subset at each split.</P1>
          <Code>{`from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(
    n_estimators=500,        # number of trees
    max_features='sqrt',     # features considered per split (key for decorrelation)
    max_depth=None,          # grow full trees
    bootstrap=True,          # bagging
    oob_score=True,          # out-of-bag validation estimate (free!)
    n_jobs=-1,               # use all CPU cores
)
rf.fit(X_train, y_train)
print(rf.feature_importances_)   # mean impurity decrease per feature`}</Code>
          <SectionTitle>Gradient Boosting (XGBoost / LightGBM)</SectionTitle>
          <P1>Sequentially train trees, each fitting the <em>negative gradient</em> (residuals) of the loss from all previous trees.</P1>
          <Code>{`Algorithm:
  F₀(x) = argmin_c Σ L(yᵢ, c)    # initial prediction (e.g., mean)
  For m = 1 to M:
    rᵢₘ = −∂L(yᵢ, Fₘ₋₁(xᵢ))/∂Fₘ₋₁(xᵢ)   # pseudo-residuals
    Train tree hₘ on {(xᵢ, rᵢₘ)}
    Fₘ(x) = Fₘ₋₁(x) + η·hₘ(x)             # η = learning rate

XGBoost adds: L2 regularisation on leaf weights + 2nd-order gradient info
LightGBM adds: histogram-based splits + leaf-wise growth (faster, same accuracy)`}</Code>
          <Table headers={["Algorithm","Type","Speed","Interpretability","Default Choice"]} rows={[
            ["Decision Tree","Single","Fast","High","Baseline / Feature insight"],
            ["Random Forest","Bagging","Medium","Medium (importances)","Good default for tabular"],
            ["Gradient Boosting","Boosting","Slow train, fast predict","Low","Best accuracy on tabular"],
            ["XGBoost / LightGBM","Boosting + tricks","Fast","Low","Competition / production winner"],
          ]} />
        </>),
      },
      {
        title: "Support Vector Machines (SVM)",
        content: (<>
          <P1>SVM finds the maximum-margin hyperplane — the decision boundary that maximises the distance (margin) between the two classes. The model depends only on <em>support vectors</em> (points on the margin).</P1>
          <Code>{`# Hard margin (linearly separable):
Minimise:   ½‖w‖²
Subject to: yᵢ(wᵀxᵢ + b) ≥ 1  for all i

# Soft margin (C-SVM — allows misclassification):
Minimise:   ½‖w‖² + C·Σξᵢ
Subject to: yᵢ(wᵀxᵢ + b) ≥ 1 − ξᵢ,  ξᵢ ≥ 0

# C hyperparameter:
Large C  → narrow margin, low training error, may overfit
Small C  → wide margin, more violations, may underfit`}</Code>
          <SectionTitle>The Kernel Trick</SectionTitle>
          <P1>For non-linear data, we implicitly map inputs to a high-dimensional (even infinite-dimensional) space using a kernel function K(xᵢ, xⱼ) = φ(xᵢ)·φ(xⱼ). We never compute φ explicitly.</P1>
          <Table headers={["Kernel","Formula","Best For"]} rows={[
            ["Linear","K(x,z) = xᵀz","Linearly separable; text (high-dim sparse)"],
            ["Polynomial","K(x,z) = (xᵀz + c)ᵈ","Image classification; moderate non-linearity"],
            ["RBF / Gaussian","K(x,z) = exp(−γ‖x−z‖²)","General non-linear; most common default"],
            ["Sigmoid","K(x,z) = tanh(αxᵀz + c)","Approximates neural network; rarely used"],
          ]} />
          <InfoBox title="SVM vs Neural Networks">
            SVM: theoretically motivated (max margin), works well with small data, needs careful feature engineering, no easy probabilistic output. Neural Networks: scale better with data and raw features (images, text), but require much more data and compute.
          </InfoBox>
        </>),
      },
      {
        title: "Model Evaluation & Metrics",
        content: (<>
          <SectionTitle>Classification Metrics</SectionTitle>
          <Code>{`Confusion Matrix (binary):
              Predicted Positive  Predicted Negative
Actual Pos   |   TP (True+)    |   FN (False-)   |
Actual Neg   |   FP (False+)   |   TN (True-)    |

Accuracy  = (TP+TN)/Total           # misleading on imbalanced data
Precision = TP/(TP+FP)              # when FP is costly (spam filter)
Recall    = TP/(TP+FN)              # when FN is costly (cancer detection)
F1-Score  = 2·P·R/(P+R)             # harmonic mean — use when P and R both matter
F-beta    = (1+β²)·P·R / (β²P + R) # β>1 weights recall more; β<1 weights precision

# Multiclass: weighted avg, macro avg, or per-class metrics`}</Code>
          <SectionTitle>ROC Curve & AUC</SectionTitle>
          <P1>The ROC curve plots True Positive Rate (Recall) vs False Positive Rate at every threshold. AUC (Area Under Curve) summarises the curve into a single number: 0.5 = random, 1.0 = perfect.</P1>
          <Code>{`from sklearn.metrics import roc_auc_score, roc_curve, classification_report
import matplotlib.pyplot as plt

y_prob = model.predict_proba(X_test)[:,1]
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)

plt.plot(fpr, tpr, label=f'AUC = {auc:.3f}')
plt.xlabel('False Positive Rate'); plt.ylabel('True Positive Rate')
plt.title('ROC Curve'); plt.legend(); plt.show()

print(classification_report(y_test, model.predict(X_test)))`}</Code>
          <SectionTitle>Regression Metrics</SectionTitle>
          <Table headers={["Metric","Formula","Notes"]} rows={[
            ["MSE","(1/n)Σ(y−ŷ)²","Heavily penalises large errors; differentiable"],
            ["RMSE","√MSE","Same units as target; interpretable scale"],
            ["MAE","(1/n)Σ|y−ŷ|","Robust to outliers; less differentiable at 0"],
            ["MAPE","(1/n)Σ|y−ŷ|/|y| × 100%","Percentage error; fails when y≈0"],
            ["R² (R-squared)","1 − SS_res/SS_tot","Proportion of variance explained; 1.0 perfect"],
            ["Adjusted R²","1 − (1−R²)(n−1)/(n−p−1)","Penalises unnecessary features; use with multiple regression"],
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 3: UNSUPERVISED LEARNING ───────────────────────── */
  {
    unit: "Unit 3 · Unsupervised Learning",
    icon: <Layers className="h-4 w-4" />,
    topics: [
      {
        title: "Clustering Algorithms",
        content: (<>
          <SectionTitle>K-Means in Depth</SectionTitle>
          <Code>{`Algorithm:
  1. Initialise K centroids (randomly or K-Means++)
  2. Assign each point to nearest centroid (Voronoi partitioning)
  3. Update centroids: μₖ = mean of all points assigned to cluster k
  4. Repeat 2–3 until centroids stop moving (convergence)

Complexity: O(n·K·d·iterations)   (n=samples, K=clusters, d=features)

K-Means++ Initialisation (better convergence):
  1. Choose first centroid uniformly at random
  2. For each subsequent centroid:
     - Compute D(x) = min distance to nearest chosen centroid
     - Sample next centroid proportional to D(x)²
  → Reduces bad initialisations; O(log K) approximation guarantee`}</Code>
          <Table headers={["Quality Metric","Formula","Interpretation"]} rows={[
            ["Inertia (WCSS)","Σₖ Σ_{x∈Cₖ} ‖x−μₖ‖²","Within-cluster sum of squares; minimised by K-Means"],
            ["Silhouette Score","(b−a)/max(a,b)","a=avg dist to own cluster; b=avg dist to nearest other cluster; −1 to 1; higher=better"],
            ["Davies-Bouldin Index","Avg ratio of within-cluster scatter to between-cluster distance","Lower = better; 0 = perfect"],
            ["Calinski-Harabasz","Ratio of between-cluster to within-cluster dispersion","Higher = better"],
          ]} />
          <SectionTitle>DBSCAN</SectionTitle>
          <Code>{`Parameters: ε (neighbourhood radius), min_samples (core point threshold)

Point types:
  Core Point  : has ≥ min_samples points within radius ε
  Border Point: within ε of a core point but not itself a core
  Noise Point : not within ε of any core point (outlier)

Algorithm:
  For each unvisited point p:
    Mark p as visited
    Find all points in N_ε(p) (ε-neighbourhood)
    If |N_ε(p)| ≥ min_samples → p is a core point
       Expand cluster (add all density-reachable points)
    Else → mark p as noise (may later become border)

Advantages over K-Means:
  ✓ Finds arbitrarily shaped clusters
  ✓ Automatically identifies outliers
  ✓ Does not require K to be specified
  ✗ Struggles with varying density; sensitive to ε`}</Code>
          <SectionTitle>Hierarchical Clustering</SectionTitle>
          <P1>Builds a dendrogram by progressively merging (agglomerative) or splitting (divisive) clusters.</P1>
          <Table headers={["Linkage","Distance Between Clusters","Result"]} rows={[
            ["Single","Min distance between any two points across clusters","Elongated clusters; sensitive to outliers"],
            ["Complete","Max distance — farthest pair","Compact, spherical clusters"],
            ["Average","Average of all pairwise distances","Compromise; commonly used"],
            ["Ward","Minimise total within-cluster variance at each merge","Best for balanced, compact clusters"],
          ]} />
        </>),
      },
      {
        title: "Dimensionality Reduction",
        content: (<>
          <SectionTitle>Principal Component Analysis (PCA)</SectionTitle>
          <Code>{`Steps:
  1. Standardise: X ← (X − μ) / σ  (unit variance, zero mean)
  2. Covariance matrix: C = (1/(n−1)) XᵀX     [p × p]
  3. Eigendecomposition: C·v = λ·v
  4. Sort eigenvectors by eigenvalue (variance explained) descending
  5. Project: Z = X · V_k    (V_k = top-k eigenvectors)

Explained variance ratio: λᵢ / Σλⱼ
→ Choose k where cumulative explained variance ≥ 95%

from sklearn.decomposition import PCA
pca = PCA(n_components=0.95, svd_solver='full')  # keep 95% variance
X_reduced = pca.fit_transform(X_scaled)
print(pca.explained_variance_ratio_)`}</Code>
          <SectionTitle>t-SNE & UMAP</SectionTitle>
          <Table headers={["Method","Type","Speed","Global Structure","Use"]} rows={[
            ["PCA","Linear","Very fast","Preserved","Preprocessing, noise reduction, any dimension"],
            ["t-SNE","Non-linear","Slow (O(n²))","Not preserved","2D/3D visualisation only"],
            ["UMAP","Non-linear","Fast (O(n log n))","Partially","Visualisation + preprocessing"],
            ["Autoencoders","Non-linear (neural)","GPU-dependent","Depends on architecture","Compression, generation, anomaly detection"],
          ]} />
          <SectionTitle>Autoencoders</SectionTitle>
          <Code>{`Architecture:
  Input x → [Encoder] → Latent z → [Decoder] → Reconstruction x̂

  Encoder: x → z = f_θ(x)   (compress to bottleneck)
  Decoder: z → x̂ = g_φ(z)  (reconstruct from bottleneck)
  Loss:    L = ‖x − x̂‖²    (reconstruction error)

Variants:
  VAE (Variational Autoencoder): z ~ N(μ, σ²) — generative model
  Sparse Autoencoder: KL penalty on activations — learns sparse representations
  Denoising Autoencoder: corrupt input with noise; learn to reconstruct clean
  Contractive Autoencoder: penalise Jacobian of encoder — robust representations`}</Code>
        </>),
      },
    ],
  },

  /* ─── UNIT 4: NEURAL NETWORKS ────────────────────────────── */
  {
    unit: "Unit 4 · Neural Networks",
    icon: <Cpu className="h-4 w-4" />,
    topics: [
      {
        title: "Neural Network Fundamentals",
        content: (<>
          <P1>A neural network is a parameterised function composed of layers of artificial neurons. Each neuron computes a weighted sum of its inputs and applies a non-linear activation function.</P1>
          <SectionTitle>Single Neuron (Perceptron)</SectionTitle>
          <Code>{`z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b  =  wᵀx + b  (linear combination)
a = f(z)                                              (activation function)

Learnable parameters: w (weights) and b (bias)`}</Code>
          <SectionTitle>Activation Functions Compared</SectionTitle>
          <Table headers={["Function","Formula","Range","Gradient","Problems","Use"]} rows={[
            ["Sigmoid","1/(1+e⁻ˣ)","(0,1)","σ(x)(1−σ(x)) ≤ 0.25","Vanishing gradient; not zero-centred","Output layer (binary)"],
            ["Tanh","(eˣ−e⁻ˣ)/(eˣ+e⁻ˣ)","-1 to 1","1−tanh²(x) ≤ 1","Vanishing gradient (less severe)","Hidden (zero-centred)"],
            ["ReLU","max(0,x)","[0,∞)","0 or 1","Dying ReLU (dead neurons)","Default hidden layer"],
            ["Leaky ReLU","max(αx, x) α=0.01","(−∞,∞)","α or 1","Small negative gradient","Dying ReLU fix"],
            ["ELU","x if x≥0; α(eˣ−1) otherwise","(−α,∞)","1 or αeˣ","Computationally expensive","Smooth alternative"],
            ["GELU","x·Φ(x)","(−∞,∞)","Complex","Slower","BERT, GPT, ViT"],
            ["Softmax","eˣⁱ/Σeˣʲ","(0,1) sum=1","Complex","Numerically unstable without log-sum-exp","Multi-class output"],
          ]} />
          <SectionTitle>Backpropagation (The Chain Rule)</SectionTitle>
          <Code>{`Forward pass:  compute ŷ = f(x; W)
Compute loss: L = loss(y, ŷ)

Backward pass (backprop):
  ∂L/∂wᴸ  = ∂L/∂aᴸ · ∂aᴸ/∂zᴸ · ∂zᴸ/∂wᴸ
             │         │           │
             └─ δᴸ ────┘           └─ aᴸ⁻¹ (previous activation)

  δᴸ = (Wᴸ⁺¹)ᵀ δᴸ⁺¹ ⊙ f'(zᴸ)      # backpropagate error
  ∂L/∂Wᴸ = δᴸ · (aᴸ⁻¹)ᵀ           # gradient for weights
  ∂L/∂bᴸ = δᴸ                        # gradient for biases

Weight update:  W ← W − η · ∂L/∂W`}</Code>
          <SectionTitle>Weight Initialisation</SectionTitle>
          <Table headers={["Method","Formula","Use With"]} rows={[
            ["Zero init","w=0","Never — all neurons learn same gradient"],
            ["Random Normal","N(0, 0.01)","Very shallow networks only"],
            ["Xavier / Glorot","N(0, 2/(nᵢₙ+nₒᵤₜ))","Sigmoid/Tanh — balances gradient scale"],
            ["He / Kaiming","N(0, 2/nᵢₙ)","ReLU and variants — accounts for zero half"],
          ]} />
        </>),
      },
      {
        title: "Training, Optimisers & Tricks",
        content: (<>
          <SectionTitle>Gradient Descent Variants</SectionTitle>
          <Table headers={["Variant","Batch Size","Update Frequency","Characteristics"]} rows={[
            ["Batch GD","Full dataset","Once per epoch","Stable gradient; very slow for large data; may get stuck in local minima"],
            ["Stochastic GD (SGD)","1 sample","n times per epoch","Noisy updates; escapes local minima; GPU inefficient"],
            ["Mini-batch GD","32–512 samples","n/batch times per epoch","Balance of stability and speed; GPU-efficient; default"],
          ]} />
          <SectionTitle>Optimisers in Detail</SectionTitle>
          <Code>{`# SGD with Momentum:
v ← β·v − η·∇L      # accumulate velocity; β typically 0.9
w ← w + v

# RMSProp (adaptive learning rate per parameter):
s ← ρ·s + (1−ρ)·(∇L)²     # running avg of squared gradients
w ← w − η · ∇L / (√s + ε)  # normalise by sqrt of running avg

# Adam (Momentum + RMSProp):
m ← β₁·m + (1−β₁)·∇L      # 1st moment (mean)
v ← β₂·v + (1−β₂)·(∇L)²   # 2nd moment (variance)
m̂ = m/(1−β₁ᵗ)              # bias correction
v̂ = v/(1−β₂ᵗ)
w ← w − η·m̂/(√v̂ + ε)       # adaptive step

Defaults: β₁=0.9, β₂=0.999, ε=1e-8, η=0.001`}</Code>
          <SectionTitle>Learning Rate Scheduling</SectionTitle>
          <Code>{`# Common schedules:
Step decay:       lr = lr₀ × 0.1^⌊epoch/30⌋
Cosine annealing: lr = lr_min + ½(lr_max−lr_min)(1 + cos(πt/T))
Warm-up + decay:  lr ramps up for first k steps, then decays
One-cycle policy: lr increases to max, then decreases to min (super-convergence)

# PyTorch examples:
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)
scheduler = torch.optim.lr_scheduler.OneCycleLR(optimizer, max_lr=0.01, steps_per_epoch=len(train_dl), epochs=10)`}</Code>
          <SectionTitle>Batch Normalisation</SectionTitle>
          <Code>{`For mini-batch B = {x₁,...,xₘ}:
  μ_B  = (1/m) Σxᵢ
  σ²_B = (1/m) Σ(xᵢ − μ_B)²
  x̂ᵢ  = (xᵢ − μ_B) / √(σ²_B + ε)    # normalise
  yᵢ   = γ·x̂ᵢ + β                      # scale & shift (learnable)

Benefits: higher lr possible; less sensitivity to init; mild regulariser
Placement: after linear/conv layer, before activation (or after, for ReLU)`}</Code>
          <SectionTitle>Dropout</SectionTitle>
          <Code>{`# Training: randomly zero each neuron with probability p (typically 0.5)
# Inference: scale activations by (1−p) to maintain expected sum

# PyTorch:
self.dropout = nn.Dropout(p=0.5)
x = self.dropout(x)   # training: zero units; eval: identity (scale inside dropout)

# Effect: acts as ensemble of 2^n different networks
# VariationalDropout / MC-Dropout: keep dropout at test time → Bayesian uncertainty`}</Code>
        </>),
      },
      {
        title: "CNNs — Computer Vision",
        content: (<>
          <P1>Convolutional Neural Networks exploit spatial locality and translation invariance in images using shared-weight convolution filters.</P1>
          <SectionTitle>Convolution Operation</SectionTitle>
          <Code>{`Output size for one spatial dimension:
  W_out = ⌊(W_in − F + 2P) / S⌋ + 1
  W_in  = input size, F = filter size, P = padding, S = stride

Parameter count for one conv layer:
  Params = F × F × C_in × C_out + C_out (biases)

Example: conv(3×3, 64 in → 128 out) = 3×3×64×128 + 128 = 73,856 params`}</Code>
          <SectionTitle>Pooling Layers</SectionTitle>
          <Table headers={["Type","Operation","Effect"]} rows={[
            ["Max Pooling","Take maximum value in each pool region","Detects presence of feature; not differentiable at max",""],
            ["Average Pooling","Take mean of pool region","Smoother; used in global avg pooling before FC layer",""],
            ["Global Average Pooling (GAP)","Average entire feature map → scalar per channel","Replaces flat FC layer; reduces overfitting",""],
          ]} />
          <SectionTitle>Classic CNN Architectures</SectionTitle>
          <Table headers={["Model","Year","Depth","Top-5 Err","Key Innovation"]} rows={[
            ["LeNet-5","1998","7","—","First successful CNN; 5×5 conv + pooling"],
            ["AlexNet","2012","8","15.3%","ReLU, dropout, GPU training, data augmentation"],
            ["VGG-16","2014","16","7.3%","Very deep with only 3×3 convs; simple and systematic"],
            ["GoogLeNet","2014","22","6.7%","Inception modules: parallel 1×1, 3×3, 5×5 convs"],
            ["ResNet-50","2015","50","5.3%","Skip connections: F(x)+x — enables 100+ layer training"],
            ["DenseNet","2016","121","5.4%","Dense connections: every layer sees all previous layers"],
            ["EfficientNet","2019","B0–B7","varies","Compound scaling of width/depth/resolution"],
            ["ViT","2020","12–32","varies","Patches as tokens; pure attention — no convolutions"],
          ]} />
          <SectionTitle>Transfer Learning</SectionTitle>
          <Code>{`# Strategy 1 — Feature Extraction (freeze backbone)
model = torchvision.models.resnet50(weights='IMAGENET1K_V2')
for param in model.parameters():
    param.requires_grad = False      # freeze all layers
model.fc = nn.Linear(2048, num_classes)  # replace head

# Strategy 2 — Fine-tuning (unfreeze last few layers)
for param in model.layer4.parameters():
    param.requires_grad = True       # unfreeze last ResNet block

# Rule of thumb:
# Small dataset + similar domain → feature extraction
# Large dataset + different domain → full fine-tuning`}</Code>
        </>),
      },
      {
        title: "RNNs, LSTMs & GRUs",
        content: (<>
          <P1>Recurrent networks process sequences by maintaining a hidden state that carries context from previous time steps.</P1>
          <SectionTitle>Vanilla RNN</SectionTitle>
          <Code>{`hₜ = tanh(Wₓₕ·xₜ + Wₕₕ·hₜ₋₁ + bₕ)     # hidden state update
ŷₜ = Wₕᵧ·hₜ + bᵧ                          # output at step t

Problem: vanishing/exploding gradients over long sequences
∂L/∂h₀ = Πₜ (∂hₜ/∂hₜ₋₁) — product of Jacobians shrinks/explodes`}</Code>
          <SectionTitle>LSTM (Long Short-Term Memory)</SectionTitle>
          <Code>{`# LSTM equations (at each time step t):
fₜ = σ(Wf·[hₜ₋₁, xₜ] + bf)    # Forget gate:  what to erase from cell
iₜ = σ(Wᵢ·[hₜ₋₁, xₜ] + bᵢ)    # Input gate:   what new info to add
C̃ₜ = tanh(Wc·[hₜ₋₁, xₜ] + bc) # Candidate:    new candidate values
Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ     # Cell state:   updated long-term memory
oₜ = σ(Wo·[hₜ₋₁, xₜ] + bo)    # Output gate:  what to expose
hₜ = oₜ ⊙ tanh(Cₜ)             # Hidden state: short-term memory

Key: the cell state Cₜ flows with only multiplicative & additive operations
→ gradient highway — gradients flow back without vanishing`}</Code>
          <SectionTitle>GRU (Gated Recurrent Unit)</SectionTitle>
          <Code>{`# Simpler than LSTM (2 gates, no separate cell state):
zₜ = σ(Wz·[hₜ₋₁, xₜ])         # Update gate: how much past to keep
rₜ = σ(Wr·[hₜ₋₁, xₜ])         # Reset gate: how much past to forget
h̃ₜ = tanh(Wh·[rₜ⊙hₜ₋₁, xₜ]) # Candidate hidden state
hₜ = (1−zₜ)⊙hₜ₋₁ + zₜ⊙h̃ₜ   # Final hidden state

GRU ≈ LSTM performance with 33% fewer parameters → faster training`}</Code>
          <SectionTitle>Sequence-to-Sequence & Encoder-Decoder</SectionTitle>
          <P1>For tasks where input and output sequences have different lengths (machine translation, summarisation), an encoder compresses the input sequence to a context vector, and the decoder generates the output sequence from it.</P1>
          <WarnBox title="Information Bottleneck Problem">
            The fixed-size context vector becomes a bottleneck for long sequences — it must encode everything. This was the motivation for the Attention mechanism, which lets the decoder query all encoder hidden states directly.
          </WarnBox>
        </>),
      },
    ],
  },

  /* ─── UNIT 5: ATTENTION & TRANSFORMERS ─────────────────── */
  {
    unit: "Unit 5 · Transformers & LLMs",
    icon: <Zap className="h-4 w-4" />,
    topics: [
      {
        title: "Attention Mechanism",
        content: (<>
          <P1>Attention allows a model to focus on different parts of the input when producing each element of the output — solving the bottleneck of fixed-size context vectors in seq2seq models.</P1>
          <SectionTitle>Bahdanau (Additive) Attention</SectionTitle>
          <Code>{`# Encoder produces hidden states h₁, h₂, ..., hₙ
# Decoder at step t has hidden state sₜ

# Attention score (alignment):
eᵢₜ = vᵀ · tanh(W_s · sₜ + W_h · hᵢ)   # learnable parameters

# Softmax to get weights:
αᵢₜ = exp(eᵢₜ) / Σⱼ exp(eⱼₜ)           # distribution over encoder steps

# Context vector:
cₜ = Σᵢ αᵢₜ · hᵢ                        # weighted sum of encoder states`}</Code>
          <SectionTitle>Scaled Dot-Product Attention</SectionTitle>
          <Code>{`# Transformer attention (Vaswani et al., 2017):
Q = X · Wq    # Query matrix  (d_k dims)
K = X · Wk    # Key matrix    (d_k dims)
V = X · Wv    # Value matrix  (d_v dims)

Attention(Q,K,V) = softmax(QKᵀ / √d_k) · V

# √d_k scaling: prevents dot products from growing large in magnitude
# (which pushes softmax into regions with vanishing gradients)

# Self-attention: Q, K, V all come from the same sequence
# Cross-attention: Q from decoder, K and V from encoder output`}</Code>
          <SectionTitle>Multi-Head Attention</SectionTitle>
          <Code>{`# Run h independent attention heads with different projections:
headᵢ = Attention(Q·Wᵢq, K·Wᵢk, V·Wᵢv)     # i = 1..h

MultiHead(Q,K,V) = Concat(head₁,...,headₕ) · Wᵒ

# Each head can attend to different aspects:
# Head 1: syntactic structure; Head 2: coreference; Head 3: semantics...
# Typical: h=8 heads, d_k=64, d_model=512 (BERT-base)`}</Code>
        </>),
      },
      {
        title: "Transformer Architecture",
        content: (<>
          <P1>The Transformer (Vaswani et al., 2017) replaces recurrence with self-attention, enabling full parallelism and capturing arbitrary long-range dependencies.</P1>
          <SectionTitle>Transformer Block Components</SectionTitle>
          <Code>{`# One Transformer encoder layer:
def transformer_encoder_layer(x):
    # 1. Multi-head self-attention
    attn_out = MultiHeadAttention(x, x, x)         # Q=K=V=x (self-attention)
    x = LayerNorm(x + Dropout(attn_out))           # residual connection + norm

    # 2. Position-wise Feed-Forward Network
    ffn_out  = Linear(ReLU(Linear(x, d_ff)), d_model)   # d_ff = 4 × d_model
    x = LayerNorm(x + Dropout(ffn_out))           # residual connection + norm
    return x`}</Code>
          <SectionTitle>Positional Encoding</SectionTitle>
          <Code>{`# Transformers have no recurrence → inject position information:
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

# Added to token embeddings before the first layer
# Properties: unique for each position; relative distances are consistent;
# generalises to longer sequences than seen in training`}</Code>
          <SectionTitle>Encoder vs Decoder Models</SectionTitle>
          <Table headers={["Architecture","Uses","Pre-training Task","Key Models"]} rows={[
            ["Encoder-only","Classification, NER, Q&A","Masked Language Model (MLM)","BERT, RoBERTa, ALBERT, DistilBERT"],
            ["Decoder-only","Text generation, code, reasoning","Causal LM (predict next token)","GPT-2/3/4, LLaMA, Mistral, Falcon"],
            ["Encoder-Decoder","Translation, summarisation, QA with generation","Seq2seq (MLM + denoising)","T5, BART, mT5, mBART"],
          ]} />
          <SectionTitle>Scaling Laws</SectionTitle>
          <P1>Kaplan et al. (OpenAI) showed that model performance scales predictably as power laws with compute, data, and parameter count:</P1>
          <Code>{`L(N, D) ≈ (Nc/N)^αN + (Dc/D)^αD + L∞

N = model parameters   αN ≈ 0.076
D = training tokens    αD ≈ 0.095
L∞ = irreducible loss (inherent data entropy)

Chinchilla (Hoffmann et al., 2022): optimal allocation is
N ≈ D (equal scaling of model size and data)
→ 70B model should train on ~1.4T tokens`}</Code>
        </>),
      },
      {
        title: "Large Language Models & Fine-tuning",
        content: (<>
          <P1>Large Language Models (LLMs) are Transformer decoder models trained on massive text corpora to predict the next token. They exhibit emergent capabilities that smaller models lack.</P1>
          <SectionTitle>LLM Training Stages</SectionTitle>
          <div className="my-4 border rounded-xl overflow-hidden text-sm">
            {[
              { step: "1. Pre-training", desc: "Train on hundreds of billions of tokens. Learn world knowledge and language patterns. Extremely expensive (millions of $).", bg: "#dbeafe" },
              { step: "2. Supervised Fine-tuning (SFT)", desc: "Fine-tune on high-quality instruction-following examples (prompts + ideal responses). Teaches the model to be helpful.", bg: "#ede9fe" },
              { step: "3. RLHF", desc: "Reinforcement Learning from Human Feedback. Train a reward model on human preferences. Use PPO to maximise reward while staying close to SFT model.", bg: "#d1fae5" },
              { step: "4. DPO / ORPO", desc: "Direct Preference Optimisation — simpler alternative to RLHF. Fine-tune directly on preference pairs without separate reward model.", bg: "#fef9c3" },
            ].map(({ step, desc, bg }) => (
              <div key={step} className="px-4 py-3 border-b" style={{ background: bg }}>
                <p className="font-black text-sm" style={{ color: PU }}>{step}</p>
                <p className="text-xs text-neutral-600 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
          <SectionTitle>Parameter-Efficient Fine-Tuning (PEFT)</SectionTitle>
          <Table headers={["Method","Trainable Params","Idea"]} rows={[
            ["LoRA","&lt;1% of model","Add low-rank matrices ΔW = BA to attention weights; freeze rest"],
            ["QLoRA","&lt;1% (4-bit)","LoRA on 4-bit quantised model — fits 65B on single A100"],
            ["Adapter Layers","~3%","Small bottleneck MLP inserted between transformer layers"],
            ["Prefix Tuning","~0.1%","Prepend trainable tokens to key/value in attention"],
            ["Prompt Tuning","~0.01%","Soft trainable prefix in embedding space only"],
          ]} />
          <SectionTitle>Prompt Engineering</SectionTitle>
          <Code>{`# Zero-shot: just ask
"Classify the sentiment of: 'The movie was fantastic!' → "

# Few-shot: provide examples
"Positive: 'Great film!'
 Negative: 'Terrible plot'
 Classify: 'Average at best' → "

# Chain-of-Thought (CoT): ask the model to reason step by step
"Solve step by step:
 Q: If Alice has 3 apples and Bob gives her 5 more, how many?
 A: Let's think step by step..."

# ReAct: Reason + Act (tool use)
"Think: I need to search for current weather.
 Action: search('weather London')
 Observation: 15°C, cloudy
 Think: Now I can answer..."
 `}</Code>
        </>),
      },
    ],
  },

  /* ─── UNIT 6: NLP ───────────────────────────────────────── */
  {
    unit: "Unit 6 · Natural Language Processing",
    icon: <MessageSquare className="h-4 w-4" />,
    topics: [
      {
        title: "NLP Fundamentals & Text Preprocessing",
        content: (<>
          <P1>NLP bridges human language and machine understanding. Text is inherently unstructured, discrete, and context-dependent — requiring specialised preprocessing and representations.</P1>
          <SectionTitle>Text Preprocessing Pipeline</SectionTitle>
          <Code>{`import re, nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

def preprocess(text):
    text = text.lower()                          # lowercase
    text = re.sub(r'[^a-z0-9\s]', '', text)     # remove special chars
    tokens = word_tokenize(text)                  # tokenise
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]  # stop-word removal
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]   # lemmatisation
    return tokens

# Stemming vs Lemmatisation:
# Stemming: fast, aggressive, produces non-words (running → run, better → better)
# Lemmatisation: slower, uses vocab, returns real words (better → good)`}</Code>
          <SectionTitle>Text Representations</SectionTitle>
          <Table headers={["Method","Captures Order?","Captures Semantics?","Dimensionality","Speed"]} rows={[
            ["Bag of Words","No","No","|vocab| (sparse)","Very fast"],
            ["TF-IDF","No","Partially (rare=distinctive)","|vocab| (sparse)","Fast"],
            ["N-grams","Local (n-word windows)","Partially","|vocab|^n (very sparse)","Fast"],
            ["Word2Vec","No (per-word)","Yes (geometric)","50–300 (dense)","Fast after training"],
            ["GloVe","No (per-word)","Yes","50–300 (dense)","Fast after training"],
            ["BERT Embeddings","Yes (full context)","Yes (context-aware)","768/1024 (dense)","Slow (full model)"],
          ]} />
          <SectionTitle>Subword Tokenisation</SectionTitle>
          <Code>{`# Modern LLMs use subword tokenisation to handle OOV words:

# Byte-Pair Encoding (BPE) — GPT:
# Start with characters; merge most frequent adjacent pairs until target vocab size
# "playing" → ["play", "ing"]   "unbelievable" → ["un", "believ", "able"]

# WordPiece — BERT:
# Similar to BPE but merges based on language model probability
# "playing" → ["play", "##ing"]  (## = continuation of word)

# SentencePiece — multilingual models:
# Treats text as raw bytes; language-agnostic; handles spaces as tokens
# Used in LLaMA, Mistral, T5`}</Code>
        </>),
      },
      {
        title: "Word Embeddings & BERT",
        content: (<>
          <SectionTitle>Word2Vec</SectionTitle>
          <Code>{`Two architectures:
  CBOW (Continuous Bag of Words): predict centre word from context
    context = [w_{t-2}, w_{t-1}, w_{t+1}, w_{t+2}]  →  w_t

  Skip-gram: predict context from centre word
    w_t  →  [w_{t-2}, w_{t-1}, w_{t+1}, w_{t+2}]

Training tricks:
  Negative sampling: instead of softmax over |vocab|, train binary classifier
    for target word vs k random negative words
  Subsampling: discard high-frequency words (the, and) with probability ∝ freq

Remarkable properties:
  king − man + woman ≈ queen    (analogy arithmetic)
  Paris − France + Italy ≈ Rome
  cosine(dog, puppy) ≈ 0.85    (semantic similarity)`}</Code>
          <SectionTitle>BERT Architecture & Pre-training</SectionTitle>
          <Code>{`# BERT-base: 12 layers, 768 hidden, 12 heads, 110M params
# BERT-large: 24 layers, 1024 hidden, 16 heads, 340M params

Pre-training Tasks:
  1. Masked Language Model (MLM):
     - Randomly mask 15% of tokens
     - 80% → [MASK], 10% → random, 10% → unchanged
     - Predict masked tokens (bidirectional context)

  2. Next Sentence Prediction (NSP):
     - Input: [CLS] Sentence A [SEP] Sentence B [SEP]
     - Predict: IsNext or NotNext (50/50)

Input representation: Token embeddings + Segment embeddings + Position embeddings

Fine-tuning (one extra layer):
  Classification: MLP on [CLS] token representation
  NER:            MLP on each token representation
  Q&A (SQuAD):    Predict start and end span of answer`}</Code>
          <Table headers={["Model","Architecture","Parameters","Key Innovation"]} rows={[
            ["BERT-base","Encoder-only","110M","MLM + NSP pre-training"],
            ["RoBERTa","Encoder-only","125M","No NSP; dynamic masking; more data"],
            ["DistilBERT","Encoder-only","66M","Knowledge distillation of BERT (60% smaller, 97% performance)"],
            ["ALBERT","Encoder-only","12M","Factorised embeddings; cross-layer parameter sharing"],
            ["GPT-3","Decoder-only","175B","In-context learning (few-shot without fine-tuning)"],
            ["T5","Encoder-Decoder","11B","Text-to-text framework; every task as seq2seq"],
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 7: COMPUTER VISION ────────────────────────────── */
  {
    unit: "Unit 7 · Computer Vision",
    icon: <Eye className="h-4 w-4" />,
    topics: [
      {
        title: "Object Detection & Segmentation",
        content: (<>
          <P1>Beyond image classification (whole-image label), computer vision tasks include object detection (bounding boxes), semantic segmentation (per-pixel class), and instance segmentation (per-pixel instance).</P1>
          <SectionTitle>Object Detection Evolution</SectionTitle>
          <Table headers={["Model","Year","Approach","Speed","mAP"]} rows={[
            ["R-CNN","2013","Region proposals → CNN per region","Very slow","~58%"],
            ["Fast R-CNN","2015","CNN on full image; RoI pooling on feature map","Fast train, slow proposals","~70%"],
            ["Faster R-CNN","2015","Region Proposal Network (RPN) inside CNN","Near real-time","~73%"],
            ["YOLO v1","2016","Single CNN, predicts grid of boxes directly","Real-time (45 FPS)","~63%"],
            ["SSD","2016","Multi-scale anchor boxes at each feature map level","Real-time","~74%"],
            ["YOLOv8","2023","CSP backbone + anchor-free detection head","Very fast","~53% COCO"],
            ["DETR","2020","Transformer: boxes as set prediction with attention","Moderate","~42%"],
          ]} />
          <SectionTitle>Key Concepts in Detection</SectionTitle>
          <Code>{`# IoU (Intersection over Union) — measures prediction quality:
IoU = Area(Prediction ∩ Ground Truth) / Area(Prediction ∪ Ground Truth)
      IoU > 0.5 = "good" detection (PASCAL VOC), IoU > 0.75 = "strict"

# Non-Maximum Suppression (NMS):
# Problem: detector outputs many overlapping boxes for same object
# Solution: sort by confidence → keep top box → remove boxes with IoU > threshold
#           repeat until no boxes left
#           Soft-NMS: reduce confidence of overlapping boxes instead of removing

# Anchor Boxes:
# Pre-defined box shapes (different scales & aspect ratios) at each grid cell
# Detector predicts offsets from anchors rather than absolute coordinates`}</Code>
          <SectionTitle>Segmentation</SectionTitle>
          <Table headers={["Task","Description","Model Examples"]} rows={[
            ["Semantic Segmentation","Label every pixel with a class; no instance distinction","FCN, DeepLab, SegNet"],
            ["Instance Segmentation","Label every pixel AND distinguish object instances","Mask R-CNN, SOLO, CondInst"],
            ["Panoptic Segmentation","Combines semantic + instance in one unified output","Panoptic FPN, Mask2Former"],
            ["SAM (Segment Anything)","Zero-shot segmentation from any prompt (point, box, text)","Meta SAM, SAM 2"],
          ]} />
        </>),
      },
      {
        title: "Generative Models — GANs & Diffusion",
        content: (<>
          <SectionTitle>Generative Adversarial Networks</SectionTitle>
          <Code>{`# GAN Framework (Goodfellow et al., 2014):
Generator G:     z ~ N(0,I) → G(z) ≈ real images   (fool D)
Discriminator D: x → P(x is real)                   (catch G)

# Min-max objective:
min_G max_D V(D,G) = 𝔼_{x~data}[log D(x)] + 𝔼_{z~pz}[log(1 − D(G(z)))]
# D maximises: correctly classify real/fake
# G minimises: make D classify fake as real

# Practical training:
for each batch:
    # Train D
    loss_D = -log D(x_real) - log(1 - D(G(z)))    # maximise
    # Train G
    loss_G = -log D(G(z))                           # non-saturating version`}</Code>
          <Table headers={["GAN Variant","Key Idea","Application"]} rows={[
            ["DCGAN","Deep Convolutional GAN — stable training guidelines","Image synthesis baseline"],
            ["Conditional GAN (cGAN)","Condition on class label y: G(z,y), D(x,y)","Class-specific generation"],
            ["Pix2Pix","Paired image-to-image translation with L1 + GAN loss","Sketch→photo, map→satellite"],
            ["CycleGAN","Unpaired translation via cycle-consistency loss","Horse↔Zebra, photo↔painting"],
            ["StyleGAN2","W latent space + AdaIN + progressive training","Ultra-realistic face synthesis"],
            ["WGAN","Wasserstein distance — more stable gradients","General image synthesis"],
          ]} />
          <SectionTitle>Diffusion Models</SectionTitle>
          <Code>{`# Denoising Diffusion Probabilistic Models (DDPM, Ho et al., 2020):

Forward process (add noise gradually over T=1000 steps):
  q(xₜ|xₜ₋₁) = N(xₜ; √(1−βₜ)·xₜ₋₁, βₜ·I)
  xₜ = √ᾱₜ·x₀ + √(1−ᾱₜ)·ε    where ε~N(0,I), ᾱₜ=∏βᵢ

Reverse process (neural network removes noise):
  p_θ(xₜ₋₁|xₜ) = N(xₜ₋₁; μ_θ(xₜ,t), Σ_θ)
  Training: minimise ‖ε − ε_θ(xₜ, t)‖²   (predict the noise added)

Generation: start from xT~N(0,I), iteratively denoise to x₀

Latent Diffusion (Stable Diffusion):
  Encode image to latent space → diffuse in latent → decode with VAE decoder
  CLIP text encoder provides conditioning: U-Net cross-attention on text embeddings`}</Code>
        </>),
      },
    ],
  },

  /* ─── UNIT 8: REINFORCEMENT LEARNING ─────────────────────── */
  {
    unit: "Unit 8 · Reinforcement Learning",
    icon: <BarChart2 className="h-4 w-4" />,
    topics: [
      {
        title: "RL Fundamentals & MDPs",
        content: (<>
          <P1>Reinforcement learning formalises sequential decision making as a Markov Decision Process (MDP). An agent interacts with an environment, observing states, taking actions, and receiving scalar rewards.</P1>
          <SectionTitle>MDP Formal Definition</SectionTitle>
          <Code>{`MDP = (S, A, P, R, γ)

S  — state space
A  — action space
P(s'|s,a) — transition probability (Markov: future depends only on present)
R(s,a,s') — reward function
γ ∈ [0,1] — discount factor (γ close to 1 = far-sighted agent)

Return (discounted sum of rewards):
  Gₜ = rₜ + γ·rₜ₊₁ + γ²·rₜ₊₂ + ... = Σₖ₌₀^∞ γᵏ·rₜ₊ₖ

Policy: π(a|s) — probability of taking action a in state s (what we're learning)`}</Code>
          <SectionTitle>Value Functions</SectionTitle>
          <Code>{`# State-value function V^π(s): expected return starting from s, following π
V^π(s) = 𝔼_π[Gₜ | sₜ=s]

# Action-value function Q^π(s,a): expected return after taking a in s, then π
Q^π(s,a) = 𝔼_π[Gₜ | sₜ=s, aₜ=a]

# Bellman Expectation Equations:
V^π(s) = Σ_a π(a|s) · Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·V^π(s')]
Q^π(s,a) = Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·Σ_{a'} π(a'|s')·Q^π(s',a')]

# Bellman Optimality Equations (optimal π*):
V*(s) = max_a Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·V*(s')]
Q*(s,a) = Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·max_{a'} Q*(s',a')]`}</Code>
          <SectionTitle>Taxonomy of RL Algorithms</SectionTitle>
          <Table headers={["Category","Model of Environment","Policy Update","Examples"]} rows={[
            ["Model-Free, Value-Based","No","Indirect via value function","Q-Learning, DQN, Double DQN"],
            ["Model-Free, Policy-Based","No","Direct gradient","REINFORCE, PPO, TRPO"],
            ["Model-Free, Actor-Critic","No","Both value + policy","A2C, A3C, SAC, TD3"],
            ["Model-Based","Yes (learned)","Planning + learning","Dyna-Q, MuZero, Dreamer"],
            ["On-Policy","No","Must use current policy's data","SARSA, A2C, PPO"],
            ["Off-Policy","No","Can use any data (replay buffer)","Q-Learning, DQN, SAC"],
          ]} />
        </>),
      },
      {
        title: "Deep RL — DQN to PPO",
        content: (<>
          <SectionTitle>Deep Q-Network (DQN)</SectionTitle>
          <Code>{`# Challenge: tabular Q-table infeasible for large state spaces
# Solution: approximate Q(s,a) with neural network Q_θ(s,a)

# Two critical stabilisation tricks:

# 1. Experience Replay:
#    Store transitions (s,a,r,s') in replay buffer D
#    Sample random mini-batch — breaks temporal correlations
#    D: circular buffer of 1M transitions (Atari)

# 2. Target Network:
#    Separate network Q_θ⁻ for computing targets
#    Updated slowly: θ⁻ ← τθ + (1−τ)θ⁻  (soft update, τ=0.005)
#    Prevents feedback loops / oscillations

# DQN Loss:
L(θ) = 𝔼[(r + γ·max_{a'} Q_{θ⁻}(s',a') − Q_θ(s,a))²]
#             └─────── TD target (using old network) ─────┘

# DQN improvements:
# Double DQN: use online net for action selection, target net for evaluation
# Dueling DQN: split Q into V(s) + A(s,a) — advantage function
# Prioritised Experience Replay: sample important transitions more often
# Rainbow: all improvements combined`}</Code>
          <SectionTitle>Policy Gradient Methods</SectionTitle>
          <Code>{`# REINFORCE (Williams, 1992) — Monte Carlo Policy Gradient:
∇J(θ) = 𝔼_π[Σₜ ∇log π_θ(aₜ|sₜ) · Gₜ]

# Problem: high variance → add baseline b(s) to reduce variance:
∇J(θ) = 𝔼_π[Σₜ ∇log π_θ(aₜ|sₜ) · (Gₜ − b(sₜ))]

# Actor-Critic: b(sₜ) = V(sₜ) → Gₜ − V(sₜ) = advantage Aₜ
# Actor: ∇log π_θ(aₜ|sₜ) · Aₜ  (update policy)
# Critic: minimise (Gₜ − V_w(sₜ))²  (update value estimator)

# PPO (Proximal Policy Optimisation — OpenAI):
L^CLIP(θ) = 𝔼ₜ[min(rₜ(θ)·Âₜ, clip(rₜ(θ), 1−ε, 1+ε)·Âₜ)]
# rₜ(θ) = π_θ(aₜ|sₜ) / π_θₒₗd(aₜ|sₜ)  (probability ratio)
# clip: constrains ratio to [1−ε, 1+ε] — prevents large destructive updates
# Simple to implement; robust; default algorithm for many applications`}</Code>
        </>),
      },
    ],
  },

  /* ─── UNIT 9: MLOps & PRODUCTION ──────────────────────── */
  {
    unit: "Unit 9 · MLOps & Deployment",
    icon: <Database className="h-4 w-4" />,
    topics: [
      {
        title: "MLOps — From Experiment to Production",
        content: (<>
          <P1><strong>MLOps</strong> is a set of practices combining ML, DevOps, and Data Engineering to reliably deploy and maintain ML models in production at scale.</P1>
          <SectionTitle>MLOps Maturity Levels</SectionTitle>
          <Table headers={["Level","Description","Automation"]} rows={[
            ["Level 0","Manual process — notebook to manual deployment","None"],
            ["Level 1","ML pipeline automation — continuous training on new data","Pipeline automated"],
            ["Level 2","CI/CD for ML — automated testing, deployment, monitoring","Full CI/CD"],
          ]} />
          <SectionTitle>Key MLOps Tools</SectionTitle>
          <CardGrid items={[
            { title: "Experiment Tracking", body: "<strong>MLflow, Weights & Biases, Neptune</strong> — track params, metrics, artifacts, code version for every run.", color: "#3b82f6" },
            { title: "Data Versioning", body: "<strong>DVC (Data Version Control)</strong> — Git for large datasets and model files; stores pointers in git, data in S3/GCS.", color: "#10b981" },
            { title: "Feature Stores", body: "<strong>Feast, Tecton, Vertex AI Feature Store</strong> — consistent feature serving for training and inference; prevents training-serving skew.", color: "#f59e0b" },
            { title: "Model Registry", body: "<strong>MLflow Registry, SageMaker Registry</strong> — version and stage-manage models (Staging → Production → Archived).", color: "#8b5cf6" },
            { title: "Serving", body: "<strong>TorchServe, TF Serving, Triton, Ray Serve, BentoML</strong> — REST/gRPC endpoints; batching; model ensembles.", color: "#ef4444" },
            { title: "Monitoring", body: "<strong>Evidently AI, WhyLabs, Arize</strong> — detect data drift, concept drift, and performance degradation in production.", color: "#ec4899" },
          ]} />
          <SectionTitle>Model Compression & Optimisation</SectionTitle>
          <Table headers={["Technique","Method","Speedup","Accuracy Impact"]} rows={[
            ["Quantisation","FP32 → INT8/INT4 weights","2–4×","Minimal with calibration"],
            ["Pruning","Remove near-zero weights or channels","2–10×","Requires fine-tuning to recover"],
            ["Knowledge Distillation","Train small student to mimic large teacher","2–10×","Modest gap from teacher"],
            ["ONNX Export","Convert to hardware-neutral format","Depends on runtime","None"],
            ["TensorRT","NVIDIA GPU-optimised inference","3–10× vs PyTorch","None"],
          ]} />
        </>),
      },
    ],
  },

  /* ─── UNIT 10: AI ETHICS & SAFETY ─────────────────────── */
  {
    unit: "Unit 10 · AI Ethics & Safety",
    icon: <Shield className="h-4 w-4" />,
    topics: [
      {
        title: "Fairness, Explainability & Responsible AI",
        content: (<>
          <P1>Deploying AI without careful consideration of fairness, transparency, and safety can cause real harm. Responsible AI is not optional — it is a technical requirement for trustworthy systems.</P1>
          <SectionTitle>Types of Algorithmic Bias</SectionTitle>
          <Table headers={["Bias Type","Source","Real Example"]} rows={[
            ["Historical Bias","Training data reflects past discrimination","COMPAS recidivism model — higher false positive rate for Black defendants"],
            ["Representation Bias","Under-represented groups in training data","Face recognition — lower accuracy on darker skin tones (Buolamwini & Gebru 2018)"],
            ["Measurement Bias","Proxy features correlate with protected attributes","Credit score as proxy for race; zip code as proxy for income"],
            ["Aggregation Bias","One model applied to subgroups with different distributions","Medical model ignoring sex-based physiological differences"],
            ["Deployment Bias","Model used for different purpose than intended","NLP emotion classifier applied to hiring decisions"],
          ]} />
          <SectionTitle>Fairness Metrics</SectionTitle>
          <Code>{`# Demographic Parity:
P(ŷ=1 | A=0) = P(ŷ=1 | A=1)     # equal positive rate across groups

# Equal Opportunity:
P(ŷ=1 | y=1, A=0) = P(ŷ=1 | y=1, A=1)  # equal true positive rate

# Equalised Odds:
Equal opportunity AND equal false positive rate

# Individual Fairness:
Similar individuals receive similar predictions (requires similarity metric)

# Note: It is mathematically impossible to satisfy all fairness metrics simultaneously
# (Chouldechova 2017, Kleinberg et al. 2016) — must choose based on context`}</Code>
          <SectionTitle>Explainability Methods</SectionTitle>
          <Table headers={["Method","Type","Idea","Best For"]} rows={[
            ["LIME","Local, model-agnostic","Fit interpretable model around a single prediction","Any model; quick local explanations"],
            ["SHAP","Local+Global, model-agnostic","Shapley values: each feature's marginal contribution","Any model; theoretically grounded"],
            ["Integrated Gradients","Local, gradient-based","Attribution for deep learning by integrating gradients","Neural networks; images; text"],
            ["Attention Maps","Local, model-specific","Visualise attention weights in Transformers","Transformers (with caveats)"],
            ["Partial Dependence Plots","Global","Average effect of one feature holding others constant","Any model; feature effect"],
          ]} />
          <SectionTitle>AI Safety — Key Challenges</SectionTitle>
          <CardGrid items={[
            { title: "Alignment", body: "Ensuring AI systems pursue goals that humans actually want, not proxies. Reward hacking: model achieves high reward through unintended shortcuts.", color: "#ef4444" },
            { title: "Robustness", body: "Models must handle distribution shift, adversarial inputs, and edge cases. A stop sign with stickers fools CNNs (Carlini & Wagner 2017).", color: "#f59e0b" },
            { title: "Privacy", body: "Training data can be extracted from models (memorisation). Differential privacy adds calibrated noise to prevent individual data inference.", color: "#3b82f6" },
            { title: "Hallucination", body: "LLMs confidently produce factually wrong information. Retrieval-Augmented Generation (RAG) and grounding help reduce hallucination.", color: "#8b5cf6" },
          ]} />
        </>),
      },
    ],
  },
];

const ALL_TOPICS = UNITS.flatMap(u => u.topics.map(t => ({ ...t, unit: u.unit, unitIcon: u.icon })));

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AIMLTheoryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const topic = ALL_TOPICS[currentIndex];
  const progress = Math.round(((currentIndex + 1) / ALL_TOPICS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Source Sans Pro', sans-serif", background: "var(--alg-bg)", color: "var(--alg-text)" }}>
      {/* Navbar */}
      <header className="fixed top-0 w-full h-14 flex items-center justify-between px-6 border-b z-50 shadow-sm bg-white" style={{ borderColor: "var(--border-color)" }}>
        <Link href="/" className="font-black text-xl no-underline flex items-center gap-2" style={{ color: P }}>
          <Code2 className="h-6 w-6" /> AlgoLogic
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs font-semibold uppercase tracking-widest text-neutral-400">AI/ML Tutorial</span>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full overflow-hidden bg-gray-200">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: PU }} />
            </div>
            <span className="text-xs text-neutral-400 font-mono">{currentIndex + 1}/{ALL_TOPICS.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-100 text-neutral-500 transition-colors" title="Toggle sidebar">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Link href="/" className="text-sm font-semibold no-underline flex items-center gap-1.5 text-neutral-500 hover:text-[var(--alg-secondary)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
        </div>
      </header>

      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <nav className="w-64 min-w-[256px] border-r overflow-y-auto py-4 shrink-0 bg-white hidden md:block" style={{ borderColor: "var(--border-color)" }}>
            <p className="px-5 pb-3 text-xs font-black uppercase tracking-widest" style={{ color: PU }}>Contents</p>
            {UNITS.map(unit => (
              <div key={unit.unit} className="mb-1">
                <div className="flex items-center gap-2 px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  {unit.icon}<span>{unit.unit.split("·")[1]?.trim()}</span>
                </div>
                {unit.topics.map(t => {
                  const idx = ALL_TOPICS.findIndex(x => x.title === t.title && x.unit === unit.unit);
                  const active = idx === currentIndex;
                  const done = idx < currentIndex;
                  return (
                    <button key={t.title} onClick={() => setCurrentIndex(idx)}
                      className={`block w-full text-left py-1.5 pl-9 pr-3 text-xs transition-all border-l-2 ${active ? "font-bold" : done ? "font-medium text-neutral-400 border-transparent" : "font-normal border-transparent text-neutral-500 hover:bg-gray-50 hover:text-[var(--alg-text)]"}`}
                      style={active ? { background: PU + "12", color: PU, borderColor: PU } : {}}
                    >
                      {done && <span className="mr-1 text-green-500">✓</span>}{t.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-10 px-5 md:px-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: PU }}>{topic.unit}</p>
            <h1 className="text-3xl md:text-4xl font-black mb-1" style={{ color: P }}>{topic.title}</h1>
            <hr className="my-5" style={{ borderColor: "var(--border-color)" }} />
            <div>{topic.content}</div>

            {/* Prev / Next */}
            <div className="flex justify-between items-center mt-14 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button
                onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); window.scrollTo(0, 0); }}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: PU }}
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              {currentIndex < ALL_TOPICS.length - 1 ? (
                <button
                  onClick={() => { setCurrentIndex(i => i + 1); window.scrollTo(0, 0); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                  style={{ background: P }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <Link href="/quiz/aiml"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white no-underline transition-all hover:-translate-y-0.5"
                  style={{ background: "#16a34a" }}
                >
                  Take AI/ML Quiz →
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
