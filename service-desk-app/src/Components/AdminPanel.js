import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignment, setAssignment] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setTickets(list);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "tickets", id), { status });
  };

  const assignTicket = async () => {
    if (!selectedTicket || assignment.trim() === "") return;
    await updateDoc(doc(db, "tickets", selectedTicket.id), { assignedTo: assignment });
    setAssignment("");
  };

  const addAdminComment = async () => {
    if (!selectedTicket || comment.trim() === "") return;
    await updateDoc(doc(db, "tickets", selectedTicket.id), {
      updates: arrayUnion({ comment, timestamp: serverTimestamp(), admin: true }),
    });
    setComment("");
  };

  return (
    <Grid container spacing={3} sx={{ padding: 2 }}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            All Tickets
          </Typography>
          <List
            sx={{
              maxHeight: 500,
              overflowY: "auto",
              bgcolor: "background.paper",
            }}
          >
            {tickets.map((ticket) => (
              <React.Fragment key={ticket.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedTicket?.id === ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <ListItemText
                      primary={`${ticket.category} — ${ticket.description.slice(0, 50)}...`}
                      secondary={`Status: ${ticket.status} | Assigned: ${
                        ticket.assignedTo || "None"
                      }`}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2 }}>
          {selectedTicket ? (
            <>
              <Typography variant="h6" gutterBottom>
                Ticket Details
              </Typography>
              <Typography><b>Description:</b> {selectedTicket.description}</Typography>
              <Typography><b>Category:</b> {selectedTicket.category}</Typography>
              <Typography><b>Priority:</b> {selectedTicket.priority}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Status:</Typography>
                <Select
                  fullWidth
                  value={selectedTicket.status}
                  onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </Box>
              <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  label="Assign to"
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={assignTicket}>
                  Assign
                </Button>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Updates / Comments</Typography>
                {selectedTicket.updates && selectedTicket.updates.length > 0 ? (
                  selectedTicket.updates.map((upd, i) => (
                    <Typography
                      key={i}
                      sx={{
                        bgcolor: upd.admin ? "#e3f2fd" : "#f1f8e9",
                        p: 1,
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      [{upd.timestamp?.toDate()?.toLocaleString() || "N/A"}]{" "}
                      {upd.admin ? "Admin" : "User"}: {upd.comment}
                    </Typography>
                  ))
                ) : (
                  <Typography>No updates.</Typography>
                )}
                <TextField
                  label="New comment"
                  multiline
                  fullWidth
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Button variant="contained" sx={{ mt: 1 }} onClick={addAdminComment}>
                  Add Comment
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Select a ticket to view details</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
