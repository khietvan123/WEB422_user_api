const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let User;
const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  favourites: [Number],
  history: [String]
});

function init(connStr){
  return mongoose.connect(connStr).then(()=>{
    User = mongoose.model('users', userSchema);
  });
}

async function addUser(userName, password, password2){
  if(password !== password2) throw 'Passwords do not match';
  const existing = await User.findOne({ userName });
  if(existing) throw 'User already exists';
  const hash = await bcrypt.hash(password, 10);
  const u = new User({ userName, password: hash, favourites: [], history: [] });
  await u.save();
}

async function checkUser(userName, password){
  const u = await User.findOne({ userName });
  if(!u) throw 'Unable to find user';
  const ok = await bcrypt.compare(password, u.password);
  if(!ok) throw 'Incorrect password';
  return { _id: u._id.toString(), userName: u.userName };
}

async function getFavourites(userId){ const u = await User.findById(userId); return u?.favourites ?? []; }
async function addFavourite(userId, id){ const u = await User.findById(userId); if(!u) throw 'User not found'; if(!u.favourites.includes(id)) u.favourites.push(id); await u.save(); return u.favourites; }
async function removeFavourite(userId, id){ const u = await User.findById(userId); if(!u) throw 'User not found'; u.favourites = u.favourites.filter(x=>x!==id); await u.save(); return u.favourites; }

async function getHistory(userId){ const u = await User.findById(userId); return u?.history ?? []; }
async function addHistory(userId, q){ const u = await User.findById(userId); if(!u) throw 'User not found'; u.history = [q, ...u.history.filter(x=>x!==q)].slice(0,50); await u.save(); return u.history; }
async function removeHistory(userId, q){ const u = await User.findById(userId); if(!u) throw 'User not found'; u.history = u.history.filter(x=>x!==q); await u.save(); return u.history; }

module.exports = { init, addUser, checkUser, getFavourites, addFavourite, removeFavourite, getHistory, addHistory, removeHistory };