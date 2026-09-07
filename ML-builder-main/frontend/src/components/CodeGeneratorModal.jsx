import React, { useState } from 'react';
import './CodeGeneratorModal.css';

const CodeGeneratorModal = ({ isOpen, onClose, nodes, edges }) => {
  const [generatedCode, setGeneratedCode] = useState('');

  React.useEffect(() => {
    if (isOpen && nodes.length > 0) {
      const code = generatePythonCode(nodes, edges);
      setGeneratedCode(code);
    }
  }, [isOpen, nodes, edges]);

  const generatePythonCode = (nodes, edges) => {
    // Create a map for node lookup
    const nodeMap = {};
    nodes.forEach(node => {
      nodeMap[node.id] = node;
    });

    // Find file and ML nodes - Support all ML algorithms
    const fileNode = nodes.find(n => n.type === 'fileNode');
    const mlNodes = nodes.filter(n => [
      'linearRegression', 'logisticRegression', 'decisionTree', 'randomForest', 'supportVectorMachine',
      'kNearestNeighbors', 'gaussianNaiveBayes', 'multinomialNaiveBayes', 
      'kMeansClustering', 'dbscanClustering', 'gaussianMixture',
      'principalComponentAnalysis', 'tSNE', 'umap'
    ].includes(n.type));
    
    if (!fileNode) {
      return '# Error: No file input found in the workflow';
    }

    if (mlNodes.length === 0) {
      return '# Error: No ML algorithms found in the workflow';
    }

    // Generate code for the first ML node (primary algorithm)
    const primaryMLNode = mlNodes[0];
    const fileName = fileNode.data?.fileName || 'data.csv';
    
    return generateSimpleMLCode(primaryMLNode, fileName);
  };

  const generateSimpleMLCode = (mlNode, fileName) => {
    const config = mlNode.data?.config || {};
    const targetColumn = config.targetColumn || 'price';
    const algorithm = mlNode.type;

    let code = '';

    // Generate advanced imports based on algorithm
    switch (algorithm) {
      case 'linearRegression':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'logisticRegression':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score, roc_curve
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'decisionTree':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, plot_tree
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error, classification_report, confusion_matrix
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'randomForest':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error, classification_report, confusion_matrix, feature_importance
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'supportVectorMachine':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.svm import SVC, SVR
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'kNearestNeighbors':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'gaussianNaiveBayes':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'multinomialNaiveBayes':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.feature_extraction.text import TfidfVectorizer
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'kMeansClustering':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, adjusted_rand_score, normalized_mutual_info_score
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'dbscanClustering':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, adjusted_rand_score, normalized_mutual_info_score
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'gaussianMixture':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, adjusted_rand_score, normalized_mutual_info_score
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'principalComponentAnalysis':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'tSNE':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

`;
        break;
      case 'umap':
        code += `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import umap.umap_ as umap
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

`;
        break;
    }

    // Advanced data loading and preprocessing
    code += `# ============ DATA LOADING & EXPLORATION ============
print("🔍 Loading and exploring dataset...")

# Load CSV file (replace with your filename)
data = pd.read_csv("${fileName}")

# Dataset overview
print(f"Dataset shape: {data.shape}")
print(f"Columns: {list(data.columns)}")
print("\\n📊 Dataset Info:")
print(data.info())

print("\\n📈 Statistical Summary:")
print(data.describe())

# Show first few rows
print("\\n🔍 First 5 rows:")
print(data.head())

# Check for missing values
print("\\n❌ Missing values:")
missing_values = data.isnull().sum()
print(missing_values[missing_values > 0])

# ============ DATA PREPROCESSING ============
print("\\n🔧 Data preprocessing...")

# Handle missing values with advanced techniques
numeric_columns = data.select_dtypes(include=[np.number]).columns
categorical_columns = data.select_dtypes(include=['object']).columns

# Fill missing numeric values with median
for col in numeric_columns:
    if data[col].isnull().sum() > 0:
        data[col] = data[col].fillna(data[col].median())
        print(f"Filled {col} missing values with median")

# Fill missing categorical values with mode
for col in categorical_columns:
    if data[col].isnull().sum() > 0:
        data[col] = data[col].fillna(data[col].mode()[0] if not data[col].mode().empty else 'Unknown')
        print(f"Filled {col} missing values with mode")

# Feature engineering - create new features from existing ones
if '${targetColumn}' in data.columns:
    print(f"\\n🎯 Target column '{targetColumn}' found")
else:
    print(f"\\n⚠️ Target column '{targetColumn}' not found. Available columns: {list(data.columns)}")
    
# Encode categorical variables if needed
label_encoders = {}
for col in categorical_columns:
    if col != '${targetColumn}':
        le = LabelEncoder()
        data[f'{col}_encoded'] = le.fit_transform(data[col])
        label_encoders[col] = le
        print(f"Encoded categorical column: {col}")

# Features and target selection
feature_columns = [col for col in data.select_dtypes(include=[np.number]).columns if col != '${targetColumn}']
print(f"\\n📋 Selected features: {feature_columns}")

X = data[feature_columns]  # independent variables
y = data['${targetColumn}']    # dependent variable (target)

print(f"Features shape: {X.shape}")
print(f"Target shape: {y.shape}")

# Feature scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=feature_columns)

# Train-test split with stratification if classification
test_size = ${config.testSize || 0.2}
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, 
    test_size=test_size, 
    random_state=42,
    ${algorithm === 'logisticRegression' ? 'stratify=y if len(np.unique(y)) <= 10 else None' : '# No stratification for regression'}
)

print(f"\\n📊 Train set: {X_train.shape}, Test set: {X_test.shape}")

`;

    // Advanced model training and evaluation
    switch (algorithm) {
      case 'linearRegression':
        code += `# ============ ADVANCED LINEAR REGRESSION ============
print("\\n🤖 Training Advanced Linear Regression Models...")

# Multiple regression models with hyperparameter tuning
models = {
    'Linear Regression': LinearRegression(),
    'Ridge Regression': Ridge(),
    'Lasso Regression': Lasso(),
    'Elastic Net': ElasticNet()
}

# Grid search for hyperparameters
ridge_params = {'alpha': [0.1, 1.0, 10.0, 100.0]}
lasso_params = {'alpha': [0.01, 0.1, 1.0, 10.0]}
elastic_params = {'alpha': [0.01, 0.1, 1.0], 'l1_ratio': [0.1, 0.5, 0.9]}

best_models = {}
results = {}

# Train and evaluate each model
for name, model in models.items():
    print(f"\\n🔄 Training {name}...")
    
    if name == 'Ridge Regression':
        grid_search = GridSearchCV(model, ridge_params, cv=5, scoring='r2')
        grid_search.fit(X_train, y_train)
        best_model = grid_search.best_estimator_
        print(f"Best alpha for Ridge: {grid_search.best_params_['alpha']}")
    elif name == 'Lasso Regression':
        grid_search = GridSearchCV(model, lasso_params, cv=5, scoring='r2')
        grid_search.fit(X_train, y_train)
        best_model = grid_search.best_estimator_
        print(f"Best alpha for Lasso: {grid_search.best_params_['alpha']}")
    elif name == 'Elastic Net':
        grid_search = GridSearchCV(model, elastic_params, cv=5, scoring='r2')
        grid_search.fit(X_train, y_train)
        best_model = grid_search.best_estimator_
        print(f"Best params for Elastic Net: {grid_search.best_params_}")
    else:
        best_model = model
        best_model.fit(X_train, y_train)
    
    best_models[name] = best_model
    
    # Cross-validation scores
    cv_scores = cross_val_score(best_model, X_train, y_train, cv=5, scoring='r2')
    
    # Predictions
    y_pred = best_model.predict(X_test)
    
    # Evaluation metrics
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    
    results[name] = {
        'R² Score': r2,
        'MSE': mse,
        'RMSE': rmse,
        'MAE': mae,
        'CV Mean R²': cv_scores.mean(),
        'CV Std R²': cv_scores.std(),
        'Predictions': y_pred
    }
    
    print(f"{name} Results:")
    print(f"  R² Score: {r2:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  MAE: {mae:.4f}")
    print(f"  Cross-Val R² (mean ± std): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Find best performing model
best_model_name = max(results.keys(), key=lambda x: results[x]['R² Score'])
print(f"\\n🏆 Best Model: {best_model_name} with R² = {results[best_model_name]['R² Score']:.4f}")

# ============ VISUALIZATIONS ============
print("\\n📊 Creating visualizations...")

# 1. Model comparison
plt.figure(figsize=(15, 10))

# Subplot 1: Model performance comparison
plt.subplot(2, 3, 1)
model_names = list(results.keys())
r2_scores = [results[name]['R² Score'] for name in model_names]
colors = ['blue', 'green', 'red', 'orange']
bars = plt.bar(model_names, r2_scores, color=colors)
plt.title('Model Performance Comparison (R² Score)')
plt.ylabel('R² Score')
plt.xticks(rotation=45)
plt.ylim(0, 1)
for bar, score in zip(bars, r2_scores):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
             f'{score:.3f}', ha='center', va='bottom')

# Subplot 2: Actual vs Predicted (Best Model)
plt.subplot(2, 3, 2)
best_pred = results[best_model_name]['Predictions']
plt.scatter(y_test, best_pred, alpha=0.7, color='blue', s=50)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', linewidth=2)
plt.xlabel(f"Actual ${targetColumn}")
plt.ylabel(f"Predicted ${targetColumn}")
plt.title(f'{best_model_name} - Prediction vs Actual')

# Subplot 3: Residual plot
plt.subplot(2, 3, 3)
residuals = y_test - best_pred
plt.scatter(best_pred, residuals, alpha=0.7, color='green')
plt.axhline(y=0, color='r', linestyle='--')
plt.xlabel(f"Predicted ${targetColumn}")
plt.ylabel("Residuals")
plt.title('Residual Plot')

# Subplot 4: Feature importance (coefficients)
plt.subplot(2, 3, 4)
best_model_obj = best_models[best_model_name]
if hasattr(best_model_obj, 'coef_'):
    feature_importance = abs(best_model_obj.coef_)
    feature_names = feature_columns[:len(feature_importance)]
    plt.barh(feature_names, feature_importance)
    plt.xlabel('|Coefficient|')
    plt.title(f'{best_model_name} - Feature Importance')

# Subplot 5: Learning curve
plt.subplot(2, 3, 5)
rmse_scores = [results[name]['RMSE'] for name in model_names]
plt.bar(model_names, rmse_scores, color=colors)
plt.title('RMSE Comparison')
plt.ylabel('RMSE')
plt.xticks(rotation=45)

# Subplot 6: Cross-validation scores
plt.subplot(2, 3, 6)
cv_means = [results[name]['CV Mean R²'] for name in model_names]
cv_stds = [results[name]['CV Std R²'] for name in model_names]
plt.errorbar(range(len(model_names)), cv_means, yerr=cv_stds, fmt='o-', capsize=5)
plt.xticks(range(len(model_names)), model_names, rotation=45)
plt.ylabel('Cross-Validation R² Score')
plt.title('Cross-Validation Performance')

plt.tight_layout()
plt.show()

# ============ ADVANCED ANALYSIS ============
print("\\n🔬 Advanced Analysis...")

# Feature correlation heatmap
plt.figure(figsize=(10, 8))
correlation_matrix = data[feature_columns + ['${targetColumn}']].corr()
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, square=True)
plt.title('Feature Correlation Matrix')
plt.show()

# Model interpretability
print(f"\\n📋 {best_model_name} Model Details:")
best_model_obj = best_models[best_model_name]
if hasattr(best_model_obj, 'coef_'):
    print("Feature coefficients:")
    for feature, coef in zip(feature_columns, best_model_obj.coef_):
        print(f"  {feature}: {coef:.4f}")
if hasattr(best_model_obj, 'intercept_'):
    print(f"Intercept: {best_model_obj.intercept_:.4f}")
`;
        break;
      case 'logisticRegression':
        code += `# ============ ADVANCED LOGISTIC REGRESSION ============
print("\\n🤖 Training Advanced Logistic Regression Models...")

# Detect if binary or multiclass classification
unique_classes = np.unique(y)
is_binary = len(unique_classes) == 2
print(f"Classification type: {'Binary' if is_binary else 'Multiclass'}")
print(f"Classes: {unique_classes}")

# Multiple logistic regression models with hyperparameter tuning
models = {
    'Logistic Regression (L2)': LogisticRegression(random_state=42, max_iter=1000),
    'Logistic Regression (L1)': LogisticRegression(penalty='l1', solver='liblinear', random_state=42),
    'Logistic Regression (Elastic Net)': LogisticRegression(penalty='elasticnet', solver='saga', l1_ratio=0.5, random_state=42, max_iter=1000)
}

# Grid search parameters
param_grids = {
    'Logistic Regression (L2)': {'C': [0.01, 0.1, 1, 10, 100]},
    'Logistic Regression (L1)': {'C': [0.01, 0.1, 1, 10, 100]},
    'Logistic Regression (Elastic Net)': {'C': [0.1, 1, 10], 'l1_ratio': [0.1, 0.5, 0.9]}
}

best_models = {}
results = {}

# Train and evaluate each model
for name, model in models.items():
    print(f"\\n🔄 Training {name}...")
    
    try:
        # Grid search with cross-validation
        grid_search = GridSearchCV(
            model, 
            param_grids[name], 
            cv=5, 
            scoring='accuracy',
            n_jobs=-1
        )
        grid_search.fit(X_train, y_train)
        best_model = grid_search.best_estimator_
        print(f"Best parameters: {grid_search.best_params_}")
        
    except Exception as e:
        print(f"Grid search failed for {name}, using default parameters: {e}")
        best_model = model
        best_model.fit(X_train, y_train)
    
    best_models[name] = best_model
    
    # Cross-validation scores
    cv_scores = cross_val_score(best_model, X_train, y_train, cv=5, scoring='accuracy')
    
    # Predictions
    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)
    
    # Evaluation metrics
    accuracy = accuracy_score(y_test, y_pred)
    
    results[name] = {
        'Accuracy': accuracy,
        'CV Mean Accuracy': cv_scores.mean(),
        'CV Std Accuracy': cv_scores.std(),
        'Predictions': y_pred,
        'Probabilities': y_pred_proba
    }
    
    # Additional metrics for binary classification
    if is_binary:
        auc_score = roc_auc_score(y_test, y_pred_proba[:, 1])
        results[name]['AUC Score'] = auc_score
        print(f"  AUC Score: {auc_score:.4f}")
    
    print(f"{name} Results:")
    print(f"  Accuracy: {accuracy:.4f}")
    print(f"  Cross-Val Accuracy (mean ± std): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Find best performing model
best_model_name = max(results.keys(), key=lambda x: results[x]['Accuracy'])
print(f"\\n🏆 Best Model: {best_model_name} with Accuracy = {results[best_model_name]['Accuracy']:.4f}")

# ============ DETAILED EVALUATION ============
print("\\n📊 Detailed Evaluation for Best Model...")

best_model_obj = best_models[best_model_name]
best_pred = results[best_model_name]['Predictions']

# Classification report
print(f"\\n📋 Classification Report for {best_model_name}:")
print(classification_report(y_test, best_pred))

# Confusion Matrix
cm = confusion_matrix(y_test, best_pred)
print(f"\\nConfusion Matrix:")
print(cm)

# ============ VISUALIZATIONS ============
print("\\n📊 Creating advanced visualizations...")

plt.figure(figsize=(20, 15))

# Subplot 1: Model performance comparison
plt.subplot(3, 4, 1)
model_names = list(results.keys())
accuracies = [results[name]['Accuracy'] for name in model_names]
colors = ['blue', 'green', 'red']
bars = plt.bar(model_names, accuracies, color=colors)
plt.title('Model Accuracy Comparison')
plt.ylabel('Accuracy')
plt.xticks(rotation=45)
plt.ylim(0, 1)
for bar, acc in zip(bars, accuracies):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
             f'{acc:.3f}', ha='center', va='bottom')

