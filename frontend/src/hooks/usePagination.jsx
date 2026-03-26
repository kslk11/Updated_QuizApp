"use client";
import { useState, useCallback } from "react";
import axios from "axios";

const usePagination = (url, { itemsPerPage = 6 } = {}) => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const [meta, setMeta] = useState({
    currentPage:  1,
    totalPages:   1,
    totalItems:   0,
    itemsPerPage,
  });

  const fetchData = useCallback(async ({
    page      = 1,
    limit     = itemsPerPage,
    search    = "",
    sortBy    = "",
    sortOrder = "asc",
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          page,
          limit,
          ...(search.trim() && { search: search.trim() }),
          ...(sortBy.trim() && { sortBy }),
          ...(sortOrder     && { sortOrder }),
        },
      });

      // ✅ FIXED: prefer res.data.data (nested) then fall back to res.data (flat)
      const d = res.data?.data ?? res.data;
      console.log(res.data);

      // Extract rows — handles all common API shapes
      const rows =
        d.teachers  ??   // { data: { teachers: [...] } }
        d.bundles   ??   // { data: { bundles: [...] } }
        d.batches   ??   // { data: { batches: [...] } }
        d.courses   ??   // { data: { courses: [...] } }
        d.quizzes   ??   // { data: { quizzes: [...] } }
        d.students  ??   // { data: { students: [...] } }
        d.data      ??   // { data: { data: [...] } }
        d.rows      ??   // { data: { rows: [...] } }
        (Array.isArray(d) ? d : []);  // { data: [...] } flat array

      // Extract pagination metadata — handles all common shapes
      const totalItems =
        res.data.total           ??   // flat: { total: 3 }
        d.totalRecords           ??
        d.pagination?.totalItems ??
        d.total                  ??
        0;

      const totalPages =
        res.data.totalPages       ||   // flat: { totalPages: 1 }
        d.totalPages              ||
        d.pagination?.totalPages  ||
        d.pages                   ||
        Math.ceil(totalItems / limit) ||
        1;

      const currentPage =
        res.data.page             ??   // flat: { page: 1 }
        d.currentPage             ??
        d.pagination?.currentPage ??
        page;

      setData(rows);
      setMeta({ currentPage, totalPages, totalItems, itemsPerPage: limit });

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, itemsPerPage]);

  const goToPage = useCallback((page) => {
    setMeta((prev) => {
      if (page < 1 || page > prev.totalPages) return prev;
      return { ...prev, currentPage: page };
    });
  }, []);

  const pageNumbers = (() => {
    const { currentPage, totalPages } = meta;
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) range.push(i);

    if (range[0] > 2)                             range.unshift("...");
    if (range[0] > 1)                             range.unshift(1);
    if (range[range.length - 1] < totalPages - 1) range.push("...");
    if (range[range.length - 1] < totalPages)     range.push(totalPages);

    return range;
  })();

  return {
    data,
    loading,
    error,
    currentPage:  meta.currentPage,
    totalPages:   meta.totalPages,
    totalItems:   meta.totalItems,
    itemsPerPage: meta.itemsPerPage,
    pageNumbers,
    hasPrev: meta.currentPage > 1,
    hasNext: meta.currentPage < meta.totalPages,
    fetchData,
    goToPage,
  };
};

export default usePagination;