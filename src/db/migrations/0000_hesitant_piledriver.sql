CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`day` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_habit_day` ON `checkins` (`habit_id`,`day`);--> statement-breakpoint
CREATE INDEX `idx_checkins_habit` ON `checkins` (`habit_id`);--> statement-breakpoint
CREATE INDEX `idx_checkins_day` ON `checkins` (`day`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`cadence_type` text NOT NULL,
	`weekdays` text,
	`weekly_target` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`archived_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