# Subplot 2: Confusion Matrix Heatmap
plt.subplot(3, 4, 2)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=unique_classes, yticklabels=unique_classes)
plt.title(f'{best_model_name} - Confusion Matrix')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')

# Subplot 3: Feature importance
plt.subplot(3, 4, 3)
if hasattr(best_model_obj, 'coef_'):
    if len(unique_classes) == 2:
        feature_importance = abs(best_model_obj.coef_[0])
    else:
        feature_importance = np.mean(np.abs(best_model_obj.coef_), axis=0)
    
    feature_names = feature_columns[:len(feature_importance)]
    indices = np.argsort(feature_importance)[-10:]  # Top 10 features
    plt.barh(range(len(indices)), feature_importance[indices])
    plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
    plt.xlabel('|Coefficient|')
    plt.title(f'{best_model_name} - Top Features')

# Subplot 4: ROC Curve (for binary classification)
if is_binary:
    plt.subplot(3, 4, 4)
    for name in model_names:
        if 'AUC Score' in results[name]:
            y_proba = results[name]['Probabilities'][:, 1]
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            auc = results[name]['AUC Score']
            plt.plot(fpr, tpr, label=f'{name} (AUC = {auc:.3f})')
    
    plt.plot([0, 1], [0, 1], 'k--', label='Random')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curves')
    plt.legend()
    plt.grid(True)

