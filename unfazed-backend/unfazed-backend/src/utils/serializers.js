exports.sharedNoteView = (n) => ({
  id: n._id, format: n.format, content: n.content, soap: n.soap, createdAt: n.createdAt
});
