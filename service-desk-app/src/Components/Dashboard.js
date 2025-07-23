import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

import {
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  Alert,
} from "@mui/material";

export default function UserDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [category, setCategory] = useState("Software");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "tickets"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setTickets(list);
        setLoading(false);
      },
      (err) => {
        setError("Failed to load tickets: " + err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user.uid]);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (description.trim() === "") {
      return setError("Please provide a description.");
    }
    setError("");
    try {
      await addDoc(collection(db, "tickets"), {
        userId: user.uid,
        userEmail: user.email,
        description,
        priority,
        category,
        status: "Open",
        createdAt: serverTimestamp(),
        updates: [],
      });
      setDescription("");
      setPriority("Low");
      setCategory("Software");
    } catch (e) {
      setError("Failed to submit ticket: " + e.message);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || comment.trim() === "") return;
    try {
      await updateDoc(doc(db, "tickets", selectedTicket.id), {
        updates: arrayUnion({
          comment,
          timestamp: serverTimestamp(),
          admin: false,
        }),
      });
      setComment("");
    } catch (e) {
      alert("Failed to add comment: " + e.message);
    }
  };

  if (loading) return <Typography>Loading tickets...</Typography>;

  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Raise a Ticket
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleTicketSubmit} noValidate>
            <TextField
              label="Issue Description"
              multiline
              rows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              required
            />
            <Select
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              margin="normal"
              displayEmpty
            >
              <MenuItem value="Low">Low Priority</MenuItem>
              <MenuItem value="Medium">Medium Priority</MenuItem>
              <MenuItem value="High">High Priority</MenuItem>
            </Select>
            <Select
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              margin="normal"
              displayEmpty
            >
              <MenuItem value="Software">Software</MenuItem>
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="Network">Network</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              size="large"
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Your Tickets
          </Typography>
          <List
            sx={{
              maxHeight: 400,
              overflow: "auto",
              bgcolor: "background.paper",
            }}
          >
            {tickets.length === 0 && (
              <Typography sx={{ p: 2 }}>No tickets submitted yet.</Typography>
            )}
            {tickets.map((ticket) => (
              <React.Fragment key={ticket.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedTicket?.id === ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <ListItemText
                      primary={`${ticket.category} — ${ticket.description.slice(0, 50)}...`}
                      secondary={`Status: ${ticket.status} | Priority: ${ticket.priority}`}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          {selectedTicket && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Ticket Details</Typography>
              <Typography><b>Description:</b> {selectedTicket.description}</Typography>
              <Typography><b>Category:</b> {selectedTicket.category}</Typography>
              <Typography><b>Priority:</b> {selectedTicket.priority}</Typography>
              <Typography><b>Status:</b> {selectedTicket.status}</Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Updates
              </Typography>
              {selectedTicket.updates && selectedTicket.updates.length > 0 ? (
                selectedTicket.updates.map((upd, i) => (
                  <Typography
                    key={i}
                    sx={{ fontSize: '0.9rem', mt: 1, bgcolor: upd.admin ? '#e3f2fd' : '#f1f8e9', p: 1, borderRadius: 1 }}
                  >
                    [{upd.timestamp?.toDate()?.toLocaleString() || 'N/A'}] {upd.admin ? 'Admin' : 'You'}: {upd.comment}
                  </Typography>
                ))
              ) : (
                <Typography>No updates available.</Typography>
              )}

              <TextField
                label="Add a comment"
                multiline
                fullWidth
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={handleAddComment}
                disabled={!comment.trim()}
              >
                Add Comment
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

