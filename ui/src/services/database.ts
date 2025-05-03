// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Only import server-side modules if not in browser
let db: any;
let stmt: any;

if (!isBrowser) {
	// Dynamic imports for server-side only
	const { default: Database } = await import("better-sqlite3");
	const { join } = await import("node:path");
	const { existsSync, mkdirSync } = await import("node:fs");

	// Create data directory if it doesn't exist
	const dataDir = join(process.cwd(), "data");
	if (!existsSync(dataDir)) {
		mkdirSync(dataDir, { recursive: true });
	}

	// Initialize database
	const dbPath = join(dataDir, "chat.db");
	db = new Database(dbPath);

	// Create tables if they don't exist
	db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `);

	// Prepare statements
	stmt = {
		// Conversation statements
		createConversation: db.prepare(`
      INSERT INTO conversations (id, title) VALUES (?, ?)
    `),
		getConversations: db.prepare(`
      SELECT * FROM conversations ORDER BY created_at DESC
    `),
		getConversation: db.prepare(`
      SELECT * FROM conversations WHERE id = ?
    `),
		updateConversationTitle: db.prepare(`
      UPDATE conversations SET title = ? WHERE id = ?
    `),
		deleteConversation: db.prepare(`
      DELETE FROM conversations WHERE id = ?
    `),

		// Message statements
		createMessage: db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)
    `),
		getMessages: db.prepare(`
      SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
    `),
	};
} else {
	// Provide stub/mock implementations for browser environment
	console.warn("SQLite operations are not available in browser environment");

	// Create empty objects
	db = {};
	stmt = {
		createConversation: () => {},
		getConversations: () => [],
		getConversation: () => null,
		updateConversationTitle: () => true,
		deleteConversation: () => true,
		createMessage: () => {},
		getMessages: () => [],
	};
}

export { db, stmt };
