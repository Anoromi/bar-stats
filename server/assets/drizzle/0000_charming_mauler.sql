CREATE TABLE `battle` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text(200) NOT NULL,
	`engineVersion` text(100) NOT NULL,
	`gameVersion` text(100) NOT NULL,
	`startTime` integer NOT NULL,
	`durationMs` integer NOT NULL,
	`fullDurationMs` integer NOT NULL,
	`winning-team` integer,
	`has-bots` integer,
	`ended-normally` integer
);
--> statement-breakpoint
CREATE TABLE `battle-team` (
	`battle-id` text NOT NULL,
	`team-number` integer NOT NULL,
	PRIMARY KEY(`battle-id`, `team-number`),
	FOREIGN KEY (`battle-id`) REFERENCES `battle`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user-to-battle` (
	`user-username` text NOT NULL,
	`user-id` integer NOT NULL,
	`battle-team-battle-id` text NOT NULL,
	`battle-team-number` text NOT NULL,
	`skill` real NOT NULL,
	`skill-uncertainty` real NOT NULL,
	`is-spectator` integer NOT NULL,
	`player-id` integer,
	`team-id` integer,
	`faction` text,
	`start-pos-x` real,
	`start-pos-y` real,
	`start-pos-z` real,
	`rank` integer NOT NULL,
	PRIMARY KEY(`battle-team-battle-id`, `battle-team-number`, `user-id`),
	FOREIGN KEY (`battle-team-battle-id`) REFERENCES `battle-team`(`battle-id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`battle-team-number`) REFERENCES `battle-team`(`team-number`) ON UPDATE no action ON DELETE no action
);
