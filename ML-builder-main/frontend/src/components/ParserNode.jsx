import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './NodeStyles.css';

const ParserNode = ({ data, id }) => {
  const [parsedContent, setParsedContent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processInput = async () => {
      // Check multiple possible data sources from connected nodes
      let fileToProcess = null;

      console.log('ParserNode: Checking inputData:', data?.inputData);

      if (data?.inputData) {
        // Search through all input data for a file
        const inputs = Object.values(data.inputData);
        for (const input of inputs) {
          console.log('ParserNode: Checking input:', input);

          // Check for raw-file type from FileNode
          if (input?.type === 'raw-file' && input?.file) {
            fileToProcess = input.file;
            console.log('ParserNode: Found raw-file:', fileToProcess.name);
            break;
          }
          // Check for direct file property
          else if (input?.file) {
            fileToProcess = input.file;
            console.log('ParserNode: Found direct file:', fileToProcess.name);
            break;
          }
        }
      }

      if (fileToProcess) {
        console.log('ParserNode: Processing file:', fileToProcess.name);
        setIsProcessing(true);
        setError(null);

        // Add visual feedback - mark node as running
        if (data.onChange) {
          data.onChange(id, { status: 'running' });
        }

        await processFile(fileToProcess);

        // Mark as completed
        if (data.onChange) {
          data.onChange(id, { status: 'completed' });
        }

        setIsProcessing(false);
      } else {
        console.log('ParserNode: No file found in inputData');
        // Reset state when no file is available
        setParsedContent(null);
        setError(null);
        setIsProcessing(false);

        // Reset status
        if (data.onChange) {
          data.onChange(id, { status: 'idle' });
        }
      }
    };

    processInput();
  }, [data?.inputData]);

  const processFile = async (file) => {
    try {
      // Read file content first
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      let result;

      if (file.name.endsWith('.csv')) {
        // Handle empty or malformed content
        if (!content || content.trim() === '') {
          throw new Error('File is empty or cannot be read');
        }

        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('No valid data found in CSV file');
        }

        // Parse headers - handle different delimiters
        let delimiter = ',';
        if (lines[0].includes(';')) delimiter = ';';
        else if (lines[0].includes('\t')) delimiter = '\t';

        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
        
        if (headers.length === 0) {
          throw new Error('No headers found in CSV file');
        }

        const rawData = lines.slice(1).map(line => {
          const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            const value = values[index] || '';
            // Enhanced type detection
            if (value === '' || value.toLowerCase() === 'null' || value.toLowerCase() === 'na') {
              row[header] = null;
            } else if (!isNaN(value) && !isNaN(parseFloat(value)) && value !== '') {
              row[header] = parseFloat(value);
            } else {
              row[header] = value;
            }
          });
          return row;
        });

        if (rawData.length === 0) {
          throw new Error('No data rows found in CSV file');
        }

        // Analyze column types for better segmentation
        const columnTypes = {};
        const numericColumns = [];
        const textColumns = [];
        const dateColumns = [];

        headers.forEach(header => {
          const sampleValues = rawData.slice(0, Math.min(10, rawData.length))
            .map(row => row[header])
            .filter(v => v !== null && v !== '');

          if (sampleValues.length === 0) {
            columnTypes[header] = 'empty';
            textColumns.push(header);
            return;
          }

          const numericCount = sampleValues.filter(v => typeof v === 'number').length;
          const dateCount = sampleValues.filter(v => {
            if (typeof v === 'string') {
              const date = new Date(v);
              return !isNaN(date.getTime()) && v.match(/\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}/);
            }
            return false;
          }).length;

          if (numericCount > sampleValues.length * 0.7) {
            columnTypes[header] = 'numeric';
            numericColumns.push(header);
          } else if (dateCount > sampleValues.length * 0.5) {
            columnTypes[header] = 'date';
            dateColumns.push(header);
          } else {
            columnTypes[header] = 'text';
            textColumns.push(header);
          }
        });

        result = {
          type: 'csv',
          headers,
          data: rawData,
          rowCount: rawData.length,
          columnCount: headers.length,
          columnTypes,
          numericColumns,
          textColumns,
          dateColumns,
          fileName: file.name,
          fileSize: file.size,
          summary: {
            totalRows: rawData.length,
            totalColumns: headers.length,
            numericColumns: numericColumns.length,
            textColumns: textColumns.length,
            dateColumns: dateColumns.length,
            hasNumericData: numericColumns.length > 0,
            hasTextData: textColumns.length > 0,
            hasDateData: dateColumns.length > 0
          }
        };
      } else if (file.name.endsWith('.json')) {
        result = { data: JSON.parse(content), type: 'json' };
      } else {
        result = { data: content, type: 'text' };
      }

      setParsedContent(result);

      const outputData = {
        type: 'parsed-data',
        fileName: file.name,
        ...result,
        timestamp: Date.now()
      };

      if (data.onChange) {
        data.onChange(id, { parsedContent: result, outputData });
      }

      if (window.dataFlowManager) {
        window.dataFlowManager.propagateData(id, outputData);
      }
    } catch (error) {
      setParsedContent({ error: error.message });
      setError(error.message);
    }
  };

  const renderPreview = () => {
    if (error) {
      return <div className="parser-error" style={{ color: '#ef4444', fontSize: '12px', padding: '8px' }}>{error}</div>;
    }

    if (!parsedContent) {
      return <div className="parser-waiting" style={{ padding: '8px', color: '#6b7280', fontSize: '12px' }}>Waiting for file input...</div>;
    }

    if (parsedContent.error) {
      return <div className="parser-error" style={{ color: '#ef4444', fontSize: '12px', padding: '8px' }}>{parsedContent.error}</div>;
    }

    // Show summary instead of full data when parsed successfully
    if (parsedContent.type === 'csv') {
      return (
        <div className="parser-summary" style={{ padding: '8px', fontSize: '11px' }}>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="summary-label" style={{ color: '#6b7280' }}>📄 File:</span>
            <span className="summary-value" style={{ color: '#374151', fontWeight: '500' }}>{parsedContent.fileName}</span>
          </div>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="summary-label" style={{ color: '#6b7280' }}>📊 Rows:</span>
            <span className="summary-value" style={{ color: '#374151', fontWeight: '500' }}>{parsedContent.rowCount.toLocaleString()}</span>
          </div>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="summary-label" style={{ color: '#6b7280' }}>📋 Columns:</span>
            <span className="summary-value" style={{ color: '#374151', fontWeight: '500' }}>{parsedContent.columnCount}</span>
          </div>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="summary-label" style={{ color: '#6b7280' }}>🔢 Numeric:</span>
            <span className="summary-value" style={{ color: '#374151', fontWeight: '500' }}>{parsedContent.numericColumns.length}</span>
          </div>
          <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="summary-label" style={{ color: '#6b7280' }}>📝 Text:</span>
            <span className="summary-value" style={{ color: '#374151', fontWeight: '500' }}>{parsedContent.textColumns.length}</span>
          </div>
          {parsedContent.dateColumns && parsedContent.dateColumns.length > 0 && (
            <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="summary-label" style={{ color: '#6b7280' }}>📅 Dates:</span>
              <span className="summary-value" style={{ color: '#374151', fontWeight: '500' }}>{parsedContent.dateColumns.length}</span>
            </div>
          )}
          <div className="summary-status" style={{ textAlign: 'center', marginTop: '8px', padding: '4px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '10px' }}>
            ✅ Ready for ML processing
          </div>
        </div>
      );
    }

    if (parsedContent.type === 'json') {
      return (
        <div className="parser-summary">
          <div className="summary-item">
            <span className="summary-label">📄 File:</span>
            <span className="summary-value">{parsedContent.fileName}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">📊 Type:</span>
            <span className="summary-value">{parsedContent.structure || 'object'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">📋 Items:</span>
            <span className="summary-value">{parsedContent.itemCount || 'N/A'}</span>
          </div>
          <div className="summary-status">
            ✅ Ready for processing
          </div>
        </div>
      );
    }

    if (parsedContent.type === 'text') {
      return (
        <div className="parser-summary">
          <div className="summary-item">
            <span className="summary-label">📄 File:</span>
            <span className="summary-value">{parsedContent.fileName}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">📝 Characters:</span>
            <span className="summary-value">{parsedContent.characterCount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">📄 Lines:</span>
            <span className="summary-value">{parsedContent.lineCount || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🔤 Words:</span>
            <span className="summary-value">{parsedContent.wordCount || 'N/A'}</span>
          </div>
          <div className="summary-status">
            ✅ Ready for processing
          </div>
        </div>
      );
    }

    return <div className="parser-summary">Unsupported format</div>;
  };

  // Get execution status for visual feedback
  const status = isProcessing ? 'running' : error ? 'error' : parsedContent ? 'completed' : 'idle';
  const statusColors = {
    idle: '#e5e7eb',
    running: '#fbbf24',
    completed: '#10b981',
    error: '#ef4444'
  };

  return (
    <div className={`custom-node parser-node ${status}`}>
      <div className="node-header">
        <div className="node-icon">🛠️</div>
        <div className="node-title">File Parser</div>
        {status !== 'idle' && (
          <div
            className="status-indicator"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColors[status],
              marginLeft: 'auto',
              animation: status === 'running' ? 'pulse 1.5s infinite' : 'none'
            }}
          />
        )}
      </div>

      <div className="node-content">
        {isProcessing ? (
          <div className="processing-indicator" style={{ color: '#fbbf24', fontSize: '12px' }}>
            🔄 Processing file...
          </div>
        ) : (
          renderPreview()
        )}
      </div>

      <Handle type="target" position={Position.Left} id="parser-input" className="handle-input" />
      <Handle type="source" position={Position.Right} id="parser-output" className="handle-output" />
    </div>
  );
};

export default ParserNode;
