ALTER TABLE `habits` ADD `reminder_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` ADD `reminder_time` integer;