# Subplot 5: Cross-validation scores
plt.subplot(3, 4, 5)
cv_means = [results[name]['CV Mean Accuracy'] for name in model_names]
cv_stds = [results[name]['CV Std Accuracy'] for name in model_names]
plt.errorbar(range(len(model_names)), cv_means, yerr=cv_stds, fmt='o-', capsize=5)
plt.xticks(range(len(model_names)), model_names, rotation=45)
plt.ylabel('Cross-Validation Accuracy')
plt.title('Cross-Validation Performance')

# Subplot 6: Prediction probability distribution
plt.subplot(3, 4, 6)
best_proba = results[best_model_name]['Probabilities']
if is_binary:
    plt.hist(best_proba[:, 1], bins=20, alpha=0.7, edgecolor='black')
    plt.xlabel('Predicted Probability (Class 1)')
    plt.ylabel('Frequency')
    plt.title('Prediction Probability Distribution')
else:
    for i, class_label in enumerate(unique_classes):
        plt.hist(best_proba[:, i], bins=15, alpha=0.5, label=f'Class {class_label}')
    plt.xlabel('Predicted Probability')
    plt.ylabel('Frequency')
    plt.title('Prediction Probability Distribution')
    plt.legend()

# Feature correlation with target
plt.subplot(3, 4, 7)
if len(feature_columns) <= 20:  # Only for manageable number of features
    target_correlations = []
    for col in feature_columns:
        if data[col].dtype in ['int64', 'float64']:
            corr = abs(np.corrcoef(data[col], data['${targetColumn}'])[0, 1])
            target_correlations.append(corr if not np.isnan(corr) else 0)
        else:
            target_correlations.append(0)
    
    indices = np.argsort(target_correlations)[-10:]  # Top 10 correlations
    plt.barh(range(len(indices)), [target_correlations[i] for i in indices])
    plt.yticks(range(len(indices)), [feature_columns[i] for i in indices])
    plt.xlabel('|Correlation with Target|')
    plt.title('Feature-Target Correlations')

