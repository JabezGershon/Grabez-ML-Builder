// IMPROVED N/A HANDLING UTILITY
// Utility functions to safely display ML results and handle N/A values

export const MLResultsFormatter = {
  // Format percentage values safely
  formatPercentage: (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'Not Available';
    }
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Format decimal values safely
  formatDecimal: (value, decimals = 4) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'Not Available';
    }
    return value.toFixed(decimals);
  },

  // Format integer values safely
  formatInteger: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'Not Available';
    }
    return Math.round(value).toString();
  },

  // Format array length safely
  formatArrayLength: (array) => {
    if (!array || !Array.isArray(array)) {
      return 'Not Available';
    }
    return array.length.toString();
  },

  // Format string values safely
  formatString: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not Available';
    }
    return value.toString();
  },

  // Check if a value is valid (not null, undefined, or NaN)
  isValidValue: (value) => {
    return value !== null && value !== undefined && !isNaN(value);
  },

  // Check if an array is valid
  isValidArray: (array) => {
    return array && Array.isArray(array) && array.length > 0;
  },

  // Get safe value with fallback
  getSafeValue: (value, fallback = 'Not Available') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'number' && isNaN(value)) {
      return fallback;
    }
    return value;
  }
};

// ML-specific formatters
export const MLMetrics = {
  // Format accuracy for classification
  formatAccuracy: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.accuracy)) {
      return MLResultsFormatter.formatPercentage(results.accuracy);
    }
    return 'Not Available';
  },

  // Format R² score for regression
  formatR2Score: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.r2Score)) {
      return MLResultsFormatter.formatPercentage(results.r2Score);
    }
    if (results && MLResultsFormatter.isValidValue(results.r2_score)) {
      return MLResultsFormatter.formatPercentage(results.r2_score);
    }
    return 'Not Available';
  },

  // Format precision
  formatPrecision: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.precision)) {
      return MLResultsFormatter.formatPercentage(results.precision);
    }
    return 'Not Available';
  },

  // Format recall
  formatRecall: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.recall)) {
      return MLResultsFormatter.formatPercentage(results.recall);
    }
    return 'Not Available';
  },

  // Format F1 Score
  formatF1Score: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.f1Score)) {
      return MLResultsFormatter.formatPercentage(results.f1Score);
    }
    if (results && MLResultsFormatter.isValidValue(results.f1_score)) {
      return MLResultsFormatter.formatPercentage(results.f1_score);
    }
    return 'Not Available';
  },

  // Format MSE
  formatMSE: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.mse)) {
      return MLResultsFormatter.formatDecimal(results.mse);
    }
    return 'Not Available';
  },

  // Format RMSE
  formatRMSE: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.rmse)) {
      return MLResultsFormatter.formatDecimal(results.rmse);
    }
    return 'Not Available';
  },

  // Format MAE
  formatMAE: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.mae)) {
      return MLResultsFormatter.formatDecimal(results.mae);
    }
    return 'Not Available';
  },

  // Format silhouette score for clustering
  formatSilhouetteScore: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.silhouetteScore)) {
      return MLResultsFormatter.formatDecimal(results.silhouetteScore, 4);
    }
    return 'Not Available';
  },

  // Format inertia for K-Means
  formatInertia: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.inertia)) {
      return MLResultsFormatter.formatDecimal(results.inertia, 2);
    }
    return 'Not Available';
  },

  // Format predictions count
  formatPredictionsCount: (results) => {
    if (results && MLResultsFormatter.isValidArray(results.predictions)) {
      return MLResultsFormatter.formatArrayLength(results.predictions);
    }
    return 'Not Available';
  },

  // Format cross-validation score
  formatCVScore: (results) => {
    const mean = results?.cvMeanScore || results?.cvMean;
    const std = results?.cvStdScore || results?.cvStd;
    
    if (MLResultsFormatter.isValidValue(mean) && MLResultsFormatter.isValidValue(std)) {
      return `${MLResultsFormatter.formatDecimal(mean)} ± ${MLResultsFormatter.formatDecimal(std)}`;
    }
    if (MLResultsFormatter.isValidValue(mean)) {
      return MLResultsFormatter.formatDecimal(mean);
    }
    return 'Not Available';
  },

  // Format data points count
  formatDataPoints: (results) => {
    if (results && MLResultsFormatter.isValidValue(results.dataPoints)) {
      return MLResultsFormatter.formatInteger(results.dataPoints);
    }
    return 'Not Available';
  },

  // Format algorithm name
  formatAlgorithmName: (results) => {
    if (results && results.algorithm) {
      return MLResultsFormatter.formatString(results.algorithm);
    }
    if (results && results.bestModel) {
      return MLResultsFormatter.formatString(results.bestModel);
    }
    return 'Not Available';
  }
};

export default { MLResultsFormatter, MLMetrics };
