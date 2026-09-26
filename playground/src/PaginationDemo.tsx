import { Pagination } from "@zse-gdansk/ui";
import { useState } from "react";

export function PaginationDemo() {
    const [page, setPage] = useState(5);
    const [size, setSize] = useState(20);
    const [table, setTable] = useState(1);

    return (
        <section className="badges">
            <Pagination page={page} onPageChange={setPage} pageCount={40} />
            <Pagination
                page={table}
                onPageChange={setTable}
                total={312}
                pageSize={size}
                pageSizeOptions={[10, 20, 50]}
                onPageSizeChange={(next) => {
                    setSize(next);
                    setTable(1);
                }}
                showInfo
            />
            <Pagination defaultPage={3} pageCount={1000} showEdges size="sm" />
            <div className="pagination-narrow">
                <Pagination defaultPage={3} pageCount={12} />
            </div>
            <Pagination defaultPage={2} pageCount={4} />
        </section>
    );
}
