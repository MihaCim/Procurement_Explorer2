import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import FilterIcon from '../../assets/icons/filter.svg?react';
import Skeleton from '../Skeleton';
import DefaultColumnFilter from './DefaultColumnFilter';
import { fuzzyFilter } from './Filters';

import type {
  ColumnDef,
  ExpandedState,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  Updater,
} from '@tanstack/react-table';
interface ExpandableOptions<T extends object, D extends object> {
  getSubRows: (row: T) => D[];
  overrideExpandableRenderer?: (row: Row<D>) => React.ReactNode;
  parentRowStyleOnExpanded?: React.CSSProperties;
  parentRowStyleOnCollapsed?: React.CSSProperties;
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'date' | 'range' | 'select';
  }
}

interface ReactTableProps<T extends object, D extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  height?: number;
  minHeight?: number;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  expandableOptions?: ExpandableOptions<T, D>;
  enableSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: (updater: Updater<RowSelectionState>) => void;
}

const TableBody = styled.tbody`
  display: grid;
  position: relative;
`;

const Header = styled.th`
  text-align: left;
  padding: 13px 8px;
  align-items: center;
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid #e2e2e2;
  min-height: 48px;
  width: '100%';
  display: flex;
`;

const Row = styled.tr`
  border-bottom: 0.5px solid #e2e2e2;
  min-height: 48px;
  width: '100%';
  display: flex;
`;

const Cell = styled.td`
  color: var(--color-text-primary, #292c3d);
  padding: 13px 16px;
  white-space: nowrap;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
`;

const TableHeader = styled('thead')<{ height?: number }>`
  display: grid;
  position: sticky;
  top: 0;
  height: auto;
  z-index: 1;
  background: ${(p) => (p.height ? 'var(--background-card, #fff)' : '#F5F6FA')};
`;

const TableContainer = styled('div')<{ height?: number; minHeight?: number }>`
  overflow: auto;
  height: ${(p) => p.height ?? 'auto'}px;
  min-height: ${(p) => p.minHeight ?? 'auto'}px;
  position: relative;
  width: 100%;
`;

const FloatingCard = styled.div`
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
`;

const Table = <T extends object, D extends object>({
  data,
  columns,
  height,
  minHeight,
  loading = false,
  globalFilter,
  expandableOptions,
  setGlobalFilter,
}: ReactTableProps<T, D>) => {
  const DEFAULT_SIZE = 100;

  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [filterVisible, setFilterVisible] = useState<Record<string, boolean>>(
    {},
  );

  const filterCardRef = useRef<HTMLDivElement | null>(null);

  const toggleFilter = (columnId: string) => {
    setFilterVisible((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (
      filterCardRef.current &&
      !filterCardRef.current.contains(event.target as Node)
    ) {
      setFilterVisible({});
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      globalFilter: globalFilter,
      pagination,
    },
    enableMultiRowSelection: false,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    onExpandedChange: setExpanded,
    getSubRows: expandableOptions
      ? (row) => expandableOptions.getSubRows(row)
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: expandableOptions ? getExpandedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,

    defaultColumn: {
      minSize: 70,
      size: DEFAULT_SIZE,
    },
  });

  return (
    <div className="flex w-full flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden p-2">
            <TableContainer height={height} minHeight={minHeight}>
              <table className="grid min-w-full">
                <TableHeader height={height}>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableHeaderRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <Header
                            key={header.id}
                            style={{
                              flexGrow:
                                header.getSize() === DEFAULT_SIZE
                                  ? 1
                                  : undefined,
                              width: header.getSize(),
                            }}
                          >
                            <div className="flex gap-2 items-center">
                              <div>
                                {header.column.getCanFilter() ? (
                                  <div>
                                    <FilterIcon
                                      onClick={() => toggleFilter(header.id)}
                                    />
                                    {filterVisible[header.id] && (
                                      <FloatingCard ref={filterCardRef}>
                                        <DefaultColumnFilter
                                          column={header.column}
                                        />
                                      </FloatingCard>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? 'cursor-pointer select-none'
                                    : '',
                                  onClick:
                                    header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {{
                                  asc: ' ↑',
                                  desc: ' ↓',
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </div>
                            </div>
                          </Header>
                        );
                      })}
                    </TableHeaderRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from(Array(10)).map((_, i) => (
                      <Row key={i}>
                        <Cell colSpan={columns.length} className="w-full">
                          <Skeleton />
                        </Cell>
                      </Row>
                    ))
                  ) : (
                    <>
                      {table.getRowModel().rows.map((row) => (
                        <Row
                          key={row.id}
                          style={
                            row.getIsExpanded()
                              ? (expandableOptions?.parentRowStyleOnExpanded ??
                                undefined)
                              : (expandableOptions?.parentRowStyleOnCollapsed ??
                                undefined)
                          }
                          className={row.getIsSelected() ? 'bg-gray-100' : ''}
                        >
                          {expandableOptions?.overrideExpandableRenderer &&
                          row.depth > 0 ? (
                            <>
                              {expandableOptions.overrideExpandableRenderer(
                                row,
                              )}
                            </>
                          ) : (
                            row.getVisibleCells().map((cell) => (
                              <Cell
                                key={cell.id}
                                style={{
                                  display: 'flex',
                                  flexGrow:
                                    cell.column.getSize() === DEFAULT_SIZE
                                      ? 1
                                      : undefined,
                                  width: cell.column.getSize(),
                                }}
                              >
                                <div className="w-full overflow-hidden text-ellipsis">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </div>
                              </Cell>
                            ))
                          )}
                        </Row>
                      ))}
                    </>
                  )}
                </TableBody>
              </table>
              {table.getPageCount() > 1 && (
                <>
                  <div
                    className="flex items-center gap-2 justify-end w-full"
                    style={{ position: 'absolute', bottom: '0' }}
                  >
                    <button
                      className="border rounded p-1"
                      onClick={() => table.firstPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      {'<<'}
                    </button>
                    <button
                      className="border rounded p-1"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      {'<'}
                    </button>
                    <button
                      className="border rounded p-1"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      {'>'}
                    </button>
                    <button
                      className="border rounded p-1"
                      onClick={() => table.lastPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      {'>>'}
                    </button>
                    <span className="flex items-center gap-1">
                      <div>Page</div>
                      <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount().toLocaleString()}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1">
                      | Go to page:
                      <input
                        type="number"
                        min="1"
                        max={table.getPageCount()}
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                          const page = e.target.value
                            ? Number(e.target.value) - 1
                            : 0;
                          table.setPageIndex(page);
                        }}
                        className="border p-1 rounded w-16"
                      />
                    </span>
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                      }}
                    >
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          Show {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Table;