plt.tight_layout()
plt.show()

# ============ MODEL INTERPRETABILITY ============
print(f"\\n🔬 Model Interpretability - {best_model_name}:")

if hasattr(best_model_obj, 'coef_'):
    print("\\n📋 Feature Coefficients:")
    if len(unique_classes) == 2:
        coeffs = best_model_obj.coef_[0]
        for feature, coef in zip(feature_columns, coeffs):
            print(f"  {feature}: {coef:.4f}")
    else:
        print("Coefficients for each class:")
        for i, class_label in enumerate(unique_classes):
            print(f"\\n  Class {class_label}:")
            for feature, coef in zip(feature_columns, best_model_obj.coef_[i]):
                print(f"    {feature}: {coef:.4f}")

if hasattr(best_model_obj, 'intercept_'):
    print(f"\\nIntercept(s): {best_model_obj.intercept_}")

# Class distribution
print(f"\\n📊 Class Distribution:")
class_counts = np.bincount(y_train)
for i, count in enumerate(class_counts):
    if i < len(unique_classes):
        print(f"  Class {unique_classes[i]}: {count} ({count/len(y_train)*100:.1f}%)")
`;
        break;
      case 'decisionTree':
        code += `# ============ ADVANCED DECISION TREE ANALYSIS ============
print("\\n🌳 Training Advanced Decision Tree Models...")

# Detect problem type (classification vs regression)
unique_target_values = np.unique(y)
is_classification = len(unique_target_values) <= 20 and not np.issubdtype(y.dtype, np.floating)

if is_classification:
    print(f"📊 Classification task detected with {len(unique_target_values)} classes: {unique_target_values}")
else:
    print(f"📈 Regression task detected with continuous target values")

# Advanced models with ensemble methods
if is_classification:
    models = {
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100),
        'Optimized Decision Tree': DecisionTreeClassifier(random_state=42)
    }
    
    param_grids = {
        'Decision Tree': {
            'max_depth': [3, 5, 7, 10, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'criterion': ['gini', 'entropy']
        },
        'Random Forest': {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, None],
            'min_samples_split': [2, 5],
            'min_samples_leaf': [1, 2]
        },
        'Optimized Decision Tree': {
            'max_depth': [3, 5, 7, 10],
            'min_samples_split': [2, 5, 10],
            'criterion': ['gini', 'entropy'],
            'max_features': ['sqrt', 'log2', None]
        }
    }
    
else:
    models = {
        'Decision Tree': DecisionTreeRegressor(random_state=42),
        'Random Forest': RandomForestRegressor(random_state=42, n_estimators=100),
        'Optimized Decision Tree': DecisionTreeRegressor(random_state=42)
    }
    
    param_grids = {
        'Decision Tree': {
            'max_depth': [3, 5, 7, 10, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        },
        'Random Forest': {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, None],
            'min_samples_split': [2, 5],
            'min_samples_leaf': [1, 2]
        },
        'Optimized Decision Tree': {
            'max_depth': [3, 5, 7, 10],
            'min_samples_split': [2, 5, 10],
            'max_features': ['sqrt', 'log2', None]
        }
    }

best_models = {}
results = {}

# Train and optimize each model
for name, model in models.items():
    print(f"\\n🔄 Training and optimizing {name}...")
    
    try:
        # Grid search for hyperparameter optimization
        scoring = 'accuracy' if is_classification else 'r2'
        grid_search = GridSearchCV(
            model, 
            param_grids[name], 
            cv=5, 
            scoring=scoring,
            n_jobs=-1,
            verbose=0
        )
        grid_search.fit(X_train, y_train)
        best_model = grid_search.best_estimator_
        print(f"Best parameters: {grid_search.best_params_}")
        
    except Exception as e:
        print(f"Grid search failed for {name}, using default parameters: {e}")
        best_model = model
        best_model.fit(X_train, y_train)
    
    best_models[name] = best_model
    
    # Cross-validation scores
    cv_scores = cross_val_score(best_model, X_train, y_train, cv=5, scoring=scoring)
    
    # Predictions
    y_pred = best_model.predict(X_test)
    
    if is_classification:
        # Classification metrics
        accuracy = accuracy_score(y_test, y_pred)
        results[name] = {
            'Accuracy': accuracy,
            'CV Mean Score': cv_scores.mean(),
            'CV Std Score': cv_scores.std(),
            'Predictions': y_pred
        }
        print(f"  Accuracy: {accuracy:.4f}")
        print(f"  Cross-Val Accuracy (mean ± std): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
        
        if hasattr(best_model, 'get_depth'):
            print(f"  Tree depth: {best_model.get_depth()}")
        elif hasattr(best_model, 'estimators_'):
            depths = [tree.get_depth() for tree in best_model.estimators_]
            print(f"  Average tree depth: {np.mean(depths):.1f}")
            
    else:
        # Regression metrics
        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        
        results[name] = {
            'R² Score': r2,
            'MSE': mse,
            'RMSE': rmse,
            'CV Mean Score': cv_scores.mean(),
            'CV Std Score': cv_scores.std(),
            'Predictions': y_pred
        }
        print(f"  R² Score: {r2:.4f}")
        print(f"  RMSE: {rmse:.4f}")
        print(f"  Cross-Val R² (mean ± std): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
        
        if hasattr(best_model, 'get_depth'):
            print(f"  Tree depth: {best_model.get_depth()}")

# Find best performing model
if is_classification:
    best_model_name = max(results.keys(), key=lambda x: results[x]['Accuracy'])
    print(f"\\n🏆 Best Model: {best_model_name} with Accuracy = {results[best_model_name]['Accuracy']:.4f}")
else:
    best_model_name = max(results.keys(), key=lambda x: results[x]['R² Score'])
    print(f"\\n🏆 Best Model: {best_model_name} with R² = {results[best_model_name]['R² Score']:.4f}")

# ============ DETAILED EVALUATION ============
print("\\n📊 Detailed evaluation...")

best_model_obj = best_models[best_model_name]
best_pred = results[best_model_name]['Predictions']

if is_classification:
    print(f"\\n📋 Classification Report for {best_model_name}:")
    print(classification_report(y_test, best_pred))
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, best_pred)
    print(f"\\nConfusion Matrix:")
    print(cm)

# ============ ADVANCED VISUALIZATIONS ============
print("\\n📊 Creating comprehensive visualizations...")

plt.figure(figsize=(20, 15))

# Subplot 1: Model performance comparison
plt.subplot(3, 4, 1)
model_names = list(results.keys())
if is_classification:
    scores = [results[name]['Accuracy'] for name in model_names]
    metric_name = 'Accuracy'
else:
    scores = [results[name]['R² Score'] for name in model_names]
    metric_name = 'R² Score'

colors = ['lightgreen', 'lightblue', 'lightcoral']
bars = plt.bar(model_names, scores, color=colors)
plt.title(f'Model {metric_name} Comparison')
plt.ylabel(metric_name)
plt.xticks(rotation=45)
for bar, score in zip(bars, scores):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
             f'{score:.3f}', ha='center', va='bottom')

