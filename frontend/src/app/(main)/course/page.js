"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
<<<<<<< HEAD:frontend/src/app/course/page.js
import { API_BASE_URL } from "../../config/api";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
=======
import { API_BASE_URL } from "../../../config/api"
import usePagination from "../../../hooks/usePagination";
import useDebounce from "../../../hooks/useDebounce";
>>>>>>> 01f13e7c69d61c413dbb070a5eecffdfe2c1d639:frontend/src/app/(main)/course/page.js

const COURSES_URL = `${API_BASE_URL}/api/course`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const emptyForm = { name: "" };

export default function CoursesPage() {
  const [search,      setSearch]      = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState(emptyForm);
  const [editId,      setEditId]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: courses,
    loading,
    currentPage,
    totalPages,
    totalItems,
    pageNumbers,
    hasPrev,
    hasNext,
    fetchData,
    goToPage,
  } = usePagination(COURSES_URL, { itemsPerPage: 8 });
console.log("data",courses)
  // fetch on page or search change
  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  // re-fetch current page (after create/update/delete)
  const refresh = () =>
    fetchData({ page: currentPage, search: debouncedSearch });

  // ── open modal ──────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (course) => {
    setForm({ name: course.name });
    setEditId(course.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  };

  // ── submit (create / update) ─────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.warning("Course name is required");
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await axios.put(`${COURSES_URL}/${editId}`, form, getAuthHeaders());
        toast.success("Course updated successfully");
      } else {
        await axios.post(COURSES_URL, form, getAuthHeaders());
        toast.success("Course created successfully");
      }
      closeModal();
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${COURSES_URL}/${id}`, getAuthHeaders());
      toast.success("Course deleted");
      setDeleteId(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Courses</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {totalItems} course{totalItems !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
          >
            + Add Course
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
          placeholder="Search courses..."
          className="w-full mb-6 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-8" />
                  <div className="h-4 bg-slate-100 rounded w-48" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                    <div className="h-8 w-16 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No courses found.{" "}
              <button onClick={openCreate} className="text-indigo-600 font-semibold hover:underline">
                Create one
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Name</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {courses.map((course, i) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 transition"
                  >
                    <div className="col-span-1 text-xs text-slate-400 font-mono">
                      {(currentPage - 1) * 8 + i + 1}
                    </div>
                    <div className="col-span-7 font-semibold text-sm text-slate-800">
                      {course.name}
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(course)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(course.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrev}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
                    p === currentPage
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNext}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-5">
              {editId ? "Edit Course" : "New Course"}
            </h2>

            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Course Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Mathematics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition"
              >
                {submitting ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🗑️
            </div>
            <h2 className="text-lg font-black text-slate-900 text-center mb-1">
              Delete Course?
            </h2>
            <p className="text-sm text-slate-400 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}