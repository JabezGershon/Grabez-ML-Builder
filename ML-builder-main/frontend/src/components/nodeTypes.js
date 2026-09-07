import TextNode from "./TextNode";
import ParserNode from "./ParserNode";
import ChatOutputNode from "./ChatOutputNode";
import FileNode from "./FileNode";
import DataVizNode from "./DataVizNode";
import DecisionTreeNode from "./DecisionTreeNode";
import LinearRegressionNode from "./LinearRegressionNode";
import LogisticRegressionNode from "./LogisticRegressionNode";

const nodeTypes = {
  textNode: TextNode,
  parserNode: ParserNode,
  chatOutputNode: ChatOutputNode,
  fileNode: FileNode,
  dataVizNode: DataVizNode,
  decisionTreeNode: DecisionTreeNode,
  linearRegressionNode: LinearRegressionNode,
  logisticRegressionNode: LogisticRegressionNode,
};

// Optional configs if you’re generating nodes dynamically
export const nodeConfigs = {
  file: {
    label: 'File Input',
    icon: '📁',
    category: 'Inputs',
    defaultData: { file: null, fileName: '' }
  },
  parser: {
    label: 'Parser',
    icon: '🗂️',
    category: 'Processing',
    defaultData: { parsedData: null }
  },
  text: {
    label: 'Text Input',
    icon: '📝',
    category: 'Inputs',
    defaultData: { text: '' }
  },
  chat: {
    label: 'Chat Input',
    icon: '💬',
    category: 'Inputs',
    defaultData: { message: '', chatHistory: [] }
  },
  linreg: {
    label: 'Linear Regression',
    icon: '📈',
    category: 'ML',
    defaultData: { 
      config: { targetColumn: '', testSize: 0.2, randomState: 42 },
      results: null 
    }
  },
  logreg: {
    label: 'Logistic Regression',
    icon: '🎯',
    category: 'ML',
    defaultData: { 
      config: { targetColumn: '', testSize: 0.2, randomState: 42, maxIter: 1000 },
      results: null 
    }
  },
  tree: {
    label: 'Decision Tree',
    icon: '🌳',
    category: 'ML',
    defaultData: { 
      config: { targetColumn: '', testSize: 0.2, randomState: 42, maxDepth: null, minSamplesSplit: 2 },
      results: null 
    }
  },
  chatout: {
    label: 'Chat Output',
    icon: '💭',
    category: 'Outputs',
    defaultData: { messages: [] }
  },
  viz: {
    label: 'Data Visualization',
    icon: '📊',
    category: 'Outputs',
    defaultData: { vizData: null }
  }
};

export default nodeTypes;