# Subplot 2: Feature importance
plt.subplot(3, 4, 2)
if hasattr(best_model_obj, 'feature_importances_'):
    feature_importance = best_model_obj.feature_importances_
    feature_names = feature_columns[:len(feature_importance)]
    
    # Sort features by importance
    indices = np.argsort(feature_importance)[-10:]  # Top 10 features
    plt.barh(range(len(indices)), feature_importance[indices])
    plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
    plt.xlabel('Feature Importance')
    plt.title(f'{best_model_name} - Feature Importance')

# Subplot 3: Prediction vs Actual
plt.subplot(3, 4, 3)
if is_classification:
    # Confusion matrix heatmap
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=unique_target_values, yticklabels=unique_target_values)
    plt.title(f'{best_model_name} - Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
else:
    # Regression scatter plot
    plt.scatter(y_test, best_pred, alpha=0.7, color='green', s=50)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', linewidth=2)
    plt.xlabel(f'Actual {targetColumn}')
    plt.ylabel(f'Predicted {targetColumn}')
    plt.title(f'{best_model_name} - Prediction vs Actual')

# Subplot 4: Cross-validation scores
plt.subplot(3, 4, 4)
cv_means = [results[name]['CV Mean Score'] for name in model_names]
cv_stds = [results[name]['CV Std Score'] for name in model_names]
plt.errorbar(range(len(model_names)), cv_means, yerr=cv_stds, fmt='o-', capsize=5)
plt.xticks(range(len(model_names)), model_names, rotation=45)
plt.ylabel(f'Cross-Validation {metric_name}')
plt.title('Cross-Validation Performance')

# Subplot 5: Learning curve simulation
plt.subplot(3, 4, 5)
if hasattr(best_model_obj, 'feature_importances_'):
    # Feature importance distribution
    importance_values = best_model_obj.feature_importances_
    plt.hist(importance_values, bins=15, alpha=0.7, edgecolor='black')
    plt.xlabel('Feature Importance')
    plt.ylabel('Frequency')
    plt.title('Feature Importance Distribution')

# Subplot 6: Tree depth analysis (for single trees)
plt.subplot(3, 4, 6)
if hasattr(best_model_obj, 'get_depth'):
    # Tree complexity analysis
    depths = []
    accuracies = []
    for depth in range(1, 11):
        if is_classification:
            temp_model = DecisionTreeClassifier(max_depth=depth, random_state=42)
        else:
            temp_model = DecisionTreeRegressor(max_depth=depth, random_state=42)
        
        temp_model.fit(X_train, y_train)
        pred = temp_model.predict(X_test)
        
        if is_classification:
            score = accuracy_score(y_test, pred)
        else:
            score = r2_score(y_test, pred)
        
        depths.append(depth)
        accuracies.append(score)
    
    plt.plot(depths, accuracies, 'o-', linewidth=2, markersize=6)
    plt.xlabel('Tree Depth')
    plt.ylabel(metric_name)
    plt.title(f'Tree Depth vs {metric_name}')
    plt.grid(True, alpha=0.3)

# Subplot 7: Residual analysis (for regression) or class distribution
plt.subplot(3, 4, 7)
if not is_classification:
    residuals = y_test - best_pred
    plt.scatter(best_pred, residuals, alpha=0.7, color='red')
    plt.axhline(y=0, color='black', linestyle='--')
    plt.xlabel(f'Predicted {targetColumn}')
    plt.ylabel('Residuals')
    plt.title('Residual Plot')
else:
    # Class distribution
    unique_values, counts = np.unique(y_train, return_counts=True)
    plt.bar(range(len(unique_values)), counts, color='skyblue')
    plt.xticks(range(len(unique_values)), unique_values)
    plt.xlabel('Class')
    plt.ylabel('Frequency')
    plt.title('Class Distribution in Training Set')

plt.tight_layout()
plt.show()

# ============ TREE VISUALIZATION ============
if hasattr(best_model_obj, 'get_depth') and best_model_obj.get_depth() <= 5:
    print("\\n🌳 Decision Tree Visualization...")
    plt.figure(figsize=(20, 10))
    
    plot_tree(
        best_model_obj, 
        feature_names=feature_columns,
        class_names=[str(c) for c in unique_target_values] if is_classification else None,
        filled=True, 
        rounded=True,
        fontsize=10
    )
    plt.title(f'{best_model_name} - Decision Tree Structure (depth: {best_model_obj.get_depth()})')
    plt.show()
else:
    print("\\n🌳 Tree too complex for visualization or is an ensemble model")

# ============ MODEL INTERPRETABILITY ============
print(f"\\n🔬 Model Interpretability - {best_model_name}:")

if hasattr(best_model_obj, 'feature_importances_'):
    print("\\n📊 Top Feature Importances:")
    feature_imp = list(zip(feature_columns, best_model_obj.feature_importances_))
    feature_imp.sort(key=lambda x: x[1], reverse=True)
    
    for feature, importance in feature_imp[:10]:  # Top 10 features
        print(f"  {feature}: {importance:.4f}")

if hasattr(best_model_obj, 'get_depth'):
    print(f"\\nTree Complexity:")
    print(f"  Max Depth: {best_model_obj.get_depth()}")
    print(f"  Number of Leaves: {best_model_obj.get_n_leaves()}")
elif hasattr(best_model_obj, 'estimators_'):
    print(f"\\nEnsemble Complexity:")
    print(f"  Number of Trees: {len(best_model_obj.estimators_)}")
    depths = [tree.get_depth() for tree in best_model_obj.estimators_]
    leaves = [tree.get_n_leaves() for tree in best_model_obj.estimators_]
    print(f"  Average Tree Depth: {np.mean(depths):.1f} ± {np.std(depths):.1f}")
    print(f"  Average Leaves per Tree: {np.mean(leaves):.1f} ± {np.std(leaves):.1f}")

# Performance summary
if is_classification:
    print(f"\\n📈 Final Performance Summary:")
    print(f"  Best Model: {best_model_name}")
    print(f"  Test Accuracy: {results[best_model_name]['Accuracy']:.4f}")
    print(f"  Number of Classes: {len(unique_target_values)}")
    print(f"  Training Samples: {len(X_train)}")
    print(f"  Test Samples: {len(X_test)}")
else:
    print(f"\\n📈 Final Performance Summary:")
    print(f"  Best Model: {best_model_name}")
    print(f"  Test R² Score: {results[best_model_name]['R² Score']:.4f}")
    print(f"  Test RMSE: {results[best_model_name]['RMSE']:.4f}")
    print(f"  Training Samples: {len(X_train)}")
    print(f"  Test Samples: {len(X_test)}")
`;
        break;

      case 'randomForest':
        code += `# ============ ADVANCED RANDOM FOREST ANALYSIS ============
print("\\n🌲 Training Advanced Random Forest Models...")

# Detect problem type (classification vs regression)
unique_target_values = np.unique(y)
is_classification = len(unique_target_values) <= 20 and not np.issubdtype(y.dtype, np.floating)

if is_classification:
    print(f"📊 Classification task detected with {len(unique_target_values)} classes: {unique_target_values}")
    models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'Extra Trees': RandomForestClassifier(random_state=42, criterion='entropy'),
        'Balanced Random Forest': RandomForestClassifier(random_state=42, class_weight='balanced')
    }
