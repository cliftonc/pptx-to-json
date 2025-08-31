/**
 * Table component parser for PowerPoint tables
 */

import { BaseParser } from './BaseParser.js';

export class TableParser extends BaseParser {
  /**
   * Parse a table component from PowerPoint shape data
   * @param {Object} graphicFrame - Graphic frame containing table data
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed table component
   */
  static parse(graphicFrame, index = 0) {
    try {
      // Check if graphic frame contains a table
      const table = this.safeGet(graphicFrame, 'a:graphic.a:graphicData.a:tbl');
      if (!table) return null;

      // Get transform information
      const xfrm = this.safeGet(graphicFrame, 'p:xfrm');
      const transform = this.parseTransform(xfrm);

      // Skip if table has no dimensions
      if (transform.width === 0 && transform.height === 0) return null;

      // Parse table structure
      const tableGrid = this.parseTableGrid(table);
      const tableRows = this.parseTableRows(table);
      const tableStyle = this.parseTableStyle(table);

      // Calculate actual content
      const content = this.generateTableContent(tableRows);

      return {
        id: this.generateId('table', index),
        type: 'table',
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: content,
        style: {
          backgroundColor: tableStyle.backgroundColor,
          borderColor: tableStyle.borderColor,
          borderWidth: tableStyle.borderWidth,
          borderStyle: tableStyle.borderStyle,
          opacity: 1
        },
        metadata: {
          rows: tableRows.length,
          cols: tableGrid.columns.length,
          columnWidths: tableGrid.columns,
          tableData: tableRows,
          hasHeader: tableStyle.hasHeader,
          tableName: this.getTableName(graphicFrame)
        }
      };

    } catch (error) {
      console.warn('Error parsing table component:', error);
      return null;
    }
  }

  /**
   * Parse table grid (column definitions)
   * @param {Object} table - Table data
   * @returns {Object} grid information
   */
  static parseTableGrid(table) {
    const tblGrid = this.safeGet(table, 'a:tblGrid.a:gridCol', []);
    
    const columns = tblGrid.map((col, index) => ({
      index: index,
      width: col.$w ? this.emuToPixels(parseInt(col.$w)) : 100 // Default width
    }));

    return {
      columns: columns,
      totalWidth: columns.reduce((sum, col) => sum + col.width, 0)
    };
  }

  /**
   * Parse table rows and cells
   * @param {Object} table - Table data
   * @returns {Array} array of row data
   */
  static parseTableRows(table) {
    const tblRows = this.safeGet(table, 'a:tr', []);
    
    return tblRows.map((row, rowIndex) => {
      const height = row.$h ? this.emuToPixels(parseInt(row.$h)) : 20; // Default height
      
      const cells = this.safeGet(row, 'a:tc', []).map((cell, cellIndex) => 
        this.parseTableCell(cell, rowIndex, cellIndex)
      );

      return {
        index: rowIndex,
        height: height,
        cells: cells
      };
    });
  }

  /**
   * Parse individual table cell
   * @param {Object} cell - Cell data
   * @param {number} rowIndex - Row index
   * @param {number} cellIndex - Cell index
   * @returns {Object} cell information
   */
  static parseTableCell(cell, rowIndex, cellIndex) {
    // Extract text content
    const textBody = this.safeGet(cell, 'a:txBody');
    const textContent = textBody ? this.extractTextContent(textBody) : '';

    // Parse cell properties
    const tcPr = this.safeGet(cell, 'a:tcPr');
    const cellStyle = this.parseCellStyle(tcPr);

    // Parse text formatting
    const textStyle = this.parseCellTextStyle(textBody);

    // Check for merged cells
    const gridSpan = tcPr?.$gridSpan ? parseInt(tcPr.$gridSpan) : 1;
    const rowSpan = tcPr?.$rowSpan ? parseInt(tcPr.$rowSpan) : 1;

    return {
      rowIndex: rowIndex,
      cellIndex: cellIndex,
      content: textContent,
      gridSpan: gridSpan,
      rowSpan: rowSpan,
      isMerged: gridSpan > 1 || rowSpan > 1,
      style: {
        backgroundColor: cellStyle.backgroundColor,
        borderTop: cellStyle.borderTop,
        borderRight: cellStyle.borderRight,
        borderBottom: cellStyle.borderBottom,
        borderLeft: cellStyle.borderLeft,
        verticalAlign: cellStyle.verticalAlign,
        textAlign: textStyle.textAlign,
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        fontWeight: textStyle.fontWeight,
        color: textStyle.color
      }
    };
  }

  /**
   * Parse cell style properties
   * @param {Object} tcPr - Table cell properties
   * @returns {Object} cell style
   */
  static parseCellStyle(tcPr) {
    const style = {
      backgroundColor: 'transparent',
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
      verticalAlign: 'top'
    };

    if (!tcPr) return style;

    // Background fill
    const solidFill = this.safeGet(tcPr, 'a:solidFill');
    if (solidFill) {
      style.backgroundColor = this.parseColor(solidFill);
    }

    // Borders
    const lnL = this.safeGet(tcPr, 'a:lnL');
    const lnR = this.safeGet(tcPr, 'a:lnR');
    const lnT = this.safeGet(tcPr, 'a:lnT');
    const lnB = this.safeGet(tcPr, 'a:lnB');

    style.borderLeft = this.parseCellBorder(lnL);
    style.borderRight = this.parseCellBorder(lnR);
    style.borderTop = this.parseCellBorder(lnT);
    style.borderBottom = this.parseCellBorder(lnB);

    // Vertical alignment
    const anchor = tcPr.$anchor;
    if (anchor) {
      switch (anchor) {
        case 't': style.verticalAlign = 'top'; break;
        case 'ctr': style.verticalAlign = 'middle'; break;
        case 'b': style.verticalAlign = 'bottom'; break;
        case 'just': style.verticalAlign = 'justify'; break;
      }
    }

    return style;
  }

