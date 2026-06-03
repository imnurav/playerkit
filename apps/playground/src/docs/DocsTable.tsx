import React from "react";
import { renderInline } from "./utils";

interface DocsTableProps {
  headers: string[];
  rows: string[][];
}

export const DocsTable: React.FC<DocsTableProps> = React.memo(
  ({ headers, rows }) => {
    return (
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{renderInline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

DocsTable.displayName = "DocsTable";