else:
    print(f"📈 Regression task detected with continuous target values")
    models = {
        'Random Forest': RandomForestRegressor(random_state=42),
        'Extra Trees': RandomForestRegressor(random_state=42)
    }

best_models = {}
results = {}

for name, model in models.items():
    print(f"\\n🔄 Training {name}...")
    
    # Hyperparameter optimization
    if 'Extra Trees' in name:
        model.set_params(n_estimators=200, max_features='sqrt')
    else:
        model.set_params(n_estimators=100, max_depth=10)
    
    # Training
    model.fit(X_train, y_train)
    best_models[name] = model
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy' if is_classification else 'r2')
    
    # Predictions
    y_pred = model.predict(X_test)
    
    if is_classification:
        accuracy = accuracy_score(y_test, y_pred)
        results[name] = {'Accuracy': accuracy, 'CV Mean': cv_scores.mean(), 'Predictions': y_pred}
        print(f"  Accuracy: {accuracy:.4f}")
    else:
        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        results[name] = {'R² Score': r2, 'RMSE': rmse, 'CV Mean': cv_scores.mean(), 'Predictions': y_pred}
        print(f"  R² Score: {r2:.4f}, RMSE: {rmse:.4f}")

# Feature importance analysis
best_model_name = list(models.keys())[0]
best_model_obj = best_models[best_model_name]

print("\\n🔍 Feature Importance Analysis:")
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': best_model_obj.feature_importances_
}).sort_values('importance', ascending=False)

print(feature_importance.head(10))
`;
        break;

      case 'supportVectorMachine':
        code += `# ============ ADVANCED SUPPORT VECTOR MACHINE ============
print("\\n🎯 Training Advanced Support Vector Machine Models...")

# Multiple SVM kernels
models = {
    'Linear SVM': SVC(kernel='linear', random_state=42),
    'RBF SVM': SVC(kernel='rbf', random_state=42),
    'Polynomial SVM': SVC(kernel='poly', degree=3, random_state=42)
}

best_models = {}
results = {}

for name, model in models.items():
    print(f"\\n🔄 Training {name}...")
    
    # Grid search for C parameter
    param_grid = {'C': [0.1, 1, 10, 100]}
    grid_search = GridSearchCV(model, param_grid, cv=5, scoring='accuracy')
    grid_search.fit(X_train, y_train)
    
    best_model = grid_search.best_estimator_
    best_models[name] = best_model
    print(f"Best C: {grid_search.best_params_['C']}")
    
    # Evaluation
    y_pred = best_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = {'Accuracy': accuracy, 'Predictions': y_pred}
    print(f"  Accuracy: {accuracy:.4f}")

print("\\n🏆 Best SVM Model Results:")
best_model_name = max(results.keys(), key=lambda x: results[x]['Accuracy'])
print(f"Best Model: {best_model_name} with Accuracy: {results[best_model_name]['Accuracy']:.4f}")
`;
        break;

      case 'kNearestNeighbors':
        code += `# ============ ADVANCED K-NEAREST NEIGHBORS ============
print("\\n👥 Training Advanced K-Nearest Neighbors Models...")

# Test different k values
k_values = [3, 5, 7, 9, 11, 15]
models = {}

for k in k_values:
    models[f'KNN (k={k})'] = KNeighborsClassifier(n_neighbors=k)

best_models = {}
results = {}

for name, model in models.items():
    print(f"\\n🔄 Training {name}...")
    
    # Training
    model.fit(X_train, y_train)
    best_models[name] = model
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    
    # Evaluation
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = {'Accuracy': accuracy, 'CV Mean': cv_scores.mean(), 'Predictions': y_pred}
    print(f"  Accuracy: {accuracy:.4f} (CV: {cv_scores.mean():.4f})")