  /**
   * Parse cell border
   * @param {Object} border - Border line data
   * @returns {string} CSS border value
   */
  static parseCellBorder(border) {
    if (!border) return 'none';

    // Line width
    const width = border.$w ? this.emuToPixels(parseInt(border.$w)) : 1;
    
    // Line color
    let color = '#000000';
    const solidFill = this.safeGet(border, 'a:solidFill');
    if (solidFill) {
      color = this.parseColor(solidFill);
    }

    // Line style
    const prstDash = this.safeGet(border, 'a:prstDash.$val');
    let style = 'solid';
    if (prstDash) {
      switch (prstDash) {
        case 'dash': style = 'dashed'; break;
        case 'dot': style = 'dotted'; break;
        case 'solid':
        default: style = 'solid'; break;
      }
    }

    return `${width}px ${style} ${color}`;
  }

  /**
   * Parse text style within a cell
   * @param {Object} textBody - Text body data
   * @returns {Object} text style
   */
  static parseCellTextStyle(textBody) {
    const style = {
      textAlign: 'left',
      fontSize: 12,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000'
    };

    if (!textBody) return style;

    // Get first paragraph properties for alignment
    const pPr = this.safeGet(textBody, 'a:p.a:pPr');
    if (pPr?.$algn) {
      switch (pPr.$algn) {
        case 'ctr': style.textAlign = 'center'; break;
        case 'r': style.textAlign = 'right'; break;
        case 'just': style.textAlign = 'justify'; break;
        case 'l':
        default: style.textAlign = 'left'; break;
      }
    }

    // Get first text run properties for font styling
    const firstRun = this.safeGet(textBody, 'a:p.a:r');
    const rPr = this.safeGet(firstRun, 'a:rPr');
    if (rPr) {
      const font = this.parseFont(rPr);
      style.fontSize = font.size;
      style.fontFamily = font.family;
      style.fontWeight = font.weight;
      style.color = font.color;
    }

    return style;
  }

  /**
   * Parse table-level style properties
   * @param {Object} table - Table data
   * @returns {Object} table style
   */
  static parseTableStyle(table) {
    const style = {
      backgroundColor: 'transparent',
      borderColor: '#000000',
      borderWidth: 1,
      borderStyle: 'solid',
      hasHeader: false
    };

    // Check table properties
    const tblPr = this.safeGet(table, 'a:tblPr');
    if (!tblPr) return style;

    // Background fill
    const solidFill = this.safeGet(tblPr, 'a:solidFill');
    if (solidFill) {
      style.backgroundColor = this.parseColor(solidFill);
    }

    // Check if first row is a header
    const firstRow = tblPr.$firstRow;
    if (firstRow === '1' || firstRow === 'true') {
      style.hasHeader = true;
    }

    return style;
  }

  /**
   * Generate readable content summary from table data
   * @param {Array} tableRows - Table row data
   * @returns {string} content summary
   */
  static generateTableContent(tableRows) {
    if (!tableRows.length) return 'Empty table';

    const totalCells = tableRows.reduce((sum, row) => sum + row.cells.length, 0);
    const hasContent = tableRows.some(row => 
      row.cells.some(cell => cell.content.trim().length > 0)
    );

    if (!hasContent) {
      return `Empty table (${tableRows.length} rows × ${tableRows?.cells.length || 0} columns)`;
    }

    // Try to create a brief summary
    const firstRowContent = tableRows?.cells.map(cell => cell.content.trim()).filter(c => c).slice(0, 3);
    if (firstRowContent.length > 0) {
      return `Table: ${firstRowContent.join(', ')}${firstRowContent.length < tableRows?.cells.length ? '...' : ''}`;
    }

    return `Table (${tableRows.length} rows × ${tableRows?.cells.length || 0} columns)`;
  }

  /**
   * Get table name from graphic frame
   * @param {Object} graphicFrame - Graphic frame data
   * @returns {string} table name
   */
  static getTableName(graphicFrame) {
    const cNvPr = this.safeGet(graphicFrame, 'p:nvGraphicFramePr.p:cNvPr');
    return cNvPr?.$name || 'Table';
  }

  /**
   * Check if a graphic frame contains a table
   * @param {Object} graphicFrame - Graphic frame data
   * @returns {boolean} true if contains table
   */
  static isTable(graphicFrame) {
    const graphicData = this.safeGet(graphicFrame, 'a:graphic.a:graphicData');
    return graphicData?.$uri === 'http://schemas.openxmlformats.org/drawingml/2006/table';
  }

  /**
   * Convert table data to CSV format
   * @param {Array} tableRows - Table row data
   * @returns {string} CSV representation
   */
  static toCSV(tableRows) {
    if (!tableRows.length) return '';

    return tableRows.map(row => {
      return row.cells.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const content = cell.content.replace(/"/g, '""');
        return content.includes(',') || content.includes('"') || content.includes('\n') 
          ? `"${content}"` 
          : content;
      }).join(',');
    }).join('\n');
  }

  /**
   * Get flattened table data for easy processing
   * @param {Object} tableComponent - Parsed table component
   * @returns {Array} 2D array of cell values
   */
  static getFlattenedData(tableComponent) {
    if (!tableComponent.metadata?.tableData) return [];

    return tableComponent.metadata.tableData.map(row => 
      row.cells.map(cell => cell.content)
    );
  }
}