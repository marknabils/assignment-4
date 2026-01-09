const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const USERS_FILE = path.join(__dirname, "users.json");

app.use(express.json());


function readUsers() {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}


app.post("/user", (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "name and email are required" });
  }

  try {
    const data = readUsers();

    const emailExists = data.users.find(user => user.email === email);
    if (emailExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newUser = { id: Date.now(), name, email, age };
    data.users.push(newUser);
    writeUsers(data);

    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/user", (req, res) => {
  try {
    const data = readUsers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.patch("/user/:id", (req, res) => {
  const userId = Number(req.params.id);
  const { name, age, email } = req.body;

  try {
    const data = readUsers();
    const userIndex = data.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

   
    if (email !== undefined) {
      const emailExists = data.users.find(u => u.email === email && u.id !== userId);
      if (emailExists) {
        return res.status(409).json({ message: "Email already exists" });
      }
      data.users[userIndex].email = email;
    }

    if (name !== undefined) data.users[userIndex].name = name;
    if (age !== undefined) data.users[userIndex].age = age;

    writeUsers(data);

    res.json({ message: "User updated successfully", user: data.users[userIndex] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.delete("/user/:id", (req, res) => {
  const userId = Number(req.params.id);

  try {
    const data = readUsers();
    const userIndex = data.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    data.users.splice(userIndex, 1);
    writeUsers(data);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/user/getByName", (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "name query parameter is required" });
  }

  try {
    const data = readUsers();
    const user = data.users.find(user => user.name === name);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/user/:id", (req, res) => {
  const userId = Number(req.params.id);

  try {
    const data = readUsers();
    const user = data.users.find(user => user.id === userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/user/filter", (req, res) => {
  const { minAge } = req.query;

  if (!minAge) {
    return res.status(400).json({ message: "minAge query parameter is required" });
  }

  try {
    const data = readUsers();
    const filteredUsers = data.users.filter(user => user.age >= Number(minAge));
    res.json({ users: filteredUsers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
