import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { io } from 'socket.io-client';
import { Paperclip, X, Upload, Clock, CheckCircle, MessageSquare, Download } from 'lucide-react';
import API_URL from '../config';

const Kanban = () => {
  const [tasks, setTasks] = useState({ 'Pending': [], 'In Progress': [], 'Review': [], 'Completed': [] });
  const [socket, setSocket] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitComment, setSubmitComment] = useState('');
  const [submitTime, setSubmitTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const TOKEN = localStorage.getItem('emp_token');
  const HEADERS = { Authorization: `Bearer ${TOKEN}` };

  useEffect(() => {
    const sock = io(API_URL);
    setSocket(sock);
    fetchTasks(sock);
    sock.on('task_updated', (updated) => {
      setTasks(prev => {
        const all = [...prev['Pending'], ...prev['In Progress'], ...prev['Review'], ...prev['Completed']];
        const idx = all.findIndex(t => t.id === updated.id);
        if (idx > -1) all[idx] = { ...all[idx], ...updated };
        const grouped = { 'Pending': [], 'In Progress': [], 'Review': [], 'Completed': [] };
        all.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });
        return grouped;
      });
    });
    return () => sock.close();
  }, []);

  const fetchTasks = async (sock) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, { headers: HEADERS });
      if (res.ok) {
        const data = await res.json();
        const grouped = { 'Pending': [], 'In Progress': [], 'Review': [], 'Completed': [] };
        data.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });
        setTasks(grouped);
        const projects = [...new Set(data.map(t => t.project_id))];
        projects.forEach(pid => sock.emit('join_project', pid));
      }
    } catch (e) { console.error(e); }
  };

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const src = [...tasks[source.droppableId]];
    const dst = [...tasks[destination.droppableId]];
    const [moved] = src.splice(source.index, 1);
    moved.status = destination.droppableId;
    dst.splice(destination.index, 0, moved);
    setTasks({ ...tasks, [source.droppableId]: src, [destination.droppableId]: dst });
    try {
      await fetch(`${API_URL}/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId })
      });
    } catch (e) { console.error(e); }
  };

  const openTask = (task) => {
    setSelectedTask(task);
    setUploadFile(null);
    setSubmitComment('');
    setSubmitTime('');
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      if (submitComment.trim()) fd.append('comment', submitComment.trim());
      if (submitTime) fd.append('time_spent', submitTime);
      const res = await fetch(`${API_URL}/api/tasks/${selectedTask.id}/submissions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: fd
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setUploadFile(null);
        setSubmitComment('');
        setSubmitTime('');
        setSelectedTask(prev => ({ ...prev, status: 'Review' }));
        setTasks(prev => {
          const all = [...prev['Pending'], ...prev['In Progress'], ...prev['Review'], ...prev['Completed']];
          const idx = all.findIndex(t => t.id === selectedTask.id);
          if (idx > -1) all[idx] = { ...all[idx], status: 'Review' };
          const grouped = { 'Pending': [], 'In Progress': [], 'Review': [], 'Completed': [] };
          all.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });
          return grouped;
        });
      }
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const priorityBorderColors = { 'Urgent': 'border-l-rose-500', 'High': 'border-l-orange-500', 'Medium': 'border-l-blue-500', 'Low': 'border-l-slate-500' };
  const priorityBadges = { 'Urgent': 'bg-rose-500/10 text-rose-400 border border-rose-500/20', 'High': 'bg-orange-500/10 text-orange-400 border border-orange-500/20', 'Medium': 'bg-blue-500/10 text-blue-400 border border-blue-500/20', 'Low': 'bg-slate-700 text-slate-300 border border-slate-600' };
  const statusColors = { 'Pending': 'bg-slate-700 text-slate-300', 'In Progress': 'bg-indigo-500/10 text-indigo-400', 'Review': 'bg-amber-500/10 text-amber-400', 'Completed': 'bg-emerald-500/10 text-emerald-400' };

  return (
    <div className="p-6 md:p-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
        <p className="text-slate-400 mt-1">Drag tasks between columns • Click a task to submit work</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 224px)' }}>
          {Object.entries(tasks).map(([status, items]) => (
            <div key={status} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 w-72 min-w-[288px] flex flex-col">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">{status}</h3>
                <span className="bg-slate-700 border border-slate-600 text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
              </div>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                    {items.map((task, index) => (
                      <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            onClick={() => openTask(task)}
                            className={`bg-slate-800 p-4 rounded-xl shadow border border-slate-700 border-l-4 hover:border-slate-500 transition-all cursor-pointer ${priorityBorderColors[task.priority]}`}
                          >
                            <h4 className="font-semibold text-slate-200 mb-2 text-sm leading-snug">{task.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                            <div className="flex justify-between items-center">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityBadges[task.priority]}`}>{task.priority}</span>
                              <span className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                            {task.attachment_url && (
                              <div className="mt-2 flex items-center gap-1 text-blue-400 text-xs">
                                <Paperclip className="w-3 h-3" /> Reference file attached
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && <p className="text-center text-slate-600 text-xs py-8">Drop tasks here</p>}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-white">{selectedTask.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedTask.project_name}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Priority */}
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedTask.status]}`}>{selectedTask.status}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityBadges[selectedTask.priority]}`}>Priority: {selectedTask.priority}</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" /> Due: {new Date(selectedTask.due_date).toLocaleDateString()}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Task Description</p>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                  {selectedTask.description}
                </p>
              </div>

              {/* Admin Reference File */}
              {selectedTask.attachment_url && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" /> Reference File from Admin
                  </p>
                  <a href={`${API_URL}${selectedTask.attachment_url}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 hover:border-blue-500/50 rounded-xl text-slate-300 hover:text-blue-400 transition-colors group">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Paperclip className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedTask.attachment_name || 'Download File'}</p>
                      <p className="text-xs text-slate-500">Click to open / download</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </a>
                </div>
              )}

              {/* Submit Work Section */}
              {selectedTask.status !== 'Completed' ? (
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-400" /> Submit Your Work
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">Upload your file and add an optional note for the admin</p>
                  </div>
                  <div className="p-4">
                    {submitSuccess ? (
                      <div className="flex flex-col items-center py-6 text-center">
                        <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-3">
                          <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-emerald-400 font-semibold">Submitted Successfully!</p>
                        <p className="text-slate-500 text-sm mt-1">Task moved to Review. Admin will review your submission.</p>
                        <button onClick={() => setSubmitSuccess(false)} className="mt-4 text-sm text-blue-400 hover:underline">Submit another file</button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* File Picker */}
                        <div
                          onClick={() => document.getElementById('submit-file').click()}
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all group ${uploadFile ? 'border-blue-500/60 bg-blue-500/5' : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'}`}
                        >
                          <input type="file" id="submit-file" className="hidden"
                            accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.xlsx,.pptx"
                            onChange={e => setUploadFile(e.target.files[0] || null)} />
                          {uploadFile ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                  <Paperclip className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-slate-200 text-sm font-medium">{uploadFile.name}</p>
                                  <p className="text-slate-500 text-xs">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button type="button" onClick={ev => { ev.stopPropagation(); setUploadFile(null); }}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="w-7 h-7 text-slate-500 group-hover:text-blue-400 transition-colors" />
                              <p className="text-slate-400 text-sm">Click to select your file</p>
                              <p className="text-slate-600 text-xs">PDF, DOCX, ZIP, Images</p>
                            </div>
                          )}
                        </div>

                        {/* Time Spent Input */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" /> Time Spent (Hours) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            required
                            placeholder="e.g. 2.5"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                            value={submitTime}
                            onChange={e => setSubmitTime(e.target.value)}
                          />
                        </div>

                        {/* Comment / Note */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Note for Admin (Optional)
                          </label>
                          <textarea
                            rows="3"
                            placeholder="Describe what you've done, any blockers, or questions for the admin..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none placeholder-slate-600"
                            value={submitComment}
                            onChange={e => setSubmitComment(e.target.value)}
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={!uploadFile || !submitTime || submitting}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all border border-blue-500/50 disabled:border-slate-600 flex items-center justify-center gap-2 shadow-lg"
                        >
                          {submitting ? 'Submitting…' : <><Upload className="w-4 h-4" /> Submit for Review</>}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm">Task Completed</p>
                    <p className="text-slate-400 text-xs mt-0.5">Admin has approved this submission.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
