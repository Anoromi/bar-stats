CREATE TABLE `battle` (
	`id` text PRIMARY KEY NOT NULL,
	`engine-version` text NOT NULL,
	`map-id` integer NOT NULL,
	`game-version` text NOT NULL,
	`start-time` integer NOT NULL,
	`duration-ms` integer NOT NULL,
	`full-duration-ms` integer NOT NULL,
	`winning-team` integer,
	`has-bots` integer NOT NULL,
	`ended-normally` integer NOT NULL,
	`player-count` integer NOT NULL,
	`battle-type` text NOT NULL,
	`preset` text
);
--> statement-breakpoint
CREATE TABLE `battle-team` (
	`battle-id` text NOT NULL,
	`team-number` integer NOT NULL,
	PRIMARY KEY(`battle-id`, `team-number`),
	FOREIGN KEY (`battle-id`) REFERENCES `battle`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `map` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bar-map-id` integer,
	`filename` text,
	`script-name` text,
	`name` text NOT NULL,
	`subclass-of` integer,
	FOREIGN KEY (`subclass-of`) REFERENCES `map`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user-to-battle` (
	`user-username` text,
	`user-id` integer,
	`battle-team-battle-id` text NOT NULL,
	`battle-team-number` integer NOT NULL,
	`skill` real,
	`skill-uncertainty` real,
	`rank` integer,
	`is-spectator` integer NOT NULL,
	`player-id` integer,
	`team-id` integer,
	`faction` text,
	`start-pos-x` real,
	`start-pos-y` real,
	`start-pos-z` real,
	PRIMARY KEY(`battle-team-battle-id`, `battle-team-number`, `user-id`),
	FOREIGN KEY (`battle-team-battle-id`,`battle-team-number`) REFERENCES `battle-team`(`battle-id`,`team-number`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `start-time-index` ON `battle` (`start-time`);--> statement-breakpoint
CREATE INDEX `map-name-idx` ON `map` (`name`);--> statement-breakpoint
CREATE INDEX `map-subclass-idx` ON `map` (`subclass-of`);--> statement-breakpoint
CREATE INDEX `map-mapId-idx` ON `map` (`bar-map-id`);--> statement-breakpoint
CREATE INDEX `user-to-battle-battle-team-idx` ON `user-to-battle` (`battle-team-number`,`battle-team-battle-id`);--> statement-breakpoint
CREATE INDEX `user-to-battle-user-id-idx` ON `user-to-battle` (`user-id`);