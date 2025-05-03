declare module "better-sqlite3" {
	interface Database {
		prepare<T = unknown>(sql: string): Statement<T>;
		exec(sql: string): void;
		close(): void;
	}

	interface Statement<T> {
		run(...params: unknown[]): { lastInsertRowid: number; changes: number };
		get(...params: unknown[]): T;
		all(...params: unknown[]): T[];
	}

	function Database(
		filename: string,
		options?: {
			readonly?: boolean;
			fileMustExist?: boolean;
			timeout?: number;
			verbose?: (...args: unknown[]) => void;
		},
	): Database;

	export = Database;
}
