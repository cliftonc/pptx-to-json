/**
 * Table component parser for PowerPoint tables
 */

import { BaseParser } from './BaseParser.js';

export class TableParser extends BaseParser {

  /**
   * Parse table component from normalized data
   * @param {Object} tableComponent - Normalized table component
   * @param {number} componentIndex - Component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Object>} - Parsed table component
   */
  static async parseFromNormalized(tableComponent, componentIndex, slideIndex) {
    const { graphicData, spPr, nvGraphicFramePr, namespace } = tableComponent;
    
    if (!graphicData) {
      throw new Error('No graphicData found in normalized table component');
    }

    // Extract table data from tbl element
    const tableData = this.extractTableData(graphicData);
    if (!tableData || tableData.length === 0) {
      return null;
    }

    // Create richText structure matching client-side implementation
    const richText = this.createTableRichText(tableData, true); // Assume first row is header

    // Extract positioning from spPr (which should be the xfrm from graphicFrame)
    const transform = this.parseTransform(spPr); // spPr is actually xfrm for graphicFrame

    // Extract component info from nvGraphicFramePr
    const cNvPr = this.safeGet(nvGraphicFramePr, 'cNvPr');
    const componentName = this.safeGet(cNvPr, '$name') || `table-${componentIndex}`;

    // Calculate table dimensions
    const { rows, cols } = this.getTableDimensions(tableData);

    return {
      id: componentName,
      type: 'table',
      content: `Table (${rows} rows × ${cols} columns)`,
      x: transform.x,
      y: transform.y,
      width: transform.width,
      height: transform.height,
      rotation: transform.rotation,
      richText: richText, // Add richText property for TLDraw compatibility
      style: {
        borderColor: '#ffffff',
        backgroundColor: 'transparent'
      },
      metadata: {
        tableData: tableData,
        rows: rows,
        cols: cols,
        hasHeader: true,
        source: 'server-parsed',
        format: namespace || 'unknown'
      }
    };
  }

  /**
   * Extract table data from graphicData
   * @param {Object} graphicData - PowerPoint table graphic data
   * @returns {Array<Array<string>>} - 2D array of table cell text
   */
  static extractTableData(graphicData) {
    try {
      // The table structure is: graphicData -> tbl (namespace stripped already)
      const table = this.safeGet(graphicData, 'tbl');
      if (!table) {
        console.warn('No table element found in graphicData');
        return [];
      }

      // Get table rows - should be 'tr' (namespace stripped)
      const rows = this.safeGet(table, 'tr');
      if (!rows) {
        console.warn('No table rows found');
        return [];
      }

      const rowsArray = Array.isArray(rows) ? rows : [rows];
      const tableData = [];

      for (const row of rowsArray) {
        // Get table cells - should be 'tc' (namespace stripped)
        const cells = this.safeGet(row, 'tc');
        if (!cells) continue;

        const cellsArray = Array.isArray(cells) ? cells : [cells];
        const rowData = [];

        for (const cell of cellsArray) {
          // Extract text from cell - look for txBody (namespace stripped)
          const txBody = this.safeGet(cell, 'txBody');
          const cellText = this.extractCellText(txBody);
          rowData.push(cellText);
        }

        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      }

      return tableData;
    } catch (error) {
      console.error('Error extracting table data:', error);
      return [];
    }
  }

  /**
   * Extract text content from a table cell
   * @param {Object} txBody - Text body element
   * @returns {string} - Cell text content
   */
  static extractCellText(txBody) {
    if (!txBody) return '';

    try {
      // Get paragraphs (namespace stripped, so just 'p')
      const paragraphs = this.safeGet(txBody, 'p');
      if (!paragraphs) return '';

      const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      const textParts = [];

      for (const paragraph of paragraphsArray) {
        // Get runs (namespace stripped, so just 'r')
        const runs = this.safeGet(paragraph, 'r');
        if (runs) {
          const runsArray = Array.isArray(runs) ? runs : [runs];
          for (const run of runsArray) {
            const text = this.safeGet(run, 't');
            if (text && typeof text === 'string') {
              textParts.push(text.trim());
            }
          }
        }

        // Also check for direct text in paragraph
        const directText = this.safeGet(paragraph, 't');
        if (directText && typeof directText === 'string') {
          textParts.push(directText.trim());
        }
      }

      return textParts.join(' ').trim();
    } catch (error) {
      console.error('Error extracting cell text:', error);
      return '';
    }
  }

  /**
   * Create TipTap richText table structure matching client-side implementation
   * @param {Array<Array<string>>} tableData - 2D array of table cell text
   * @param {boolean} hasHeader - Whether first row is header
   * @returns {Object} - TipTap richText structure
   */
  static createTableRichText(tableData, hasHeader = true) {
    if (!tableData || tableData.length === 0) {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Empty table' }]
          }
        ]
      };
    }

    const tableRows = tableData.map((rowData, rowIndex) => {
      const isHeaderRow = hasHeader && rowIndex === 0;
      const cellType = isHeaderRow ? 'tableHeader' : 'tableCell';
      
      const cells = rowData.map((cellContent) => {
        const textContent = cellContent && cellContent.trim() ? cellContent : ' ';
        return {
          type: cellType,
          attrs: {
            colspan: 1,
            rowspan: 1,
            colwidth: null
          },
          content: [
            {
              type: 'paragraph',
              attrs: {
                dir: 'auto'
              },
              content: [
                {
                  type: 'text',
                  text: textContent
                }
              ]
            }
          ]
        };
      });

      return {
        type: 'tableRow',
        content: cells
      };
    });

    return {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: tableRows
        }
      ]
    };
  }

  /**
   * Get table dimensions
   * @param {Array<Array<string>>} tableData - Table data
   * @returns {Object} - {rows, cols}
   */
  static getTableDimensions(tableData) {
    if (!tableData || tableData.length === 0) {
      return { rows: 0, cols: 0 };
    }
    return {
      rows: tableData.length,
      cols: tableData[0]?.length || 0
    };
  }
}