// src/components/index.js
import ChatInputNode from "./ChatInputNode";
import ChatOutputNode from "./ChatOutputNode";
import DataVizNode from "./DataVizNode";
import DecisionTreeNode from "./DecisionTreeNode";
import FileNode from "./FileNode";
import LinearRegressionNode from "./LinearRegressionNode";
import LogisticRegressionNode from "./LogisticRegressionNode";
import RandomForestNode from "./RandomForestNode";
import SVMNode from "./SVMNode";
import KNNNode from "./KNNNode";
import KMeansNode from "./KMeansNode";
import PCANode from "./PCANode";
import GaussianNBNode from "./GaussianNBNode";
import MultinomialNBNode from "./MultinomialNBNode";
import DBSCANNode from "./DBSCANNode";
import GaussianMixtureNode from "./GaussianMixtureNode";
import TSNENode from "./TSNENode";
import UMAPNode from "./UMAPNode";
import ParserNode from "./ParserNode";
import TextNode from "./TextNode";
import ImageNode from "./ImageNode";
import LoggerNode from "./LoggerNode";

import MLNode from "./MLNode";

export const nodeTypes = {
  chatInputNode: ChatInputNode,
  chatOutputNode: ChatOutputNode,
  dataVizNode: DataVizNode,
  linearRegression: LinearRegressionNode,
  logisticRegression: LogisticRegressionNode,
  decisionTree: DecisionTreeNode,
  randomForest: RandomForestNode,
  supportVectorMachine: SVMNode,
  kNearestNeighbors: KNNNode,
  gaussianNaiveBayes: GaussianNBNode,
  multinomialNaiveBayes: MultinomialNBNode,
  kMeansClustering: KMeansNode,
  dbscanClustering: DBSCANNode,
  gaussianMixture: GaussianMixtureNode,
  principalComponentAnalysis: PCANode,
  tSNE: TSNENode,
  umap: UMAPNode,
  loggerNode: LoggerNode,
  fileNode: FileNode,
  parserNode: ParserNode,
  textNode: TextNode,
  imageNode: ImageNode,
};

// Enhanced node configurations with comprehensive ML algorithms
export const nodeConfigs = {
  // === INPUT NODES ===
  fileNode: { defaultData: { label: "📁 File Upload" }, category: "🔧 Input Nodes" },
  textNode: { defaultData: { label: "📝 Text Input" }, category: "🔧 Input Nodes" },
  chatInputNode: { defaultData: { label: "💬 Chat Input" }, category: "🔧 Input Nodes" },
  imageNode: { defaultData: { label: "🖼️ Image Input" }, category: "🔧 Input Nodes" },
  
  // === PREPROCESSING NODES ===
  parserNode: { defaultData: { label: "🔍 Data Parser" }, category: "⚙️ Preprocessing" },
  
  // === 🎯 SUPERVISED LEARNING ===
  // Linear Models
  linearRegression: { defaultData: { label: "📈 Linear Regression" }, category: "📊 Linear Models" },
  logisticRegression: { defaultData: { label: "📊 Logistic Regression" }, category: "📊 Linear Models" },
  
  // Tree-Based Models  
  decisionTree: { defaultData: { label: "🌳 Decision Tree" }, category: "🌲 Tree-Based Models" },
  randomForest: { defaultData: { label: "🌲 Random Forest" }, category: "🌲 Tree-Based Models" },
  
  // Support Vector Machines
  supportVectorMachine: { defaultData: { label: "⚡ Support Vector Machine" }, category: "⚡ Support Vector Machines" },
  
  // Instance-Based & Probabilistic Learning
  kNearestNeighbors: { defaultData: { label: "🎯 K-Nearest Neighbors" }, category: "🧠 Instance-Based & Probabilistic" },
  gaussianNaiveBayes: { defaultData: { label: "🎰 Gaussian Naive Bayes" }, category: "🧠 Instance-Based & Probabilistic" },
  multinomialNaiveBayes: { defaultData: { label: "🎲 Multinomial Naive Bayes" }, category: "🧠 Instance-Based & Probabilistic" },
  
  // === 🔮 UNSUPERVISED LEARNING ===
  // Clustering Algorithms
  kMeansClustering: { defaultData: { label: "🎭 K-Means Clustering" }, category: "🎪 Clustering" },
  dbscanClustering: { defaultData: { label: "🎪 DBSCAN Clustering" }, category: "🎪 Clustering" },
  gaussianMixture: { defaultData: { label: "🎭 Gaussian Mixture Model" }, category: "🎪 Clustering" },
  
  // Dimensionality Reduction
  principalComponentAnalysis: { defaultData: { label: "🔄 Principal Component Analysis" }, category: "📉 Dimensionality Reduction" },
  tSNE: { defaultData: { label: "🌀 t-SNE" }, category: "📉 Dimensionality Reduction" },
  umap: { defaultData: { label: "🗺️ UMAP" }, category: "📉 Dimensionality Reduction" },
  
  // === OUTPUT NODES ===
  dataVizNode: { defaultData: { label: "📊 Data Visualization" }, category: "📈 Output Nodes" },
  chatOutputNode: { defaultData: { label: "💬 Chat Output" }, category: "📈 Output Nodes" },
  loggerNode: { defaultData: { label: "📋 Debug Logger" }, category: "📈 Output Nodes" },
};