# Find optimal k
best_model_name = max(results.keys(), key=lambda x: results[x]['Accuracy'])
optimal_k = int(best_model_name.split('k=')[1].split(')')[0])
print(f"\\n🏆 Optimal k = {optimal_k} with Accuracy: {results[best_model_name]['Accuracy']:.4f}")
`;
        break;

      case 'gaussianNaiveBayes':
        code += `# ============ ADVANCED GAUSSIAN NAIVE BAYES ============
print("\\n📊 Training Gaussian Naive Bayes Model...")

# Model training
model = GaussianNB()
model.fit(X_train, y_train)

# Cross-validation
cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')

# Predictions
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)

# Evaluation
accuracy = accuracy_score(y_test, y_pred)
print(f"\\n📈 Gaussian Naive Bayes Results:")
print(f"  Accuracy: {accuracy:.4f}")
print(f"  Cross-Val Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Classification report
print("\\n📋 Classification Report:")
print(classification_report(y_test, y_pred))
`;
        break;

      case 'multinomialNaiveBayes':
        code += `# ============ ADVANCED MULTINOMIAL NAIVE BAYES ============
print("\\n📊 Training Multinomial Naive Bayes Model...")

# Ensure all features are non-negative (required for MultinomialNB)
X_train_positive = X_train - X_train.min() + 1
X_test_positive = X_test - X_test.min() + 1

# Model training
model = MultinomialNB()
model.fit(X_train_positive, y_train)

# Cross-validation
cv_scores = cross_val_score(model, X_train_positive, y_train, cv=5, scoring='accuracy')

# Predictions
y_pred = model.predict(X_test_positive)

# Evaluation
accuracy = accuracy_score(y_test, y_pred)
print(f"\\n📈 Multinomial Naive Bayes Results:")
print(f"  Accuracy: {accuracy:.4f}")
print(f"  Cross-Val Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
`;
        break;

      case 'kMeansClustering':
        code += `# ============ ADVANCED K-MEANS CLUSTERING ============
print("\\n🎯 Performing Advanced K-Means Clustering Analysis...")

# Determine optimal number of clusters using elbow method
max_k = min(10, len(X_scaled) // 2)
k_range = range(2, max_k + 1)
inertias = []
silhouette_scores = []

for k in k_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(X_scaled)
    inertias.append(kmeans.inertia_)
    sil_score = silhouette_score(X_scaled, cluster_labels)
    silhouette_scores.append(sil_score)
    print(f"k={k}: Silhouette Score = {sil_score:.3f}")

# Find optimal k using silhouette score
optimal_k = k_range[np.argmax(silhouette_scores)]
print(f"\\n🏆 Optimal number of clusters: {optimal_k}")

# Final clustering with optimal k
kmeans_final = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
final_labels = kmeans_final.fit_predict(X_scaled)

# Clustering evaluation
final_silhouette = silhouette_score(X_scaled, final_labels)
print(f"\\n📊 Final Clustering Results:")
print(f"  Number of Clusters: {optimal_k}")
print(f"  Silhouette Score: {final_silhouette:.4f}")
print(f"  Inertia: {kmeans_final.inertia_:.2f}")

# Cluster centers analysis
print(f"\\n🎯 Cluster Centers (first 5 features):")
centers = pd.DataFrame(kmeans_final.cluster_centers_, columns=feature_columns)
print(centers.iloc[:, :5])
`;
        break;

      case 'dbscanClustering':
        code += `# ============ ADVANCED DBSCAN CLUSTERING ============
print("\\n🎯 Performing Advanced DBSCAN Clustering Analysis...")

# Parameter tuning for DBSCAN
eps_values = [0.3, 0.5, 0.7, 1.0]
min_samples_values = [5, 10, 15]

best_score = -1
best_params = {}

for eps in eps_values:
    for min_samples in min_samples_values:
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        cluster_labels = dbscan.fit_predict(X_scaled)
        
        # Skip if all points are noise or only one cluster
        n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
        if n_clusters > 1:
            sil_score = silhouette_score(X_scaled, cluster_labels)
            if sil_score > best_score:
                best_score = sil_score
                best_params = {'eps': eps, 'min_samples': min_samples}
                print(f"eps={eps}, min_samples={min_samples}: {n_clusters} clusters, Silhouette = {sil_score:.3f}")

if best_params:
    # Final clustering with best parameters
    dbscan_final = DBSCAN(**best_params)
    final_labels = dbscan_final.fit_predict(X_scaled)
    
    n_clusters = len(set(final_labels)) - (1 if -1 in final_labels else 0)
    n_noise = list(final_labels).count(-1)
    
    print(f"\\n🏆 Best DBSCAN Results:")
    print(f"  Best Parameters: {best_params}")
    print(f"  Number of Clusters: {n_clusters}")
    print(f"  Number of Noise Points: {n_noise}")
    print(f"  Silhouette Score: {best_score:.4f}")
else:
    print("\\n⚠️ Could not find suitable DBSCAN parameters")
`;
        break;

      case 'gaussianMixture':
        code += `# ============ ADVANCED GAUSSIAN MIXTURE MODEL ============
print("\\n🎯 Training Advanced Gaussian Mixture Models...")

# Test different numbers of components
n_components_range = range(2, min(8, len(X_scaled) // 10))
models = {}
scores = {}

for n in n_components_range:
    model = GaussianMixture(n_components=n, random_state=42)
    model.fit(X_scaled)
    
    # BIC and AIC scores (lower is better)
    bic_score = model.bic(X_scaled)
    aic_score = model.aic(X_scaled)
    
    # Silhouette score for cluster labels
    labels = model.predict(X_scaled)
    sil_score = silhouette_score(X_scaled, labels)
    
    models[n] = model
    scores[n] = {'BIC': bic_score, 'AIC': aic_score, 'Silhouette': sil_score}
    print(f"Components={n}: BIC={bic_score:.2f}, AIC={aic_score:.2f}, Silhouette={sil_score:.3f}")

# Select best model based on silhouette score
best_n = max(scores.keys(), key=lambda x: scores[x]['Silhouette'])
best_model = models[best_n]

print(f"\\n🏆 Best Gaussian Mixture Model:")
print(f"  Number of Components: {best_n}")
print(f"  Silhouette Score: {scores[best_n]['Silhouette']:.4f}")
print(f"  BIC Score: {scores[best_n]['BIC']:.2f}")

# Final predictions
final_labels = best_model.predict(X_scaled)
probabilities = best_model.predict_proba(X_scaled)

print(f"  Cluster Distribution: {np.bincount(final_labels)}")
`;
        break;

      case 'principalComponentAnalysis':
        code += `# ============ ADVANCED PRINCIPAL COMPONENT ANALYSIS ============
print("\\n🎯 Performing Advanced PCA Analysis...")

# Full PCA to analyze variance explained
pca_full = PCA()
pca_full.fit(X_scaled)

# Calculate cumulative explained variance
cumsum_var = np.cumsum(pca_full.explained_variance_ratio_)
n_components_95 = np.argmax(cumsum_var >= 0.95) + 1
n_components_90 = np.argmax(cumsum_var >= 0.90) + 1

print(f"\\n📊 PCA Variance Analysis:")
print(f"  Total Features: {X_scaled.shape[1]}")
print(f"  Components for 90% variance: {n_components_90}")
print(f"  Components for 95% variance: {n_components_95}")

# Apply PCA with optimal number of components
optimal_components = n_components_90
pca_optimal = PCA(n_components=optimal_components)
X_pca = pca_optimal.fit_transform(X_scaled)

print(f"\\n🎯 Optimal PCA Results:")
print(f"  Reduced from {X_scaled.shape[1]} to {optimal_components} dimensions")
print(f"  Variance Explained: {np.sum(pca_optimal.explained_variance_ratio_):.4f}")

# Component analysis
print("\\n📈 Top Principal Components:")
for i in range(min(5, optimal_components)):
    print(f"  PC{i+1}: {pca_optimal.explained_variance_ratio_[i]:.4f} variance")
    
    # Show most important features for this component
    feature_importance = abs(pca_optimal.components_[i])
    top_features = np.argsort(feature_importance)[-3:][::-1]
    print(f"    Top features: {[feature_columns[j] for j in top_features]}")
`;
        break;

      case 'tSNE':
        code += `# ============ ADVANCED t-SNE ANALYSIS ============
print("\\n🎯 Performing Advanced t-SNE Analysis...")

# Test different perplexity values
perplexity_values = [5, 10, 30, 50]
results = {}

for perplexity in perplexity_values:
    if perplexity < len(X_scaled):  # Perplexity must be less than number of samples
        print(f"\\n🔄 Running t-SNE with perplexity={perplexity}...")
        
        tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, n_iter=1000)
        X_tsne = tsne.fit_transform(X_scaled)
        
        # Calculate trustworthiness (measure of how well local structure is preserved)
        # For this we'll use a simple measure: average distance preservation
        results[perplexity] = {
            'embedding': X_tsne,
            'kl_divergence': tsne.kl_divergence_
        }
        
        print(f"  KL Divergence: {tsne.kl_divergence_:.2f}")

# Select best perplexity (lowest KL divergence)
best_perplexity = min(results.keys(), key=lambda x: results[x]['kl_divergence'])
best_embedding = results[best_perplexity]['embedding']

print(f"\\n🏆 Best t-SNE Results:")
print(f"  Best Perplexity: {best_perplexity}")
print(f"  Final KL Divergence: {results[best_perplexity]['kl_divergence']:.2f}")
print(f"  Reduced to 2D embedding with shape: {best_embedding.shape}")

# Add t-SNE results to original data for visualization
tsne_df = pd.DataFrame(best_embedding, columns=['t-SNE-1', 't-SNE-2'])
print("\\n📊 t-SNE embedding statistics:")
print(tsne_df.describe())
`;
        break;

      case 'umap':
        code += `# ============ ADVANCED UMAP ANALYSIS ============
print("\\n🎯 Performing Advanced UMAP Analysis...")

# Test different UMAP parameters
n_neighbors_values = [5, 15, 50]
min_dist_values = [0.1, 0.25, 0.5]
results = {}

for n_neighbors in n_neighbors_values:
    for min_dist in min_dist_values:
        print(f"\\n🔄 Running UMAP with n_neighbors={n_neighbors}, min_dist={min_dist}...")
        
        reducer = umap.UMAP(
            n_components=2, 
            n_neighbors=n_neighbors,
            min_dist=min_dist,
            random_state=42
        )
        
        X_umap = reducer.fit_transform(X_scaled)
        
        # Store results
        param_key = f"n{n_neighbors}_d{min_dist}"
        results[param_key] = {
            'embedding': X_umap,
            'n_neighbors': n_neighbors,
            'min_dist': min_dist
        }
        
        print(f"  Embedding shape: {X_umap.shape}")

# Use default best parameters (n_neighbors=15, min_dist=0.1)
best_key = "n15_d0.1"
if best_key in results:
    best_embedding = results[best_key]['embedding']
    best_params = {'n_neighbors': 15, 'min_dist': 0.1}
else:
    # Use first available result
    best_key = list(results.keys())[0]
    best_embedding = results[best_key]['embedding']
    best_params = {'n_neighbors': results[best_key]['n_neighbors'], 'min_dist': results[best_key]['min_dist']}

print(f"\\n🏆 Selected UMAP Results:")
print(f"  Parameters: {best_params}")
print(f"  Embedding shape: {best_embedding.shape}")

# Add UMAP results to original data
umap_df = pd.DataFrame(best_embedding, columns=['UMAP-1', 'UMAP-2'])
print("\\n📊 UMAP embedding statistics:")
print(umap_df.describe())
`;
        break;
    }

    return code;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      alert('Code copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Code copied to clipboard!');
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ml_pipeline.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="code-generator-overlay">
      <div className="code-generator-modal">
        <div className="code-generator-header">
          <h2>🐍 Generated Python Code</h2>
          <div className="code-generator-actions">
            <button onClick={copyToClipboard} className="copy-btn">
              📋 Copy
            </button>
            <button onClick={downloadCode} className="download-btn">
              💾 Download
            </button>
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </div>
        
        <div className="code-generator-content">
          <pre className="code-preview">
            <code>{generatedCode}</code>
          </pre>
        </div>
        
        <div className="code-generator-footer">
          <p>💡 Generated code requires dependencies. Install with:</p>
          <code className="install-command">pip install pandas numpy scikit-learn matplotlib seaborn plotly</code>
        </div>
      </div>
    </div>
  );
};

export default CodeGeneratorModal;
