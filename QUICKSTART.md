# CoCode - Quick Start Guide

Get CoCode up and running in 5 minutes! 🚀

## 🎯 What You'll Need

- Node.js 18 or higher
- A modern web browser
- Two terminal windows

## 📝 Step-by-Step Setup

### Terminal 1: Backend Server

```bash
# Navigate to backend directory
cd cocode-backend

# Install dependencies (first time only)
npm install

# Start the WebSocket server
npm start
```

You should see:
```
🚀 CoCode WebSocket Server running on port 1234
```

### Terminal 2: Frontend Application

```bash
# Navigate to frontend directory
cd cocode-frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

## 🎮 Testing Collaboration

1. **Open the app**
   - Click the Local URL or visit `http://localhost:5173`

2. **Start coding**
   - You'll see a random room ID in the top-left corner
   - Type some code in the Monaco editor

3. **Open a second window**
   - Right-click the "Share Room" button → Copy link
   - Open a new browser window or incognito tab
   - Paste the URL and press Enter

4. **Watch the magic! ✨**
   - Type in one window
   - See it appear instantly in the other window
   - Notice the colored cursors showing where others are typing

## 🧪 Test Code Execution

1. **Select a language** from the dropdown (e.g., Python)
2. **Write some code:**
   ```python
   print("Hello from CoCode!")
   ```
3. **Click the ▶ Run button**
4. **Check the console** (toggle with "Console" button)

## 🎨 Features to Try

- [ ] Real-time collaborative editing
- [ ] Multiple browser windows synchronized
- [ ] Language switching (JavaScript, Python, Java, etc.)
- [ ] Code execution with live output
- [ ] Share room link with friends
- [ ] Connection status indicator
- [ ] Cursor tracking across users

## 🐛 Troubleshooting

### "Cannot connect to WebSocket"
- Make sure the backend server is running on port 1234
- Check that no firewall is blocking the connection

### "Module not found" errors
- Run `npm install` in both frontend and backend directories

### Changes don't sync between windows
- Verify both windows have the same room ID in the URL
- Check browser console for WebSocket errors
- Restart the backend server

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Explore the code in `cocode-frontend/src/components/`
- Customize the UI in `tailwind.config.js`

## 💡 Tips

- **Network sync test**: Open on phone and computer on same WiFi
- **Offline test**: Disconnect network, type, reconnect → changes sync!
- **Multi-language**: Try switching languages mid-session
- **Large files**: Test performance with 1000+ lines of code

## 🎓 Learning Resources

### Understanding the Code

**Frontend Flow:**
```
User types → Monaco Editor → Yjs Document → WebSocket → Server
                ↓
         Updates UI instantly
```

**Backend Flow:**
```
WebSocket receives update → Apply to Yjs Doc → Broadcast to all clients
```

**Key Files to Study:**
- `cocode-frontend/src/components/Editor.tsx` - Yjs integration
- `cocode-backend/src/server.js` - WebSocket handling
- `cocode-frontend/src/hooks/useCodeExecution.ts` - Code execution

### Concepts to Explore

1. **CRDT (Conflict-free Replicated Data Types)**
   - How Yjs ensures consistency without conflicts
   - Why it's better than Operational Transformation

2. **WebSocket Protocol**
   - Full-duplex communication
   - Binary message format for efficiency

3. **Monaco Editor**
   - Same engine as VS Code
   - Extensible and powerful

## 🤝 Contributing

Want to improve CoCode?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Ideas for contributions:
- Add more programming languages
- Implement user authentication
- Create a file browser
- Add syntax error highlighting
- Build a chat feature

## 📞 Get Help

- **Issues**: Open a GitHub issue
- **Questions**: Check README.md FAQ section
- **Discussions**: GitHub Discussions

---

**Happy coding! May your edits be conflict-free! 🎉**
