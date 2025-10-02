import React, { useState } from 'react';
import './DataTable.css';

const DataTable = ({ 
  entity, 
  columns, 
  data, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onRoleChange,
  pagination,
  onPageChange 
}) => {
  const [pageInput, setPageInput] = useState('');

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput) - 1;
    if (page >= 0 && page < pagination.totalPages) {
      onPageChange(page);
      setPageInput('');
    }
  };

  const handleAction = (action, item) => {
    switch (action) {
      case 'edit':
        onEdit(item);
        break;
      case 'delete':
        onDelete(item);
        break;
      case 'status':
        onStatusChange(item);
        break;
      case 'role':
        onRoleChange(item);
        break;
      default:
        break;
    }
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'currency':
        return `€${parseFloat(value).toFixed(2)}`;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'image':
        return value ? (
          <img 
            src={value} 
            alt="Preview" 
            className="data-table__image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : '-';
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="data-table__loading">
        <div className="data-table__spinner"></div>
        <p>Loading {entity}...</p>
      </div>
    );
  }

  return (
    <div className="data-table">
      <div className="data-table__header">
        <div className="data-table__title">
          <h2>{entity.charAt(0).toUpperCase() + entity.slice(1)}</h2>
          <span className="data-table__count">
            {pagination?.totalElements || data.length} items
          </span>
        </div>
        <button 
          className="data-table__add-btn"
          onClick={onAdd}
        >
          Add {entity.charAt(0).toUpperCase() + entity.slice(1).slice(0, -1)}
        </button>
      </div>

      <div className="data-table__container">
        <table className="data-table__table">
          <thead className="data-table__thead">
            <tr>
              {columns.map(column => (
                <th key={`header-${column.key}`} className="data-table__th">
                  {column.label}
                </th>
              ))}
              <th className="data-table__th data-table__th--actions">Actions</th>
            </tr>
          </thead>
          <tbody className="data-table__tbody">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="data-table__empty">
                  No {entity} found
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={`row-${item.id}`} className="data-table__row">
                  {columns.map(column => (
                    <td key={`${item.id}-${column.key}`} className="data-table__td">
                      {formatValue(item[column.key], column.type)}
                    </td>
                  ))}
                  <td className="data-table__td data-table__td--actions">
                    <div className="data-table__actions">
                      <button
                        className="data-table__action data-table__action--edit"
                        onClick={() => handleAction('edit', item)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {onStatusChange && (
                        <button
                          className="data-table__action data-table__action--status"
                          onClick={() => handleAction('status', item)}
                          title="Change Status"
                        >
                          🔄
                        </button>
                      )}
                      {onRoleChange && (
                        <button
                          className="data-table__action data-table__action--role"
                          onClick={() => handleAction('role', item)}
                          title="Change Role"
                        >
                          👤
                        </button>
                      )}
                      <button
                        className="data-table__action data-table__action--delete"
                        onClick={() => handleAction('delete', item)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="data-table__pagination">
      <div className="data-table__pagination-info">
        Showing {pagination.totalElements > 0 ? pagination.number * pagination.size + 1 : 0} to {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} entries
      </div>
          <div className="data-table__pagination-controls">
            <button
              className="data-table__pagination-btn"
              disabled={pagination.number === 0}
              onClick={() => onPageChange(pagination.number - 1)}
            >
              Previous
            </button>
            <span className="data-table__pagination-page">
              Page {pagination.number + 1} of {pagination.totalPages}
            </span>
            <form onSubmit={handlePageInputSubmit} className="data-table__page-input-form">
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={pageInput}
                onChange={handlePageInputChange}
                placeholder="Go to page"
                className="data-table__page-input"
              />
              <button
                type="submit"
                className="data-table__page-go-btn"
                disabled={!pageInput || pageInput < 1 || pageInput > pagination.totalPages}
              >
                Go
              </button>
            </form>
            <button
              className="data-table__pagination-btn"
              disabled={pagination.number >= pagination.totalPages - 1}
              onClick={() => onPageChange(pagination.number + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;